import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useWalletStore } from "../stores/useWalletStore";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { TabNavigator } from "./TabNavigator";

// =============================================================================
// Types
// =============================================================================

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

// =============================================================================
// Navigator
// =============================================================================

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLinked } = useWalletStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {!isLinked ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Main" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
