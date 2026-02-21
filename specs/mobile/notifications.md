# Push Notifications

> Pairing + session requests only.

## Notification Types

| Event | Notify | Priority |
|-------|--------|----------|
| Pairing request | ✅ Yes | High |
| Session request | ✅ Yes | High |
| Tx executed | ❌ No | — |
| Session expiring | ❌ No | — |

**MVP scope:** Only notify for actions requiring user approval.

---

## Pairing Request

### Trigger

Agent submits pairing request via API.

### Notification

```
┌─────────────────────────────────────────┐
│ 🔗 Agent wants to pair                  │
│ Neo is requesting access to your wallet │
└─────────────────────────────────────────┘
```

### Payload

```json
{
  "type": "pairing_request",
  "agentId": "neo-123",
  "agentName": "Neo",
  "requestId": "req-456"
}
```

### Action

Tap → Open app → Agents tab with request visible

---

## Session Request

### Trigger

Agent requests spending session via API.

### Notification

```
┌─────────────────────────────────────────┐
│ 🔐 Session Request                      │
│ Neo wants a 1 hour session (0.5 SOL)    │
└─────────────────────────────────────────┘
```

### Payload

```json
{
  "type": "session_request",
  "agentId": "neo-123",
  "agentName": "Neo",
  "requestId": "req-789",
  "durationSeconds": 3600,
  "limitSol": 0.5
}
```

### Action

Tap → Open app → Session Request full screen

---

## Implementation

### Service

Use `expo-notifications` or Firebase Cloud Messaging (FCM).

```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get push token
const token = await Notifications.getExpoPushTokenAsync();

// Register with server
await api.registerPushToken(token.data);
```

### Server-Side

1. Store push tokens per wallet
2. On pairing/session request → send push
3. Use Expo Push API or FCM

### Deep Links

| Type | Deep Link |
|------|-----------|
| Pairing request | `odyssey://agents?request={id}` |
| Session request | `odyssey://sessions/request/{id}` |

---

## Permissions

### iOS

Request on first pairing request attempt (just-in-time).

### Android

Notifications enabled by default. Request for Android 13+.

---

## Future (Not in Scope)

| Feature | Status |
|---------|--------|
| Tx notifications | ❌ |
| Session expiring warning | ❌ |
| Balance alerts | ❌ |
| Custom notification sounds | ❌ |

---

*Minimal notification spec. Approval-only.*
