# Mobile Device Pairing

## Overview
Allow users to add their mobile device as an authority on their Odyssey wallet. Once paired, the mobile can sign session approvals directly without going through Telegram.

## User Flow

### 1. Initiate Pairing (Telegram)
- User runs `/pair-mobile` command in @odyssey_session_bot
- Bot generates a one-time token linked to user's wallet
- Bot displays QR code containing URL: `https://app.getodyssey.xyz/pair-mobile?token=<uuid>`
- Token expires in 10 minutes

### 2. Scan & Create Passkey (Mobile)
- User scans QR code with mobile camera
- Opens browser to `/pair-mobile` page
- Page validates token via API
- Page displays wallet info and "Create Passkey" button
- User taps button → WebAuthn creates passkey
- Passkey is stored in device keychain (iCloud/Google sync)

### 3. Register Passkey (API)
- Mobile browser sends passkey public key to API
- API stores pending authority request:
  - `walletPubkey`
  - `telegramId`
  - `secp256r1Pubkey` (from passkey)
  - `rpIdHash`
  - `credentialId`
- API notifies user in Telegram: "Approve mobile device?"

### 4. Approve Authority (Telegram)
- User sees approval request in Telegram
- Taps "Approve" → opens webview
- Signs `add_authority` transaction with existing passkey
- On-chain: mobile passkey added as Spender authority

### 5. Confirmation
- Telegram shows "Mobile paired successfully!"
- Mobile browser shows success state
- Mobile app can now sign session approvals

## Technical Details

### Token Structure (Server-side)
```typescript
interface MobilePairingToken {
  token: string;           // UUID
  telegramId: number;
  walletPubkey: string;
  createdAt: Date;
  expiresAt: Date;         // +10 minutes
  used: boolean;
  // After passkey created:
  credentialId?: string;   // base64
  secp256r1Pubkey?: string; // base64 compressed
  rpIdHash?: string;       // base64
  status: 'pending' | 'passkey_created' | 'approved' | 'expired';
}
```

### API Endpoints

#### POST /api/pair-mobile/generate
Called by Telegram bot to generate pairing token.
```typescript
// Request
{ telegramId: number, walletPubkey: string }

// Response
{ token: string, expiresAt: string, qrUrl: string }
```

#### GET /api/pair-mobile/:token
Called by mobile browser to validate token and get wallet info.
```typescript
// Response (valid)
{ 
  valid: true,
  walletPubkey: string,
  walletShort: string,  // "7xKX...gAsU"
  rpId: string          // "getodyssey.xyz"
}

// Response (invalid/expired)
{ valid: false, error: string }
```

#### POST /api/pair-mobile/register
Called by mobile browser after passkey creation.
```typescript
// Request
{
  token: string,
  credentialId: string,      // base64
  publicKey: string,         // base64 compressed secp256r1
  rpIdHash: string,          // base64
  // Attestation for verification
  attestationObject?: string,
  clientDataJSON?: string
}

// Response
{ 
  success: true,
  requestId: string,  // For tracking approval
  message: "Approval request sent to Telegram"
}
```

#### POST /api/pair-mobile/approve
Called after owner approves in Telegram (signs add_authority tx).
```typescript
// Request (from approval webview)
{
  requestId: string,
  signature: string,         // DER
  authenticatorData: string, // base64
  clientDataJSON: string     // base64
}

// Response
{ success: true, txSignature: string }
```

### Bot Commands

#### /pair-mobile
```
🔗 *Pair Mobile Device*

Scan this QR code with your phone to add it as a signer.

[QR CODE IMAGE]

Or open: https://app.getodyssey.xyz/pair-mobile?token=xxx

⏱️ Expires in 10 minutes
```

### Web Pages

#### /pair-mobile (new page)
- Validates token on load
- Shows wallet info
- "Create Passkey" button
- Creates WebAuthn credential
- Posts to /api/pair-mobile/register
- Shows success/waiting state

### Lazorkit Integration
Uses `add_authority` instruction:
- `authority_type`: Spender (limited permissions)
- `secp256r1_pubkey`: From mobile passkey
- `rp_id_hash`: SHA256 of rpId
- Signed by existing Owner authority

## UI States

### Telegram Bot
1. **Generate**: Show QR code + link
2. **Approval Request**: "Mobile device wants to pair" + Approve/Deny buttons
3. **Success**: "Mobile paired! ✅"

### Mobile Browser (/pair-mobile)
1. **Loading**: Validating token...
2. **Ready**: Wallet info + "Create Passkey" button
3. **Creating**: Creating passkey...
4. **Waiting**: "Waiting for approval in Telegram..."
5. **Success**: "Mobile paired! You can now approve sessions."
6. **Error**: Token expired/invalid

## Security Considerations
- Token is single-use and expires in 10 minutes
- Passkey bound to rpId (getodyssey.xyz)
- Mobile added as Spender (not Owner) - can approve sessions but not add authorities
- Owner must approve via existing passkey (2FA-like)

## Files to Create/Modify

### New Files
- `packages/api/src/pages/pair-mobile.ts` - Web page HTML
- Bot: Add `/pair-mobile` command handler

### Modified Files
- `packages/api/src/index.ts` - Add API endpoints
- `packages/bot/src/index.ts` - Add command handler

## Dependencies
- QR code generation: Use existing `qrcode` package or inline SVG
- No new dependencies needed
