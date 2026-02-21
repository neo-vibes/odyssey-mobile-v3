// Services exports
export { api, default as apiClient } from './api';
export { pairing, default as pairingClient } from './pairing';
export {
  parseTokenFromUrl,
  getPairingDetails,
  registerDevice,
  pollApprovalStatus,
} from './pairing';
export {
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
} from './api';

// Types
export type {
  ApiError,
  ApiResponse,
  PairingCodeResponse,
  PairingRequestsResponse,
  PairingApproveRequest,
  PairingApproveResponse,
  PairingDenyRequest,
  AgentsListResponse,
  SessionRequestsResponse,
  SessionApproveRequest,
  SessionApproveResponse,
  SessionDenyRequest,
  SessionsForAgentResponse,
  SessionDetailResponse,
  Transaction,
  SessionTransactionsResponse,
  WalletBalanceResponse,
  WalletSendRequest,
  WalletSendResponse,
} from './api';

// Mobile pairing types (QR linking)
export type {
  PairingDetails,
  RegisterDeviceParams,
  RegisterDeviceResponse,
  ApprovalStatus,
} from './pairing';
