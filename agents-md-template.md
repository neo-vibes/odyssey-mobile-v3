# AGENTS.md Template

> This is a template for AGENTS.md files. Keep it ~100 lines.
> It's a MAP, not an encyclopedia. Point to deeper docs.

---

```markdown
# AGENTS.md

## Overview

[One paragraph: What is this project? What does it do?]

## Quick Start

```bash
# Install
pnpm install

# Run dev
pnpm dev

# Test
pnpm test

# Lint
pnpm lint
```

## Project Structure

```
src/
├── types/        # Type definitions → see docs/types.md
├── config/       # Configuration → see docs/config.md
├── services/     # Business logic → see docs/architecture.md
├── routes/       # API endpoints → see docs/api.md
└── utils/        # Helpers
```

## Key Principles

1. **Verify your work** — Run tests, check against spec, don't assume
2. **Parse at boundaries** — Validate inputs with Zod
3. **Explicit > implicit** — No magic, no hidden behavior
4. **Test before done** — No PR without tests

## Architecture

See `docs/architecture.md` for full details.

**Layer flow:** Types → Config → Repository → Service → Runtime → UI

Dependencies go forward only. No cycles.

## Quality Standards

- TypeScript strict mode
- ESLint + Prettier/Biome
- Parse inputs at boundaries (Zod)
- Tests required, coverage > 80%

**TypeScript patterns:** Follow [typescript-best-practices](https://playbooks.com/skills/vdustr/vp-claude-code-marketplace/typescript-best-practices) skill.

## Code Rules

- **Packages > utils** — Use established packages (lodash, date-fns, zod) over custom helpers
- **3 params max** — More than 3? Use an options object
- **Small functions** — One function, one job. Max ~30 lines
- **Early returns** — Fail fast, reduce nesting
- **No magic values** — Constants or config, not hardcoded
- **Descriptive names** — `getUserById` not `get`, `isActive` not `flag`
- **Colocation** — Keep related code close (tests next to source)

## Common Tasks

### Adding a new feature
1. Read the spec in `docs/specs/[feature].md`
2. Write types first
3. Implement service logic with tests
4. Add route/UI last
5. Run full test suite
6. Open PR

### Fixing a bug
1. Write a failing test first
2. Fix the bug
3. Verify test passes
4. Check for related edge cases
5. Open PR

### Refactoring
1. Ensure tests exist for affected code
2. Make changes incrementally
3. Run tests after each change
4. No behavior changes (tests should still pass)

## Before Completing Any Task

- [ ] Tests exist and pass (coverage > 80%)
- [ ] `pnpm lint` passes (no warnings)
- [ ] `pnpm build` passes (no type errors)
- [ ] Verified against original spec/issue
- [ ] No `console.log` (use logger)
- [ ] No `any` types (use `unknown` + guards)
- [ ] No `!` assertions (check null properly)
- [ ] Promises handled (no floating promises)

## Documentation Index

| Doc | Description |
|-----|-------------|
| `docs/architecture.md` | System design, layer structure |
| `docs/api.md` | API endpoints, request/response |
| `docs/config.md` | Environment variables, settings |
| `docs/quality.md` | Linting rules, test patterns |
| `docs/specs/` | Feature specifications |
| `docs/decisions/` | Architecture decision records |

## Getting Help

If stuck:
1. Re-read the relevant spec
2. Check `docs/` for guidance
3. Look at similar existing code
4. If still stuck, describe the problem clearly

## Don't

- Don't commit without tests passing
- Don't use `any` (use `unknown` + type guards)
- Don't use `!` non-null assertions
- Don't leave `console.log` (use logger)
- Don't ignore promise rejections
- Don't mutate function parameters
- Don't skip the verification checklist
- Don't edit the same file 5+ times without reconsidering approach
```

---

**Why this structure works:**

1. **Quick Start** — Agent can immediately run the project
2. **Project Structure** — Map to navigate, links to details
3. **Key Principles** — Most important rules, always in context
4. **Common Tasks** — Step-by-step for frequent operations
5. **Checklist** — Forces verification before completion
6. **Doc Index** — Progressive disclosure to deeper content
7. **Don't** — Explicit anti-patterns to avoid

**Keep it under 100 lines.** If it grows, move content to `docs/`.

---

*Template version: 1.0 — 2026-02-19*
