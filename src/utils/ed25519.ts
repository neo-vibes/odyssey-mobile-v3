import * as nacl from 'tweetnacl';

// Base58 alphabet (Bitcoin/Solana)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Decode a base58 string to Uint8Array
 */
function base58Decode(input: string): Uint8Array {
  if (input.length === 0) return new Uint8Array(0);
  
  const bytes = [0];
  for (const char of input) {
    const value = BASE58_ALPHABET.indexOf(char);
    if (value === -1) throw new Error(`Invalid base58 character: ${char}`);
    
    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  
  // Handle leading zeros
  for (const char of input) {
    if (char !== '1') break;
    bytes.push(0);
  }
  
  return new Uint8Array(bytes.reverse());
}

/**
 * Verify an Ed25519 signature (base64 encoded inputs).
 * @param message - The message that was signed (base64 encoded)
 * @param signature - The signature to verify (base64 encoded)
 * @param pubkey - The public key to verify against (base64 encoded)
 * @returns true if the signature is valid, false otherwise
 */
export function verifySignature(message: string, signature: string, pubkey: string): boolean {
  try {
    // Decode base64 inputs to Uint8Array
    const messageBytes = Uint8Array.from(atob(message), c => c.charCodeAt(0));
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const pubkeyBytes = Uint8Array.from(atob(pubkey), c => c.charCodeAt(0));

    // Verify the detached signature
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  } catch (error) {
    // Return false for any decoding or verification errors
    return false;
  }
}

/**
 * Verify an Ed25519 signature with UTF-8 message and base58 pubkey.
 * Used for agent identity verification where:
 * - message is a plain UTF-8 string (e.g., "code:agentId:timestamp")
 * - signature is base64 encoded
 * - pubkey is base58 encoded (Solana format)
 * 
 * @param message - The message that was signed (UTF-8 string)
 * @param signature - The signature to verify (base64 encoded)
 * @param pubkey - The public key to verify against (base58 encoded)
 * @returns true if the signature is valid, false otherwise
 */
export function verifyAgentSignature(message: string, signature: string, pubkey: string): boolean {
  try {
    // Encode UTF-8 message to bytes
    const messageBytes = new TextEncoder().encode(message);
    // Decode base64 signature
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    // Decode base58 pubkey (Solana format)
    const pubkeyBytes = base58Decode(pubkey);

    // Verify the detached signature
    return nacl.sign.detached.verify(messageBytes, signatureBytes, pubkeyBytes);
  } catch (error) {
    console.warn('Signature verification error:', error);
    // Return false for any decoding or verification errors
    return false;
  }
}
