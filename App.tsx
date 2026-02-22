// NativeWind v2 - no CSS import needed
import React from "react";
import { StatusBar } from "expo-status-bar";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </GluestackUIProvider>
  );
}
