/**
 * API Client Service
 * Handles all backend communication for the Odyssey mobile app
 */

import type { Agent, PairingRequest } from '../stores/useAgentsStore';
import type { Session, SessionRequest } from '../stores/useSessionsStore';

// =============================================================================
// Configuration
// =============================================================================

// TODO: Move to env variable for production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://app.getodyssey.xyz';

// In-memory auth token storage
// TODO: Consider using expo-secure-store for production
let authToken: string | null = null;

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  ok: boolean;
}

// Pairing types
export interface PairingCodeResponse {
  code: string;
  expiresAt: string;
}

export interface PairingRequestsResponse {
  requests: PairingRequest[];
}

export interface PairingApproveRequest {
  requestId: string;
  // Passkey signature data if required
  signature?: string;
  authenticatorData?: string;
  clientDataJSON?: string;
}

export interface PairingApproveResponse {
  agent: Agent;
}

export interface PairingDenyRequest {
  requestId: string;
}

// Agent types
export interface AgentsListResponse {
  agents: Agent[];
}

// Session types
export interface SessionRequestsResponse {
  requests: SessionRequest[];
}

export interface SessionApproveRequest {
  requestId: string;
  // Passkey signature for approval
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}

export interface SessionApproveResponse {
  session: Session;
}

export interface SessionDenyRequest {
  requestId: string;
}

export interface SessionsForAgentResponse {
  sessions: Session[];
}

export interface SessionDetailResponse {
  session: Session;
}

export interface Transaction {
  id: string;
  sessionId: string;
  signature: string;
  amountSol: number;
  destination: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface SessionTransactionsResponse {
  transactions: Transaction[];
}

// Wallet types
export interface WalletBalanceResponse {
  address: string;
  balanceSol: number;
  balanceUsd: number;
}

export interface WalletSendRequest {
  destination: string;
  amountSol: number;
  // Passkey signature for send
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}

export interface WalletSendResponse {
  txSignature: string;
  amountSol: number;
  destination: string;
}

// =============================================================================
// Auth Token Management
// =============================================================================

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearAuthToken(): void {
  authToken = null;
}

// =============================================================================
// HTTP Client
// =============================================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorBody = isJson ? await response.json() : await response.text();
      const apiError: ApiError = {
        message: typeof errorBody === 'string' 
          ? errorBody 
          : errorBody.message || errorBody.error || 'Request failed',
        code: typeof errorBody === 'object' ? errorBody.code : undefined,
        statusCode: response.status,
      };
      return { data: null, error: apiError, ok: false };
    }

    const data = isJson ? await response.json() : null;
    return { data: data as T, error: null, ok: true };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    };
    return { data: null, error: apiError, ok: false };
  }
}

// =============================================================================
// Pairing API
// =============================================================================

/**
 * Generate a new pairing code for agents to connect
 * Requires walletPubkey and telegramId (from linked wallet)
 */
export async function generatePairingCode(walletPubkey: string, telegramId: number): Promise<ApiResponse<PairingCodeResponse>> {
  return request<PairingCodeResponse>('/api/pairing/generate-code', {
    method: 'POST',
    body: JSON.stringify({ walletPubkey, telegramId }),
  });
}

/**
 * Get list of pending pairing requests
 */
export async function getPairingRequests(): Promise<ApiResponse<PairingRequestsResponse>> {
  return request<PairingRequestsResponse>('/api/pairing/requests');
}

/**
 * Approve a pairing request
 */
export async function approvePairingRequest(
  data: PairingApproveRequest
): Promise<ApiResponse<PairingApproveResponse>> {
  return request<PairingApproveResponse>('/api/pairing/approve', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Deny a pairing request
 */
export async function denyPairingRequest(
  data: PairingDenyRequest
): Promise<ApiResponse<void>> {
  return request<void>('/api/pairing/deny', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Agents API
// =============================================================================

/**
 * Get list of all paired agents
 */
export async function getAgents(walletPubkey: string): Promise<ApiResponse<AgentsListResponse>> {
  return request<AgentsListResponse>(`/api/pairing/agents/${walletPubkey}`);
}

/**
 * Unpair (remove) an agent
 */
export async function unpairAgent(agentId: string): Promise<ApiResponse<void>> {
  return request<void>(`/api/agents/${agentId}`, {
    method: 'DELETE',
  });
}

// =============================================================================
// Sessions API
// =============================================================================

/**
 * Get pending session requests for a wallet
 */
export async function getSessionRequests(walletPubkey: string): Promise<ApiResponse<SessionRequestsResponse>> {
  return request<SessionRequestsResponse>(`/api/sessions/requests?walletPubkey=${walletPubkey}`);
}

/**
 * Approve a session request (requires passkey signature)
 */
export async function approveSessionRequest(
  data: SessionApproveRequest
): Promise<ApiResponse<SessionApproveResponse>> {
  return request<SessionApproveResponse>('/api/sessions/approve', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Deny a session request
 */
export async function denySessionRequest(
  data: SessionDenyRequest
): Promise<ApiResponse<void>> {
  return request<void>('/api/sessions/deny', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get all sessions for a specific agent
 */
export async function getSessionsForAgent(
  agentId: string
): Promise<ApiResponse<SessionsForAgentResponse>> {
  return request<SessionsForAgentResponse>(`/api/agents/${agentId}/sessions`);
}

/**
 * Get session details by ID
 */
export async function getSessionDetail(
  sessionId: string
): Promise<ApiResponse<SessionDetailResponse>> {
  return request<SessionDetailResponse>(`/api/sessions/${sessionId}`);
}

/**
 * Get transactions for a session
 */
export async function getSessionTransactions(
  sessionId: string
): Promise<ApiResponse<SessionTransactionsResponse>> {
  return request<SessionTransactionsResponse>(
    `/api/sessions/${sessionId}/transactions`
  );
}

// =============================================================================
// Wallet API
// =============================================================================

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<ApiResponse<WalletBalanceResponse>> {
  return request<WalletBalanceResponse>('/api/wallet/balance');
}

/**
 * Send SOL (requires passkey signature)
 */
export async function sendSol(
  data: WalletSendRequest
): Promise<ApiResponse<WalletSendResponse>> {
  return request<WalletSendResponse>('/api/wallet/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Convenience Exports
// =============================================================================

export const api = {
  // Auth
  setAuthToken,
  getAuthToken,
  clearAuthToken,

  // Pairing
  generatePairingCode,
  getPairingRequests,
  approvePairingRequest,
  denyPairingRequest,

  // Agents
  getAgents,
  unpairAgent,

  // Sessions
  getSessionRequests,
  approveSessionRequest,
  denySessionRequest,
  getSessionsForAgent,
  getSessionDetail,
  getSessionTransactions,

  // Wallet
  getWalletBalance,
  sendSol,
};

export default api;
