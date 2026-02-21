import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { WalletStackParamList } from "./types";
import { WalletScreen, ReceiveScreen, SendScreen } from "../screens/wallet";

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0A0A0A" },
        headerTintColor: "#FFB84D",
        headerTitleStyle: { fontWeight: "600", color: "#FFFFFF" },
        contentStyle: { backgroundColor: "#0A0A0A" },
      }}
    >
      <Stack.Screen
        name="WalletScreen"
        component={WalletScreen}
        options={{ title: "Wallet" }}
      />
      <Stack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen}
        options={{ title: "Receive" }}
      />
      <Stack.Screen
        name="SendScreen"
        component={SendScreen}
        options={{ title: "Send" }}
      />
    </Stack.Navigator>
  );
}
