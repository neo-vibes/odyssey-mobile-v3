import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDENTIAL_KEY = 'odyssey_credential_id';

/**
 * Save credential ID to storage
 */
export async function saveCredentialId(credentialId: string): Promise<void> {
  await AsyncStorage.setItem(CREDENTIAL_KEY, credentialId);
}

/**
 * Get credential ID from storage
 * @returns credentialId string or null if not found
 */
export async function getCredentialId(): Promise<string | null> {
  return await AsyncStorage.getItem(CREDENTIAL_KEY);
}

/**
 * Clear credential ID from storage
 */
export async function clearCredentialId(): Promise<void> {
  await AsyncStorage.removeItem(CREDENTIAL_KEY);
}
