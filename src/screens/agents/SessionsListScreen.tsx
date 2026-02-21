import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { SessionsListScreenProps } from "../../navigation/types";
import { useSessionsStore, Session } from "../../stores/useSessionsStore";
import { useAgentsStore } from "../../stores/useAgentsStore";

export function SessionsListScreen({
  route,
  navigation,
}: SessionsListScreenProps) {
  const { agentId } = route.params;

  const agent = useAgentsStore((state) =>
    state.agents.find((a) => a.id === agentId)
  );
  const sessions = useSessionsStore((state) =>
    state.getSessionsForAgent(agentId)
  );

  const { activeSession, pastSessions } = useMemo(() => {
    const active = sessions.find((s) => s.status === "active");
    const past = sessions
      .filter((s) => s.status !== "active")
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    return { activeSession: active, pastSessions: past };
  }, [sessions]);

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return `${diffMins} min left`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (mins === 0) {
      return `${hours}h left`;
    }
    return `${hours}h ${mins}m left`;
  };

  const formatDuration = (startedAt: Date, expiresAt: Date): string => {
    const start = new Date(startedAt);
    const end = new Date(expiresAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));

    if (diffMins < 60) {
      return `${diffMins} min`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleSessionPress = (sessionId: string) => {
    navigation.navigate("SessionDetailScreen", { sessionId });
  };

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 p-4">
        {/* Active Session Section */}
        <Text className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
          Active
        </Text>

        {activeSession ? (
          <Pressable
            onPress={() => handleSessionPress(activeSession.id)}
            className="bg-gray-800 border border-green-600/30 rounded-xl p-4 mb-6 active:bg-gray-700"
          >
            <View className="flex-row items-center mb-2">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-white font-semibold">
                {formatTimeRemaining(activeSession.expiresAt)}
              </Text>
              <Text className="text-gray-400 mx-2">•</Text>
              <Text className="text-gray-300">
                {activeSession.limitSol} SOL limit
              </Text>
            </View>
            <Text className="text-gray-400">
              {activeSession.txCount} transaction
              {activeSession.txCount !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        ) : (
          <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
            <Text className="text-gray-500 text-center">
              No active session
            </Text>
          </View>
        )}

        {/* Past Sessions Section */}
        <Text className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
          Past
        </Text>

        {pastSessions.length > 0 ? (
          <View className="bg-gray-800 rounded-xl overflow-hidden">
            {pastSessions.map((session, index) => (
              <Pressable
                key={session.id}
                onPress={() => handleSessionPress(session.id)}
                className={`flex-row items-center justify-between p-4 active:bg-gray-700 ${
                  index < pastSessions.length - 1
                    ? "border-b border-gray-700"
                    : ""
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-white font-medium">
                      {formatDate(session.startedAt)}
                    </Text>
                    <Text className="text-gray-500 mx-2">•</Text>
                    <Text className="text-gray-400">
                      {formatDuration(session.startedAt, session.expiresAt)}
                    </Text>
                    <Text className="text-gray-500 mx-2">•</Text>
                    <Text className="text-gray-400">
                      {session.spentSol} SOL spent
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-lg ml-2">›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <Text className="text-gray-500 text-center">
              No past sessions
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
