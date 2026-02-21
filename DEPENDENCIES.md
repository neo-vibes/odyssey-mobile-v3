# Dependencies & Tools

> Tools and skills available to sub-agents in this harness.

## Environment

| Tool | Path | Purpose |
|------|------|---------|
| `qmd` | `~/.bun/bin/qmd` | Search specs (BM25 keyword search) |
| `npm` | System | Package management |
| `npx` | System | Run npm packages |
| `git` | System | Version control |
| `bun` | `~/.bun/bin/bun` | Alternative package manager |

## Agent Capabilities

Sub-agents spawned via `sessions_spawn` have access to:

- **exec** — Run shell commands
- **read** — Read file contents
- **write** — Create/overwrite files
- **edit** — Precise file edits
- **process** — Manage background processes
- **web_search** — Brave search API
- **web_fetch** — Fetch URLs

## qmd Usage

Search specs without loading full context:

```bash
# Search for content
qmd search "session approval" -c odyssey-mobile-specs -n 3

# Get full file
qmd get "specs/mobile/sessions.md"

# Get by doc ID from search results
qmd get "#abc123"
```

**Collections:**
- `odyssey-mobile-specs` — Project specs in `specs/`

## Working Directory

Sub-agents start in: `/home/neo/.openclaw/workspace`

**Always cd to project first:**
```bash
cd ~/odyssey-mobile-v3 && <command>
```

## Path Setup

For qmd and bun access:
```bash
export PATH="$HOME/.bun/bin:$PATH"
```

Or use full paths:
```bash
~/.bun/bin/qmd search "query"
```

## Known Limitations

1. **Model override may not apply** — Check which model is actually used
2. **Working directory** — Must cd to project explicitly
3. **Interactive prompts** — Use non-interactive flags (e.g., `--yes`, `-y`)

---

*Include this context in sub-agent prompts.*
