# Onboarding

> Telegram-first. Mobile links to existing wallet.

## Context

Wallet is created in Telegram (via browser webapp). Mobile app links to existing wallet and adds itself as a signer.

---

## Screen: Onboarding (First Launch)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│            🚀 Odyssey                   │
│                                         │
│     Give your agents spending power     │
│                                         │
│                                         │
│      [Link Telegram Wallet]             │
│                                         │
│    Don't have one?                      │
│    Create in @odyssey_bot →             │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Logo + tagline | Static | — |
| "Link Telegram Wallet" | Primary button | Start linking flow |
| "Create in @odyssey_bot" | Link | Deep link to Telegram bot |

---

## Linking Flow

```
1. Tap "Link Telegram Wallet"
         │
         ▼
2. Telegram OAuth / QR scan
   (user authenticates via Telegram)
         │
         ▼
3. Server identifies wallet via telegramId
         │
         ▼
4. Mobile creates passkey
   (native WebAuthn prompt)
         │
         ▼
5. Mobile signs challenge (off-chain)
   (proves ownership of new passkey)
         │
         ▼
6. Server sends "Add device" request to Telegram
         │
         ▼
7. User approves on Telegram (laptop/desktop)
   (signs add_authority tx with existing passkey)
         │
         ▼
8. Mobile passkey added as signer
         │
         ▼
9. Navigate to Agents tab ✓
```

---

## Telegram Side: Add Device Request

When mobile initiates linking, Telegram bot shows:

```
Bot: 📱 Mobile Device Pairing

Your mobile app wants to link to this wallet.

Device: iPhone 15 Pro
Time: Just now

[✅ Approve]  [❌ Deny]
```

**Same UX pattern as agent pairing** — request comes in, user approves.

### Flow

1. User taps "Approve"
2. Webapp opens
3. Passkey prompt appears
4. User authenticates
5. `add_authority` tx signed and submitted
6. Mobile receives confirmation (via websocket/polling)

---

## States

### Loading State

```
┌─────────────────────────────────────────┐
│                                         │
│            🔄 Linking...                │
│                                         │
│    Waiting for approval on Telegram     │
│                                         │
└─────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────────┐
│                                         │
│            ❌ Link Failed               │
│                                         │
│    Could not connect to wallet.         │
│    Make sure you have a wallet in       │
│    @odyssey_bot first.                  │
│                                         │
│    [Try Again]    [Create Wallet →]     │
│                                         │
└─────────────────────────────────────────┘
```

### Success State

Navigate directly to Agents tab. Optional: brief success toast.

---

## Edge Cases

| Case | Behavior |
|------|----------|
| No wallet exists | Show error, link to create in Telegram |
| User denies on Telegram | Show "Denied" error, allow retry |
| Timeout (2 min) | Show timeout error, allow retry |
| Already linked | Skip to Agents tab |

---

## Technical Notes

- Use Telegram Login Widget or deep link OAuth
- Store `telegramId` on device after successful link
- Check linking status on app launch
- If linked, skip onboarding

---

*One screen. One flow. Load agents.md after onboarding is complete.*
