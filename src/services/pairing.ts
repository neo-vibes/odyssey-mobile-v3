/**
 * Mobile Pairing Service
 * Handles QR code linking flow between mobile app and Telegram wallet
 */

const API_URL = 'https://app.getodyssey.xyz';

// =============================================================================
// Types
// =============================================================================

export interface PairingDetails {
  walletPubkey: string;
  telegramId: number;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

export interface RegisterDeviceParams {
  token: string;
  deviceName: string;
  publicKey: string;   // base64 compressed pubkey from passkey
  credentialId: string; // base64
  rpIdHash?: string;   // base64 (optional - API derives if not provided)
}

export interface RegisterDeviceResponse {
  requestId: string;
}

export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'denied';
  walletPubkey?: string;
}

export interface CodeStatus {
  code: string;
  status: 'waiting' | 'pending_approval' | 'approved' | 'expired';
  requestId?: string;
  agentId?: string;
  agentName?: string;
  requestedAt?: string;
  signature?: string;   // Ed25519 signature proving agent identity
  timestamp?: number;   // Timestamp when signature was created
}

export interface ApproveParams {
  requestId: string;
  signature: string;
  authenticatorData: string;
  clientDataJSON: string;
}

export interface ApprovalResponse {
  success: boolean;
  agentId: string;
  agentName: string;
}

export interface PairedAgent {
  agentId: string;
  agentName: string;
  pairedAt: string;
}

// =============================================================================
// URL Parsing
// =============================================================================

/**
 * Parse token from QR URL like https://app.getodyssey.xyz/pair-mobile?token=xxx
 * Returns the token string or null if URL is invalid/missing token
 */
export function parseTokenFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    
    // Validate it's our domain (allow with or without www)
    const validHosts = ['app.getodyssey.xyz', 'www.app.getodyssey.xyz'];
    if (!validHosts.includes(parsedUrl.hostname)) {
      return null;
    }
    
    // Validate path
    if (parsedUrl.pathname !== '/pair-mobile') {
      return null;
    }
    
    // Extract token from query params
    const token = parsedUrl.searchParams.get('token');
    
    // Return null if token is empty or missing
    if (!token || token.trim() === '') {
      return null;
    }
    
    return token;
  } catch {
    // Invalid URL
    return null;
  }
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get pairing details from token
 * Fetches wallet info and current pairing status
 */
export async function getPairingDetails(token: string): Promise<PairingDetails> {
  const response = await fetch(`${API_URL}/api/pair-mobile/${encodeURIComponent(token)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to get pairing details';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return data as PairingDetails;
}

/**
 * Register mobile device as signer
 * Sends passkey public key to be added as authorized signer
 */
export async function registerDevice(params: RegisterDeviceParams): Promise<RegisterDeviceResponse> {
  const response = await fetch(`${API_URL}/api/pair-mobile/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: params.token,
      deviceName: params.deviceName,
      publicKey: params.publicKey,
      credentialId: params.credentialId,
      rpIdHash: params.rpIdHash,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to register device';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return data as RegisterDeviceResponse;
}

/**
 * Poll for approval status
 * Call this repeatedly (e.g., every 2s) to check if user approved in Telegram
 */
export async function pollApprovalStatus(requestId: string): Promise<ApprovalStatus> {
  const response = await fetch(`${API_URL}/api/pair-mobile/status/${encodeURIComponent(requestId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to check approval status';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return data as ApprovalStatus;
}

// =============================================================================
// Agent Pairing Functions
// =============================================================================

/**
 * Get all agents paired with this wallet
 * Returns list of paired agents for display in the app
 */
export async function getPairedAgents(walletPubkey: string): Promise<PairedAgent[]> {
  const response = await fetch(`${API_URL}/api/agents/paired?walletPubkey=${encodeURIComponent(walletPubkey)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to get paired agents';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return (data.agents || []) as PairedAgent[];
}

/**
 * Check the status of an agent pairing code
 * Used to see if an agent has requested pairing with this code
 */
export async function checkCodeStatus(code: string): Promise<CodeStatus> {
  const response = await fetch(`${API_URL}/api/pairing/code/${encodeURIComponent(code)}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to check code status';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return data as CodeStatus;
}

/**
 * Approve an agent pairing request
 * Signs with passkey to authorize the agent
 */
export async function approveAgentPairing(params: ApproveParams): Promise<ApprovalResponse> {
  const response = await fetch(`${API_URL}/api/pairing/approve-mobile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: params.requestId,
      signature: params.signature,
      authenticatorData: params.authenticatorData,
      clientDataJSON: params.clientDataJSON,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let message = 'Failed to approve agent pairing';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }

  const data = await response.json();
  return data as ApprovalResponse;
}

/**
 * Deny an agent pairing request
 */
export async function denyAgentPairing(requestId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/pairing/deny`, {
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
    let message = 'Failed to deny agent pairing';
    
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || message;
    } catch {
      if (errorBody) message = errorBody;
    }
    
    throw new Error(message);
  }
}

// =============================================================================
// Convenience Export
// =============================================================================

export const pairing = {
  parseTokenFromUrl,
  getPairingDetails,
  registerDevice,
  pollApprovalStatus,
  getPairedAgents,
  checkCodeStatus,
  approveAgentPairing,
  denyAgentPairing,
};

export default pairing;
