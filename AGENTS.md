# AGENTS.md — Odyssey Mobile v3

## Project
React Native mobile app for Odyssey — AI agent spending sessions on Solana.

## Architecture
- **Framework:** Expo (managed workflow)
- **Styling:** NativeWind v5 (Tailwind for RN)
- **Components:** gluestack-ui v2
- **Navigation:** React Navigation 7
- **State:** Zustand
- **Animations:** Reanimated + Moti

## Key Decisions
- **Telegram-first:** Wallet created in Telegram, mobile links to existing wallet
- **Dark mode only** (MVP)
- **SOL only** (no SPL tokens yet)
- **2 tabs:** Agents (default), Wallet

## Specs
Specs are in `specs/` directory. Use qmd to search:
```bash
qmd search "query" -c odyssey-specs
qmd get "specs/mobile/agents.md"
```

Key spec files:
- `specs/mobile/overview.md` — Navigation, constraints
- `specs/mobile/onboarding.md` — Link wallet flow
- `specs/mobile/agents.md` — Agents tab, pairing
- `specs/mobile/sessions.md` — Session approval, history
- `specs/mobile/wallet.md` — Balance, send, receive
- `specs/best-practices/ui.md` — Colors, typography
- `specs/best-practices/react-native.md` — Tech stack

## Backend API
Running at agentic-wallet. Key endpoints:
- `POST /api/pairing/code` — Generate pairing code
- `POST /api/pairing/request` — Agent submits pairing request
- `GET /api/sessions/requests` — Pending session requests
- `POST /api/sessions/approve` — Approve session (needs passkey)
- `GET /api/wallet/balance` — Get SOL balance
- `POST /api/wallet/send` — Send SOL (needs passkey)

## Commands
```bash
# Development
npx expo start              # Start dev server
npx expo run:ios            # Run on iOS
npx expo run:android        # Run on Android

# Quality
npx tsc --noEmit            # Type check
npx eslint .                # Lint
npm test                    # Tests
```

## Structure
```
src/
├── app/                    # Expo Router screens
├── components/
│   ├── ui/                 # Base components (gluestack)
│   └── common/             # Shared app components
├── hooks/                  # Custom hooks
├── stores/                 # Zustand stores
├── services/               # API client, solana utils
├── types/                  # TypeScript types
└── utils/                  # Helpers
```

## Workflow
This project uses the agentic engineering workflow:
1. Read `tasks.json` for current task
2. Search specs with qmd for requirements
3. Build → Verify → Fix loop
4. Return structured status

## Quality Gates
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint .` passes
- [ ] App runs without crash
- [ ] Feature matches spec wireframe

---

*Read specs/mobile/overview.md for full navigation structure.*
