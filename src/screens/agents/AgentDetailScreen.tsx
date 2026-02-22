import React, { useMemo } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import type { AgentDetailScreenProps } from "../../navigation/types";
import { useAgentsStore } from "../../stores/useAgentsStore";
import { useSessionsStore, Session } from "../../stores/useSessionsStore";

const EMPTY_SESSIONS: Session[] = [];

export function AgentDetailScreen({
  route,
  navigation,
}: AgentDetailScreenProps) {
  const { agentId } = route.params;

  const agent = useAgentsStore((state) =>
    state.agents.find((a) => a.id === agentId)
  );
  const removeAgent = useAgentsStore((state) => state.removeAgent);

  const sessions = useSessionsStore((state) =>
    state.sessionsByAgent[agentId] ?? EMPTY_SESSIONS
  );

  const sessionCounts = useMemo(() => {
    const active = sessions.filter((s) => s.status === "active").length;
    const past = sessions.filter((s) => s.status !== "active").length;
    return { active, past };
  }, [sessions]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUnpair = () => {
    Alert.alert(
      "Unpair Agent",
      `Are you sure you want to unpair ${agent?.name ?? "this agent"}? This will revoke all active sessions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: () => {
            removeAgent(agentId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!agent) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <Text className="text-gray-400 text-lg">Agent not found</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 bg-gray-700 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 p-4">
      {/* Agent Info Section */}
      <View className="items-center py-8">
        <Text className="text-5xl mb-4">🤖</Text>
        <Text className="text-white text-2xl font-bold">{agent.name}</Text>
        <Text className="text-gray-400 mt-1">
          Paired: {formatDate(agent.pairedAt)}
        </Text>
      </View>

      {/* Unpair Button */}
      <View className="px-4 mb-8">
        <Pressable
          onPress={handleUnpair}
          className="bg-red-600/20 border border-red-600 py-3 rounded-lg active:bg-red-600/40"
        >
          <Text className="text-red-500 font-semibold text-center">
            Unpair Agent
          </Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-700 mx-4" />

      {/* Sessions Section */}
      <Pressable
        onPress={() => navigation.navigate("SessionsListScreen", { agentId })}
        className="mx-4 py-4 active:bg-gray-800 rounded-lg"
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-semibold">Sessions</Text>
          <View className="flex-row items-center">
            <Text className="text-blue-400 font-medium mr-1">View</Text>
            <Text className="text-blue-400">›</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="mr-8">
            <Text className="text-gray-400">Active</Text>
            <Text className="text-white text-xl font-semibold">
              {sessionCounts.active}
            </Text>
          </View>
          <View>
            <Text className="text-gray-400">Past</Text>
            <Text className="text-white text-xl font-semibold">
              {sessionCounts.past}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
