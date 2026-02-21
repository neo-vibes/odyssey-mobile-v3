import React from "react";
import { View, Text, Pressable } from "react-native";
import type { AgentDetailScreenProps } from "../../navigation/types";

export function AgentDetailScreen({
  route,
  navigation,
}: AgentDetailScreenProps) {
  const { agentId } = route.params;

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">🤖 Agent Detail</Text>
      <Text className="text-gray-400 text-center mb-8">Agent ID: {agentId}</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("SessionsListScreen", { agentId })
        }
        className="bg-blue-600 px-6 py-3 rounded-lg mb-4"
      >
        <Text className="text-white font-semibold">View Sessions</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.goBack()}
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Back</Text>
      </Pressable>
    </View>
  );
}
