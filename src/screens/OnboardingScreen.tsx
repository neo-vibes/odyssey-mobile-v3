import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Linking,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useWalletStore } from "../stores/useWalletStore";
import {
  getPairingDetails,
  registerDevice,
  pollApprovalStatus,
  type PairingDetails,
} from "../services/pairing";
import { saveLinkedWallet } from "../services/wallet-storage";

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

type OnboardingState =
  | "idle"
  | "linking"
  | "creating_passkey"
  | "registering"
  | "waiting_approval"
  | "error";

interface OnboardingScreenProps {
  onLinkComplete?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const TELEGRAM_BOT_LINK = "https://t.me/odyssey_session_bot";
const DEV_WALLET_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const DEV_TELEGRAM_ID = 6213870545; // Yann's telegram ID for dev testing
const DEV_TAP_COUNT = 5;
const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds
const APPROVAL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout

// =============================================================================
// Error Types & Messages
// =============================================================================

type ErrorType =
  | "token_expired"
  | "passkey_failed"
  | "approval_denied"
  | "timeout"
  | "network"
  | "generic";

interface ErrorInfo {
  type: ErrorType;
  title: string;
  message: string;
}

const ERROR_MESSAGES: Record<ErrorType, { title: string; message: string }> = {
  token_expired: {
    title: "QR Code Expired",
    message: "QR code expired. Please generate a new one in Telegram.",
  },
  passkey_failed: {
    title: "Authentication Required",
    message: "Face ID / Touch ID is required to link your wallet.",
  },
  approval_denied: {
    title: "Request Denied",
    message: "The linking request was denied in Telegram. Please try again.",
  },
  timeout: {
    title: "Request Timed Out",
    message: "Approval timed out after 5 minutes. Please try again.",
  },
  network: {
    title: "Connection Failed",
    message: "Connection failed. Please check your internet and try again.",
  },
  generic: {
    title: "Link Failed",
    message: "Could not link wallet. Please try again.",
  },
};

/**
 * Classify error into specific type for appropriate messaging
 */
function classifyError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Token/QR expired
    if (
      message.includes("expired") ||
      message.includes("not found") ||
      message.includes("404") ||
      message.includes("invalid token")
    ) {
      return { type: "token_expired", ...ERROR_MESSAGES.token_expired };
    }

    // Passkey/biometric errors
    if (
      message.includes("passkey") ||
      message.includes("biometric") ||
      message.includes("face id") ||
      message.includes("touch id") ||
      message.includes("authentication") ||
      message.includes("user cancelled") ||
      message.includes("not enrolled")
    ) {
      return { type: "passkey_failed", ...ERROR_MESSAGES.passkey_failed };
    }

    // Approval denied
    if (message.includes("denied") || message.includes("rejected")) {
      return { type: "approval_denied", ...ERROR_MESSAGES.approval_denied };
    }

    // Timeout
    if (message.includes("timed out") || message.includes("timeout")) {
      return { type: "timeout", ...ERROR_MESSAGES.timeout };
    }

    // Network errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("internet") ||
      error.name === "TypeError" // fetch throws TypeError on network failure
    ) {
      return { type: "network", ...ERROR_MESSAGES.network };
    }
  }

  // Check for TypeError (common for network failures)
  if (error instanceof TypeError) {
    return { type: "network", ...ERROR_MESSAGES.network };
  }

  return { type: "generic", ...ERROR_MESSAGES.generic };
}

// =============================================================================
// Passkey Helper (placeholder for react-native-passkey)
// =============================================================================

interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
}

/**
 * Base64 encode a string (React Native compatible)
 */
function btoa64(str: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = str.charCodeAt(i + 1) || 0;
    const c = str.charCodeAt(i + 2) || 0;
    result +=
      chars[a >> 2] +
      chars[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < str.length ? chars[((b & 15) << 2) | (c >> 6)] : "=") +
      (i + 2 < str.length ? chars[c & 63] : "=");
  }
  return result;
}

/**
 * Create a passkey using biometric authentication
 * TODO: Replace with actual react-native-passkey implementation when installed:
 *
 * import { Passkey } from 'react-native-passkey';
 *
 * const credential = await Passkey.create({
 *   challenge: base64Challenge,
 *   domain: 'app.getodyssey.xyz',
 *   displayName: 'Odyssey Wallet',
 *   userId: walletPubkey,
 * });
 */
