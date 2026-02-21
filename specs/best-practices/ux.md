# UX Best Practices

> Trust through simplicity. Power through restraint.

## Design Philosophy

### Core Principle: Invisible Design

The best mobile app design is invisible. Users accomplish goals without thinking about the interface.

### Guiding Mantras

1. **"If in doubt, leave it out"** — Every element must earn its place
2. **"Show don't tell"** — Use visual feedback, not explanatory text
3. **"One thing at a time"** — Progressive disclosure, never overwhelm
4. **"Feel, don't think"** — Interactions should be intuitive, not learned

### Emotional Goals

| Goal | How |
|------|-----|
| **Trust** | Clean, professional aesthetic; clear security indicators |
| **Control** | User always knows what's happening and why |
| **Effortless** | Minimal taps, maximum impact |
| **Premium** | Attention to micro-details; smooth animations |

---

## Minimalist Principles

### What to Cut

**Remove ruthlessly:**
- ❌ Explanatory paragraphs (use single sentences)
- ❌ Multiple CTAs competing for attention
- ❌ Decorative elements that don't serve function
- ❌ Confirmation dialogs for reversible actions
- ❌ Tutorial overlays and coach marks
- ❌ Settings that 90% of users won't change

**Keep only:**
- ✅ One primary action per screen
- ✅ Essential information at a glance
- ✅ Clear affordances for interactive elements

### Content Hierarchy

**5-second rule:** If a user can't understand what to do within 5 seconds, it's too complex.

```
Level 1: Hero Element (balance, main action)
Level 2: Primary Actions (send, receive, approve)
Level 3: Supporting Info (address, agent name)
Level 4: Secondary Actions (settings, history)
```

### Whitespace

Whitespace is not empty space—it's breathing room.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon padding, inline elements |
| `sm` | 8px | Related items, compact lists |
| `md` | 16px | Section separators, card padding |
| `lg` | 24px | Screen margins, major sections |
| `xl` | 32px | Hero areas |

**Rule:** When in doubt, add more space—not less.

### Touch Targets

- **Minimum:** 44pt (iOS) / 48dp (Android)
- **Recommended:** 56pt for primary actions
- **Spacing:** At least 8pt between targets

---

## Do's and Don'ts

### ✅ DO

| Category | Guidance |
|----------|----------|
| **Layout** | Use generous whitespace |
| **Feedback** | Provide immediate feedback for all actions |
| **Copy** | Use short, clear labels (not sentences) |
| **Loading** | Use skeleton screens, not spinners |
| **Errors** | Be specific about what went wrong |
| **Security** | Gate sensitive actions with biometrics |
| **Addresses** | Middle-truncate and make copyable |
| **Animations** | Keep under 300ms for UI |

### ❌ DON'T

| Category | Avoid |
|----------|-------|
| **Layout** | Don't cram everything above the fold |
| **Typography** | Don't use more than 3 font sizes per screen |
| **Feedback** | Don't use alerts for success messages |
| **Copy** | Don't use crypto jargon without context |
| **Loading** | Don't block entire screen for partial loads |
| **Errors** | Don't show technical error codes |
| **Security** | Don't ask confirmation for reversible actions |

### Anti-Patterns

1. **"Are you sure?" dialogs** — Only for destructive actions
2. **Tutorial overlays** — Design should be self-explanatory
3. **Splash screens** — Get to content immediately
4. **Toast spam** — One notification at a time
5. **Nested modals** — Never open modal from modal

---

## Wallet App Patterns

Patterns from Phantom, Rainbow, Coinbase:

| Pattern | Usage |
|---------|-------|
| **Tab bar** | Home, Activity, Settings |
| **Bottom sheets** | Secondary actions, details |
| **Pull to refresh** | Balance, transaction list |
| **Biometric gates** | Before transactions |
| **Skeleton loading** | While fetching data |
| **Toast notifications** | Success/error feedback |

### Steal These

- Transaction preview before signing (Phantom)
- One-tap copy with visual feedback
- Activity feed with icons (Rainbow)
- Security warning patterns (Coinbase)
- Transaction grouping by date

---

*Reference this when designing. Don't load for implementation tasks.*
