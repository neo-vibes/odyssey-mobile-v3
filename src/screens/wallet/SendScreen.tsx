import React from "react";
import { View, Text, Pressable } from "react-native";
import type { SendScreenProps } from "../../navigation/types";

export function SendScreen({ navigation }: SendScreenProps) {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">📤 Send</Text>
      <Text className="text-gray-400 text-center mb-8">Send SOL to an address</Text>

      <View className="w-full max-w-xs mb-4">
        <Text className="text-gray-400 text-sm mb-2">Recipient Address</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-gray-500">[Address input placeholder]</Text>
        </View>
      </View>

      <View className="w-full max-w-xs mb-8">
        <Text className="text-gray-400 text-sm mb-2">Amount (SOL)</Text>
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-gray-500">[Amount input placeholder]</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {}}
        className="bg-blue-600 px-6 py-3 rounded-lg mb-4 w-full max-w-xs"
      >
        <Text className="text-white font-semibold text-center">Send</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.goBack()}
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Cancel</Text>
      </Pressable>
    </View>
  );
}
