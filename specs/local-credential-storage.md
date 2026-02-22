# Local Credential Storage

## 1. Overview

**Project Name:** Local Credential Storage

**One-liner:** Store passkey credentialId locally on each device instead of server-side, enabling seamless multi-device support.

**Why it matters:** Current server-side credential storage causes "credential not found" errors when users switch devices. Each device should manage its own credential.

---

## 2. Requirements

### Core Features
- [ ] Store credentialId in AsyncStorage after successful passkey operations
- [ ] Retrieve local credentialId for passkey operations
- [ ] Fall back to discoverable flow if no local credential
- [ ] Remove dependency on server-side credentialId

### User Stories
```
As a user with multiple devices, I want each device to remember its own passkey
so that I can approve sessions from any linked device without errors.
```

### Non-Functional Requirements
- **Performance:** Local storage lookup < 10ms
- **Reliability:** Graceful fallback if credential missing
- **Security:** credentialId is not sensitive (just an identifier)

---

## 3. Constraints

### Technical Constraints
- **Storage:** AsyncStorage (React Native)
- **Key format:** `odyssey_credential_id`
- **Passkey lib:** react-native-passkey

### Dependencies
- Existing passkey flows (wallet creation, mobile link, session approval)
- AsyncStorage already in project

---

## 4. Architecture

### Storage Schema
```typescript
// AsyncStorage key
const CREDENTIAL_KEY = 'odyssey_credential_id';

// Value: string (base64 credentialId from passkey)
```

### Capture Points
1. **Wallet creation** (`OnboardingScreen`) - after Passkey.create()
2. **Mobile link** (`LinkWalletScreen`) - after Passkey.create()
3. **Session approval** (`AgentsScreen`) - after Passkey.get() if not stored
4. **Any passkey login** - after Passkey.get() if not stored

### Usage Points
1. **Session approval** - pass to allowCredentials
2. **Any future passkey.get()** - use local credential

### Fallback
If no local credential or passkey fails with stored credential:
→ Use discoverable flow (no allowCredentials)
→ Save credentialId from successful response

---

## 5. Quality Standards

### Testing Requirements
- [ ] Credential saved after wallet creation
- [ ] Credential saved after mobile link
- [ ] Credential retrieved for session approval
- [ ] Fallback works when credential missing
- [ ] Fallback works when credential invalid

### Code Quality
- [ ] TypeScript strict mode
- [ ] Centralized credential service
- [ ] No duplicate storage logic

---

## 6. Success Criteria

**Done when:**
- [ ] Fresh install → create wallet → credentialId stored locally
- [ ] Session approval uses local credentialId (no picker if valid)
- [ ] Missing credential falls back to discoverable (shows picker)
- [ ] Server credentialId no longer used for mobile session approval

**Verification:**
- [ ] Test on fresh device install
- [ ] Test approval after credential stored
- [ ] Test approval with cleared storage (fallback)

---

## 7. Out of Scope

- Removing credentialId from server entirely (keep for web/Telegram flows)
- Multi-wallet support on same device
- Credential migration between devices

---

## 8. References

- Current passkey flows: `OnboardingScreen.tsx`, `AgentsScreen.tsx`
- AsyncStorage docs: https://react-native-async-storage.github.io/async-storage/
- react-native-passkey: returns `id` (credentialId) in response
