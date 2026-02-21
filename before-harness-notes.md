# Before Harness Notes

> Observations and predictions BEFORE running the agentic workflow.
> Compare with after-harness-notes.md to improve the framework.

## Date
2026-02-21

## Project
Odyssey Mobile v3 — React Native app for AI agent spending sessions

## Setup
- Fresh repo with workflow harness copied in
- Specs from odyssey-project-management (11 files, well-organized)
- qmd installed for spec search (96% token reduction)
- Backend API exists and running at agentic-wallet/packages/api

## Predictions

### What might go well
1. **Specs are well-organized** — per-feature files (~3-8KB each), should be easy for sub-agents to consume
2. **qmd for spec navigation** — sub-agents can search instead of loading all specs into context
3. **Clear acceptance criteria** — each spec has wireframes and explicit requirements
4. **Existing backend** — no mocking needed, reduces risk of misalignment

### What might go wrong
1. **Expo/RN setup** — Initial project setup often has quirks (New Architecture, native dependencies)
2. **Sub-agent file access** — Need to verify sub-agents can read specs and use qmd
3. **WebAuthn/Passkey integration** — Complex native module, may need manual intervention
4. **State management patterns** — Sub-agents might create inconsistent patterns if not specified
5. **API integration** — If API contracts aren't explicit, sub-agents might guess wrong
6. **qmd on sub-agents** — Will spawned sessions have access to qmd? Or need alternative approach?

### Open questions
1. ~~How do we inject qmd capability into sub-agent context?~~ **ANSWERED:** qmd available via exec, works
2. Should we define shared types/components in a setup task first?
3. How to handle Expo EAS build configuration?
4. What's the definition of "runs without crash"? Simulator? Device?

### Test Results (pre-execution)
- ✅ Sub-agents have exec, read, write, edit
- ✅ qmd is in PATH (`~/.bun/bin/qmd`)
- ✅ qmd search works against `odyssey-mobile-specs` collection
- ⚠️ Working directory is workspace, must cd to project
- ⚠️ Model override in sessions_spawn may not apply (tested Sonnet, got Opus)

### Metrics to track
- Total tasks created
- Tasks completed on first Ralph loop
- Tasks requiring multiple loops
- Manual interventions needed
- Time from start to working app
- Token usage (if measurable)

## Framework improvements to consider
- [ ] Template for RN-specific AGENTS.md
- [ ] Standard setup task for new RN projects
- [ ] qmd integration instructions for sub-agents
- [ ] Better handling of native dependencies

---

*Update after-harness-notes.md when complete.*
