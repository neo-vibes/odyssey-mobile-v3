import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";

// ============================================================================
// Root Stack (Onboarding Flow)
// ============================================================================
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
};

export type OnboardingScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Onboarding"
>;

// ============================================================================
// Agents Stack
// ============================================================================
export type AgentsStackParamList = {
  AgentsScreen: undefined;
  PairAgentScreen: undefined;
  AgentDetailScreen: { agentId: string };
  SessionRequestScreen: {
    requestId: string;
    agentName: string;
    durationSeconds: number;
    limitSol: number;
    network?: "mainnet" | "devnet";
  };
  SessionsListScreen: { agentId: string };
  SessionDetailScreen: { sessionId: string };
  TransactionDetailScreen: { transactionId: string };
};

// ============================================================================
// Wallet Stack
// ============================================================================
export type WalletStackParamList = {
  WalletScreen: undefined;
  ReceiveScreen: undefined;
  SendScreen: undefined;
};

// ============================================================================
// Tab Navigator
// ============================================================================
export type RootTabParamList = {
  AgentsTab: NavigatorScreenParams<AgentsStackParamList>;
  WalletTab: NavigatorScreenParams<WalletStackParamList>;
};

// ============================================================================
// Screen Props Types
// ============================================================================

// Agents Stack Screens
export type AgentsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "AgentsScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type PairAgentScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "PairAgentScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type AgentDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "AgentDetailScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type SessionRequestScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "SessionRequestScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type SessionsListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "SessionsListScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type SessionDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "SessionDetailScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type TransactionDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgentsStackParamList, "TransactionDetailScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

// Wallet Stack Screens
export type WalletScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WalletStackParamList, "WalletScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type ReceiveScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WalletStackParamList, "ReceiveScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

export type SendScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WalletStackParamList, "SendScreen">,
  BottomTabScreenProps<RootTabParamList>
>;

// ============================================================================
// Declaration for useNavigation hook
// ============================================================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
