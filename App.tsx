import "./global.css";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation";
import { getLinkedWallet } from "./src/services/wallet-storage";
import { useWalletStore } from "./src/stores/useWalletStore";

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { setAddress, setTelegramId, setIsLinked } = useWalletStore();

  useEffect(() => {
    async function rehydrateWallet() {
      try {
        const wallet = await getLinkedWallet();
        if (wallet) {
          console.log("🔄 Rehydrating wallet from storage:", wallet.pubkey);
          setAddress(wallet.pubkey);
          setTelegramId(wallet.telegramId);
          setIsLinked(true);
        }
      } catch (error) {
        console.error("Failed to rehydrate wallet:", error);
      } finally {
        setIsReady(true);
      }
    }
    rehydrateWallet();
  }, [setAddress, setTelegramId, setIsLinked]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D0F" }}>
        <ActivityIndicator size="large" color="#FFB84D" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <AppContent />
    </GluestackUIProvider>
  );
}
