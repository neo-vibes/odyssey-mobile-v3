# Agent Identity V2 — agentId = pubkey

> Serverless agent identity: public key IS the identity

---

## 1. Overview

**Project Name:** Agent Identity V2

**One-liner:** Replace string-based agentId with Ed25519 public key as the canonical agent identity

**Why it matters:** 
- Eliminates TOFU vulnerability (no registration race)
- Prevents agentId squatting
- Enables serverless pairing (no server-side agent registry)
- Self-sovereign identity for agents

---

## 2. Requirements

### Core Features
- [ ] Agent signs pairing requests with Ed25519 private key
- [ ] agentId = base64-encoded public key (32 bytes)
- [ ] agentName = display-only human-readable name
- [ ] API verifies signature against agentId directly
- [ ] Mobile stores paired agents locally (agentId + name)
- [ ] Mobile verifies signatures for session requests

### Data Model

**Before:**
```json
{
  "agentId": "neo",
  "agentName": "Neo ⚡",
  "agentPubkey": "9KGFHF..."
}
```

**After:**
```json
{
  "agentId": "e4s7BoQ2riqTEcCz...",  // base64 pubkey (32 bytes)
  "agentName": "Neo ⚡"               // display only
}
```

### Signature Format

Agent signs: `{code}:{agentId}:{timestamp}`

Request body:
```json
{
  "code": "AB12",
  "agentId": "e4s7BoQ2riq...",      // base64 pubkey
  "agentName": "Neo ⚡",
  "timestamp": 1771749912424,
  "signature": "base64-signature"
}
```

### Non-Functional Requirements
- **Security:** Ed25519 signatures, 5-minute timestamp window
- **Backwards compatibility:** Support unsigned requests temporarily (migration)
- **Performance:** Signature verification < 1ms

---

## 3. Constraints

### Technical Constraints
- **API:** Fastify (existing), Node.js crypto for Ed25519
- **Mobile:** React Native, need Ed25519 library for verification
- **Storage:** AsyncStorage for local agent list

### Dependencies
- API: Node.js crypto (built-in Ed25519 support)
- Mobile: `@noble/curves` or `tweetnacl` for Ed25519

---

## 4. Architecture

### API Flow

```
Agent Request
    │
    ├─ Extract agentId (= pubkey)
    │
    ├─ Verify signature against agentId
    │   └─ Fail → 401 Unauthorized
    │
    ├─ Process request (pairing/session)
    │
    └─ Return response
```

### Mobile Flow

```
User approves pairing
    │
    ├─ Store {agentId, agentName} in AsyncStorage
    │
    └─ Display in agents list

Session request arrives
    │
    ├─ Verify signature against agentId
    │   └─ Fail → reject
    │
    ├─ Check agentId in local list
    │   └─ Not found → show as "Unknown Agent"
    │
    └─ Prompt user for approval
```

### Storage

**API:** No server-side agent registry needed (removed)

**Mobile:** Local storage only
```json
// AsyncStorage key: "odyssey_paired_agents"
{
  "agents": [
    {
      "agentId": "e4s7BoQ2riq...",
      "agentName": "Neo ⚡",
      "pairedAt": "2026-02-22T10:00:00Z"
    }
  ]
}
```

---

## 5. Quality Standards

### Testing Requirements
- [ ] Unit tests for signature verification
- [ ] Integration tests for signed pairing flow
- [ ] Test invalid/expired signatures rejected

### Acceptance Criteria
- [ ] API accepts agentId as base64 pubkey
- [ ] API verifies signature against agentId
- [ ] API rejects invalid signatures with 401
- [ ] API rejects expired timestamps (>5 min)
- [ ] Mobile verifies signatures locally
- [ ] Mobile stores agents in AsyncStorage
- [ ] Mobile displays agents list from local storage

---

## 6. Migration

### Phase 1: API (backwards compatible)
- Accept both old (string agentId) and new (pubkey agentId)
- If signature provided, verify it
- If no signature AND agentId looks like pubkey, require signature

### Phase 2: Mobile
- Update to store/verify with new format
- Migrate existing agents (re-pair required)

### Phase 3: Deprecate old format
- Require signatures for all requests
- Remove TOFU code
- Remove server-side agent registry

---

## 7. Out of Scope

- Agent Keyring service (future product)
- Key rotation
- Multi-sig agents
- On-chain identity registry

---

## 8. References

- Design discussion: memory/topics/agent-keyring.md
- Ed25519: https://ed25519.cr.yp.to/
- Node.js crypto: https://nodejs.org/api/crypto.html#ed25519-and-ed448

---

*Spec version: 1.0 — 2026-02-22*
