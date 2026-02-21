import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { StyleTest } from "./components/StyleTest";

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <StatusBar style="light" />
      <StyleTest />
    </GluestackUIProvider>
  );
}
