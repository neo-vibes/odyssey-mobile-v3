# Agent Pairing Approval (Mobile)

## 1. Overview

**Project Name:** Mobile Agent Pairing Approval

**One-liner:** Allow users to approve agent pairing requests directly from the mobile app using passkey signature.

**Why it matters:** Currently users must switch to Telegram to approve agent pairing requests. Native mobile approval provides a seamless UX.

---

## 2. Requirements

### Core Features
- [ ] Poll for incoming agent pairing requests after generating code
- [ ] Display approval modal with agent info
- [ ] Approve with passkey signature
- [ ] Deny without passkey (simple rejection)
- [ ] Success/error states with appropriate UX

### User Stories
```
As a wallet owner, I want to approve agent pairing requests on my phone 
so that I don't have to switch to Telegram.
```

### Non-Functional Requirements
- **Performance:** Polling every 2s, approval < 3s
- **Security:** Passkey required for approval (no accidental approves)
- **UX:** Consistent with existing app styling

---

## 3. Constraints

### Technical Constraints
- **Language:** TypeScript
- **Framework:** React Native / Expo
- **Auth:** react-native-passkey for signatures

### Dependencies
- Existing `/api/pairing/request` endpoint
- Existing passkey infrastructure on mobile
- Wallet must be linked first

---

## 4. Architecture

### API Changes Needed
1. `GET /api/pairing/code/:code/status` - Check if agent requested pairing
2. `POST /api/pairing/approve-mobile` - Approve with passkey signature

### Mobile Changes
1. `src/services/pairing.ts` - Add API functions
2. `src/screens/agents/PairAgentScreen.tsx` - Add polling + approval flow
3. `src/components/AgentApprovalModal.tsx` - New modal component

### Flow
```
Generate Code → Poll Status → Agent Requests → Show Modal → Passkey Sign → Approved
```

---

## 5. Quality Standards

### Testing Requirements
- [ ] API endpoints return correct shapes
- [ ] Polling starts/stops correctly
- [ ] Passkey flow handles success/error

### Code Quality
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Consistent with existing code style

---

## 6. Success Criteria

**Done when:**
- [ ] User can generate code, wait for agent, approve via passkey - all in mobile app
- [ ] Agent receives `authSecret` after mobile approval
- [ ] Deny flow works without passkey
- [ ] Error states handled gracefully

**Verification:**
- [ ] Manual test: full flow mobile-only
- [ ] Agent polls and receives approval

---

## 7. Out of Scope

- Push notifications (future - using polling for now)
- WebSocket real-time updates
- Multi-agent approval queue

---

## 8. References

- Existing Telegram approval: `packages/bot/src/index.ts`
- Mobile passkey flow: `src/screens/OnboardingScreen.tsx`
- Pairing API: `packages/api/src/index.ts`
