/**
 * Session Challenge Builder
 * Builds the 89-byte challenge for WebAuthn session approval
 */

import type { SessionApprovalData } from '../services/sessions';

// Base58 alphabet (Bitcoin/Solana)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Decode a base58 string to Uint8Array (32 bytes for public keys)
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
 * PublicKey-like helper for base58 decoding
 * Mimics @solana/web3.js PublicKey.toBytes()
 */
class PublicKey {
  private _bytes: Uint8Array;

  constructor(value: string) {
    this._bytes = base58Decode(value);
    if (this._bytes.length !== 32) {
      throw new Error(`Invalid public key length: ${this._bytes.length}, expected 32`);
    }
  }

  toBytes(): Uint8Array {
    return this._bytes;
  }
}

// Challenge format (89 bytes total):
// [0]: discriminator = 5 (CreateSession)
// [1-32]: sessionPubkey (32 bytes)
// [33-40]: expiresAtSlot (8 bytes, little-endian i64)
// [41-72]: mint (32 bytes - all zeros for 'native')
// [73-80]: maxAmount (8 bytes, little-endian u64)
// [81-88]: currentSlot (8 bytes, little-endian u64)

const CREATE_SESSION_DISCRIMINATOR = 5;
const CHALLENGE_LENGTH = 89;

/**
 * Build the 89-byte session challenge for WebAuthn signing
 * 
 * @param data - Session approval data from the API
 * @returns Uint8Array of exactly 89 bytes (to be hashed by caller)
 */
export function buildSessionChallenge(data: SessionApprovalData): Uint8Array {
  const buffer = new ArrayBuffer(CHALLENGE_LENGTH);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  let offset = 0;

  // [0]: Discriminator = 5 (CreateSession)
  bytes[offset] = CREATE_SESSION_DISCRIMINATOR;
  offset += 1;

  // [1-32]: sessionPubkey (32 bytes from base58)
  const sessionPubkeyBytes = new PublicKey(data.sessionPubkey).toBytes();
  bytes.set(sessionPubkeyBytes, offset);
  offset += 32;

  // [33-40]: expiresAtSlot (8 bytes, little-endian i64)
  view.setBigInt64(offset, BigInt(data.expiresAtSlot), true);
  offset += 8;

  // [41-72]: mint (32 bytes - all zeros for 'native', base58 decode for SPL)
  if (data.mint === 'native') {
    // All zeros for native SOL
    bytes.fill(0, offset, offset + 32);
  } else {
    const mintBytes = new PublicKey(data.mint).toBytes();
    bytes.set(mintBytes, offset);
  }
  offset += 32;

  // [73-80]: maxAmount (8 bytes, little-endian u64)
  view.setBigUint64(offset, BigInt(data.maxAmount), true);
  offset += 8;

  // [81-88]: currentSlot (8 bytes, little-endian u64)
  view.setBigUint64(offset, BigInt(data.currentSlot), true);
  offset += 8;

  // Sanity check
  if (offset !== CHALLENGE_LENGTH) {
    throw new Error(`Challenge length mismatch: ${offset} !== ${CHALLENGE_LENGTH}`);
  }

  return bytes;
}
