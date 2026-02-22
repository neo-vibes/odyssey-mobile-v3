import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Passkey } from "react-native-passkey";
import type { PairAgentScreenProps } from "../../navigation/types";
import { generatePairingCode } from "../../services/api";
import { checkCodeStatus, approveAgentPairing, denyAgentPairing } from "../../services/pairing";
import { useWalletStore } from "../../stores/useWalletStore";
import { addPairedAgent } from "../../services/agent-storage";
import { AgentApprovalModal } from "../../components/AgentApprovalModal";
import { verifyAgentSignature } from "../../utils/ed25519";

interface PairingCodeState {
  code: string;
  expiresAt: Date;
}

export function PairAgentScreen({ navigation }: PairAgentScreenProps) {
  const { address, telegramId } = useWalletStore();
  const [pairingCode, setPairingCode] = useState<PairingCodeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copied, setCopied] = useState<"code" | "instructions" | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{requestId: string, agentId: string, agentName: string} | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch pairing code on mount
  const fetchPairingCode = useCallback(async () => {
    if (!address || !telegramId) {
      setError("Wallet not linked. Please link your Telegram wallet first.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await generatePairingCode(address, telegramId);

    if (response.ok && response.data) {
      const expiresAt = new Date(response.data.expiresAt);
      console.log('✅ Got pairing code:', response.data.code);
      setPairingCode({
        code: response.data.code,
        expiresAt,
      });
      // Calculate initial time remaining
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeRemaining(remaining);
    } else {
      console.log('❌ Failed to generate code:', response.error?.message);
      setError(response.error?.message || "Failed to generate pairing code");
    }

    setLoading(false);
  }, [address, telegramId]);

  useEffect(() => {
    fetchPairingCode();
  }, [fetchPairingCode]);

  // Countdown timer
  useEffect(() => {
    if (!pairingCode) return;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        pairingCode.expiresAt.getTime() - Date.now()
      );
      setTimeRemaining(remaining);

      if (remaining === 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pairingCode]);

  // Poll for incoming agent pairing requests
  useEffect(() => {
    if (!pairingCode) return;

    const interval = setInterval(async () => {
      try {
        const status = await checkCodeStatus(pairingCode.code);
        console.log('📊 Code status:', status.status);
        if (status.status === 'pending_approval' && status.requestId && status.agentId && status.agentName) {
          // Verify agent signature before showing approval modal (defense in depth)
          if (status.signature && status.timestamp) {
            const message = `${pairingCode.code}:${status.agentId}:${status.timestamp}`;
            const isValid = verifyAgentSignature(message, status.signature, status.agentId);
            
            if (!isValid) {
              console.warn('⚠️ Invalid agent signature - ignoring pairing request', {
                agentId: status.agentId,
                agentName: status.agentName,
              });
              return; // Don't show modal for invalid signatures
            }
            console.log('✅ Agent signature verified:', status.agentName);
          } else {
            // If signature/timestamp missing, log warning but still allow (backwards compatibility)
            console.warn('⚠️ Pairing request missing signature/timestamp - proceeding without verification');
          }
          
          setIncomingRequest({ requestId: status.requestId, agentId: status.agentId, agentName: status.agentName });
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('Poll error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pairingCode]);

  // Handle passkey approval
  const handleApprove = async () => {
    if (!incomingRequest) return;
    
    setApproving(true);
    try {
      const timestamp = Date.now();
      const challenge = `approve-agent:${incomingRequest.requestId}:${timestamp}`;
      const challengeBase64 = btoa(challenge);
      
      // Get passkey assertion
      const result = await Passkey.get({
        rpId: 'app.getodyssey.xyz',
        challenge: challengeBase64,
        userVerification: 'required',
      });
      
      // Call API to approve
      console.log('📤 Calling approveAgentPairing API...');
      await approveAgentPairing({
        requestId: incomingRequest.requestId,
        signature: result.response.signature,
        authenticatorData: result.response.authenticatorData,
        clientDataJSON: result.response.clientDataJSON,
      });
      console.log('✅ API approval succeeded');
      
      // Save agent locally
      console.log('💾 Saving agent locally:', incomingRequest.agentId, incomingRequest.agentName);
      await addPairedAgent({
        agentId: incomingRequest.agentId,
        agentName: incomingRequest.agentName,
        pairedAt: new Date().toISOString(),
      });
      console.log('✅ Agent saved to local storage');
      
      // Success!
      setApprovalSuccess(incomingRequest.agentName);
      setIncomingRequest(null);
    } catch (err) {
      console.error('Approval failed:', err);
      setError((err as Error).message || 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  // Format time remaining as MM:SS
  const formatTimeRemaining = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    if (!pairingCode) return;
    await Clipboard.setStringAsync(pairingCode.code);
    setCopied("code");
    setTimeout(() => setCopied(null), 2000);
  };

  // Copy full instructions to clipboard
  const handleCopyInstructions = async () => {
    if (!pairingCode) return;
    const instructions = `Pair with my Odyssey wallet using code ${pairingCode.code}`;
    await Clipboard.setStringAsync(instructions);
    setCopied("instructions");
    setTimeout(() => setCopied(null), 2000);
  };

  // Deny agent pairing request
  const handleDeny = async () => {
    if (!incomingRequest) return;
    
    try {
      await denyAgentPairing(incomingRequest.requestId);
      // Close modal and generate new code
      setIncomingRequest(null);
      fetchPairingCode(); // Re-generate code for another agent
    } catch (err) {
      console.error('Deny failed:', err);
      setError((err as Error).message || 'Failed to deny');
    }
  };

  // Check if code is expired
  const isExpired = timeRemaining === 0 && pairingCode !== null;

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-background-base items-center justify-center p-4">
        <ActivityIndicator size="large" color="#FFB84D" />
        <Text className="text-text-secondary mt-4">Generating pairing code...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-background-base items-center justify-center p-4">
        <Text className="text-error text-lg mb-4">⚠️ {error}</Text>
        <Pressable
          onPress={fetchPairingCode}
          className="bg-gold px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-background-base font-semibold">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <View className="flex-1 bg-background-base items-center justify-center p-4">
        <Text className="text-text-secondary text-lg mb-2">⏱️ Code Expired</Text>
        <Text className="text-text-muted text-center mb-6">
          The pairing code has expired. Generate a new one.
        </Text>
        <Pressable
          onPress={fetchPairingCode}
          className="bg-gold px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-background-base font-semibold">Generate New Code</Text>
        </Pressable>
      </View>
    );
  }

  // Success state - agent paired
  if (approvalSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0F', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✅</Text>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', marginBottom: 8 }}>
          Agent Paired!
        </Text>
        <Text style={{ color: '#FFB84D', fontSize: 18, marginBottom: 24 }}>
          {approvalSuccess}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 }}>
          This agent can now request spending sessions from your wallet.
        </Text>
        <Pressable
          style={{ backgroundColor: '#FFB84D', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginBottom: 12 }}
          onPress={() => { setApprovalSuccess(null); fetchPairingCode(); }}
        >
          <Text style={{ color: '#0D0D0F', fontWeight: '600' }}>Pair Another Agent</Text>
        </Pressable>
        <Pressable
          style={{ paddingHorizontal: 24, paddingVertical: 14 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-base p-6">
      {/* Header text */}
      <Text className="text-text-secondary text-lg text-center mt-8 mb-8">
        Share this code with your agent:
      </Text>

      {/* Pairing code display */}
      <View className="items-center mb-6">
        <View className="bg-background-elevated border-2 border-gold/30 rounded-2xl px-8 py-6">
          <Text className="text-gold text-4xl font-mono font-bold tracking-widest">
            {pairingCode?.code}
          </Text>
        </View>
      </View>

      {/* Copy Code button */}
      <View className="items-center mb-8">
        <Pressable
          onPress={handleCopyCode}
          className="bg-gold px-8 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-background-base font-semibold text-lg">
            {copied === "code" ? "✓ Copied!" : "Copy Code"}
          </Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View className="flex-row items-center mb-8 px-4">
        <View className="flex-1 h-px bg-background-elevated" />
        <Text className="text-text-muted mx-4">or</Text>
        <View className="flex-1 h-px bg-background-elevated" />
      </View>

      {/* Copy Instructions button */}
      <View className="items-center mb-4">
        <Pressable
          onPress={handleCopyInstructions}
          className="bg-background-elevated border border-text-secondary/30 px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-text-primary font-semibold">
            {copied === "instructions"
              ? "✓ Copied!"
              : "Copy Instructions for Agent"}
          </Text>
        </Pressable>
      </View>

      {/* Instructions preview */}
      <View className="items-center mb-8">
        <Text className="text-text-muted text-center text-sm italic px-4">
          "Pair with my Odyssey wallet using code {pairingCode?.code}"
        </Text>
      </View>

      {/* Expiry timer */}
      <View className="items-center mt-auto mb-8">
        <Text
          className={`text-lg ${
            timeRemaining < 60000 ? "text-gold" : "text-text-secondary"
          }`}
        >
          Expires in {formatTimeRemaining(timeRemaining)}
        </Text>
      </View>

      {/* Cancel button */}
      <Pressable
        onPress={() => navigation.goBack()}
        className="items-center py-3"
      >
        <Text className="text-text-muted font-medium">Cancel</Text>
      </Pressable>

      {/* Agent approval modal */}
      <AgentApprovalModal
        visible={incomingRequest !== null}
        agentName={incomingRequest?.agentName || ''}
        onApprove={handleApprove}
        onDeny={handleDeny}
        loading={approving}
      />
    </View>
  );
}
