import React from "react";
import { View, Text, Pressable } from "react-native";
import type { WalletScreenProps } from "../../navigation/types";

export function WalletScreen({ navigation }: WalletScreenProps) {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">💳 Wallet</Text>
      <Text className="text-gray-400 text-center mb-4">Your balance</Text>

      <View className="bg-gray-800 rounded-xl p-6 mb-8 w-full max-w-xs">
        <Text className="text-white text-4xl font-bold text-center">
          0.00 SOL
        </Text>
        <Text className="text-gray-500 text-center mt-2">$0.00 USD</Text>
      </View>

      <View className="flex-row gap-4">
        <Pressable
          onPress={() => navigation.navigate("ReceiveScreen")}
          className="bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Receive</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("SendScreen")}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Send</Text>
        </Pressable>
      </View>
    </View>
  );
}
