import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWalletStore } from "../stores/useWalletStore";

// =============================================================================
// Types
// =============================================================================

type RootStackParamList = {
  Onboarding: { token?: string } | undefined;
  ScanQR: undefined;
  Main: undefined;
};

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Onboarding"
>;

type OnboardingScreenRouteProp = RouteProp<RootStackParamList, "Onboarding">;

type OnboardingState = "idle" | "loading" | "error";

interface OnboardingScreenProps {
  onLinkComplete?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const TELEGRAM_BOT_LINK = "https://t.me/odyssey_session_bot";
const DEV_WALLET_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const DEV_TELEGRAM_ID = 6213870545;  // Yann's telegram ID for dev testing
const DEV_TAP_COUNT = 5;

// =============================================================================
// OnboardingScreen Component
// =============================================================================

export function OnboardingScreen({ onLinkComplete }: OnboardingScreenProps) {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const route = useRoute<OnboardingScreenRouteProp>();
  const [state, setState] = useState<OnboardingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAddress, setTelegramId, setIsLinked } = useWalletStore();
  
  // Dev mode: tap logo 5x to bypass
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle token from QR scan
  useEffect(() => {
    const token = route.params?.token;
    if (token) {
      // Token received from ScanQR - start linking process
      console.log("📱 Received token from QR scan:", token.substring(0, 8) + "...");
      handleTokenReceived(token);
    }
  }, [route.params?.token]);

  // Process the token received from QR scan
  const handleTokenReceived = useCallback(async (token: string) => {
    setState("loading");
    setErrorMessage(null);

    try {
      // TODO: Implement full linking flow:
      // 1. GET /api/pair-mobile/:token - fetch wallet details
      // 2. Create passkey (Face ID / Touch ID)
      // 3. POST /api/pair-mobile/register - send device info
      // 4. Poll for approval status
      // 5. On approval, save wallet and complete

      // For now, simulate the process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual implementation
      throw new Error("Mobile linking flow not yet implemented");
      
    } catch (error) {
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not link wallet. Please try again."
      );
    }
  }, [setAddress, setTelegramId, setIsLinked, onLinkComplete]);

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    if (tapCountRef.current >= DEV_TAP_COUNT) {
      // Dev mode activated - use mock wallet
      console.log("🔧 Dev mode: Using mock wallet");
      setAddress(DEV_WALLET_ADDRESS);
      setTelegramId(DEV_TELEGRAM_ID);
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
  const handleLinkWallet = useCallback(() => {
    // Navigate to QR scanner
    navigation.navigate("ScanQR");
  }, [navigation]);

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
          <Image
            source={require("../../assets/logo.png")}
            className="w-20 h-20 mb-4 opacity-50"
            resizeMode="contain"
          />
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
        <Image
          source={require("../../assets/logo.png")}
          className="w-24 h-24 mb-4"
          resizeMode="contain"
        />
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
