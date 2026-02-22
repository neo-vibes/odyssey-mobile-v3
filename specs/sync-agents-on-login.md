# Sync Agents on Login

## 1. Overview

**Project Name:** Sync Paired Agents on Login

**One-liner:** Fetch and restore paired agents from server when user links their wallet.

**Why it matters:** Currently logout clears local agent list. Users lose their paired agents and must re-pair manually. Server already has the pairings — we should sync them.

---

## 2. Requirements

### Core Features
- [ ] API endpoint to get paired agents for a wallet
- [ ] Mobile fetches paired agents after wallet link
- [ ] Saves fetched agents to local storage
- [ ] Shows synced agents in Agents screen

### User Stories
```
As a user who logged out and back in, I want my paired agents restored
so that I don't have to re-pair each one manually.
```

---

## 3. Architecture

### API Endpoint
`GET /api/agents/paired?walletPubkey=X`

**Response:**
```json
{
  "agents": [
    {
      "agentId": "3ZAQ...",
      "agentName": "Neo",
      "pairedAt": "2026-02-22T12:13:47.616Z"
    }
  ]
}
```

### Mobile Flow
```
Link Wallet (OnboardingScreen)
    ↓
Passkey created successfully
    ↓
Call GET /api/agents/paired?walletPubkey=X
    ↓
Save agents to local storage (zustand + AsyncStorage)
    ↓
Agents appear in Agents screen
```

---

## 4. Success Criteria

**Done when:**
- [ ] User logs out, logs back in, sees their paired agents restored
- [ ] No manual re-pairing needed
- [ ] Works for multiple agents

---

## 5. Out of Scope

- Unpair on logout (explicitly NOT doing this)
- Push sync (only syncs on login)
