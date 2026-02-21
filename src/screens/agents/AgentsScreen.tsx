import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAgentsStore, useSessionsStore } from "../../stores";
import type { AgentsScreenProps } from "../../navigation/types";
import type { PairingRequest, Agent } from "../../stores";
import type { SessionRequest } from "../../stores";

// ============================================================================
// Pairing Request Card Component
// ============================================================================
interface PairingRequestCardProps {
  request: PairingRequest;
  onApprove: () => void;
  onDeny: () => void;
  onDetails: () => void;
}

function PairingRequestCard({
  request,
  onApprove,
  onDeny,
  onDetails,
}: PairingRequestCardProps) {
  const timeAgo = getTimeAgo(request.requestedAt);

  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">🔗</Text>
        <Text className="text-white font-semibold text-base">
          Pairing Request
        </Text>
      </View>

      <Text className="text-gray-300 mb-1">
        Agent: <Text className="text-white font-medium">{request.agentName}</Text>
      </Text>
      <Text className="text-gray-500 text-sm mb-4">Requested: {timeAgo}</Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row">
          <Pressable
            onPress={onApprove}
            className="bg-green-600 px-4 py-2 rounded-lg mr-2 active:opacity-80"
          >
            <Text className="text-white font-semibold">Approve</Text>
          </Pressable>
          <Pressable
            onPress={onDeny}
            className="bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-red-400 font-semibold">Deny</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onDetails}
          className="px-4 py-2 active:opacity-60"
        >
          <Text className="text-blue-400 font-semibold">Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Session Request Card Component
// ============================================================================
interface SessionRequestCardProps {
  request: SessionRequest;
  onApprove: () => void;
  onDeny: () => void;
  onDetails: () => void;
}

