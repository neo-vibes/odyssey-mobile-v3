# Odyssey Specs

> Time-boxed spending sessions for AI agents on Solana

## Architecture

- [architecture.md](./architecture.md) — System overview, components, flows

## Best Practices

Guidelines for building Odyssey. Reference when implementing.

| File | Description |
|------|-------------|
| [ux.md](./best-practices/ux.md) | UX principles, design philosophy |
| [ui.md](./best-practices/ui.md) | Colors, typography, components |
| [react-native.md](./best-practices/react-native.md) | Tech stack, animations, performance |

## Mobile App Specs

Feature specs for the mobile app. Each file is self-contained.

| File | Screens | Description |
|------|---------|-------------|
| [overview.md](./mobile/overview.md) | — | Navigation, hierarchy, constraints |
| [onboarding.md](./mobile/onboarding.md) | 1 | Link wallet, add device flow |
| [agents.md](./mobile/agents.md) | 3 | Agents tab, pairing, agent detail |
| [sessions.md](./mobile/sessions.md) | 4 | Session requests, approval, history |
| [wallet.md](./mobile/wallet.md) | 3 | Balance, send, receive |
| [notifications.md](./mobile/notifications.md) | — | Push notification spec |

## API & Bot Specs

| File | Description |
|------|-------------|
| [api/](./api/) | API endpoints spec |
| [bot/](./bot/) | Telegram bot flows |
| [agentic-kit/](./agentic-kit/) | Agent SDK/skill |

---

*Load only what you need. Keep context small.*
