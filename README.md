# Agentic Engineering Workflow

> "Humans steer. Agents execute."

A structured workflow for Claude Code to build software through orchestrated sub-agents and iterative Ralph loops.

## How It Works

See **[WORKFLOW.md](./WORKFLOW.md)** for full architecture.

**Quick summary:**
1. **Orchestrator** (Claude Code) reads project spec
2. Generates `tasks.json` — task breakdown with complexity, deps, iterations
3. For each task: runs **Ralph Loop** (N iterations via sub-agents)
4. Sub-agents return structured status/logs
5. Final **Code Quality Loop** cleans everything

## Files

| File | Purpose |
|------|---------|
| `WORKFLOW.md` | Architecture overview |
| `spec-template.md` | How to write project specs |
| `tasks-schema.md` | tasks.json format |
| `principles.md` | Coding rules for sub-agents |
| `ralph-prompt-template.md` | Ralph loop prompt template |
| `agents-md-template.md` | AGENTS.md template for projects |

## Quick Start

```bash
# 1. Create project with spec
mkdir my-project && cd my-project
git init
cp ~/agentic-engineering-workflow/spec-template.md ./SPEC.md
# Edit SPEC.md for your project

# 2. Start Claude Code
claude

# 3. Tell Claude Code to orchestrate
# "Read SPEC.md and ~/agentic-engineering-workflow/WORKFLOW.md. 
#  Generate tasks.json and execute the workflow."
```

Claude Code will:
- Generate tasks.json from your spec
- Spawn sub-agents for each task
- Run Ralph loops with iteration memory
- Finish with code quality pass

## Key Concepts

### Ralph Loop
Iterative execution for each task:
- Sub-agent spawns with clean context
- Returns status + iteration notes
- Next iteration receives previous notes
- Orchestrator decides: continue / done / blocked

### Two Memory Levels
- **Iteration memory** — notes within a Ralph loop
- **Cross-loop memory** — last iteration carries into new loop if retry needed

### Task Complexity → Iterations
- `low` — 1-2 iterations
- `medium` — 2-3 iterations
- `high` — 3-5 iterations

---

*Agentic Engineering Workflow v2.0 — 2026-02-20*
