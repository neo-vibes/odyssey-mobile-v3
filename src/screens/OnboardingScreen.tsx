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
import { Passkey } from "react-native-passkey";
import { useWalletStore } from "../stores/useWalletStore";
import { useAgentsStore, type Agent } from "../stores/useAgentsStore";
import {
  getPairingDetails,
  registerDevice,
  pollApprovalStatus,
  getPairedAgents,
  type PairingDetails,
} from "../services/pairing";
import { saveLinkedWallet } from "../services/wallet-storage";
import { saveCredentialId } from "../services/credential";
import { addPairedAgent } from "../services/agent-storage";

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
// Passkey Helper (using react-native-passkey)
// =============================================================================

interface PasskeyCredential {
  credentialId: string;  // base64url
  publicKey: string;     // base64 compressed secp256r1 (33 bytes)
  rpIdHash: string;      // base64 (32 bytes SHA256 of RP ID)
}

const RP_ID = "app.getodyssey.xyz";
const RP_NAME = "Odyssey";

/**
 * Convert base64url to standard base64
 */
function base64urlToBase64(base64url: string): string {
  return base64url.replace(/-/g, "+").replace(/_/g, "/");
}

/**
 * Convert Uint8Array to base64
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Use btoa if available, otherwise manual encoding
  if (typeof btoa !== "undefined") {
    return btoa(binary);
  }
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = binary.charCodeAt(i + 1) || 0;
    const c = binary.charCodeAt(i + 2) || 0;
    result +=
      chars[a >> 2] +
      chars[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < binary.length ? chars[((b & 15) << 2) | (c >> 6)] : "=") +
      (i + 2 < binary.length ? chars[c & 63] : "=");
  }
  return result;
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64urlToBase64(base64));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Parse COSE key from attestation to extract compressed secp256r1 public key
 * COSE key format: https://datatracker.ietf.org/doc/html/rfc8152#section-13.1
 */
function extractPublicKeyFromCOSE(coseKey: Uint8Array): Uint8Array {
  // COSE_Key for EC2 (secp256r1):
  // Map with: 1: kty=2 (EC2), 3: alg=-7 (ES256), -1: crv=1 (P-256), -2: x (32 bytes), -3: y (32 bytes)
  // We need to find x and y coordinates and compress them
  
  // Simple CBOR parsing for the expected structure
  // Look for the x coordinate (-2 = 0x21) and y coordinate (-3 = 0x22)
  let x: Uint8Array | null = null;
  let y: Uint8Array | null = null;
  
  let i = 0;
  while (i < coseKey.length - 33) {
    // Look for negative integer -2 (encoded as 0x21 in CBOR)
    if (coseKey[i] === 0x21) {
      // Next should be byte string of 32 bytes (0x58 0x20)
      if (coseKey[i + 1] === 0x58 && coseKey[i + 2] === 0x20) {
        x = coseKey.slice(i + 3, i + 3 + 32);
        i += 35;
        continue;
      }
    }
    // Look for negative integer -3 (encoded as 0x22 in CBOR)
    if (coseKey[i] === 0x22) {
      if (coseKey[i + 1] === 0x58 && coseKey[i + 2] === 0x20) {
        y = coseKey.slice(i + 3, i + 3 + 32);
        i += 35;
        continue;
      }
    }
    i++;
  }
  
  if (!x || !y) {
    throw new Error("Could not extract x,y coordinates from COSE key");
  }
  
  // Compress: 0x02 if y is even, 0x03 if y is odd
  const prefix = (y[31] & 1) === 0 ? 0x02 : 0x03;
  const compressed = new Uint8Array(33);
  compressed[0] = prefix;
  compressed.set(x, 1);
  
  return compressed;
}

/**
 * Parse attestation object to extract public key and authenticator data
 * attestationObject is CBOR encoded with: fmt, attStmt, authData
 */
function parseAttestationObject(attestationObjectB64: string): {
  publicKey: Uint8Array;
  rpIdHash: Uint8Array;
  credentialId: Uint8Array;
} {
  const data = base64ToUint8Array(attestationObjectB64);
  
  // Find authData in the CBOR structure
  // authData starts after "authData" key in the CBOR map
  // Structure: rpIdHash (32) + flags (1) + signCount (4) + attestedCredentialData
  
  // Simple approach: find the authData by looking for the pattern
  // authData is typically the largest byte string in the attestation object
  
  // Look for byte string marker followed by large length
  let authDataStart = -1;
  let authDataLen = 0;
  
  for (let i = 0; i < data.length - 50; i++) {
    // CBOR byte string with 2-byte length: 0x59 followed by 2 bytes of length
    if (data[i] === 0x59) {
      const len = (data[i + 1] << 8) | data[i + 2];
      if (len > 100 && len < 2000) { // authData is typically 100-500 bytes
        authDataStart = i + 3;
        authDataLen = len;
        break;
      }
    }
    // CBOR byte string with 1-byte length: 0x58 followed by 1 byte of length
    if (data[i] === 0x58) {
      const len = data[i + 1];
      if (len > 100) {
        authDataStart = i + 2;
        authDataLen = len;
        break;
      }
    }
  }
  
  if (authDataStart === -1) {
    throw new Error("Could not find authData in attestation object");
  }
  
  const authData = data.slice(authDataStart, authDataStart + authDataLen);
  
  // Parse authData:
  // rpIdHash: 32 bytes
  // flags: 1 byte
  // signCount: 4 bytes (big-endian)
  // attestedCredentialData (if AT flag set):
  //   aaguid: 16 bytes
  //   credentialIdLength: 2 bytes (big-endian)
  //   credentialId: credentialIdLength bytes
  //   credentialPublicKey: COSE_Key (remaining)
  
  const rpIdHash = authData.slice(0, 32);
  const flags = authData[32];
  const hasAttestedCredentialData = (flags & 0x40) !== 0;
  
  if (!hasAttestedCredentialData) {
    throw new Error("No attested credential data in authData");
  }
  
  // Skip to attestedCredentialData (after rpIdHash + flags + signCount)
  let offset = 37; // 32 + 1 + 4
  
  // Skip aaguid (16 bytes)
  offset += 16;
  
  // Read credentialIdLength (2 bytes big-endian)
  const credIdLen = (authData[offset] << 8) | authData[offset + 1];
  offset += 2;
  
  // Read credentialId
  const credentialId = authData.slice(offset, offset + credIdLen);
  offset += credIdLen;
  
  // Remaining is the COSE public key
  const coseKey = authData.slice(offset);
  const publicKey = extractPublicKeyFromCOSE(coseKey);
  
  return { publicKey, rpIdHash, credentialId };
}

