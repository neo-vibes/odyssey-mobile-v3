# Wallet Feature

> Balance, send, receive. Secondary tab.

## Screens

1. **Wallet Tab** — Balance + actions
2. **Receive** — QR code + address
3. **Send** — Send SOL

---

## Screen: Wallet Tab

```
┌─────────────────────────────────────────┐
│  Wallet                                 │
├─────────────────────────────────────────┤
│                                         │
│           💰 2.50 SOL                   │
│             ~$425                       │
│                                         │
│       7xKt...3nQm           [Copy]      │
│                                         │
│  ┌──────────────┐  ┌──────────────┐     │
│  │   📥 Receive │  │   📤 Send    │     │
│  └──────────────┘  └──────────────┘     │
│                                         │
├───────────────────┬─────────────────────┤
│     🤖 Agents     │     💳 Wallet       │
└───────────────────┴─────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Balance (SOL) | Display | Large, prominent |
| Balance (USD) | Display | Secondary, gray |
| Address | Truncated | Tap to copy |
| Copy button | Icon button | Copy + toast |
| Receive | Button | → Receive screen |
| Send | Button | → Send screen |

### Data

- Balance from on-chain (poll or websocket)
- USD price from API (cache, update periodically)

---

## Screen: Receive

```
┌─────────────────────────────────────────┐
│  ← Receive                              │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │    [QR CODE]    │             │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│         7xKt...3nQm                     │
│                                         │
│         [Copy Address]                  │
│                                         │
│         [Share]                         │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| QR Code | Image | Encodes full address |
| Address | Text | Full address, copyable |
| Copy Address | Button | Copy + toast |
| Share | Button | Native share sheet |

### QR Code

- Generate with `react-native-qrcode-svg` or similar
- White QR on dark background for dark mode
- Large enough to scan easily

---

## Screen: Send

```
┌─────────────────────────────────────────┐
│  ← Send                                 │
├─────────────────────────────────────────┤
│                                         │
│  To                                     │
│  ┌─────────────────────────────────┐    │
│  │ Address                         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Amount                                 │
│  ┌─────────────────────────────────┐    │
│  │ 0.00                        SOL │    │
│  └─────────────────────────────────┘    │
│  Available: 2.50 SOL                    │
│                                         │
│  ─────────────────────────────────────  │
│  Network fee: ~0.000005 SOL             │
│  ─────────────────────────────────────  │
│                                         │
│  [Send]                                 │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Validation |
|---------|------|------------|
| To | Text input | Valid Solana address |
| Amount | Number input | > 0, ≤ available |
| Available | Display | Current balance |
| Network fee | Display | Estimated fee |
| Send | Button | Disabled until valid |

### Flow

1. Enter address
2. Enter amount
3. Tap Send
4. Passkey prompt
5. Transaction submitted
6. Success toast + navigate back

### Validation

| Field | Rule | Error |
|-------|------|-------|
| To | Valid base58, 32-44 chars | "Invalid address" |
| Amount | > 0 | "Enter amount" |
| Amount | ≤ available - fee | "Insufficient balance" |

### States

**Loading (sending):**
```
┌─────────────────────────────────────────┐
│                                         │
│           Sending...                    │
│                                         │
│           [spinner]                     │
│                                         │
└─────────────────────────────────────────┘
```

**Success:**
- Toast: "Sent 0.5 SOL"
- Navigate back to Wallet tab
- Balance updates

**Error:**
- Toast: "Transaction failed: {reason}"
- Stay on screen, allow retry

---

## Constraints

| Item | Decision |
|------|----------|
| Tokens | SOL only (no SPL tokens) |
| Token picker | ❌ Not in scope |
| Max button | ✅ Include (available - fee) |
| Address book | ❌ Not in scope |
| QR scan | ❌ Not in scope (MVP) |

---

## Data Model

```typescript
interface WalletState {
  address: string;
  balanceSol: number;
  balanceUsd: number;
  lastUpdated: Date;
}

interface SendTransaction {
  to: string;
  amountSol: number;
  signature?: string;
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/wallet/balance` | GET | Get SOL balance |
| `/api/wallet/send` | POST | Send SOL (needs passkey sig) |

---

*3 screens. Simple wallet ops.*
