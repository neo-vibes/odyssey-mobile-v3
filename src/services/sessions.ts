/**
 * Sessions Service
 * Handles agent session approval flow for mobile app
 */

const API_URL = 'https://app.getodyssey.xyz';

// =============================================================================
// Types
// =============================================================================

export interface SessionLimit {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
}

export interface PendingSession {
  requestId: string;
  agentId: string;
  agentName: string;
  sessionPubkey: string;
  durationSeconds: number;
  mint: string;
  maxAmount: number;
  limits: SessionLimit[];
  status: string;
  createdAt: string;
}

export interface SessionApprovalData {
  sessionPubkey: string;
  walletPubkey: string;
  durationSeconds: number;
  mint: string;
  maxAmount: number;
  credentialId?: string;
  currentSlot: number;
  expiresAtSlot: number;
  rpId: string;
}

export interface ApproveSessionParams {
  requestId: string;
  walletPubkey: string;
  sessionPubkey: string;
  expiresAtSlot: number;
  limits: SessionLimit[];
  // WebAuthn response fields
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}

export interface ApproveSessionResponse {
  success: boolean;
  txSignature?: string;
  sessionPubkey?: string;
  expiresAtSlot?: number;
  error?: string;
}

export interface DenySessionResponse {
  success: boolean;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get pending session requests for a wallet
 * Returns all sessions awaiting approval
 */
export async function getPendingSessions(walletPubkey: string): Promise<PendingSession[]> {
  const response = await fetch(
    `${API_URL}/api/sessions/pending?walletPubkey=${encodeURIComponent(walletPubkey)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to get pending sessions';

    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }

    throw new Error(message);
  }

  const data = await response.json();
  // API returns array directly, not wrapped
  return (Array.isArray(data) ? data : data.sessions || []) as PendingSession[];
}

/**
 * Get approval data for a specific session request
 * Returns data needed to construct WebAuthn challenge
 */
export async function getSessionApprovalData(requestId: string): Promise<SessionApprovalData> {
  const response = await fetch(
    `${API_URL}/api/sessions/${encodeURIComponent(requestId)}/approval-data`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to get session approval data';

    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }

    throw new Error(message);
  }

  const data = await response.json();
  return data as SessionApprovalData;
}

/**
 * Deny a session request
 */
export async function denySession(requestId: string): Promise<DenySessionResponse> {
  const response = await fetch(`${API_URL}/api/sessions/deny`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to deny session';

    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }

    throw new Error(message);
  }

  return { success: true };
}

/**
 * Approve a session request with WebAuthn signature
 * Creates the on-chain session via /api/v2/session/create
 */
export async function approveSession(params: ApproveSessionParams): Promise<ApproveSessionResponse> {
  const response = await fetch(`${API_URL}/api/v2/session/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: params.requestId,
      walletPubkey: params.walletPubkey,
      sessionPubkey: params.sessionPubkey,
      expiresAtSlot: params.expiresAtSlot,
      limits: params.limits,
      signature: params.signature,
      authenticatorData: params.authenticatorData,
      clientDataJSON: params.clientDataJSON,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to approve session';

    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }

    throw new Error(message);
  }

  const data = await response.json();
  return {
    success: true,
    txSignature: data.txSignature,
    sessionPubkey: data.sessionPubkey,
    expiresAtSlot: data.expiresAtSlot,
  };
}

// =============================================================================
// Convenience Export
// =============================================================================

export const sessions = {
  getPendingSessions,
  getSessionApprovalData,
  denySession,
  approveSession,
};

export default sessions;