function SessionRequestCard({
  request,
  onApprove,
  onDeny,
  onDetails,
}: SessionRequestCardProps) {
  const durationStr = formatDuration(request.durationSeconds);

  return (
    <View className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
      <View className="flex-row items-center mb-2">
        <Text className="text-lg mr-2">🔐</Text>
        <Text className="text-white font-semibold text-base">
          Session Request
        </Text>
      </View>

      <Text className="text-gray-300 mb-1">
        {request.agentName} • {durationStr} • {request.limitSol} SOL
      </Text>
      <Text className="text-gray-500 text-sm mb-4">
        Requested: {getTimeAgo(request.requestedAt)}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row">
          <Pressable
            onPress={onApprove}
            className="bg-green-600 px-4 py-2 rounded-lg mr-2 active:opacity-80"
          >
            <Text className="text-white font-semibold">Approve</Text>
          </Pressable>
          <Pressable
            onPress={onDeny}
            className="bg-red-600/20 border border-red-600 px-4 py-2 rounded-lg active:opacity-80"
          >
            <Text className="text-red-400 font-semibold">Deny</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onDetails}
          className="px-4 py-2 active:opacity-60"
        >
          <Text className="text-blue-400 font-semibold">Details</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// Agent Row Component
// ============================================================================
interface AgentRowProps {
  agent: Agent;
  onPress: () => void;
}

function AgentRow({ agent, onPress }: AgentRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-2 border-b border-gray-800 active:bg-gray-800/50"
    >
      <View className="flex-row items-center">
        {agent.hasActiveSession && (
          <Text className="text-green-500 mr-2">🟢</Text>
        )}
        <Text className="text-white text-base font-medium">{agent.name}</Text>
      </View>
      <Text className="text-gray-500 text-xl">›</Text>
    </Pressable>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================
interface EmptyStateProps {
  onPairAgent: () => void;
}

function EmptyState({ onPairAgent }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-gray-400 text-lg text-center mb-6">
        No agents paired yet
      </Text>
      <Pressable
        onPress={onPairAgent}
        className="bg-blue-600 px-6 py-3 rounded-lg active:opacity-80"
      >
        <Text className="text-white font-semibold">Pair Your First Agent</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================
function getTimeAgo(date: Date): string {
  const now = new Date();
  const dateObj = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${mins} min`;
}

// ============================================================================
// Main Screen Component
// ============================================================================
export function AgentsScreen({ navigation }: AgentsScreenProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  // Store selectors
  const agents = useAgentsStore((s) => s.agents);
  const pendingPairingRequests = useAgentsStore((s) => s.pendingPairingRequests);
  const removePairingRequest = useAgentsStore((s) => s.removePairingRequest);

  const pendingSessionRequests = useSessionsStore((s) => s.pendingSessionRequests);
  const removeSessionRequest = useSessionsStore((s) => s.removeSessionRequest);

  // Derived state
  const hasAgents = agents.length > 0;
  const hasPendingRequests =
    pendingPairingRequests.length > 0 || pendingSessionRequests.length > 0;
  const showEmptyState = !hasAgents && !hasPendingRequests;

  // Handlers
  const handleApprovePairing = useCallback(
    (requestId: string) => {
      // TODO: Call API to approve pairing, then refresh
      console.log("Approve pairing:", requestId);
      removePairingRequest(requestId);
    },
    [removePairingRequest]
  );

  const handleDenyPairing = useCallback(
    (requestId: string) => {
      // TODO: Call API to deny pairing
      console.log("Deny pairing:", requestId);
      removePairingRequest(requestId);
    },
    [removePairingRequest]
  );

  const handleApproveSession = useCallback(
    (requestId: string) => {
      // TODO: Call API to approve session
      console.log("Approve session:", requestId);
      removeSessionRequest(requestId);
    },
    [removeSessionRequest]
  );

  const handleDenySession = useCallback(
    (requestId: string) => {
      // TODO: Call API to deny session
      console.log("Deny session:", requestId);
      removeSessionRequest(requestId);
    },
    [removeSessionRequest]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch agents and pending requests from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const navigateToPairAgent = useCallback(() => {
    navigation.navigate("PairAgentScreen");
  }, [navigation]);

  const navigateToAgentDetail = useCallback(
    (agentId: string) => {
      navigation.navigate("AgentDetailScreen", { agentId });
    },
    [navigation]
  );

  // Render empty state
  if (showEmptyState) {
    return (
      <View className="flex-1 bg-gray-900">
        <EmptyState onPairAgent={navigateToPairAgent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Pending Requests Section */}
        {hasPendingRequests && (
          <View className="px-4 pt-4">
            {/* Pairing Requests */}
            {pendingPairingRequests.map((request) => (
              <PairingRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprovePairing(request.id)}
                onDeny={() => handleDenyPairing(request.id)}
                onDetails={() => {
                  // TODO: Navigate to pairing request details
                  console.log("View pairing details:", request.id);
                }}
              />
            ))}

            {/* Session Requests */}
            {pendingSessionRequests.map((request) => (
              <SessionRequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApproveSession(request.id)}
                onDeny={() => handleDenySession(request.id)}
                onDetails={() => {
                  // TODO: Navigate to session request details
                  console.log("View session details:", request.id);
                }}
              />
            ))}
          </View>
        )}

        {/* Paired Agents Section */}
        {hasAgents && (
          <View className="px-4 mt-4">
            {/* Section divider */}
            {hasPendingRequests && (
              <View className="border-t border-gray-700 mb-4" />
            )}

            <Text className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-2">
              Paired Agents
            </Text>

            <View className="bg-gray-800/50 rounded-xl overflow-hidden">
              {agents.map((agent, index) => (
                <React.Fragment key={agent.id}>
                  <AgentRow
                    agent={agent}
                    onPress={() => navigateToAgentDetail(agent.id)}
                  />
                  {index < agents.length - 1 && (
                    <View className="h-px bg-gray-700 ml-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Pair New Agent Button */}
        <View className="px-4 mt-6">
          <Pressable
            onPress={navigateToPairAgent}
            className="bg-blue-600 py-4 rounded-xl items-center active:opacity-80"
          >
            <Text className="text-white font-semibold text-base">
              + Pair New Agent
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
