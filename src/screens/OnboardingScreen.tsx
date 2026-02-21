import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useWalletStore } from "../stores/useWalletStore";

// =============================================================================
// Types
// =============================================================================

type OnboardingState = "idle" | "loading" | "error";

interface OnboardingScreenProps {
  onLinkComplete?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const TELEGRAM_BOT_LINK = "https://t.me/odyssey_session_bot";
const DEV_WALLET_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const DEV_TAP_COUNT = 5;

// =============================================================================
// OnboardingScreen Component
// =============================================================================

export function OnboardingScreen({ onLinkComplete }: OnboardingScreenProps) {
  const [state, setState] = useState<OnboardingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAddress, setIsLinked } = useWalletStore();
  
  // Dev mode: tap logo 5x to bypass
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    if (tapCountRef.current >= DEV_TAP_COUNT) {
      // Dev mode activated - use mock wallet
      console.log("🔧 Dev mode: Using mock wallet");
      setAddress(DEV_WALLET_ADDRESS);
      setIsLinked(true);
      onLinkComplete?.();
      tapCountRef.current = 0;
      return;
    }
    
    // Reset tap count after 2 seconds of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  }, [setAddress, setIsLinked, onLinkComplete]);

  // Handle "Link Telegram Wallet" button press
  const handleLinkWallet = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);

    try {
      // TODO: Implement Telegram OAuth / QR scan flow
      // For now, simulate the linking process
      // This will be replaced with actual Telegram login integration

      // Simulated delay for demo
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual wallet linking logic:
      // 1. Open Telegram OAuth / show QR code
      // 2. User authenticates via Telegram
      // 3. Server identifies wallet via telegramId
      // 4. Mobile creates passkey
      // 5. Mobile signs challenge (off-chain)
      // 6. Server sends "Add device" request to Telegram
      // 7. User approves on Telegram
      // 8. Mobile passkey added as signer

      // For demo purposes, throw an error to show error state
      // Remove this in production
      throw new Error("Telegram linking not yet implemented");

      // Success flow (uncomment when implemented):
      // setAddress(walletAddress);
      // setIsLinked(true);
      // onLinkComplete?.();
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to wallet. Make sure you have a wallet in @odyssey_bot first."
      );
    }
  }, [setAddress, setIsLinked, onLinkComplete]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setState("idle");
    setErrorMessage(null);
  }, []);

  // Handle opening Telegram bot
  const handleCreateWallet = useCallback(async () => {
    try {
      await Linking.openURL(TELEGRAM_BOT_LINK);
    } catch (error) {
      console.error("Failed to open Telegram:", error);
    }
  }, []);

  // =========================================================================
  // Render States
  // =========================================================================

  // Loading State
  if (state === "loading") {
    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        <ActivityIndicator size="large" color="#FFB84D" className="mb-6" />
        <Text className="text-gold text-h2 font-semibold mb-3">Linking...</Text>
        <Text className="text-text-secondary text-body text-center">
          Waiting for approval on Telegram
        </Text>
      </View>
    );
  }

  // Error State
  if (state === "error") {
    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        {/* Tappable logo for dev mode */}
        <Pressable onPress={handleLogoTap}>
          <Text className="text-4xl mb-4">❌</Text>
        </Pressable>
        <Text className="text-error text-h2 font-semibold mb-3">
          Link Failed
        </Text>
        <Text className="text-text-secondary text-body text-center mb-8 max-w-[280px]">
          {errorMessage ||
            "Could not connect to wallet. Make sure you have a wallet in @odyssey_bot first."}
        </Text>

        <View className="flex-row gap-3">
          <Pressable
            onPress={handleRetry}
            className="bg-background-elevated border border-text-secondary/30 px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-text-primary font-semibold text-body">
              Try Again
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreateWallet}
            className="bg-gold px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-background-base font-semibold text-body">
              Create Wallet →
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Idle State (Default)
  return (
    <View className="flex-1 bg-background-base items-center justify-center px-8">
      {/* Tappable logo for dev mode */}
      <Pressable onPress={handleLogoTap}>
        <Text className="text-6xl mb-4">🚀</Text>
      </Pressable>
      <Text className="text-text-primary text-h1 font-bold mb-3">Odyssey</Text>

      {/* Tagline */}
      <Text className="text-text-secondary text-body text-center mb-12 max-w-[280px]">
        Give your agents spending power
      </Text>

      {/* Primary Action */}
      <Pressable
        onPress={handleLinkWallet}
        className="bg-gold w-full max-w-[280px] py-4 rounded-xl items-center active:bg-gold-500 mb-8"
      >
        <Text className="text-background-base font-bold text-body">
          Link Telegram Wallet
        </Text>
      </Pressable>

      {/* Secondary Action */}
      <View className="items-center">
        <Text className="text-text-muted text-caption mb-1">
          Don't have one?
        </Text>
        <Pressable onPress={handleCreateWallet} className="active:opacity-80">
          <Text className="text-gold text-caption font-medium">
            Create in @odyssey_bot →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default OnboardingScreen;
