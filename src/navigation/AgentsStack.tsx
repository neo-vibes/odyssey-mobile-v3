import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AgentsStackParamList } from "./types";
import {
  AgentsScreen,
  PairAgentScreen,
  AgentDetailScreen,
  SessionRequestScreen,
  SessionsListScreen,
  SessionDetailScreen,
  TransactionDetailScreen,
} from "../screens/agents";

const Stack = createNativeStackNavigator<AgentsStackParamList>();

export function AgentsStack() {
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
        name="AgentsScreen"
        component={AgentsScreen}
        options={{ title: "Agents" }}
      />
      <Stack.Screen
        name="PairAgentScreen"
        component={PairAgentScreen}
        options={{ title: "Pair Agent" }}
      />
      <Stack.Screen
        name="AgentDetailScreen"
        component={AgentDetailScreen}
        options={{ title: "Agent Detail" }}
      />
      <Stack.Screen
        name="SessionRequestScreen"
        component={SessionRequestScreen}
        options={{ title: "Session Request" }}
      />
      <Stack.Screen
        name="SessionsListScreen"
        component={SessionsListScreen}
        options={{ title: "Sessions" }}
      />
      <Stack.Screen
        name="SessionDetailScreen"
        component={SessionDetailScreen}
        options={{ title: "Session Detail" }}
      />
      <Stack.Screen
        name="TransactionDetailScreen"
        component={TransactionDetailScreen}
        options={{ title: "Transaction" }}
      />
    </Stack.Navigator>
  );
}
