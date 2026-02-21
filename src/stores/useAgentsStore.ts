import { create } from 'zustand';

export interface Agent {
  id: string;
  name: string;
  pairedAt: Date;
  hasActiveSession: boolean;
}

export interface PairingRequest {
  id: string;
  agentId: string;
  agentName: string;
  requestedAt: Date;
  expiresAt: Date;
}

interface AgentsState {
  agents: Agent[];
  pendingPairingRequests: PairingRequest[];
}

interface AgentsActions {
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  setPendingPairingRequests: (requests: PairingRequest[]) => void;
  addPairingRequest: (request: PairingRequest) => void;
  removePairingRequest: (requestId: string) => void;
  reset: () => void;
}

const initialState: AgentsState = {
  agents: [],
  pendingPairingRequests: [],
};

export const useAgentsStore = create<AgentsState & AgentsActions>((set) => ({
  ...initialState,

  setAgents: (agents) => set({ agents }),

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  removeAgent: (agentId) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== agentId),
    })),

  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, ...updates } : a
      ),
    })),

  setPendingPairingRequests: (requests) =>
    set({ pendingPairingRequests: requests }),

  addPairingRequest: (request) =>
    set((state) => ({
      pendingPairingRequests: [...state.pendingPairingRequests, request],
    })),

  removePairingRequest: (requestId) =>
    set((state) => ({
      pendingPairingRequests: state.pendingPairingRequests.filter(
        (r) => r.id !== requestId
      ),
    })),

  reset: () => set(initialState),
}));
