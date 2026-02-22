import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Passkey } from "react-native-passkey";
import * as Crypto from "expo-crypto";
import { useAgentsStore, useSessionsStore } from "../../stores";
import { useWalletStore } from "../../stores/useWalletStore";
import { getSessionRequests } from "../../services/api";
import { getPairedAgents } from "../../services/agent-storage";
import {
  getPendingSessions,
  getSessionApprovalData,
  approveSession,
  PendingSession,
} from "../../services/sessions";
import { buildSessionChallenge } from "../../utils/sessionChallenge";
import { SessionApprovalModal } from "../../components/SessionApprovalModal";
import type { AgentsScreenProps } from "../../navigation/types";
import type { PairingRequest, Agent } from "../../stores";
import type { SessionRequest } from "../../stores";

// ============================================================================
// Pairing Request Card Component
// ============================================================================
interface PairingRequestCardProps {
  request: PairingRequest;
  onApprove: () => void;
  onDeny: () => void;
  onDetails: () => void;
}

function PairingRequestCard({
  request,
  onApprove,
  onDeny,
  onDetails,
}: PairingRequestCardProps) {
  const timeAgo = getTimeAgo(request.requestedAt);

  return (
    <View className="bg-background-elevated rounded-xl p-4 mb-3 border border-background-elevated">
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">🔗</Text>
        <Text className="text-white font-semibold text-base">
          Pairing Request
        </Text>
      </View>

      <Text className="text-text-primary mb-1">
        Agent: <Text className="text-white font-medium">{request.agentName}</Text>
      </Text>
      <Text className="text-text-muted text-sm mb-4">Requested: {timeAgo}</Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row">
          <Pressable
            onPress={onApprove}
            className="bg-green-600 px-4 py-2 rounded-lg mr-2 active:opacity-80"
          >
            <Text className="text-white font-semibold">Approve</Text>
          </Pressable>
          <Pressable
            onPress={onDeny}
            className="bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-red-400 font-semibold">Deny</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onDetails}
          className="px-4 py-2 active:opacity-60"
        >
          <Text className="text-gold font-semibold">Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Session Request Card Component
// ============================================================================
interface SessionRequestCardProps {
  request: SessionRequest;
  onApprove: () => void;
  onDeny: () => void;
  onDetails: () => void;
}

function SessionRequestCard({
  request,
  onApprove,
  onDeny,
  onDetails,
}: SessionRequestCardProps) {
  const durationStr = formatDuration(request.durationSeconds);

  return (
    <View className="bg-background-elevated rounded-xl p-4 mb-3 border border-background-elevated">
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">🔐</Text>
        <Text className="text-white font-semibold text-base">
          Session Request
        </Text>
      </View>

      <Text className="text-text-primary mb-1">
        {request.agentName} • {durationStr} • {request.limitSol} SOL
      </Text>
      <Text className="text-text-muted text-sm mb-4">
        Requested: {getTimeAgo(request.requestedAt)}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row">
          <Pressable
            onPress={onApprove}
            className="bg-green-600 px-4 py-2 rounded-lg mr-2 active:opacity-80"
          >
            <Text className="text-white font-semibold">Approve</Text>
          </Pressable>
          <Pressable
            onPress={onDeny}
            className="bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-red-400 font-semibold">Deny</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onDetails}
          className="px-4 py-2 active:opacity-60"
        >
          <Text className="text-gold font-semibold">Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Agent Row Component
// ============================================================================
interface AgentRowProps {
  agent: Agent;
  onPress: () => void;
}

function AgentRow({ agent, onPress }: AgentRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-2 border-b border-gray-800 active:bg-background-elevated/50"
    >
      <View className="flex-row items-center">
        {agent.hasActiveSession && (
          <Text className="text-green-500 mr-2">🟢</Text>
        )}
        <Text className="text-white text-base font-medium">{agent.name}</Text>
      </View>
      <Text className="text-text-muted text-xl">›</Text>
    </Pressable>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================
interface EmptyStateProps {
  onPairAgent: () => void;
}

function EmptyState({ onPairAgent }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-text-secondary text-lg text-center mb-6">
        No agents paired yet
      </Text>
      <Pressable
        onPress={onPairAgent}
        className="bg-gold px-6 py-3 rounded-xl active:opacity-80"
      >
        <Text className="text-background-base font-semibold">Pair Your First Agent</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================
function getTimeAgo(date: Date): string {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}

// ============================================================================
// Main Screen Component
// ============================================================================
export function AgentsScreen({ navigation }: AgentsScreenProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  // Session approval modal state
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Wallet store
  const walletAddress = useWalletStore((s) => s.address);

  // Store selectors
  const agents = useAgentsStore((s) => s.agents);
  const setAgents = useAgentsStore((s) => s.setAgents);
  const pendingPairingRequests = useAgentsStore((s) => s.pendingPairingRequests);
  const removePairingRequest = useAgentsStore((s) => s.removePairingRequest);

  const pendingSessionRequests = useSessionsStore((s) => s.pendingSessionRequests);
  const setPendingSessionRequests = useSessionsStore((s) => s.setPendingSessionRequests);
  const removeSessionRequest = useSessionsStore((s) => s.removeSessionRequest);

  // Derived state
  const hasAgents = agents.length > 0;
  const hasPendingRequests =
    pendingPairingRequests.length > 0 || pendingSessionRequests.length > 0;
  const showEmptyState = !hasAgents && !hasPendingRequests;

  // Handlers
  const handleApprovePairing = useCallback(
    (requestId: string) => {
      // TODO: Call API to approve pairing, then refresh
      console.log("Approve pairing:", requestId);
      removePairingRequest(requestId);
    },
    [removePairingRequest]
  );

  const handleDenyPairing = useCallback(
    (requestId: string) => {
      // TODO: Call API to deny pairing
      console.log("Deny pairing:", requestId);
      removePairingRequest(requestId);
    },
    [removePairingRequest]
  );

  const handleApproveSession = useCallback(
    (requestId: string) => {
      // TODO: Call API to approve session
      console.log("Approve session:", requestId);
      removeSessionRequest(requestId);
    },
    [removeSessionRequest]
  );

  const handleDenySession = useCallback(
    (requestId: string) => {
      // TODO: Call API to deny session
      console.log("Deny session:", requestId);
      removeSessionRequest(requestId);
    },
    [removeSessionRequest]
  );

  // Session approval modal handlers
  const handleModalApprove = useCallback(async () => {
    if (!pendingSession) return;
    
    setModalLoading(true);
    try {
      // 1. Get approval data (includes currentSlot, expiresAtSlot, credentialId)
      const approvalData = await getSessionApprovalData(pendingSession.requestId);
      
      // 2. Build 89-byte challenge
      const challengeData = buildSessionChallenge(approvalData);
      
      // 3. Hash challenge with SHA-256 for WebAuthn
      // Convert Uint8Array to string for expo-crypto
      const challengeString = String.fromCharCode(...challengeData);
      const challengeHashBase64 = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        challengeString,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      // 4. Call Passkey.get with hashed challenge
      const result = await Passkey.get({
        rpId: approvalData.rpId,
        challenge: challengeHashBase64,
        allowCredentials: approvalData.credentialId ? [{
          id: approvalData.credentialId,
          type: 'public-key' as const,
        }] : undefined,
        userVerification: 'required',
      });
      
      // 5. Extract WebAuthn response fields (already base64 from react-native-passkey)
      const signature = result.response.signature;
      const authenticatorData = result.response.authenticatorData;
      const clientDataJSON = result.response.clientDataJSON;
      
      // 6. Call approve API with WebAuthn signature
      await approveSession({
        requestId: pendingSession.requestId,
        walletPubkey: approvalData.walletPubkey,
        sessionPubkey: approvalData.sessionPubkey,
        expiresAtSlot: approvalData.expiresAtSlot,
        limits: pendingSession.limits,
        signature,
        authenticatorData,
        clientDataJSON,
      });
      
      // 7. Success - close modal and show toast
      setModalVisible(false);
      setPendingSession(null);
      Alert.alert('Session Approved', 'Agent can now execute transactions');
      
    } catch (error: any) {
      console.error("Failed to approve session:", error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to approve session',
        [
          { text: 'Retry', onPress: () => handleModalApprove() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setModalLoading(false);
    }
  }, [pendingSession]);

  const handleModalDeny = useCallback(async () => {
    if (!pendingSession) return;
    
    setModalLoading(true);
    try {
      // Import and call denySession
      const { denySession } = await import("../../services/sessions");
      await denySession(pendingSession.requestId);
      
      // Close modal and clear pending session
      setModalVisible(false);
      setPendingSession(null);
      
      // Show success toast
      Alert.alert('Denied', 'Session denied');
    } catch (error: any) {
      console.error("Failed to deny session:", error);
      Alert.alert('Error', 'Failed to deny session: ' + (error?.message || 'Unknown error'));
    } finally {
      setModalLoading(false);
    }
  }, [pendingSession]);

  const fetchAgents = useCallback(async () => {
    // Load paired agents from local storage (no wallet required)
    const pairedAgents = await getPairedAgents();
    const mappedAgents: Agent[] = pairedAgents.map((a) => ({
      id: a.agentId,
      name: a.agentName,
      pairedAt: new Date(a.pairedAt),
      hasActiveSession: false,
    }));
    setAgents(mappedAgents);
    
    // Fetch pending session requests from API (requires wallet)
    if (walletAddress) {
      const sessionsResponse = await getSessionRequests(walletAddress);
      if (sessionsResponse.ok && sessionsResponse.data) {
        const mappedRequests = sessionsResponse.data.requests.map((r: any) => ({
          id: r.id,
          agentId: r.agentId || r.sessionPubkey,
          agentName: r.agentName,
          requestedAt: new Date(r.createdAt),
          durationSeconds: r.durationSeconds,
          limitSol: r.limits?.[0]?.amount || r.maxAmount || 0,
        }));
        setPendingSessionRequests(mappedRequests);
      }
    }
  }, [walletAddress, setAgents, setPendingSessionRequests]);

  // Fetch on mount and when screen gains focus (e.g., after pairing)
  useFocusEffect(
    useCallback(() => {
      fetchAgents();
    }, [fetchAgents])
  );

  // Poll for pending session requests (every 3 seconds when focused)
  useFocusEffect(
    useCallback(() => {
      let interval: ReturnType<typeof setInterval> | null = null;

      const poll = async () => {
        // Don't poll if modal is visible or no wallet
        if (modalVisible || !walletAddress) return;
        
        try {
          const sessions = await getPendingSessions(walletAddress);
          if (sessions.length > 0) {
            setPendingSession(sessions[0]);
            setModalVisible(true);
          }
        } catch (error) {
          // Silently fail - will retry on next poll
          console.log("Failed to poll pending sessions:", error);
        }
      };

      // Initial poll
      poll();
      
      // Set up interval polling
      interval = setInterval(poll, 3000);

      // Cleanup on blur
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [walletAddress, modalVisible])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAgents();
    setRefreshing(false);
  }, [fetchAgents]);

  const navigateToPairAgent = useCallback(() => {
    navigation.navigate("PairAgentScreen");
  }, [navigation]);

  const navigateToAgentDetail = useCallback(
    (agentId: string) => {
      navigation.navigate("AgentDetailScreen", { agentId });
    },
    [navigation]
  );

  // Render empty state
  if (showEmptyState) {
    return (
      <View className="flex-1 bg-background-base">
        <EmptyState onPairAgent={navigateToPairAgent} />
        
        {/* Session Approval Modal - shown even on empty state */}
        <SessionApprovalModal
          visible={modalVisible}
          session={pendingSession}
          onApprove={handleModalApprove}
          onDeny={handleModalDeny}
          loading={modalLoading}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-base">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Pending Requests Section */}
        {hasPendingRequests && (
          <View className="px-4 pt-4">
            {/* Pairing Requests */}
            {pendingPairingRequests.map((request) => (
              <PairingRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprovePairing(request.id)}
                onDeny={() => handleDenyPairing(request.id)}
                onDetails={() => {
                  // TODO: Navigate to pairing request details
                  console.log("View pairing details:", request.id);
                }}
              />
            ))}

            {/* Session Requests */}
            {pendingSessionRequests.map((request) => (
              <SessionRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApproveSession(request.id)}
                onDeny={() => handleDenySession(request.id)}
                onDetails={() => {
                  // TODO: Navigate to session request details
                  console.log("View session details:", request.id);
                }}
              />
            ))}
          </View>
        )}

        {/* Paired Agents Section */}
        {hasAgents && (
          <View className="px-4 mt-4">
            {/* Section divider */}
            {hasPendingRequests && (
              <View className="border-t border-background-elevated mb-4" />
            )}

            <Text className="text-text-secondary text-sm font-medium uppercase tracking-wide mb-2">
              Paired Agents
            </Text>

            <View className="bg-background-elevated/50 rounded-xl overflow-hidden">
              {agents.map((agent, index) => (
                <React.Fragment key={agent.id}>
                  <AgentRow
                    agent={agent}
                    onPress={() => navigateToAgentDetail(agent.id)}
                  />
                  {index < agents.length - 1 && (
                    <View className="h-px bg-gray-700 ml-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Pair New Agent Button */}
        <View className="px-4 mt-6">
          <Pressable
            onPress={navigateToPairAgent}
            className="bg-gold py-4 rounded-xl items-center active:opacity-80"
          >
            <Text className="text-background-base font-semibold text-base">
              + Pair New Agent
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Session Approval Modal */}
      <SessionApprovalModal
        visible={modalVisible}
        session={pendingSession}
        onApprove={handleModalApprove}
        onDeny={handleModalDeny}
        loading={modalLoading}
      />
    </View>
  );
}
