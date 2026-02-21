import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Vibration,
  Alert,
  Dimensions,
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
        navigation.navigate("Onboarding", { token });
      } else {
        // Invalid QR - show error toast
        Vibration.vibrate([0, 50, 50, 50]); // Error pattern
        Alert.alert(
          "Invalid QR Code",
          "Please scan a QR code from Telegram bot",
          [
            {
              text: "Try Again",
              onPress: () => {
                setHasScanned(false);
                processingRef.current = false;
              },
            },
          ]
        );
      }
    },
    [hasScanned, navigation]
  );

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
    // Permission not granted
    return (
      <View className="flex-1 bg-background-base items-center justify-center px-8">
        <Text className="text-text-primary text-h2 font-semibold mb-3 text-center">
          Camera Access Required
        </Text>
        <Text className="text-text-secondary text-body text-center mb-8 max-w-[280px]">
          We need camera access to scan the QR code from Telegram
        </Text>

        <Pressable
          onPress={handleRequestPermission}
          className="bg-gold px-6 py-4 rounded-xl active:opacity-80"
        >
          <Text className="text-background-base font-bold text-body">
            Allow Camera Access
          </Text>
        </Pressable>

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

        {/* Bottom Overlay with Instruction */}
        <View className="flex-1 bg-black/60 items-center pt-8">
          <Text className="text-white text-body font-medium text-center">
            Scan QR code from Telegram
          </Text>
          <Text className="text-text-secondary text-caption mt-2 text-center">
            Open @odyssey_bot and use /pair_mobile
          </Text>
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
