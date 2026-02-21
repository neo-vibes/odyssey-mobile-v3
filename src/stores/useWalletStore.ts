import { create } from 'zustand';

export interface WalletState {
  address: string | null;
  telegramId: number | null;  // For API calls that require it
  balanceSol: number;
  balanceUsd: number;
  isLinked: boolean;
  lastUpdated: Date | null;
}

interface WalletActions {
  setAddress: (address: string | null) => void;
  setTelegramId: (telegramId: number | null) => void;
  setBalance: (balanceSol: number, balanceUsd: number) => void;
  setIsLinked: (isLinked: boolean) => void;
  reset: () => void;
}

const initialState: WalletState = {
  address: null,
  telegramId: null,
  balanceSol: 0,
  balanceUsd: 0,
  isLinked: false,
  lastUpdated: null,
};

export const useWalletStore = create<WalletState & WalletActions>((set) => ({
  ...initialState,

  setAddress: (address) => set({ address, isLinked: address !== null }),

  setTelegramId: (telegramId) => set({ telegramId }),

  setBalance: (balanceSol, balanceUsd) =>
    set({
      balanceSol,
      balanceUsd,
      lastUpdated: new Date(),
    }),

  setIsLinked: (isLinked) => set({ isLinked }),

  reset: () => set(initialState),
}));
