import React from "react";
import { View, Text, Pressable } from "react-native";
import type { AgentsScreenProps } from "../../navigation/types";

export function AgentsScreen({ navigation }: AgentsScreenProps) {
  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">🤖 Agents</Text>
      <Text className="text-gray-400 text-center mb-8">
        Manage your paired agents and pending requests
      </Text>

      <Pressable
        onPress={() => navigation.navigate("PairAgentScreen")}
        className="bg-blue-600 px-6 py-3 rounded-lg mb-4"
      >
        <Text className="text-white font-semibold">Pair New Agent</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("AgentDetailScreen", { agentId: "demo-agent" })
        }
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">View Demo Agent</Text>
      </Pressable>
    </View>
  );
}
