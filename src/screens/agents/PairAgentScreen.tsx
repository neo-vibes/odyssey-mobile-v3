import React from "react";
import { View, Text, Pressable } from "react-native";
import type { PairAgentScreenProps } from "../../navigation/types";

export function PairAgentScreen({ navigation }: PairAgentScreenProps) {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">🔗 Pair Agent</Text>
      <Text className="text-gray-400 text-center mb-8">
        Enter pairing code from your agent
      </Text>

      <View className="w-full max-w-xs bg-gray-800 rounded-lg p-4 mb-8">
        <Text className="text-gray-500 text-center">
          [Pairing code input placeholder]
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Cancel</Text>
      </Pressable>
    </View>
  );
}
