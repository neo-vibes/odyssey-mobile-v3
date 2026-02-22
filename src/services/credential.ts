import AsyncStorage from '@react-native-async-storage/async-storage';

const CREDENTIAL_KEY = 'odyssey_credential_id';
const PUBLIC_KEY_KEY = 'odyssey_public_key';
const RP_ID_HASH_KEY = 'odyssey_rp_id_hash';

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

/**
 * Save public key (secp256r1 compressed, base64)
 */
export async function savePublicKey(publicKey: string): Promise<void> {
  await AsyncStorage.setItem(PUBLIC_KEY_KEY, publicKey);
}

/**
 * Get public key from storage
 */
export async function getPublicKey(): Promise<string | null> {
  return await AsyncStorage.getItem(PUBLIC_KEY_KEY);
}

/**
 * Save rpIdHash (base64)
 */
export async function saveRpIdHash(rpIdHash: string): Promise<void> {
  await AsyncStorage.setItem(RP_ID_HASH_KEY, rpIdHash);
}

/**
 * Get rpIdHash from storage
 */
export async function getRpIdHash(): Promise<string | null> {
  return await AsyncStorage.getItem(RP_ID_HASH_KEY);
}
