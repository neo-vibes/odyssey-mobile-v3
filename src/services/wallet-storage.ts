import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_KEY = 'odyssey_linked_wallet';

export interface LinkedWallet {
  pubkey: string;
  telegramId: number;
  credentialId: string;
  linkedAt: string; // ISO date
}

/**
 * Save linked wallet to storage
 */
export async function saveLinkedWallet(wallet: LinkedWallet): Promise<void> {
  const json = JSON.stringify(wallet);
  await AsyncStorage.setItem(WALLET_KEY, json);
}

/**
 * Get linked wallet from storage
 * @returns LinkedWallet or null if not found
 */
export async function getLinkedWallet(): Promise<LinkedWallet | null> {
  const json = await AsyncStorage.getItem(WALLET_KEY);
  if (!json) {
    return null;
  }
  return JSON.parse(json) as LinkedWallet;
}

/**
 * Clear linked wallet from storage
 */
export async function clearLinkedWallet(): Promise<void> {
  await AsyncStorage.removeItem(WALLET_KEY);
}
