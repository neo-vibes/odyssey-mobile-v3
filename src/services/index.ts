// Services exports
export { api, default as apiClient } from './api';
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
