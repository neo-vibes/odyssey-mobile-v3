import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import type { SessionDetailScreenProps } from "../../navigation/types";

// Types from spec
interface Session {
  id: string;
  agentId: string;
  startedAt: Date;
  expiresAt: Date;
  limitSol: number;
  spentSol: number;
  status: "active" | "expired" | "exhausted";
  txCount: number;
}

interface Transaction {
  signature: string;
  type: "send" | "receive" | "swap";
  amountSol: number;
  destination?: string;
  swapTo?: string;
  timestamp: Date;
}

// Helper to format date
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Helper to format duration
function formatDuration(startedAt: Date, expiresAt: Date): string {
  const diffMs = expiresAt.getTime() - startedAt.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${minutes}m`;
}

// Helper to truncate address
function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Transaction icon based on type
function getTxIcon(type: Transaction["type"]): string {
  switch (type) {
    case "send":
      return "📤";
    case "receive":
      return "📥";
    case "swap":
      return "🔄";
  }
}

// Status badge colors
function getStatusStyle(status: Session["status"]): {
  bg: string;
  text: string;
} {
  switch (status) {
    case "active":
      return { bg: "bg-green-900/50", text: "text-green-400" };
    case "expired":
      return { bg: "bg-gray-700/50", text: "text-gray-400" };
    case "exhausted":
      return { bg: "bg-orange-900/50", text: "text-orange-400" };
  }
}

// Mock data
const MOCK_SESSION: Session = {
  id: "session-1",
  agentId: "agent-1",
  startedAt: new Date("2026-02-19T14:30:00"),
  expiresAt: new Date("2026-02-19T15:30:00"),
  limitSol: 0.5,
  spentSol: 0.1,
  status: "expired",
  txCount: 3,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    signature: "4YnJx8kW...3nQm8JWc",
    type: "send",
    amountSol: 0.05,
    destination: "7xKtR9vB5sQ2pL4mN8jH6kY3nQm",
    timestamp: new Date("2026-02-19T14:35:00"),
  },
  {
    signature: "5ZoKy9lX...4oRn9KXd",
    type: "send",
    amountSol: 0.03,
    destination: "9aBcD1eF2gH3iJ4kL5mN6oP4dEf",
    timestamp: new Date("2026-02-19T14:45:00"),
  },
  {
    signature: "6ApLz0mY...5pSo0LYe",
    type: "swap",
    amountSol: 0.02,
    swapTo: "USDC",
    timestamp: new Date("2026-02-19T15:10:00"),
  },
];

// Transaction row component
function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress: () => void;
}) {
  const icon = getTxIcon(transaction.type);

  // Build description based on type
  let description: string;
  if (transaction.type === "swap") {
    description = `Swap ${transaction.amountSol} SOL → ${transaction.swapTo}`;
  } else if (transaction.destination) {
    description = `${transaction.amountSol} SOL → ${truncateAddress(transaction.destination)}`;
  } else {
    description = `${transaction.amountSol} SOL`;
  }

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 active:bg-gray-800/50"
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-white text-base">{description}</Text>
      <Text className="text-gray-500 text-lg">›</Text>
    </Pressable>
  );
}

export function SessionDetailScreen({
  route,
  navigation,
}: SessionDetailScreenProps) {
  const { sessionId } = route.params;

  // In real app, fetch session by sessionId
  const session = MOCK_SESSION;
  const transactions = MOCK_TRANSACTIONS;
  const statusStyle = getStatusStyle(session.status);

  return (
    <ScrollView className="flex-1 bg-gray-900">
      {/* Session Metadata */}
      <View className="p-4">
        {/* Date and time */}
        <Text className="text-white text-lg font-semibold mb-4">
          {formatDate(session.startedAt)} • {formatTime(session.startedAt)}
        </Text>

        {/* Metadata rows */}
        <View className="space-y-2">
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-400">Duration</Text>
            <Text className="text-white">
              {formatDuration(session.startedAt, session.expiresAt)}
            </Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-gray-400">Limit</Text>
            <Text className="text-white">{session.limitSol} SOL</Text>
          </View>

          <View className="flex-row justify-between py-1">
            <Text className="text-gray-400">Spent</Text>
            <Text className="text-white">{session.spentSol} SOL</Text>
          </View>

          <View className="flex-row justify-between items-center py-1">
            <Text className="text-gray-400">Status</Text>
            <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
              <Text className={`${statusStyle.text} capitalize text-sm`}>
                {session.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-800 mx-4" />

      {/* Transactions section */}
      <View className="mt-4">
        <Text className="text-gray-400 text-sm px-4 mb-2">
          Transactions ({transactions.length})
        </Text>

        {transactions.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-gray-500">No transactions</Text>
          </View>
        ) : (
          <View>
            {transactions.map((tx, index) => (
              <React.Fragment key={tx.signature}>
                <TransactionRow
                  transaction={tx}
                  onPress={() =>
                    navigation.navigate("TransactionDetailScreen", {
                      transactionId: tx.signature,
                    })
                  }
                />
                {index < transactions.length - 1 && (
                  <View className="h-px bg-gray-800 ml-12 mr-4" />
                )}
              </React.Fragment>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
