import React from "react";
import { View, Text, Pressable } from "react-native";
import type { TransactionDetailScreenProps } from "../../navigation/types";

export function TransactionDetailScreen({
  route,
  navigation,
}: TransactionDetailScreenProps) {
  const { transactionId } = route.params;

  return (
    <View className="flex-1 bg-gray-900 items-center justify-center p-4">
      <Text className="text-white text-2xl font-bold mb-2">💸 Transaction</Text>
      <Text className="text-gray-400 text-center mb-8">
        Transaction ID: {transactionId}
      </Text>

      <View className="w-full max-w-xs bg-gray-800 rounded-lg p-4 mb-8">
        <Text className="text-gray-500 text-center">
          [Transaction details placeholder]
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        className="bg-gray-700 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Back</Text>
      </Pressable>
    </View>
  );
}
