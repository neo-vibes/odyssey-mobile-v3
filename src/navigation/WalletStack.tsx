import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { WalletStackParamList } from "./types";
import { WalletScreen, ReceiveScreen, SendScreen } from "../screens/wallet";

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: "#111827" },
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
