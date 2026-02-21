# Agents Feature

> Default tab. Pairing + pending requests.

## Screens

1. **Agents Tab** — List + pending requests
2. **Pair New Agent** — Generate pairing code
3. **Agent Detail** — Agent info + sessions link

---

## Screen: Agents Tab (Default)

```
┌─────────────────────────────────────────┐
│  Agents                                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔗 Pairing Request              │    │
│  │ Agent: Neo                      │    │
│  │ [Approve]  [Deny]      [Details]│    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔐 Session Request              │    │
│  │ Neo • 1 hour • 0.5 SOL          │    │
│  │ [Approve]  [Deny]      [Details]│    │
│  └─────────────────────────────────┘    │
│                                         │
│  ─────────────────────────────────────  │
│  Paired Agents                          │
│                                         │
│  🟢 Neo                           >     │
│  Argos                            >     │
│                                         │
│  [+ Pair New Agent]                     │
│                                         │
├───────────────────┬─────────────────────┤
│     🤖 Agents     │     💳 Wallet       │
└───────────────────┴─────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Pending requests | Cards | Inline approve/deny or Details |
| Paired agents | List rows | Tap → Agent Detail |
| 🟢 indicator | Badge | Active session |
| "Pair New Agent" | Button | → Pair screen |

### Empty State

```
┌─────────────────────────────────────────┐
│  Agents                                 │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         No agents paired yet            │
│                                         │
│         [Pair Your First Agent]         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

## Screen: Pair New Agent

```
┌─────────────────────────────────────────┐
│  ← Pair Agent                           │
├─────────────────────────────────────────┤
│                                         │
│  Share this code with your agent:       │
│                                         │
│         ┌─────────────────┐             │
│         │    ABC-123      │             │
│         └─────────────────┘             │
│                                         │
│         [Copy Code]                     │
│                                         │
│  ─── or ───                             │
│                                         │
│  [Copy Instructions for Agent]          │
│                                         │
│  "Pair with my Odyssey wallet using     │
│   code ABC-123"                         │
│                                         │
│  Expires in 14:59                       │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Code | Display (large, monospace) | — |
| "Copy Code" | Button | Copy to clipboard + toast |
| "Copy Instructions" | Button | Copy full instruction text |
| Timer | Countdown | 15 min expiry |

### Flow

1. User taps "Pair New Agent" → screen opens, code generated
2. User copies code or instruction text
3. Shares with agent (via chat)
4. Agent sends pairing request via API
5. Request appears on Agents tab
6. User approves → agent paired

---

## Pairing Request Card

Shown on Agents tab when agent submits pairing request.

```
┌─────────────────────────────────────────┐
│ 🔗 Pairing Request                      │
│                                         │
│ Agent: Neo                              │
│ Requested: Just now                     │
│                                         │
│ [Approve]  [Deny]              [Details]│
└─────────────────────────────────────────┘
```

### Actions

| Action | Behavior |
|--------|----------|
| Approve | Passkey prompt → agent paired |
| Deny | Dismiss request |
| Details | Full screen with agent info |

---

## Screen: Agent Detail

```
┌─────────────────────────────────────────┐
│  ← Neo                                  │
├─────────────────────────────────────────┤
│                                         │
│  🤖 Neo                                 │
│  Paired: Feb 20, 2026                   │
│                                         │
│  [Unpair Agent]                         │
│                                         │
│  ─────────────────────────────────────  │
│  Sessions                       [View]  │
│                                         │
│  Active: 1                              │
│  Past: 12                               │
│                                         │
└─────────────────────────────────────────┘
```

### Elements

| Element | Type | Action |
|---------|------|--------|
| Agent name | Header | — |
| Paired date | Caption | — |
| "Unpair Agent" | Destructive button | Confirm → remove pairing |
| Sessions row | Link | → Sessions list (see sessions.md) |

---

## Data Model

```typescript
interface Agent {
  id: string;
  name: string;
  pairedAt: Date;
  hasActiveSession: boolean;
}

interface PairingRequest {
  id: string;
  agentId: string;
  agentName: string;
  requestedAt: Date;
  expiresAt: Date;
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pairing/code` | POST | Generate pairing code |
| `/api/pairing/requests` | GET | List pending requests |
| `/api/pairing/approve` | POST | Approve request |
| `/api/pairing/deny` | POST | Deny request |
| `/api/agents` | GET | List paired agents |
| `/api/agents/:id` | DELETE | Unpair agent |

---

*3 screens. Load sessions.md for session flows.*
