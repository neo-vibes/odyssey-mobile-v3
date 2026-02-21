# Tasks Schema

> Claude Code outputs this JSON when planning a project.
> The dispatch script reads it and orchestrates execution.

## tasks.json

```json
{
  "project": "odyssey-v2",
  "spec": "spec.md",
  "tasks": [
    {
      "id": "types",
      "name": "Core Types & Interfaces",
      "deps": [],
      "prompt": "Define TypeScript types for wallet, session, transaction...",
      "acceptance": [
        "All types exported from src/types/index.ts",
        "Zod schemas for runtime validation",
        "No 'any' types"
      ],
      "estimatedIterations": 5
    },
    {
      "id": "config",
      "name": "Configuration Loading",
      "deps": [],
      "prompt": "Implement config loading from env vars...",
      "acceptance": [
        "Config loads from .env",
        "Validation on startup",
        "Typed config object"
      ],
      "estimatedIterations": 5
    },
    {
      "id": "wallet-service",
      "name": "Wallet Service",
      "deps": ["types", "config"],
      "prompt": "Implement wallet creation and passkey verification...",
      "acceptance": [
        "Create wallet with passkey",
        "Verify passkey signatures",
        "Tests for happy path and errors"
      ],
      "estimatedIterations": 15
    },
    {
      "id": "session-service",
      "name": "Session Service",
      "deps": ["types", "wallet-service"],
      "prompt": "Implement session creation and validation...",
      "acceptance": [
        "Create time-limited sessions",
        "Validate session signatures",
        "Enforce spending limits"
      ],
      "estimatedIterations": 15
    },
    {
      "id": "api-routes",
      "name": "API Routes",
      "deps": ["wallet-service", "session-service"],
      "prompt": "Implement REST API endpoints...",
      "acceptance": [
        "POST /wallet/create",
        "POST /session/request",
        "POST /session/transfer",
        "Error handling with proper status codes"
      ],
      "estimatedIterations": 10
    },
    {
      "id": "integration-tests",
      "name": "Integration Tests",
      "deps": ["api-routes"],
      "prompt": "Write integration tests for full flows...",
      "acceptance": [
        "Test wallet creation flow",
        "Test session request flow",
        "Test transfer with valid session",
        "Test rejection with invalid session"
      ],
      "estimatedIterations": 10
    }
  ],
  "mergeOrder": ["types", "config", "wallet-service", "session-service", "api-routes", "integration-tests"]
}
```

## Schema Definition

### Task Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier (used in deps) |
| `name` | string | ✓ | Human-readable name |
| `deps` | string[] | ✓ | Task IDs this depends on (empty = no deps) |
| `prompt` | string | ✓ | What to build (injected into PROMPT-build.md) |
| `acceptance` | string[] | ✓ | Criteria for completion |
| `estimatedIterations` | number | | Hint for max-iterations |

### Dependency Rules

- Tasks with no deps can run in parallel
- Task runs only when ALL deps are complete
- Circular deps = invalid plan (script rejects)

### Merge Order

Explicit order for merging PRs. Must respect dependencies.

---

## How Claude Code Generates This

Prompt pattern:
```markdown
Read spec.md.

Create tasks.json with:
- Logical task breakdown
- Clear dependencies
- Specific acceptance criteria per task
- Estimated iterations (5-20 typical)

Output valid JSON matching the schema.
```

---

## Prompt Best Practices

### Non-Interactive Commands
**CRITICAL:** All shell commands in prompts must be fully non-interactive.

```
❌ npx create-expo-app --template
✅ npx create-expo-app . --template blank-typescript --yes

❌ npm init
✅ npm init -y

❌ git push
✅ git push --set-upstream origin feat/task-id
```

Sub-agents hang on interactive prompts. Always specify:
- `--yes`, `-y`, `--non-interactive` flags
- All required arguments explicitly
- Default values where needed

### Clear Acceptance Criteria
```
❌ "Tests should work"
✅ "All tests pass, pnpm test exits 0, coverage > 80%"

❌ "Code should be clean"
✅ "pnpm lint passes, pnpm build passes, no console.logs left"
```

### Right-Sized Tasks
- Simple tasks: 5-10 iterations (types, config, utils)
- Medium tasks: 10-20 iterations (API endpoints, services)
- Complex tasks: 20-30 iterations (integration flows, complex logic)

If estimating > 30 iterations, split the task.

---

*Schema version: 1.1 — 2026-02-20*
