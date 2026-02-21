# Mobile App Overview

> Opinionated. Minimalist. Thumb-first.

## Architecture

**Telegram-first:** Wallet is created in Telegram. Mobile app links to existing wallet and adds itself as a signer via `add_authority`.

See [architecture.md](../architecture.md) for system-level details.

---

## Navigation

**Bottom tabs (2):**

```
┌─────────────────────────────────────────┐
│            [Screen Content]             │
├───────────────────┬─────────────────────┤
│     🤖 Agents     │     💳 Wallet       │
│     (default)     │                     │
└───────────────────┴─────────────────────┘
```

| Tab | Purpose | Priority |
|-----|---------|----------|
| **Agents** | Pairing + session signing | Primary |
| **Wallet** | Balance, send, receive | Secondary |

---

## Screen Hierarchy

```
Agents (default)
├── Pending requests (pairing + sessions)
├── Agents list (paired)
│   └── [tap agent] → Agent detail
│       └── Sessions
│           └── [tap session] → Session detail
│               └── [tap tx] → Transaction detail
│
Wallet
├── Balance
├── Receive (QR + address)
└── Send
```

**Depth = Importance (inverse):**
- Depth 0: Pending requests (most important)
- Depth 1: Agents list, Wallet actions
- Depth 2: Agent detail
- Depth 3: Session detail
- Depth 4: Transaction detail

---

## Screen Summary

| Screen | Depth | Spec File |
|--------|-------|-----------|
| Onboarding | — | [onboarding.md](./onboarding.md) |
| Agents tab | 0 | [agents.md](./agents.md) |
| Pair Agent | 1 | [agents.md](./agents.md) |
| Agent Detail | 1 | [agents.md](./agents.md) |
| Session Request | 1 | [sessions.md](./sessions.md) |
| Sessions List | 2 | [sessions.md](./sessions.md) |
| Session Detail | 3 | [sessions.md](./sessions.md) |
| Transaction Detail | 4 | [sessions.md](./sessions.md) |
| Wallet tab | 0 | [wallet.md](./wallet.md) |
| Receive | 1 | [wallet.md](./wallet.md) |
| Send | 1 | [wallet.md](./wallet.md) |

**Total: 9 screens**

---

## Constraints

| Item | Decision |
|------|----------|
| Wallet creation | Telegram-first (mobile links) |
| Mobile onboarding | Link via Telegram, add as signer |
| Revoke session | ❌ Not supported |
| Multiple sessions/agent | ❌ One at a time |
| Network | Fixed per build (no toggle) |
| Send | SOL only (no token picker) |

---

## Push Notifications

See [notifications.md](./notifications.md).

| Event | Notify |
|-------|--------|
| Pairing request | ✅ |
| Session request | ✅ |
| Tx executed | ❌ |

---

## Future (Not in Scope)

1. Mobile-first wallet creation
2. Settings screen
3. SPL token support
4. Revoke session
5. Tx notifications

---

*Load feature specs for implementation details.*
