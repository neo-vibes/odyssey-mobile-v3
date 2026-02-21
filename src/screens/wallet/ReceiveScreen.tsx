import React from "react";
import { View, Text, Pressable } from "react-native";
import type { ReceiveScreenProps } from "../../navigation/types";

export function ReceiveScreen({ navigation }: ReceiveScreenProps) {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">📥 Receive</Text>
      <Text className="text-gray-400 text-center mb-8">
        Share your address to receive SOL
      </Text>

      <View className="bg-gray-800 rounded-xl p-8 mb-6 w-64 h-64 items-center justify-center">
        <Text className="text-gray-500 text-center">[QR Code Placeholder]</Text>
      </View>

      <View className="bg-gray-800 rounded-lg p-4 mb-8 w-full max-w-xs">
        <Text className="text-gray-400 text-xs text-center">
          [Wallet address placeholder]
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Back</Text>
      </Pressable>
    </View>
  );
}