/**
 * Generate a random challenge for passkey creation
 */
function generateChallenge(): string {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return uint8ArrayToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Create a passkey using biometric authentication
 * Falls back to mock credentials if real passkeys aren't available
 */
async function createPasskey(walletPubkey: string): Promise<PasskeyCredential> {
  // Try real passkeys first
  const useRealPasskeys = Passkey.isSupported();
  
  if (useRealPasskeys) {
    try {
      const challenge = generateChallenge();
      
      const request = {
        challenge,
        rp: {
          id: RP_ID,
          name: RP_NAME,
        },
        user: {
          id: walletPubkey.slice(0, 32),
          name: `odyssey-${walletPubkey.slice(0, 8)}`,
          displayName: "Odyssey Wallet",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "preferred",
          userVerification: "required",
        },
        attestation: "direct",
        timeout: 60000,
      };
      
      console.log("🔐 Creating real passkey...");
      const result = await Passkey.create(request);
      
      // Save credential ID locally for future authentication
      if (result.id) {
        try {
          await saveCredentialId(result.id);
          console.log("💾 Credential ID saved locally");
        } catch (saveError) {
          console.warn("⚠️ Failed to save credential ID locally:", saveError);
          // Non-blocking - wallet creation continues even if save fails
        }
      }
      
      const { publicKey, rpIdHash, credentialId } = parseAttestationObject(
        result.response.attestationObject
      );
      
      console.log("✅ Real passkey created");
      return {
        credentialId: uint8ArrayToBase64(credentialId),
        publicKey: uint8ArrayToBase64(publicKey),
        rpIdHash: uint8ArrayToBase64(rpIdHash),
      };
    } catch (error) {
      console.log("⚠️ Real passkey failed, falling back to mock:", error);
    }
  }
  
  // Mock passkey fallback
  console.log("🎭 Using mock passkey (real passkeys not available)");
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate biometric delay
  
  const timestamp = Date.now();
  const mockCredentialId = uint8ArrayToBase64(
    new TextEncoder().encode(`odyssey-${walletPubkey.slice(0, 8)}-${timestamp}`)
  );
  const mockPublicKey = uint8ArrayToBase64(
    new TextEncoder().encode(`pubkey-${walletPubkey.slice(0, 16)}-${timestamp}`)
  );
  // Mock rpIdHash (SHA256 of app.getodyssey.xyz would be 32 bytes)
  const mockRpIdHash = uint8ArrayToBase64(new Uint8Array(32).fill(0));
  
  return {
    credentialId: mockCredentialId,
    publicKey: mockPublicKey,
    rpIdHash: mockRpIdHash,
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
  const { setAgents } = useAgentsStore();

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
            rpIdHash: passkeyCreds.rpIdHash,
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

              console.log("✅ Wallet saved, syncing paired agents...");

              // Sync paired agents from server
              try {
                const pairedAgents = await getPairedAgents(pairingDetails.walletPubkey);
                if (pairedAgents && pairedAgents.length > 0) {
                  // Save to AsyncStorage (agent-storage) for persistence
                  for (const pa of pairedAgents) {
                    await addPairedAgent({
                      agentId: pa.agentId,
                      agentName: pa.agentName,
                      pairedAt: pa.pairedAt,
                    });
                  }
                  // Also update zustand store for immediate UI
                  const agents: Agent[] = pairedAgents.map((pa) => ({
                    id: pa.agentId,
                    name: pa.agentName,
                    pairedAt: new Date(pa.pairedAt),
                    hasActiveSession: false,
                  }));
                  setAgents(agents);
                  console.log(`✅ Synced ${agents.length} paired agent(s)`);
                } else {
                  console.log("ℹ️ No paired agents found");
                }
              } catch (syncError) {
                // Don't block login on sync failure - just log warning
                console.warn("⚠️ Failed to sync paired agents:", syncError);
              }

              console.log("✅ Navigating to main screen");

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
    [setAddress, setTelegramId, setIsLinked, setAgents, onLinkComplete]
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
