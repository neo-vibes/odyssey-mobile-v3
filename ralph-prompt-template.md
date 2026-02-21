# Ralph Prompt Templates

> Templates for iteration prompts used with Ralph loops.
> Two phases: Build (make it work) and Polish (make it clean).

---

## PROMPT-build.md Template

```markdown
# Task: [TASK_NAME]

## What to Build
[Clear description of what to implement]

## Acceptance Criteria
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

## Rules
Read AGENTS.md for coding standards.

**CRITICAL:** All shell commands must be non-interactive.
- Use `--yes`, `-y`, `--no-input`, `--non-interactive` flags
- Specify all required arguments (e.g., `--template blank-typescript`)
- Never rely on interactive prompts — they will hang sub-agents

## Context (read first)
- task-logs/notes.md — your notes from previous iterations
- task-logs/test-output.log — last test results  
- git status / git diff — current state

## Instructions
1. Read context files above
2. Implement the requirements
3. Write tests for new functionality
4. Run: pnpm test 2>&1 | tee task-logs/test-output.log
5. Update task-logs/notes.md with progress/blockers
6. If all acceptance criteria met and tests pass:
   Output <promise>BUILD_DONE</promise>

## Loop Detection
If same error 3+ times, try a different approach.
If stuck after 10 iterations, document blockers in notes.md.
```

---

## PROMPT-polish.md Template

```markdown
# Polish: [TASK_NAME]

The feature is working. Now clean it up.

## Checklist
- [ ] pnpm lint passes
- [ ] pnpm build passes (no type errors)
- [ ] Remove verbose debug logs (keep meaningful ones)
- [ ] Improve variable/function naming if needed
- [ ] No TODOs left in code
- [ ] Coverage > 80%

## Context
- Read task-logs/notes.md for what was built
- Run pnpm lint, pnpm build to check status

When all checks pass: <promise>POLISH_DONE</promise>
```

---

## task-logs/notes.md Template

```markdown
# Task Notes: [TASK_ID]

## Iteration Log
<!-- Agent updates this each iteration -->
### Iteration 1
- Started: [timestamp]
- Tried: [approach]
- Result: [outcome]

### Iteration 2
...

## Blockers
<!-- Document any blockers here -->

## Decisions Made
<!-- Document key decisions and why -->
- Chose X over Y because Z
```

---

## Usage

### Manual (single task)
```bash
cd my-task/
cat PROMPT-build.md | ralph-loop --max-iterations 30 --completion-promise "BUILD_DONE"
cat PROMPT-polish.md | ralph-loop --max-iterations 10 --completion-promise "POLISH_DONE"
```

### Automated (via dispatch.sh)
```bash
./dispatch.sh tasks.json
```

dispatch.sh generates these prompts automatically from tasks.json.

---

## Prompt Writing Tips

### Be Specific
```
❌ "Build the auth system"
✅ "Implement JWT-based authentication with login/logout endpoints"
```

### Measurable Acceptance
```
❌ "Tests should pass"
✅ "All tests pass, coverage > 80%, no lint errors"
```

### Include Debug Hints
```
For passkey verification:
- Log clientDataJSON before parsing
- Log challenge comparison (expected vs received)
- Log origin validation result
```

### Escape Hatches
```
If blocked on [KNOWN_ISSUE]:
- Document in notes.md
- Skip and continue with other criteria
- Flag for human review
```

---

*Template version: 1.0 — 2026-02-19*
