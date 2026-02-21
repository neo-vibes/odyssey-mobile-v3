# Odyssey Architecture

## Philosophy

**Telegram-first:** Wallet is created in Telegram (via signer-webapp). Mobile app is an optional enhancement that adds itself as an additional signer via `add_authority`.

This means:
- Users can experience Odyssey with just Telegram (no app download required)
- Mobile app provides native UX + independent signing capability
- Both devices can sign after mobile is linked

## Components

| Component | Description |
|-----------|-------------|
| **api** | Core backend — wallet, pairing, sessions, tx, device linking |
| **bot** | Telegram bot + signer-webapp (browser webapp for passkeys) |
| **mobile** | Mobile app (links to existing wallet, adds native passkey as signer) |
| **agentic-kit** | OpenClaw plugin + skills for agents |
| **lazorkit** | On-chain Solana program |

## Diagram

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Telegram Bot   │  │   Mobile App    │  │  Agents (kit)   │
│ + signer-webapp │  │ (native passkey)│  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────────────┐
                    │          API            │
                    │  ┌───────────────────┐  │
                    │  │ routes/           │  │
                    │  │  wallet, pairing, │  │
                    │  │  session, transfer│  │
                    │  └─────────┬─────────┘  │
                    │            ▼            │
                    │  ┌───────────────────┐  │
                    │  │ services/         │  │
                    │  │  wallet.ts        │  │
                    │  │  session.ts       │  │
                    │  │  pairing.ts       │  │
                    │  │  tx.ts            │  │
                    │  │  solana.ts        │  │
                    │  └───────────────────┘  │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │       lazorkit          │
                    │    (Solana program)     │
                    └─────────────────────────┘
```

## API Structure

```
api/
├── src/
│   ├── routes/
│   │   ├── wallet.ts      # Wallet creation, lookup
│   │   ├── pairing.ts     # Agent pairing flow
│   │   ├── session.ts     # Session CRUD
│   │   └── transfer.ts    # SOL, token, sign-and-send
│   ├── services/
│   │   ├── wallet.ts      # Wallet logic
│   │   ├── pairing.ts     # Pairing logic
│   │   ├── session.ts     # Session logic
│   │   ├── tx.ts          # Transaction building/sending
│   │   └── solana.ts      # RPC client
│   ├── types/
│   │   └── index.ts       # Zod schemas, types
│   └── index.ts           # Fastify setup
└── tests/
```

## Frontends

### Telegram Bot + Signer Webapp
- Bot handles conversation UI
- Signer-webapp is Telegram Mini App for passkey signatures
- User clicks button → Mini App opens → passkey prompt → closes

### Mobile App
- React Native + Expo
- Native passkey support (no webapp needed)
- Same API endpoints as bot

### Agentic Kit
- OpenClaw skill (SKILL.md)
- TypeScript SDK for pairing, sessions, transfers
- Used by AI agents

## Auth Flow

1. **User creates wallet (Telegram)** → passkey generated in browser, credentialId stored
2. **Agent pairs** → 6-char code, links agentId to walletPubkey
3. **Agent requests session** → user approves with passkey
4. **Agent executes tx** → signs with session key, API submits

## Device Linking Flow (Mobile)

Mobile app adds itself as an additional signer to an existing Telegram wallet:

```
Mobile App                    Server                      Telegram
    │                           │                             │
    │  1. "Link wallet"         │                             │
    │  ─────────────────────>   │                             │
    │                           │                             │
    │  2. Show QR / Telegram    │                             │
    │     OAuth                 │                             │
    │  <─────────────────────   │                             │
    │                           │                             │
    │  3. User authenticates    │                             │
    │     via Telegram          │                             │
    │  ─────────────────────────┼──────────────────────────>  │
    │                           │                             │
    │  4. Server knows          │                             │
    │     telegramId → wallet   │                             │
    │  <─────────────────────   │                             │
    │                           │                             │
    │  5. Create passkey        │                             │
    │     (on mobile)           │                             │
    │                           │                             │
    │  6. Sign challenge        │                             │
    │     (prove key ownership) │                             │
    │  ─────────────────────>   │                             │
    │                           │                             │
    │                           │  7. "Add mobile device?"    │
    │                           │  ──────────────────────────>│
    │                           │                             │
    │                           │  8. User approves           │
    │                           │     (laptop passkey signs   │
    │                           │      add_authority tx)      │
    │                           │  <──────────────────────────│
    │                           │                             │
    │  9. Mobile linked!        │                             │
    │  <─────────────────────   │                             │
    │                           │                             │
```

**Result:** Mobile passkey is now an authority on the Lazorkit vault. Both Telegram (browser passkey) and mobile (native passkey) can sign independently.

## Data

- **On-chain** (source of truth): wallets, sessions, balances, authorities
- **Server** (cache only): 
  - `credentialId → walletPubkey` (passkey → wallet mapping)
  - `telegramId → walletPubkey` (Telegram user → wallet mapping)
  - Pending requests (pairing, sessions, device linking)

---

*Odyssey — Time-boxed spending sessions for AI agents on Solana*
