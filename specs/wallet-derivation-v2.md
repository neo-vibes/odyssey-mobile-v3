# Wallet Derivation V2

> Deterministic multi-wallet derivation with no server state.

## Status: Draft

---

## Problem

Current system uses random `userSeed` for wallet derivation:
- Stored only in passkey `userHandle`
- iCloud sync loses/changes `userHandle`
- Wallets become unrecoverable

## Solution

Deterministic derivation from `telegramId + counter`:

```
walletSeed = sha256(telegramId + ':' + counter)
walletPDA = findProgramAddress(['wallet', walletSeed], LAZORKIT_PROGRAM)
```

---

## Derivation Scheme

| Input | Format | Example |
|-------|--------|---------|
| telegramId | string | `"6213870545"` |
| counter | integer | `0`, `1`, `2`, ... |
| separator | literal | `":"` |

```javascript
function deriveWalletSeed(telegramId, counter) {
  const input = `${telegramId}:${counter}`;
  return sha256(Buffer.from(input, 'utf-8'));
}

function deriveWalletPDA(telegramId, counter) {
  const seed = deriveWalletSeed(telegramId, counter);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('wallet'), seed],
    LAZORKIT_PROGRAM_ID
  );
}
```

---

## Operations

### Load All Wallets

Scan from counter=0 until first empty slot:

```javascript
async function loadWallets(telegramId) {
  const wallets = [];
  
  for (let counter = 0; ; counter++) {
    const [pda] = deriveWalletPDA(telegramId, counter);
    const account = await connection.getAccountInfo(pda);
    
    if (!account || account.data[0] !== 1) {
      break;  // Empty slot = end of wallets
    }
    
    wallets.push({
      counter,
      pubkey: pda.toBase58(),
      // ... parse account data
    });
  }
  
  return wallets;
}
```

### Create New Wallet

Find first empty counter slot:

```javascript
async function getNextCounter(telegramId) {
  for (let counter = 0; ; counter++) {
    const [pda] = deriveWalletPDA(telegramId, counter);
    const account = await connection.getAccountInfo(pda);
    
    if (!account || account.data[0] !== 1) {
      return counter;  // First empty slot
    }
  }
}
```

### Import/Hide Wallets (Client-Side)

No on-chain deletion. User manages visibility locally:

```javascript
// localStorage structure
{
  "odyssey_imported_wallets": {
    "6213870545": [0, 2, 4]  // counters of imported wallets
  }
}

// Load only imported
async function loadImportedWallets(telegramId) {
  const imported = getImportedCounters(telegramId);
  const wallets = [];
  
  for (const counter of imported) {
    const [pda] = deriveWalletPDA(telegramId, counter);
    const account = await connection.getAccountInfo(pda);
    if (account) {
      wallets.push({ counter, pubkey: pda.toBase58() });
    }
  }
  
  return wallets;
}
```

---

## UX Flow

### First Time User (Webapp)

1. Open app → no wallets found (counter=0 empty)
2. "Create Wallet" → creates at counter=0
3. Redirect to wallet view

### Returning User (Webapp)

1. Open app → scan finds wallets
2. If 1 wallet → auto-select
3. If multiple → show picker

### Create Additional Wallet (Webapp)

1. "Add Wallet" → finds next empty counter
2. Create wallet on-chain
3. Show new wallet

### Telegram Bot Flow

#### `/start` or `/wallet`

1. Scan all wallets for telegramId
2. If none → prompt "Create Wallet"
3. If one → show that wallet
4. If multiple → show picker with inline buttons

```
Found 3 wallets:

[Wallet 1: CoVQ...weVB] (0.5 SOL)
[Wallet 2: 7xKX...uRZi] (1.2 SOL)  
[Wallet 3: FxzF...cuRZ] (0.0 SOL)

Select a wallet to continue.
```

#### `/create`

1. Find next empty counter
2. Create wallet on-chain
3. Set as active wallet
4. Show confirmation

#### `/recover`

1. Scan all counters for telegramId
2. Show list of found wallets with balances
3. User picks one → set as active

#### Active Wallet State

Bot tracks current active wallet per user:
```javascript
// In-memory or simple file store
activeWallet: { telegramId: walletPubkey }
```

Commands operate on active wallet. User can switch anytime.

---

## Recovery

User can always recover all wallets by scanning:

```javascript
async function recoverAllWallets(telegramId) {
  const wallets = await loadWallets(telegramId);
  saveImportedCounters(telegramId, wallets.map(w => w.counter));
  return wallets;
}
```

**No server needed. No passkey userHandle needed. Just telegramId.**

---

## Migration

### Existing Random-Seed Wallets

Old wallets using random `userSeed` cannot be migrated to new scheme.

Options for users with old wallets:
1. **If userHandle still works**: Withdraw funds, create new wallet
2. **If userHandle lost**: Funds unrecoverable (known limitation)

### New Wallets Only

V2 derivation applies to **new wallet creation only**.
Old wallets continue to work if userHandle is intact.

---

## Security Considerations

- `telegramId` is public but required for derivation
- Attacker cannot create wallet without passkey signature
- Attacker cannot spend without passkey signature
- Scanning reveals which counters have wallets (acceptable)

---

## API Changes

### `POST /api/v2/wallet/create`

**Before:**
```javascript
userSeed = crypto.getRandomValues(new Uint8Array(32))
```

**After:**
```javascript
userSeed = sha256(telegramId + ':' + counter)
```

### `POST /api/v2/wallet/check`

Add support for counter-based lookup:
```javascript
body: {
  telegramId: string,
  counter: number
}
```

---

## Program Changes

**None required.** 

Wallet PDA derivation unchanged: `['wallet', seed]`
Only the seed generation changes (client-side).

---

## Files to Modify

| File | Changes |
|------|---------|
| `packages/api/src/pages.ts` | New derivation in create flow |
| `packages/api/src/index.ts` | `/api/v2/wallet/check` with counter |
| `packages/web/*` (if exists) | Update derivation |
| Bot commands | Support multi-wallet selection |

---

## Acceptance Criteria

- [ ] New wallets use `sha256(telegramId + ':' + counter)` derivation
- [ ] Load scans until first empty counter
- [ ] Create finds first empty counter
- [ ] Import/hide managed client-side (localStorage)
- [ ] Recovery works with just telegramId
- [ ] Old random-seed wallets still work (backward compat)

---

*Created: 2026-02-21*
