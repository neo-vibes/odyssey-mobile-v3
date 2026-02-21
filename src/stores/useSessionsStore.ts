import { create } from 'zustand';

export interface Session {
  id: string;
  agentId: string;
  startedAt: Date;
  expiresAt: Date;
  limitSol: number;
  spentSol: number;
  status: 'active' | 'expired' | 'exhausted';
  txCount: number;
}

export interface SessionRequest {
  id: string;
  agentId: string;
  agentName: string;
  durationSeconds: number;
  limitSol: number;
  requestedAt: Date;
}

interface SessionsState {
  // Sessions indexed by agentId for quick lookup
  sessionsByAgent: Record<string, Session[]>;
  pendingSessionRequests: SessionRequest[];
}

interface SessionsActions {
  setSessionsForAgent: (agentId: string, sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  removeSession: (sessionId: string) => void;
  getSessionsForAgent: (agentId: string) => Session[];
  getActiveSessionForAgent: (agentId: string) => Session | undefined;
  setPendingSessionRequests: (requests: SessionRequest[]) => void;
  addSessionRequest: (request: SessionRequest) => void;
  removeSessionRequest: (requestId: string) => void;
  reset: () => void;
}

const initialState: SessionsState = {
  sessionsByAgent: {},
  pendingSessionRequests: [],
};

export const useSessionsStore = create<SessionsState & SessionsActions>(
  (set, get) => ({
    ...initialState,

    setSessionsForAgent: (agentId, sessions) =>
      set((state) => ({
        sessionsByAgent: {
          ...state.sessionsByAgent,
          [agentId]: sessions,
        },
      })),

    addSession: (session) =>
      set((state) => {
        const agentSessions = state.sessionsByAgent[session.agentId] || [];
        return {
          sessionsByAgent: {
            ...state.sessionsByAgent,
            [session.agentId]: [...agentSessions, session],
          },
        };
      }),

    updateSession: (sessionId, updates) =>
      set((state) => {
        const newSessionsByAgent = { ...state.sessionsByAgent };
        for (const agentId in newSessionsByAgent) {
          newSessionsByAgent[agentId] = newSessionsByAgent[agentId].map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          );
        }
        return { sessionsByAgent: newSessionsByAgent };
      }),

    removeSession: (sessionId) =>
      set((state) => {
        const newSessionsByAgent = { ...state.sessionsByAgent };
        for (const agentId in newSessionsByAgent) {
          newSessionsByAgent[agentId] = newSessionsByAgent[agentId].filter(
            (s) => s.id !== sessionId
          );
        }
        return { sessionsByAgent: newSessionsByAgent };
      }),

    getSessionsForAgent: (agentId) => {
      return get().sessionsByAgent[agentId] || [];
    },

    getActiveSessionForAgent: (agentId) => {
      const sessions = get().sessionsByAgent[agentId] || [];
      return sessions.find((s) => s.status === 'active');
    },

    setPendingSessionRequests: (requests) =>
      set({ pendingSessionRequests: requests }),

    addSessionRequest: (request) =>
      set((state) => ({
        pendingSessionRequests: [...state.pendingSessionRequests, request],
      })),

    removeSessionRequest: (requestId) =>
      set((state) => ({
        pendingSessionRequests: state.pendingSessionRequests.filter(
          (r) => r.id !== requestId
        ),
      })),

    reset: () => set(initialState),
  })
);