async function createPasskey(walletPubkey: string): Promise<PasskeyCredential> {
  // Simulate passkey creation delay (biometric prompt)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate mock credentials for development
  // In production, these come from the actual passkey API
  const timestamp = Date.now();
  const mockCredentialId = btoa64(
    `odyssey-${walletPubkey.slice(0, 8)}-${timestamp}`
  );
  const mockPublicKey = btoa64(
    `pubkey-${walletPubkey.slice(0, 16)}-${timestamp}`
  );

  return {
    credentialId: mockCredentialId,
    publicKey: mockPublicKey,
  };
}

/**
 * Get device name for registration
 */
function getDeviceName(): string {
  const platform = Platform.OS === "ios" ? "iPhone" : "Android";
  return `${platform} Mobile App`;
}

// =============================================================================
// OnboardingScreen Component
// =============================================================================

export function OnboardingScreen({ onLinkComplete }: OnboardingScreenProps) {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const route = useRoute<OnboardingScreenRouteProp>();
  const [state, setState] = useState<OnboardingState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const { setAddress, setTelegramId, setIsLinked } = useWalletStore();

  // Refs for cleanup
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);

  // Dev mode: tap logo 5x to bypass
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle token from QR scan
  useEffect(() => {
    const token = route.params?.token;
    if (token) {
      // Token received from ScanQR - start linking process
      console.log(
        "📱 Received token from QR scan:",
        token.substring(0, 8) + "..."
      );
      handleTokenReceived(token);
    }
  }, [route.params?.token]);

  // Process the token received from QR scan
  const handleTokenReceived = useCallback(
    async (token: string) => {
      isCancelledRef.current = false;
      setState("linking");
      setStatusMessage("Linking wallet...");
      setErrorInfo(null);

      let pairingDetails: PairingDetails | null = null;
      let passkeyCreds: PasskeyCredential | null = null;

      try {
        // Step 1: Get pairing details
        console.log("🔗 Step 1: Fetching pairing details...");
        
        try {
          pairingDetails = await getPairingDetails(token);
        } catch (fetchError) {
          // Check if it's a network error
          if (fetchError instanceof TypeError) {
            throw new Error("network: Connection failed");
          }
          // Check for 404/expired token in error message
          const errorMsg = fetchError instanceof Error ? fetchError.message : "";
          if (
            errorMsg.includes("not found") ||
            errorMsg.includes("404") ||
            errorMsg.includes("invalid")
          ) {
            throw new Error("expired: Token not found or invalid");
          }
          throw fetchError;
        }

        if (isCancelledRef.current) return;

        console.log("✅ Got pairing details:", {
          walletPubkey: pairingDetails.walletPubkey.slice(0, 8) + "...",
          telegramId: pairingDetails.telegramId,
          status: pairingDetails.status,
        });

        // Check if token is still valid
        if (pairingDetails.status === "expired") {
          throw new Error("expired: QR code has expired");
        }

        // Step 2: Create passkey
        console.log("🔐 Step 2: Creating passkey...");
        setState("creating_passkey");
        setStatusMessage("Authenticating with Face ID / Touch ID...");

        try {
          passkeyCreds = await createPasskey(pairingDetails.walletPubkey);
        } catch (passkeyError) {
          // Wrap passkey errors for proper classification
          const errorMsg =
            passkeyError instanceof Error ? passkeyError.message : "unknown";
          throw new Error(`passkey: ${errorMsg}`);
        }

        if (isCancelledRef.current) return;

        console.log("✅ Passkey created:", {
          credentialId: passkeyCreds.credentialId.slice(0, 16) + "...",
        });

        // Step 3: Register device
        console.log("📝 Step 3: Registering device...");
        setState("registering");
        setStatusMessage("Registering device...");

        try {
          const registerResponse = await registerDevice({
            token,
            deviceName: getDeviceName(),
            publicKey: passkeyCreds.publicKey,
            credentialId: passkeyCreds.credentialId,
          });

          if (isCancelledRef.current) return;

          console.log(
            "✅ Device registered, requestId:",
            registerResponse.requestId
          );

          // Step 4: Poll for approval
          console.log("⏳ Step 4: Waiting for approval...");
          setState("waiting_approval");
          setStatusMessage("Waiting for approval in Telegram...");

          // Start the polling and timeout
          await pollForApproval(
            registerResponse.requestId,
            pairingDetails,
            passkeyCreds.credentialId
          );
        } catch (registerError) {
          // Check for network errors during registration
          if (registerError instanceof TypeError) {
            throw new Error("network: Connection failed during registration");
          }
          throw registerError;
        }
      } catch (error) {
        if (isCancelledRef.current) return;

        console.error("❌ Linking failed:", error);
        setState("error");

        // Classify the error and set appropriate messaging
        const classified = classifyError(error);
        setErrorInfo(classified);
      }
    },
    [setAddress, setTelegramId, setIsLinked, onLinkComplete]
  );

  // Poll for approval status
  const pollForApproval = useCallback(
    async (
      requestId: string,
      pairingDetails: PairingDetails,
      credentialId: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        // Set up timeout
        timeoutRef.current = setTimeout(() => {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          reject(new Error("Approval timed out. Please try again."));
        }, APPROVAL_TIMEOUT_MS);

        // Start polling
        const checkStatus = async () => {
          if (isCancelledRef.current) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
          }

          try {
            const status = await pollApprovalStatus(requestId);
            console.log("📊 Poll status:", status.status);

            if (status.status === "approved") {
              // Success!
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);

              console.log("🎉 Approval received! Saving wallet...");

              // Save linked wallet
              await saveLinkedWallet({
                pubkey: pairingDetails.walletPubkey,
                telegramId: pairingDetails.telegramId,
                credentialId: credentialId,
                linkedAt: new Date().toISOString(),
              });

              // Update store
              setAddress(pairingDetails.walletPubkey);
              setTelegramId(pairingDetails.telegramId);
              setIsLinked(true);

              console.log("✅ Wallet saved, navigating to main screen");

              // Navigate to main screen
              onLinkComplete?.();

              resolve();
            } else if (status.status === "denied") {
              // Request was denied
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              reject(new Error("Request was denied"));
            }
            // If pending, continue polling
          } catch (error) {
            // Network error during poll - continue polling unless timeout
            const elapsed = Date.now() - startTime;
            if (elapsed < APPROVAL_TIMEOUT_MS) {
              console.warn("Poll error, will retry:", error);
            } else {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              reject(error);
            }
          }
        };

        // Initial check
        checkStatus();

        // Set up interval
        pollIntervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
      });
    },
    [setAddress, setTelegramId, setIsLinked, onLinkComplete]
  );

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
  }, [setAddress, setTelegramId, setIsLinked, onLinkComplete]);

  // Handle "Link Telegram Wallet" button press
  const handleLinkWallet = useCallback(() => {
    // Navigate to QR scanner
    navigation.navigate("ScanQR");
  }, [navigation]);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setState("idle");
    setStatusMessage("");
    setErrorInfo(null);
    // Clear any active timers
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
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

  // Loading States (linking, creating_passkey, registering, waiting_approval)
  if (
    state === "linking" ||
    state === "creating_passkey" ||
    state === "registering" ||
    state === "waiting_approval"
  ) {
    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        <ActivityIndicator size="large" color="#FFB84D" className="mb-6" />
        <Text className="text-gold text-h2 font-semibold mb-3">
          {state === "waiting_approval" ? "Waiting for approval" : "Linking..."}
        </Text>
        <Text className="text-text-secondary text-body text-center max-w-[280px]">
          {statusMessage}
        </Text>
        {state === "waiting_approval" && (
          <Text className="text-text-muted text-caption text-center mt-4 max-w-[280px]">
            Check Telegram for approval request
          </Text>
        )}
      </View>
    );
  }

  // Error State
  if (state === "error" && errorInfo) {
    // Pick appropriate icon based on error type
    const errorIcon =
      errorInfo.type === "network"
        ? "📡"
        : errorInfo.type === "timeout"
        ? "⏱️"
        : errorInfo.type === "token_expired"
        ? "⌛"
        : errorInfo.type === "passkey_failed"
        ? "🔐"
        : "⚠️";

    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        {/* Tappable logo for dev mode */}
        <Pressable onPress={handleLogoTap}>
          <Image
            source={require("../../assets/logo.png")}
            className="w-20 h-20 mb-2 opacity-50"
            resizeMode="contain"
          />
        </Pressable>

        {/* Error Icon */}
        <Text className="text-4xl mb-4">{errorIcon}</Text>

        {/* Error Title */}
        <Text className="text-error text-h2 font-semibold mb-3 text-center">
          {errorInfo.title}
        </Text>

        {/* Error Message */}
        <Text className="text-text-secondary text-body text-center mb-8 max-w-[280px]">
          {errorInfo.message}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleRetry}
            className="bg-gold px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-background-base font-semibold text-body">
              Try Again
            </Text>
          </Pressable>

          {/* Show "Create Wallet" only for certain error types */}
          {(errorInfo.type === "generic" ||
            errorInfo.type === "token_expired") && (
            <Pressable
              onPress={handleCreateWallet}
              className="bg-background-elevated border border-text-secondary/30 px-6 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-text-primary font-semibold text-body">
                Open Telegram
              </Text>
            </Pressable>
          )}
        </View>

        {/* Dismiss hint */}
        <Text className="text-text-muted text-caption mt-6">
          Tap "Try Again" to scan a new QR code
        </Text>
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
