# Mobile QR Linking Spec

## Overview
Implement QR code scanning flow to link mobile app with Telegram-created wallet.

## User Flow
1. User taps "Link Telegram Wallet" in mobile app
2. Camera opens with QR scanner overlay
3. User scans QR from `/pair_mobile` in Telegram bot
4. Mobile creates passkey (Face ID / Touch ID)
5. Mobile registers as additional signer via API
6. User approves in Telegram
7. Mobile shows success, navigates to wallet

## Technical Flow

```
Mobile                          API                           Telegram Bot
  |                              |                                  |
  |-- Scan QR ------------------>|                                  |
  |   (extract token from URL)   |                                  |
  |                              |                                  |
  |-- GET /api/pair-mobile/:token|                                  |
  |<-- { walletPubkey, telegramId, status }                         |
  |                              |                                  |
  |-- Create passkey (local) ----|                                  |
  |                              |                                  |
  |-- POST /api/pair-mobile/register                                |
  |   { token, deviceId, publicKey, credentialId }                  |
  |<-- { requestId }             |                                  |
  |                              |-- Notify: "Device wants access"  |
  |                              |                                  |
  |-- Poll GET /api/pair-mobile/status/:requestId                   |
  |<-- { status: 'pending' }     |                                  |
  |   ...                        |                                  |
  |                              |<-- User taps "Approve"           |
  |<-- { status: 'approved' }    |                                  |
  |                              |                                  |
  |-- Save wallet locally -------|                                  |
  |-- Navigate to WalletScreen   |                                  |
```

## Dependencies
- `expo-camera` — QR scanning
- `react-native-passkey` — already installed
- Existing API endpoints (already implemented)

## Files to Create/Modify

### New Files
- `src/screens/ScanQRScreen.tsx` — Camera with QR overlay
- `src/services/pairing.ts` — API calls for pairing flow

### Modified Files
- `src/screens/OnboardingScreen.tsx` — Replace TODO with navigation to ScanQRScreen
- `src/navigation/index.tsx` — Add ScanQRScreen route
- `package.json` — Add expo-camera

## API Endpoints (Already Exist)
- `GET /api/pair-mobile/:token` — Get pairing details
- `POST /api/pair-mobile/register` — Register device
- `GET /api/pair-mobile/status/:requestId` — Poll approval status

## Screen Specs

### ScanQRScreen
- Full screen camera view
- QR frame overlay (centered square)
- "Scan QR from Telegram" instruction text
- Back button (top left)
- On successful scan:
  - Vibrate feedback
  - Parse URL: `https://app.getodyssey.xyz/pair-mobile?token=xxx`
  - Extract token
  - Navigate to linking flow

### Linking Flow (within OnboardingScreen or new screen)
- "Linking wallet..." loading state
- Create passkey prompt (Face ID)
- "Waiting for approval..." with spinner
- Poll every 2s for status
- Timeout after 5 minutes
- Success → save wallet, navigate to WalletScreen
- Denied → show error, return to onboarding
- Timeout → show error, allow retry

## State Management
```typescript
// Store in SecureStore or similar
interface LinkedWallet {
  pubkey: string;
  telegramId: number;
  credentialId: string;  // For future signing
  linkedAt: string;
}
```

## Error Handling
- Camera permission denied → show settings prompt
- Invalid QR code → "Please scan QR from Telegram bot"
- Token expired → "QR code expired. Generate new one in Telegram"
- Passkey creation failed → "Face ID required to link wallet"
- Approval denied → "Request was denied. Try again."
- Timeout → "Approval timed out. Try again."
- Network error → "Connection failed. Check internet."

## Testing Requirements

### Unit Tests
- `pairing.ts`: Parse token from various URL formats
- `pairing.ts`: Handle API error responses

### Integration Tests  
- Full flow: scan → register → approve → wallet loaded
- Deny flow: scan → register → deny → error shown
- Timeout flow: scan → register → timeout → error shown

### Manual Test Cases
- [ ] Scan valid QR → success flow
- [ ] Scan invalid QR → error message
- [ ] Scan expired token → error message
- [ ] Deny in Telegram → error shown
- [ ] Cancel during passkey → return to scanner
- [ ] Background app during approval → resume works
