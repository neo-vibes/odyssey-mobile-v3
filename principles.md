# Engineering Principles

> These principles guide how Claude Code builds software in our workflow.
> Include relevant sections in AGENTS.md or inject via prompts.

---

## Core Philosophy

> "Humans steer. Agents execute."

- Humans define WHAT and WHY
- Agents figure out HOW and build it
- Repository is the system of record
- If it's not in the repo, it doesn't exist

---

## 1. Build-Verify Loop

**Every change must be verified. No exceptions.**

```
Plan → Build → Test → Verify → Fix → Repeat
```

### The Anti-Pattern (don't do this)
```
Write code → Re-read own code → "Looks good" → Stop ❌
```

### The Correct Pattern
```
Write code → Run tests → Check output against spec → Fix issues → Repeat ✓
```

### Pre-Completion Checklist
Before marking any task complete:
- [ ] Tests exist and pass
- [ ] Output matches the spec (not just "looks right")
- [ ] Edge cases handled
- [ ] No hardcoded values that should be config

---

## 2. Context Engineering

**Onboard the agent. Don't make it search.**

### Inject at Start
- Directory structure
- Available tools/commands
- Project conventions
- Relevant constraints
- Time/resource limits

### Progressive Disclosure
- AGENTS.md is the map (~100 lines)
- Points to deeper docs in `docs/`
- Agent looks up details as needed

### What NOT to Do
- Giant instruction files (crowds out the task)
- Stale documentation (agent can't tell what's true)
- Context in Slack/email (invisible to agent)

---

## 3. Architecture Standards

### Layer Structure (per domain)
```
Types → Config → Repository → Service → Runtime → UI
```

Dependencies flow forward only. Enforce mechanically.

### Boundaries
- Parse data at boundaries (Zod, etc.)
- Validate inputs, trust internals
- Explicit over implicit
- No magic, no hidden behavior

### File Organization
```
src/
├── types/        # Shared type definitions
├── config/       # Configuration loading
├── repositories/ # Data access
├── services/     # Business logic
├── routes/       # API endpoints (thin)
└── utils/        # Pure helper functions
```

---

## 4. Quality Gates

### TypeScript
- `strict: true` in tsconfig
- No `any` (use `unknown` + type guards)
- Explicit return types on public functions

### Linting
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/strict"],
  "rules": {
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### Formatting
- Biome or Prettier (pick one, enforce)
- Run on pre-commit or CI

### Testing
- Unit tests: business logic, utilities
- Integration tests: API endpoints
- Test naming: `should [expected behavior] when [condition]`
- Coverage target: 80% (focus on critical paths)

---

## 5. Guardrails

### Loop Detection
If editing the same file 5+ times, STOP and reconsider approach.

### Time Budgeting
- Be aware of time constraints
- If running long, shift to verification mode
- Don't perfect forever — ship and iterate

### Error Recovery
- On failure, don't just retry with small variations
- Step back, re-read the spec, try different approach

---

## 6. PR Workflow

### Branch Naming
```
feat/[short-description]
fix/[short-description]
refactor/[short-description]
```

### Commit Messages
```
type: short description

- Detail 1
- Detail 2
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### PR Description
```markdown
## What
[One sentence: what does this PR do?]

## Why
[Why is this change needed?]

## How
[Brief technical approach]

## Testing
- [ ] Tests added/updated
- [ ] Manual verification done
- [ ] Verified against spec
```

### Review Checklist (for Neo to check)
- [ ] Solves the stated problem
- [ ] Tests exist and are meaningful
- [ ] No obvious bugs or edge cases missed
- [ ] Follows architecture patterns
- [ ] Code is readable

---

## 7. Reasoning Budget

**The Sandwich Pattern:**
```
High reasoning  → Planning (understand the problem)
Lower reasoning → Implementation (speed matters)
High reasoning  → Verification (catch mistakes)
```

Don't burn all compute on implementation. Save some for review.

---

## 8. Logging Conventions

**Two log levels for agent workflow:**

| Level | Purpose | When | Example |
|-------|---------|------|---------|
| `INFO` | App behavior | Production, always | `logger.info('Todo created', { id })` |
| `DEBUG` | Agent debugging | Dev only | `logger.debug('Storage state', { todos, raw })` |

### Where to Add DEBUG Logs
- Decision points ("chose X because Y")
- External calls (storage, API, crypto)
- State transitions (before/after)
- Error context (what was the input?)

### Pattern
```typescript
import { logger } from './utils/logger';

// Normal app log
logger.info('Transaction sent', { txId });

// Debug log for agent iteration
logger.debug('Passkey verify', {
  challenge: challenge.substring(0, 20) + '...',
  origin,
  expectedOrigin,
  match: origin === expectedOrigin
});
```

### Simple Logger Implementation
```typescript
// src/utils/logger.ts
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export const logger = {
  info: (msg: string, data?: object) => {
    console.log(JSON.stringify({ level: 'info', msg, ...data, ts: Date.now() }));
  },
  debug: (msg: string, data?: object) => {
    if (LOG_LEVEL === 'debug') {
      console.log(JSON.stringify({ level: 'debug', msg, ...data, ts: Date.now() }));
    }
  },
  error: (msg: string, err: Error, data?: object) => {
    console.error(JSON.stringify({ level: 'error', msg, error: err.message, stack: err.stack, ...data, ts: Date.now() }));
  }
};
```

### Running with Debug
```bash
LOG_LEVEL=debug pnpm test 2>&1 | tee task-logs/debug.log
```

Agent reads `task-logs/debug.log` to understand failures.

---

## 9. Minimalist Tooling

We are a 2-person team. Keep it simple.

### Use (CLI-based, simple)
- TypeScript strict
- ESLint + Biome
- Vitest for tests
- `gh` CLI for GitHub

### Skip (overkill for now)
- SonarQube
- Complex CI pipelines
- Heavy test frameworks
- Multiple MCPs when CLI works

---

*Principles version: 1.0 — 2026-02-19*
