import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import type { SendScreenProps } from "../../navigation/types";
import { useWalletStore } from "../../stores/useWalletStore";
import { sendSol } from "../../services/api";

// Estimated network fee in SOL
const NETWORK_FEE_SOL = 0.000005;

// Base58 character set for Solana addresses
const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Validates a Solana address:
 * - Must be 32-44 characters
 * - Must contain only base58 characters
 */
function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) {
    return false;
  }
  for (const char of address) {
    if (!BASE58_CHARS.includes(char)) {
      return false;
    }
  }
  return true;
}

/**
 * Formats SOL amount for display
 */
function formatSol(amount: number): string {
  if (amount === 0) return "0.00";
  if (amount < 0.000001) return "0.000000";
  if (amount < 0.01) return amount.toFixed(6);
  return amount.toFixed(2);
}

type SendState = "idle" | "sending" | "success" | "error";

export function SendScreen({ navigation }: SendScreenProps) {
  const { balanceSol } = useWalletStore();

  // Form state
  const [address, setAddress] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed values
  const amount = useMemo(() => {
    const parsed = parseFloat(amountStr);
    return isNaN(parsed) ? 0 : parsed;
  }, [amountStr]);

  const maxAmount = useMemo(() => {
    const max = balanceSol - NETWORK_FEE_SOL;
    return max > 0 ? max : 0;
  }, [balanceSol]);

  // Validation
  const addressError = useMemo(() => {
    if (!address) return null;
    if (!isValidSolanaAddress(address)) return "Invalid Solana address";
    return null;
  }, [address]);

  const amountError = useMemo(() => {
    if (!amountStr) return null;
    if (amount <= 0) return "Enter a valid amount";
    if (amount > maxAmount) return "Insufficient balance";
    return null;
  }, [amountStr, amount, maxAmount]);

  const isValid = useMemo(() => {
    return (
      address.length > 0 &&
      !addressError &&
      amountStr.length > 0 &&
      !amountError &&
      amount > 0
    );
  }, [address, addressError, amountStr, amountError, amount]);

  // Handlers
  const handleMaxPress = useCallback(() => {
    if (maxAmount > 0) {
      setAmountStr(maxAmount.toFixed(9).replace(/\.?0+$/, ""));
    }
  }, [maxAmount]);

  const handleSend = useCallback(async () => {
    if (!isValid) return;

    setSendState("sending");
    setErrorMessage(null);

    try {
      // TODO: Integrate passkey signature for production
      const result = await sendSol({
        destination: address,
        amountSol: amount,
        signature: "", // Placeholder - passkey integration needed
        authenticatorData: "",
        clientDataJSON: "",
      });

      if (result.ok) {
        setSendState("success");
        Alert.alert(
          "Success!",
          `Sent ${formatSol(amount)} SOL`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setSendState("error");
        setErrorMessage(result.error?.message || "Transaction failed");
        Alert.alert("Error", result.error?.message || "Transaction failed");
      }
    } catch (error) {
      setSendState("error");
      const msg = error instanceof Error ? error.message : "Transaction failed";
      setErrorMessage(msg);
      Alert.alert("Error", msg);
    }
  }, [isValid, address, amount, navigation]);

  const isSending = sendState === "sending";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0A0A]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-8 pb-6">
          {/* Sending Overlay */}
          {isSending && (
            <View className="absolute inset-0 bg-black/80 z-10 items-center justify-center">
              <ActivityIndicator size="large" color="#FFB84D" />
              <Text className="text-white text-xl mt-4 font-semibold">
                Sending...
              </Text>
            </View>
          )}

          {/* To Address */}
          <View className="mb-6">
            <Text className="text-[#A1A1AA] text-sm mb-2 font-medium">To</Text>
            <TextInput
              className={`bg-[#1F1F1F] text-white text-base p-4 rounded-xl border ${
                addressError ? "border-red-500" : "border-transparent"
              }`}
              placeholder="Solana address"
              placeholderTextColor="#71717A"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSending}
            />
            {addressError && (
              <Text className="text-red-500 text-sm mt-1">{addressError}</Text>
            )}
          </View>

          {/* Amount */}
          <View className="mb-4">
            <Text className="text-[#A1A1AA] text-sm mb-2 font-medium">
              Amount
            </Text>
            <View
              className={`flex-row items-center bg-[#1F1F1F] rounded-xl border ${
                amountError ? "border-red-500" : "border-transparent"
              }`}
            >
              <TextInput
                className="flex-1 text-white text-base p-4"
                placeholder="0.00"
                placeholderTextColor="#71717A"
                value={amountStr}
                onChangeText={setAmountStr}
                keyboardType="decimal-pad"
                editable={!isSending}
              />
              <Text className="text-[#A1A1AA] text-base mr-2">SOL</Text>
              <Pressable
                onPress={handleMaxPress}
                disabled={isSending || maxAmount <= 0}
                className="bg-[#FFB84D] px-3 py-1.5 rounded-lg mr-3 active:opacity-80"
              >
                <Text className="text-black text-sm font-semibold">Max</Text>
              </Pressable>
            </View>
            {amountError && (
              <Text className="text-red-500 text-sm mt-1">{amountError}</Text>
            )}
          </View>

          {/* Available Balance */}
          <Text className="text-[#A1A1AA] text-sm mb-6">
            Available: {formatSol(balanceSol)} SOL
          </Text>

          {/* Network Fee */}
          <View className="border-t border-[#27272A] pt-4 mb-8">
            <Text className="text-[#A1A1AA] text-sm">
              Network fee: ~{NETWORK_FEE_SOL} SOL
            </Text>
          </View>

          {/* Error Message */}
          {errorMessage && sendState === "error" && (
            <View className="bg-red-500/20 p-4 rounded-xl mb-4">
              <Text className="text-red-400 text-center">{errorMessage}</Text>
            </View>
          )}

          {/* Spacer */}
          <View className="flex-1" />

          {/* Send Button */}
          <Pressable
            onPress={handleSend}
            disabled={!isValid || isSending}
            className={`py-4 rounded-xl items-center ${
              isValid && !isSending
                ? "bg-[#FFB84D] active:opacity-80"
                : "bg-[#3F3F46]"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isValid && !isSending ? "text-black" : "text-[#71717A]"
              }`}
            >
              Send
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
