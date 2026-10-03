# Codex Agent Instructions — Club Lion

Welcome, Codex (`gpt-6.1-sol`)! You are operating in **Club Lion**, a React 19, TypeScript (strict), and Vite browser game inspired by the golden era of Fantage × Club Penguin.

### Active Multi-Agent Workflow
In our current flexible tri-agent workflow:
- **Lead Orchestrator & Assigner:** Antigravity (`gemini-3.8-flash`) — architecture, roadmaps, task breakdowns, and worktree setup.
- **Reviewer & Merger:** Codex (`gpt-6.1-sol`) — code review, strict quality audits, verification (`npm run verify`, `npm run test:e2e`), integrating merge commits to `master`, and pruning retired worktrees/branches.
- **Implementer:** Claude Code (`claude-sonnet-5`) — implementing feature code and RED-GREEN TDD unit tests inside isolated worktrees.

*(Roles remain flexible and can change dynamically whenever Kaitlyn directs: any agent can step into implementation, review, or orchestration as needed.)*

---

## 1. Mandatory Commit & Merge Attribution Standards

Every commit and merge MUST follow the model attribution trailer format:

### Standard Commits
Every commit across all branches and worktrees must conclude with the `Implementer` trailer:
```text
<type>(<scope>): <summary>

Implementer: <model> (<agent>)
```
*Standard identifiers:* `claude-sonnet-5 (claude code)`, `gpt-6.1-sol (codex)`, `gemini-3.8-flash (antigravity)`. Use whichever model implemented the code.

### Merges & Milestone Integrations
When reviewing and merging a feature branch into `master`, include the complete multi-agent trailer:
```text
merge: <summary>

Implementer: claude-sonnet-5 (claude code)
Reviewer: gpt-6.1-sol (codex)
Assigner: gemini-3.8-flash (antigravity)
```
*(If you implement a feature yourself, use `Implementer: gpt-6.1-sol (codex)`.)*

---

## 2. Fast Verification Commands

- `npm run verify`: Single one-shot verification command. Runs:
  1. `npm test`: Node-native test runner (`src/game.test.ts`, `src/types/world.test.ts`, `src/components/avatarSvg.test.ts`, `src/utils/petFollower.test.ts`, `src/rooms/camera.test.ts`, `src/utils/ballistics.test.ts`)
  2. `npm run typecheck`: Strict TypeScript checking (`tsc --noEmit`)
  3. `npm run format:check`: Prettier style verification
  4. `npm run build`: Production bundle generation (`tsc -b && vite build`)
- `npm run test:e2e`: Runs full Playwright suite across desktop and mobile viewports with WCAG AA accessibility tests.
- `npm run format`: Automatically formats files with Prettier defaults.

---

## 3. Git Worktree & Task Workflow

When implementing plans or multi-agent tasks:
1. **Isolated Worktrees**:
   ```bash
   git worktree add .worktrees/<task-name> -b feat/<task-name>
   ```
2. **Execute TDD & Verification**:
   Inside the worktree, write tests RED -> GREEN, run `npm run verify` and `npm run test:e2e`.
3. **Commit with Attribution**:
   Commit using the `Implementer:` trailer.
4. **Merge & Prune**:
   Merge to the target branch (or master) with the merge trailer, then clean up:
   ```bash
   git worktree remove --force .worktrees/<task-name>
   git branch -d feat/<task-name>
   ```
5. **Update Tracker**:
   Update `docs/TASK-TRACKER.md` on `master` to record completed tasks, commit hashes, model names, and verification results.

---

## 4. Key Architectural Subsystems

- **Avatar Engine (`src/components/Avatar.tsx` & `src/components/avatarSvg.ts`)**:
  Layered vector SVG paper-doll stack (120×160 coordinate space) with 10 wardrobe taxonomy slots, actions (`idle`, `walk`, `wave`, `dance`, `sit`, `jam`), and hoverboard sparkle trails.
- **Pet Companion Physics (`src/components/PetCompanion.tsx` & `src/utils/petFollower.ts`)**:
  Spring-damper trailing lerp physics following the avatar with trotting state and heading flipping.
- **Room Engine & Viewport (`src/rooms/` & `src/components/CameraViewport.tsx`)**:
  Declarative `RoomManifest` schema with walkable polygons, depth layers, portal bounds, and camera lerp clamping.
- **Action Wheel & Ballistics (`src/components/ActionWheel.tsx` & `src/components/MangoToss.tsx`)**:
  Radial action wheel with quick phrases, emotes, and parabolic canvas mango tossing.
- **Le Shop Catalog & Hair Salon (`src/components/CatalogModal.tsx` & `src/components/SalonModal.tsx`)**:
  Tabbed flip catalog with hidden clickable secret triggers and hair color/streak dyes.
- **Fantage ID Card & Save Migration (`src/components/PlayerCard.tsx`, `src/usePlayer.ts`, `src/game.ts`)**:
  Player ID card modal, star rank levels, ribbon medals, and guest-to-cloud save migration.
- **Zero-Cost ($0) Audio & Infrastructure Constraint**:
  All sounds, musical instruments, and chimes MUST be synthesized via procedural Web Audio API (zero external MP3 assets). All code must run offline and with local storage.

---

## 5. Active Roadmaps & Specifications

- Master Specification: [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](../docs/plans/2026-10-03-club-lion-expanded-world-design.md)
- Phase 1 Plan (Completed): [`docs/plans/2026-10-03-phase-1-chibi-avatar-pet-downtown.md`](../docs/plans/2026-10-03-phase-1-chibi-avatar-pet-downtown.md)
- Phase 2 Plan (Ready to Execute): [`docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md`](../docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md)
- Task Tracker Ledger: [`docs/TASK-TRACKER.md`](../docs/TASK-TRACKER.md)

---

## 6. Review & Merge Protocol (Your Core Flow)

When Claude Code (or another agent) completes a task in an isolated worktree/branch:
1. **Audit Diff & Requirements**: Inspect changes against [`DESIGN.md`](../DESIGN.md), [`UX-CONTRACT.md`](../UX-CONTRACT.md), and the phase plan. Ensure procedural Web Audio is used for all sounds ($0 asset rule).
2. **Execute Verification Gate**:
   ```bash
   npm run verify
   npm run test:e2e
   ```
   Both suites must pass with 100% green tests and zero type errors.
3. **Merge into `master` with Complete Attribution**:
   ```bash
   git checkout master
   git merge feat/<task-name> --no-ff -m "merge: <summary of task>" -m "Implementer: claude-sonnet-5 (claude code)
   Reviewer: gpt-6.1-sol (codex)
   Assigner: gemini-3.8-flash (antigravity)"
   ```
4. **Prune Worktree & Branch**:
   ```bash
   git worktree remove --force .worktrees/<task-name>
   git branch -d feat/<task-name>
   ```
5. **Update Task Ledger**: Update [`docs/TASK-TRACKER.md`](../docs/TASK-TRACKER.md) on `master` to mark the task complete with commit hash and verification checkmark.
6. **Synchronize Remote**:
   ```bash
   git push origin master
   ```
