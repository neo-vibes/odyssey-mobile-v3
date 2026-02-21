import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'odyssey_linked_wallet';

export interface LinkedWallet {
  pubkey: string;
  telegramId: number;
  credentialId: string;
  linkedAt: string; // ISO date
}

/**
 * Save linked wallet to secure storage
 */
export async function saveLinkedWallet(wallet: LinkedWallet): Promise<void> {
  const json = JSON.stringify(wallet);
  await SecureStore.setItemAsync(WALLET_KEY, json);
}

/**
 * Get linked wallet from secure storage
 * @returns LinkedWallet or null if not found
 */
export async function getLinkedWallet(): Promise<LinkedWallet | null> {
  const json = await SecureStore.getItemAsync(WALLET_KEY);
  if (!json) {
    return null;
  }
  return JSON.parse(json) as LinkedWallet;
}

/**
 * Clear linked wallet from secure storage
 */
export async function clearLinkedWallet(): Promise<void> {
  await SecureStore.deleteItemAsync(WALLET_KEY);
}
