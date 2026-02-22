# Session Approval (Mobile)

## 1. Overview

**Project Name:** Mobile Session Approval

**One-liner:** Allow users to approve agent session requests directly from the mobile app using passkey signature.

**Why it matters:** Currently session approval only works via Telegram → web page. Native mobile approval provides a seamless UX consistent with agent pairing.

---

## 2. Requirements

### Core Features
- [ ] Poll for pending session requests on Agents screen
- [ ] Display approval modal with session details (agent, amount, duration, token)
- [ ] Approve with passkey signature (creates session on-chain)
- [ ] Deny without passkey (simple rejection)
- [ ] Success/error states with appropriate UX

### User Stories
```
As a wallet owner, I want to approve spending sessions on my phone
so that I don't have to switch to Telegram.
```

### Non-Functional Requirements
- **Performance:** Polling every 3s, approval < 5s (includes on-chain tx)
- **Security:** Passkey required for approval, shows exact spending limit
- **UX:** Consistent with agent pairing approval flow

---

## 3. Constraints

### Technical Constraints
- **Language:** TypeScript
- **Framework:** React Native / Expo
- **Auth:** react-native-passkey for signatures
- **On-chain:** Session created via existing /api/v2/session/create

### Dependencies
- Existing session request flow (agent → API → pending state)
- Existing passkey infrastructure on mobile
- Wallet must be linked, agent must be paired

---

## 4. Architecture

### API Changes Needed
1. `GET /api/sessions/pending?walletPubkey=X` - List pending session requests
2. `POST /api/sessions/deny` - Deny a session request

### Mobile Changes
1. `src/services/sessions.ts` - Add API functions
2. `src/screens/agents/AgentsScreen.tsx` - Add polling for pending sessions
3. `src/components/SessionApprovalModal.tsx` - New modal component

### Flow
```
Open Agents Screen → Poll Pending → Session Request Found → Show Modal → Passkey Sign → On-chain Session → Success
```

### Session Approval Passkey Flow
1. Mobile fetches session request details
2. Build challenge: 80 bytes (sessionPubkey + expiresAt + mint + maxAmount)
3. Call Passkey.get() with challenge hash
4. POST to /api/v2/session/create with WebAuthn response
5. API creates session on-chain

---

## 5. Quality Standards

### Testing Requirements
- [ ] API endpoints return correct shapes
- [ ] Polling starts/stops correctly
- [ ] Passkey flow creates valid on-chain session

### Code Quality
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Consistent with existing code style

---

## 6. Success Criteria

**Done when:**
- [ ] User can approve session request entirely from mobile app
- [ ] Session is created on-chain after approval
- [ ] Agent can execute transfers using approved session
- [ ] Deny flow works without passkey
- [ ] Error states handled gracefully

**Verification:**
- [ ] Manual test: agent requests session, approve on mobile, agent transfers
- [ ] On-chain session account exists after approval

---

## 7. Out of Scope

- Push notifications (using polling for now)
- Session revocation from mobile
- Multiple pending sessions queue (show one at a time)

---

## 8. References

- Agent pairing approval: `specs/agent-pairing-approval.md`
- Existing session creation: `packages/api/src/index.ts` (/api/v2/session/create)
- Web approval page: `packages/api/src/pages.ts` (challenge building)
- Mobile passkey: `src/screens/OnboardingScreen.tsx`
