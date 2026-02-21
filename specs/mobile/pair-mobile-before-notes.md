# Mobile Device Pairing - Before Notes

## Run Expectations

### Goal
Enable mobile app to become a signer on the user's Odyssey wallet, so it can approve session requests directly without Telegram webview.

### What Success Looks Like
1. User runs `/pair-mobile` in Telegram → sees QR code
2. User scans with phone → browser opens, creates passkey
3. User approves in Telegram → mobile passkey added on-chain
4. Mobile can now sign session approvals

### Out of Scope (This Run)
- Native passkey in React Native (using browser WebAuthn instead)
- Mobile signing sessions directly (will still use webview for now)
- Multiple mobile devices per wallet
- Revoking mobile authority

## Workflow Control

### How to Guide Sub-agents
Each task gets a focused prompt with:
- Spec reference (pair-mobile.md)
- Specific acceptance criteria
- Files to modify
- What NOT to change

### Review Checkpoints
After each task:
1. **Does it compile?** - No TypeScript errors
2. **Does it match spec?** - Endpoints/UI per spec
3. **Does it integrate?** - Works with existing code
4. **Is it minimal?** - No extra features

### Intervention Points
- **Before task 3 (web page):** Review API endpoints work via curl
- **Before task 5 (bot callback):** Test token flow manually
- **Before task 8 (integration):** All pieces in place

## Technical Constraints

### Repos & Paths
| Repo | Path | Main File |
|------|------|-----------|
| API | `~/agentic-wallet/packages/api` | `src/index.ts` |
| Pages | `~/agentic-wallet/packages/api` | `src/pages.ts` |
| Bot | `~/agentic-wallet/packages/bot` | `src/index.ts` |
| Specs | `~/odyssey-mobile-v3/specs/mobile` | `pair-mobile.md` |

### Working Directory
Run all commands from workspace root or use full paths. Sub-agents should `cd` to the correct repo before making changes.

### Dependencies
- Existing passkey/WebAuthn code in pages.ts
- Existing add_authority logic (if any) or need to build
- QR code generation (qrcode npm package or inline SVG)

### Services
- API runs at: `https://app.getodyssey.xyz`
- Restart after changes: `sudo systemctl restart odyssey-api`
- Bot restart: `sudo systemctl restart odyssey-bot`

## Risk Areas

### Add Authority Transaction
- Need to verify Lazorkit add_authority instruction format
- Owner must sign → need correct challenge format
- Test on devnet first

### Passkey Creation in Mobile Browser
- rpId must match domain (getodyssey.xyz)
- Mobile Safari/Chrome WebAuthn compatibility
- Credential stored in device keychain

### Token Security
- Short expiry (10 min)
- Single use
- No sensitive data in QR URL

## Test Plan

### Manual Tests
1. Generate token via curl → verify response
2. Open /pair-mobile?token=xxx → verify page loads
3. Create passkey → verify API receives it
4. Approve in Telegram → verify tx on-chain
5. Check authority exists on wallet PDA

### Curl Commands for Testing
```bash
# Generate token
curl -X POST https://app.getodyssey.xyz/api/pair-mobile/generate \
  -H "Content-Type: application/json" \
  -d '{"telegramId": 6213870545, "walletPubkey": "7xKXtg..."}'

# Validate token
curl https://app.getodyssey.xyz/api/pair-mobile/TOKEN_HERE

# After passkey creation, check token status
curl https://app.getodyssey.xyz/api/pair-mobile/TOKEN_HERE/status
```

## Estimated Effort
- Tasks 1-4: ~30 min each (API + web + bot basics)
- Tasks 5-7: ~45 min each (approval flow, on-chain tx)
- Task 8: ~15 min (integration test)
- **Total:** ~4-5 hours

## After Run: Verify
- [ ] /pair-mobile command works in bot
- [ ] QR code scans and opens correct URL
- [ ] Passkey created and stored
- [ ] Approval notification in Telegram
- [ ] add_authority tx confirmed on-chain
- [ ] Mobile passkey appears as authority on wallet
