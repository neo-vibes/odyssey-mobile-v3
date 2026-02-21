import React, { useCallback } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { WalletScreenProps } from "../../navigation/types";
import { useWalletStore } from "../../stores/useWalletStore";

/**
 * Truncates a wallet address to format: "7xKt...3nQm"
 */
function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Formats SOL balance with appropriate decimal places
 */
function formatSol(amount: number): string {
  if (amount === 0) return "0.00";
  if (amount < 0.01) return amount.toFixed(6);
  return amount.toFixed(2);
}

/**
 * Formats USD balance with dollar sign
 */
function formatUsd(amount: number): string {
  return `~$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function WalletScreen({ navigation }: WalletScreenProps) {
  const { address, balanceSol, balanceUsd } = useWalletStore();

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert("Copied!", "Wallet address copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  }, [address]);

  const displayAddress = address || "Not connected";
  const truncatedAddress = address ? truncateAddress(address) : "---";

  return (
    <View className="flex-1 bg-[#0A0A0A] px-6 pt-8">
      {/* Header */}
      <Text className="text-white text-xl font-semibold mb-8">Wallet</Text>

      {/* Balance Card */}
      <View className="items-center py-8">
        {/* SOL Balance - Large and prominent */}
        <View className="flex-row items-center mb-2">
          <Text className="text-4xl mr-2">💰</Text>
          <Text className="text-white text-4xl font-bold">
            {formatSol(balanceSol)} SOL
          </Text>
        </View>

        {/* USD Balance - Secondary */}
        <Text className="text-[#A1A1AA] text-lg">
          {formatUsd(balanceUsd)}
        </Text>
      </View>

      {/* Address Row */}
      <View className="flex-row items-center justify-center mt-4 mb-10">
        <Text className="text-[#A1A1AA] text-base mr-3 font-mono">
          {truncatedAddress}
        </Text>
        <Pressable
          onPress={handleCopyAddress}
          disabled={!address}
          className="bg-[#1F1F1F] px-4 py-2 rounded-lg active:opacity-70"
        >
          <Text className="text-white text-sm font-medium">Copy</Text>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-center gap-4">
        <Pressable
          onPress={() => navigation.navigate("ReceiveScreen")}
          className="flex-1 bg-[#FFB84D] py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-black text-base font-semibold">
            📥 Receive
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SendScreen")}
          className="flex-1 bg-[#FFB84D] py-4 rounded-xl items-center active:opacity-80"
        >
          <Text className="text-black text-base font-semibold">📤 Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
