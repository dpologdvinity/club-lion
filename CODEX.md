# Codex Guidelines & Operating Manual

> For full Codex instructions, see [`.codex/instructions.md`](.codex/instructions.md).

## Quick Reference for Codex (`gpt-6.1-sol`)

### 1. Mandatory Commit Attribution
```text
<type>(<scope>): <summary>

Implementer: gpt-6.1-sol (codex)
```
On merges:
```text
merge: <summary>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Assigner: <model> (<agent>)
```

### 2. Fast Verification
```bash
npm run verify
```
Runs unit tests, strict typecheck, Prettier style check, and production build in a single command. Run `npm run test:e2e` for the full browser Playwright suite.

### 3. Worktree Workflow
- Create: `git worktree add .worktrees/<task-name> -b feat/<task-name>`
- Verify: `npm run verify && npm run test:e2e`
- Retire: `git worktree remove --force .worktrees/<task-name> && git branch -d feat/<task-name>`
- Track: Record status and commits in `docs/TASK-TRACKER.md`

### 4. Roadmap & Specs
- Master Spec: `docs/plans/2026-10-03-club-lion-expanded-world-design.md`
- Phase 1 (Complete): `docs/plans/2026-10-03-phase-1-chibi-avatar-pet-downtown.md`
- Phase 2 (Active): `docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md`
- Task Tracker: `docs/TASK-TRACKER.md`
