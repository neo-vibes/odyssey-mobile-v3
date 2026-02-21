# Sessions Feature

> Session requests, approval, history, transactions.

## Screens

1. **Session Request** — Approval flow (full screen)
2. **Sessions List** — Active + past sessions for an agent
3. **Session Detail** — Session info + transactions
4. **Transaction Detail** — Single tx info

---

## Session Request Card (on Agents tab)

```
┌─────────────────────────────────────────┐
│ 🔐 Session Request                      │
│                                         │
│ Neo • 1 hour • 0.5 SOL                  │
│                                         │
│ [Approve]  [Deny]              [Details]│
└─────────────────────────────────────────┘
```

### Inline Actions

| Action | Behavior |
|--------|----------|
| Approve | Passkey prompt → session created |
| Deny | Dismiss request |
| Details | → Session Request full screen |

---

## Screen: Session Request (Full Screen)

```
┌─────────────────────────────────────────┐
│  ← Session Request                      │
├─────────────────────────────────────────┤
│                                         │
│  🤖 Neo                                 │
│  wants a spending session               │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Duration        1 hour                 │
│  Limit           0.5 SOL (~$85)         │
│  Network         Mainnet                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [Approve]                              │
│                                         │
│  [Deny]                                 │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Content |
|---------|---------|
| Agent name | From request |
| Duration | Human readable (1 hour, 30 min) |
| Limit | SOL amount + USD equivalent |
| Network | Mainnet/Devnet (fixed per build) |

### Flow

1. Tap Approve
2. Passkey prompt appears
3. Session created on-chain
4. Agent notified
5. Navigate back to Agents tab
6. Agent shows 🟢 active session indicator

---

## Screen: Sessions List

Accessed from Agent Detail → "View Sessions"

```
┌─────────────────────────────────────────┐
│  ← Neo › Sessions                       │
├─────────────────────────────────────────┤
│                                         │
│  Active                                 │
│  ┌─────────────────────────────────┐    │
│  │ 45 min left • 0.5 SOL limit     │    │
│  │ 3 transactions                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Past                                   │
│  Feb 19 • 1 hour • 0.1 SOL spent   >    │
│  Feb 18 • 30 min • 0 SOL spent     >    │
│  Feb 17 • 2 hours • 0.3 SOL spent  >    │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Active session card | Card | → Session Detail |
| Past sessions | List rows | → Session Detail |

### Active Session Card

Shows:
- Time remaining
- Spending limit
- Tx count

### Past Session Row

Shows:
- Date
- Duration
- Amount spent

---

## Screen: Session Detail

```
┌─────────────────────────────────────────┐
│  ← Session                              │
├─────────────────────────────────────────┤
│                                         │
│  Feb 19, 2026 • 14:30                   │
│  Duration: 1 hour                       │
│  Limit: 0.5 SOL                         │
│  Spent: 0.1 SOL                         │
│  Status: Expired                        │
│                                         │
│  ─────────────────────────────────────  │
│  Transactions (3)                       │
│                                         │
│  📤 0.05 SOL → 7xKt...3nQm         >    │
│  📤 0.03 SOL → 9aBc...4dEf         >    │
│  🔄 Swap 0.02 SOL → USDC           >    │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Content |
|---------|---------|
| Timestamp | Session start time |
| Duration | How long session lasted |
| Limit | Max spending allowed |
| Spent | Actual amount spent |
| Status | Active / Expired |
| Transactions | List of txs during session |

### Status Values

| Status | Meaning |
|--------|---------|
| Active | Session in progress |
| Expired | Time elapsed |
| Exhausted | Limit reached |

---

## Screen: Transaction Detail

```
┌─────────────────────────────────────────┐
│  ← Transaction                          │
├─────────────────────────────────────────┤
│                                         │
│  📤 Sent 0.05 SOL                       │
│                                         │
│  To                                     │
│  7xKt...3nQm                    [Copy]  │
│                                         │
│  Amount                                 │
│  0.05 SOL (~$8.50)                      │
│                                         │
│  Time                                   │
│  Feb 19, 2026 • 14:35                   │
│                                         │
│  Signature                              │
│  4YnJ...8JWc                    [Copy]  │
│                                         │
│  [View on Explorer]                     │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Action |
|---------|--------|
| Address | Tap to copy |
| Signature | Tap to copy |
| "View on Explorer" | Open Solscan/Explorer |

### Tx Types

| Icon | Type |
|------|------|
| 📤 | Send |
| 📥 | Receive |
| 🔄 | Swap |

---

## Data Model

```typescript
interface SessionRequest {
  id: string;
  agentId: string;
  agentName: string;
  durationSeconds: number;
  limitSol: number;
  requestedAt: Date;
}

interface Session {
  id: string;
  agentId: string;
  startedAt: Date;
  expiresAt: Date;
  limitSol: number;
  spentSol: number;
  status: 'active' | 'expired' | 'exhausted';
  txCount: number;
}

interface Transaction {
  signature: string;
  type: 'send' | 'receive' | 'swap';
  amountSol: number;
  destination?: string;
  timestamp: Date;
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions/requests` | GET | Pending session requests |
| `/api/sessions/approve` | POST | Approve (needs passkey sig) |
| `/api/sessions/deny` | POST | Deny request |
| `/api/agents/:id/sessions` | GET | Sessions for agent |
| `/api/sessions/:id` | GET | Session detail |
| `/api/sessions/:id/transactions` | GET | Txs in session |

---

*4 screens. Core approval flow.*
