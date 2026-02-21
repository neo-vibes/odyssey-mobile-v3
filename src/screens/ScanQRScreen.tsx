import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Vibration,
  Dimensions,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { parseTokenFromUrl } from "../services/pairing";

// =============================================================================
// Types
// =============================================================================

type RootStackParamList = {
  Onboarding: { token?: string } | undefined;
  ScanQR: undefined;
  Main: undefined;
};

type ScanQRScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ScanQR"
>;

// =============================================================================
// Constants
// =============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const QR_FRAME_SIZE = SCREEN_WIDTH * 0.7;

// =============================================================================
// ScanQRScreen Component
// =============================================================================

export function ScanQRScreen() {
  const navigation = useNavigation<ScanQRScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const processingRef = useRef(false);

  // Handle barcode scan
  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // Prevent multiple scans
      if (processingRef.current || hasScanned) return;
      processingRef.current = true;
      setHasScanned(true);

      const scannedData = result.data;
      const token = parseTokenFromUrl(scannedData);

      if (token) {
        // Valid QR - haptic feedback and navigate back with token
        Vibration.vibrate(100);
        setScanError(null);
        navigation.navigate("Onboarding", { token });
      } else {
        // Invalid QR - show inline error
        Vibration.vibrate([0, 50, 50, 50]); // Error pattern
        setScanError("Please scan a QR code from @odyssey_bot");
        // Reset scanning after short delay to allow retry
        setTimeout(() => {
          setHasScanned(false);
          processingRef.current = false;
        }, 1500);
      }
    },
    [hasScanned, navigation]
  );

  // Handle dismissing scan error
  const handleDismissError = useCallback(() => {
    setScanError(null);
    setHasScanned(false);
    processingRef.current = false;
  }, []);

  // Handle opening app settings
  const handleOpenSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Handle back button press
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle permission request
  const handleRequestPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);

  // =========================================================================
  // Permission States
  // =========================================================================

  if (!permission) {
    // Loading permission state
    return (
      <View className="flex-1 bg-background-base items-center justify-center">
        <Text className="text-text-secondary text-body">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Check if permission was permanently denied (can't ask again)
    const isPermanentlyDenied = permission.canAskAgain === false;

    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        {/* Error Icon */}
        <Text className="text-4xl mb-4">📷</Text>
        
        <Text className={`text-h2 font-semibold mb-3 text-center ${isPermanentlyDenied ? 'text-error' : 'text-text-primary'}`}>
          {isPermanentlyDenied ? 'Camera Access Denied' : 'Camera Access Required'}
        </Text>
        <Text className="text-text-secondary text-body text-center mb-8 max-w-[280px]">
          {isPermanentlyDenied
            ? 'Camera access is required to scan QR codes. Please enable it in Settings.'
            : 'We need camera access to scan the QR code from Telegram'}
        </Text>

        {isPermanentlyDenied ? (
          <Pressable
            onPress={handleOpenSettings}
            className="bg-gold px-6 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-background-base font-bold text-body">
              Open Settings
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleRequestPermission}
            className="bg-gold px-6 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-background-base font-bold text-body">
              Allow Camera Access
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleBack}
          className="mt-4 px-6 py-3 active:opacity-80"
        >
          <Text className="text-text-secondary text-body">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // =========================================================================
  // Camera View
  // =========================================================================

  return (
    <View className="flex-1 bg-background-black">
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Top Overlay */}
        <View className="flex-1 bg-black/60" />

        {/* Middle Row */}
        <View style={{ flexDirection: "row" }}>
          {/* Left Overlay */}
          <View
            className="bg-black/60"
            style={{ width: (SCREEN_WIDTH - QR_FRAME_SIZE) / 2 }}
          />

          {/* QR Frame - Clear Area */}
          <View
            style={{
              width: QR_FRAME_SIZE,
              height: QR_FRAME_SIZE,
            }}
          >
            {/* Corner decorations */}
            {/* Top Left */}
            <View
              className="absolute top-0 left-0 border-t-4 border-l-4 border-gold rounded-tl-lg"
              style={{ width: 40, height: 40 }}
            />
            {/* Top Right */}
            <View
              className="absolute top-0 right-0 border-t-4 border-r-4 border-gold rounded-tr-lg"
              style={{ width: 40, height: 40 }}
            />
            {/* Bottom Left */}
            <View
              className="absolute bottom-0 left-0 border-b-4 border-l-4 border-gold rounded-bl-lg"
              style={{ width: 40, height: 40 }}
            />
            {/* Bottom Right */}
            <View
              className="absolute bottom-0 right-0 border-b-4 border-r-4 border-gold rounded-br-lg"
              style={{ width: 40, height: 40 }}
            />
          </View>

          {/* Right Overlay */}
          <View
            className="bg-black/60"
            style={{ width: (SCREEN_WIDTH - QR_FRAME_SIZE) / 2 }}
          />
        </View>

        {/* Bottom Overlay with Instruction or Error */}
        <View className="flex-1 bg-black/60 items-center pt-8">
          {scanError ? (
            <>
              {/* Error Message */}
              <View className="bg-error/20 border border-error rounded-xl px-4 py-3 mx-6 mb-4">
                <Text className="text-error text-body font-medium text-center">
                  ⚠️ Invalid QR Code
                </Text>
                <Text className="text-error/80 text-caption text-center mt-1">
                  {scanError}
                </Text>
              </View>
              <Pressable
                onPress={handleDismissError}
                className="bg-white/20 px-6 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-body">
                  Try Again
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-white text-body font-medium text-center">
                Scan QR code from Telegram
              </Text>
              <Text className="text-text-secondary text-caption mt-2 text-center">
                Open @odyssey_bot and use /pair_mobile
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        className="absolute top-14 left-4 bg-black/50 rounded-full p-3 active:opacity-80"
      >
        <Text className="text-white text-xl font-bold">←</Text>
      </Pressable>
    </View>
  );
}

export default ScanQRScreen;
