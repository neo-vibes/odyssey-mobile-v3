import React, { useCallback } from "react";
import { View, Text, Pressable, Alert, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import type { ReceiveScreenProps } from "../../navigation/types";
import { useWalletStore } from "../../stores/useWalletStore";

export function ReceiveScreen({ navigation }: ReceiveScreenProps) {
  const { address } = useWalletStore();

  const displayAddress = address || "No wallet connected";

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await Clipboard.setStringAsync(address);
      Alert.alert("Copied!", "Wallet address copied to clipboard");
    } catch {
      Alert.alert("Error", "Failed to copy address");
    }
  }, [address]);

  const handleShare = useCallback(async () => {
    if (!address) return;
    try {
      await Share.share({
        message: address,
        title: "My Solana Address",
      });
    } catch {
      Alert.alert("Error", "Failed to share address");
    }
  }, [address]);

  return (
    <View className="flex-1 bg-[#0A0A0A] px-6 pt-4">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-4 p-2 -ml-2 active:opacity-70"
        >
          <Text className="text-white text-2xl">←</Text>
        </Pressable>
        <Text className="text-white text-xl font-semibold">Receive</Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center pt-8">
        {/* QR Code Container */}
        <View className="bg-white rounded-2xl p-6 mb-8">
          {address ? (
            <QRCode
              value={address}
              size={200}
              backgroundColor="white"
              color="#0A0A0A"
            />
          ) : (
            <View className="w-[200px] h-[200px] items-center justify-center">
              <Text className="text-gray-500 text-center">
                No wallet connected
              </Text>
            </View>
          )}
        </View>

        {/* Full Address Display */}
        <View className="bg-[#1F1F1F] rounded-xl p-4 mb-8 w-full">
          <Text
            className="text-[#A1A1AA] text-sm font-mono text-center"
            selectable
          >
            {displayAddress}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-3">
          <Pressable
            onPress={handleCopyAddress}
            disabled={!address}
            className="bg-[#FFB84D] py-4 rounded-xl items-center active:opacity-80 disabled:opacity-50"
          >
            <Text className="text-black text-base font-semibold">
              Copy Address
            </Text>
          </Pressable>

          <Pressable
            onPress={handleShare}
            disabled={!address}
            className="bg-[#1F1F1F] py-4 rounded-xl items-center active:opacity-70 disabled:opacity-50"
          >
            <Text className="text-white text-base font-semibold">Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
