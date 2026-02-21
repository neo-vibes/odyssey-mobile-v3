import React, { useState, useCallback } from "react";
import { View, Text, Pressable, Linking, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { TransactionDetailScreenProps } from "../../navigation/types";

// Transaction type icons
const TX_ICONS: Record<string, string> = {
  send: "📤",
  receive: "📥",
  swap: "🔄",
};

// Transaction type labels
const TX_LABELS: Record<string, string> = {
  send: "Sent",
  receive: "Received",
  swap: "Swapped",
};

// Mock transaction data (in production, this would come from a store or API)
const MOCK_TRANSACTION = {
  signature: "4YnJx8WqKfLmVNzHgR3TpQsDc7UjYk2nAfMbP8JWcVsN",
  type: "send" as const,
  amountSol: 0.05,
  amountUsd: 8.5,
  destination: "7xKt9RbPqJ2VmWnLkZcH5TsNdCfYgE4uQaXv3nQmKRpS",
  timestamp: new Date("2026-02-19T14:35:00"),
};

// Truncate address/signature for display
function truncateAddress(address: string, startChars = 4, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Copyable field component
function CopyableField({
  label,
  value,
  displayValue,
}: {
  label: string;
  value: string;
  displayValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      <View className="flex-row items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
        <Text className="text-white font-mono text-base flex-1">
          {displayValue ?? value}
        </Text>
        <Pressable
          onPress={handleCopy}
          className="ml-3 bg-gray-700 px-3 py-1.5 rounded active:bg-gray-600"
        >
          <Text className="text-gray-300 text-sm font-medium">
            {copied ? "Copied!" : "Copy"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Info row component
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm mb-2">{label}</Text>
      <Text className="text-white text-base">{value}</Text>
    </View>
  );
}

export function TransactionDetailScreen({
  route,
}: TransactionDetailScreenProps) {
  const { transactionId } = route.params;

  // In production, fetch transaction by ID
  // For now, use mock data
  const tx = MOCK_TRANSACTION;

  const icon = TX_ICONS[tx.type] ?? "💸";
  const label = TX_LABELS[tx.type] ?? "Transaction";

  const handleViewOnExplorer = useCallback(async () => {
    const url = `https://solscan.io/tx/${tx.signature}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }, [tx.signature]);

  return (
    <ScrollView className="flex-1 bg-gray-900">
      <View className="p-4">
        {/* Transaction header */}
        <View className="items-center py-8">
          <Text className="text-5xl mb-4">{icon}</Text>
          <Text className="text-white text-2xl font-bold">
            {label} {tx.amountSol} SOL
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-700 mb-6" />

        {/* Transaction details */}
        {tx.destination && (
          <CopyableField
            label="To"
            value={tx.destination}
            displayValue={truncateAddress(tx.destination)}
          />
        )}

        <InfoRow
          label="Amount"
          value={`${tx.amountSol} SOL (~$${tx.amountUsd.toFixed(2)})`}
        />

        <InfoRow
          label="Time"
          value={`${formatDate(tx.timestamp)} • ${formatTime(tx.timestamp)}`}
        />

        <CopyableField
          label="Signature"
          value={tx.signature}
          displayValue={truncateAddress(tx.signature)}
        />

        {/* View on Explorer button */}
        <Pressable
          onPress={handleViewOnExplorer}
          className="bg-blue-600 py-4 rounded-lg active:bg-blue-700 mt-4"
        >
          <Text className="text-white font-semibold text-center text-base">
            View on Explorer
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
