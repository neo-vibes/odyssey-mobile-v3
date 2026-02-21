import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AgentsStackParamList } from "./types";
import {
  AgentsScreen,
  PairAgentScreen,
  AgentDetailScreen,
  SessionsListScreen,
  SessionDetailScreen,
  TransactionDetailScreen,
} from "../screens/agents";

const Stack = createNativeStackNavigator<AgentsStackParamList>();

export function AgentsStack() {
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
