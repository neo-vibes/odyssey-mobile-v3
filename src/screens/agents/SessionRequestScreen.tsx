import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { SessionRequestScreenProps } from "../../navigation/types";

// Format duration from seconds to human readable
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return mins === 1 ? "1 minute" : `${mins} minutes`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (mins === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours}h ${mins}m`;
}

// Format SOL with USD estimate (using placeholder rate)
function formatLimit(sol: number, usdRate: number = 170): string {
  const usd = sol * usdRate;
  return `${sol} SOL (~$${usd.toFixed(0)})`;
}

export function SessionRequestScreen({
  route,
  navigation,
}: SessionRequestScreenProps) {
  const {
    requestId,
    agentName,
    durationSeconds,
    limitSol,
    network = "mainnet",
  } = route.params;

  const handleApprove = () => {
    // TODO: Trigger passkey prompt → create session on-chain → notify agent
    console.log("Approve session request:", requestId);
    // For now, just go back
    navigation.goBack();
  };

  const handleDeny = () => {
    // TODO: Call API to deny request
    console.log("Deny session request:", requestId);
    navigation.goBack();
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 px-6 py-8">
        {/* Agent Header */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-4">🤖</Text>
          <Text className="text-white text-2xl font-bold">{agentName}</Text>
          <Text className="text-gray-400 text-lg mt-1">
            wants a spending session
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-700 mb-6" />

        {/* Session Details */}
        <View className="mb-6">
          <DetailRow label="Duration" value={formatDuration(durationSeconds)} />
          <DetailRow label="Limit" value={formatLimit(limitSol)} />
          <DetailRow
            label="Network"
            value={network.charAt(0).toUpperCase() + network.slice(1)}
          />
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-700 mb-8" />

        {/* Spacer to push buttons to bottom */}
        <View className="flex-1" />

        {/* Action Buttons */}
        <View className="gap-3">
          <Pressable
            onPress={handleApprove}
            className="bg-green-600 active:bg-green-700 py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-semibold">Approve</Text>
          </Pressable>

          <Pressable
            onPress={handleDeny}
            className="bg-gray-700 active:bg-gray-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-semibold">Deny</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

// Detail row component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-3">
      <Text className="text-gray-400 text-base">{label}</Text>
      <Text className="text-white text-base font-medium">{value}</Text>
    </View>
  );
}
