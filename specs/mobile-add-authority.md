# Mobile Add Authority On-Chain

## 1. Overview

**Project Name:** Mobile Add Authority

**One-liner:** Register mobile passkey as on-chain authority so it can sign session approvals.

**Why it matters:** Mobile passkey is created locally but not registered on Lazorkit contract. Can't approve sessions without on-chain authority.

---

## 2. Current State

**Mobile link flow today:**
1. ✅ Scan QR from Telegram
2. ✅ Create passkey on mobile
3. ✅ Store locally
4. ❌ NOT registered as on-chain authority
5. ❌ Can't approve sessions (passkey not authorized to sign)

**What's needed:**
- Call `add_authority` instruction on Lazorkit
- Requires OWNER signature (original passkey from Telegram/web)
- Adds mobile pubkey as authorized signer

---

## 3. Flow Design

### Option A: Owner approves via Telegram
```
Mobile creates passkey
    ↓
API sends notification to Telegram
    ↓
Owner clicks "Approve" in Telegram
    ↓
Web page triggers owner passkey signature
    ↓
API builds & submits add_authority tx
    ↓
Mobile passkey now authorized on-chain
```

### Option B: Owner approves via existing passkey on mobile (if multi-device sync)
- Not applicable for cross-platform (iOS → Android)

**Recommendation:** Option A (already have Telegram notification infra)

---

## 4. Architecture

### API Changes
1. `POST /api/pair-mobile/register` — after passkey creation, create pending authority request
2. Telegram notification: "New device wants to link. Approve?"
3. Approval URL → web page with owner passkey challenge
4. `POST /api/pair-mobile/approve-authority` — receives owner signature, builds add_authority tx

### Lazorkit add_authority instruction
```rust
// Adds a new WebAuthn credential as authority
add_authority {
    wallet: Pubkey,
    new_credential_id: Vec<u8>,
    new_public_key: Vec<u8>,
    // ... owner signature to authorize
}
```

### Mobile Changes
1. After passkey creation, poll for authority approval status
2. Show "Waiting for approval from main device..."
3. Once approved, proceed to main app

---

## 5. Success Criteria

**Done when:**
- [ ] Mobile creates passkey
- [ ] Owner receives Telegram notification
- [ ] Owner approves with original passkey
- [ ] add_authority tx submitted on-chain
- [ ] Mobile can now approve sessions

---

## 6. References

- Existing approval flow: `packages/api/src/index.ts` line 1834+
- Lazorkit add_authority: check program IDL
- Mobile link: `OnboardingScreen.tsx`
