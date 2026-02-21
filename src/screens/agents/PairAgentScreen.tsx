import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { PairAgentScreenProps } from "../../navigation/types";
import { generatePairingCode } from "../../services/api";

interface PairingCodeState {
  code: string;
  expiresAt: Date;
}

export function PairAgentScreen({ navigation }: PairAgentScreenProps) {
  const [pairingCode, setPairingCode] = useState<PairingCodeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copied, setCopied] = useState<"code" | "instructions" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch pairing code on mount
  const fetchPairingCode = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await generatePairingCode();

    if (response.ok && response.data) {
      const expiresAt = new Date(response.data.expiresAt);
      setPairingCode({
        code: response.data.code,
        expiresAt,
      });
      // Calculate initial time remaining
      const remaining = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeRemaining(remaining);
    } else {
      setError(response.error?.message || "Failed to generate pairing code");
    }

    setLoading(false);
  }, []);

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

  // Check if code is expired
  const isExpired = timeRemaining === 0 && pairingCode !== null;

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-400 mt-4">Generating pairing code...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-red-400 text-lg mb-4">⚠️ {error}</Text>
        <Pressable
          onPress={fetchPairingCode}
          className="bg-indigo-600 px-6 py-3 rounded-lg active:bg-indigo-700"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Expired state
  if (isExpired) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-gray-400 text-lg mb-2">⏱️ Code Expired</Text>
        <Text className="text-gray-500 text-center mb-6">
          The pairing code has expired. Generate a new one.
        </Text>
        <Pressable
          onPress={fetchPairingCode}
          className="bg-indigo-600 px-6 py-3 rounded-lg active:bg-indigo-700"
        >
          <Text className="text-white font-semibold">Generate New Code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 p-6">
      {/* Header text */}
      <Text className="text-gray-300 text-lg text-center mt-8 mb-8">
        Share this code with your agent:
      </Text>

      {/* Pairing code display */}
      <View className="items-center mb-6">
        <View className="bg-gray-800 border-2 border-gray-700 rounded-xl px-8 py-6">
          <Text className="text-white text-4xl font-mono font-bold tracking-widest">
            {pairingCode?.code}
          </Text>
        </View>
      </View>

      {/* Copy Code button */}
      <View className="items-center mb-8">
        <Pressable
          onPress={handleCopyCode}
          className="bg-indigo-600 px-8 py-3 rounded-lg active:bg-indigo-700"
        >
          <Text className="text-white font-semibold text-lg">
            {copied === "code" ? "✓ Copied!" : "Copy Code"}
          </Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View className="flex-row items-center mb-8 px-4">
        <View className="flex-1 h-px bg-gray-700" />
        <Text className="text-gray-500 mx-4">or</Text>
        <View className="flex-1 h-px bg-gray-700" />
      </View>

      {/* Copy Instructions button */}
      <View className="items-center mb-4">
        <Pressable
          onPress={handleCopyInstructions}
          className="bg-gray-700 px-6 py-3 rounded-lg active:bg-gray-600"
        >
          <Text className="text-white font-semibold">
            {copied === "instructions"
              ? "✓ Copied!"
              : "Copy Instructions for Agent"}
          </Text>
        </Pressable>
      </View>

      {/* Instructions preview */}
      <View className="items-center mb-8">
        <Text className="text-gray-500 text-center text-sm italic px-4">
          "Pair with my Odyssey wallet using code {pairingCode?.code}"
        </Text>
      </View>

      {/* Expiry timer */}
      <View className="items-center mt-auto mb-8">
        <Text
          className={`text-lg ${
            timeRemaining < 60000 ? "text-orange-400" : "text-gray-400"
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
        <Text className="text-gray-400 font-medium">Cancel</Text>
      </Pressable>
    </View>
  );
}
