# Codex Agent Instructions — Club Lion

Welcome, Codex (`gpt-6.1-sol`)! You are operating in **Club Lion**, a React 19, TypeScript (strict), and Vite browser game inspired by the golden era of Fantage × Club Penguin.

### Official 4-Role Operating Lifecycle
Club Lion operates under a 4-role development and integration lifecycle (full spec: [`docs/WORKFLOW.md`](../docs/WORKFLOW.md)):
- **Orchestrator (Phase level):** Assigns tasks, creates worktrees with `PROMPT.md`, manages the merge queue, squashes verified worktrees into `master`, and cleans up branches.
- **Implementer (Task level):** Works inside `.worktrees/<task-name>` with RED-GREEN TDD, deletes `PROMPT.md`, and commits with `Implementer: <model> (<agent>)`.
- **Reviewer (Task level):** Audits commits in the worktree. Uses judgment to make minor fixes directly and commit, or writes a new `PROMPT.md` with review feedback for the Implementer.
- **Verifier (Integration level):** Pre-merge specialist. Rebases the candidate worktree onto latest `master`, resolves all merge conflicts (e.g. `package.json` test scripts, shared types, CSS), and runs `npm run verify` + `npm run test:e2e` to confirm 100% green tests before `master` is touched.

*(Roles remain flexible and any agent can play any role as directed by Kaitlyn.)*

---

## 1. Mandatory Commit & Merge Attribution Standards

Every commit and merge MUST follow the model attribution trailer format:

### Standard Worktree Commits (Implementer & Reviewer)
```text
<type>(<scope>): <summary>

Implementer: <model> (<agent>)
```
*Standard identifiers:* `claude-sonnet-5 (claude code)`, `gpt-6.1-sol (codex)`, `gemini-3.8-flash (antigravity)`.

### Squashed Integration Commits on `master` (Orchestrator)
When squashing a verified worktree into `master`:
```text
<type>(<scope>): <summary>

<bulleted list of feature capabilities, changes, and test additions>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Verifier: <model> (<agent>)
Assigner: <model> (<agent>)
```

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
- Phase 2 Plan (Completed; see docs/PHASE-2-COMPLETION.md): [`docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md`](../docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md)
- Task Tracker Ledger: [`docs/TASK-TRACKER.md`](../docs/TASK-TRACKER.md)

---

## 6. Reviewer & Verifier Operating Protocols

Full architectural specification: [`docs/WORKFLOW.md`](../docs/WORKFLOW.md)

### When Acting as Reviewer (Task Level)
1. **Audit Diff & Requirements**: Inspect changes in `.worktrees/<task-name>` against [`DESIGN.md`](../DESIGN.md), [`UX-CONTRACT.md`](../UX-CONTRACT.md), and the phase plan. Ensure procedural Web Audio API is used for all sounds ($0 external asset rule) and strict typing is preserved.
2. **Dual-Agency Action**:
   - **Minor fixes / nits** (styling tweaks, missing type annotation, test edge case):
     Make the changes directly in the worktree, run `npm test` (or focused probe: ~100ms), and commit with your trailer. (Do NOT run full `npm run verify` or E2E tests during task review; that gate is run once at merge time).
   - **Major architectural changes or missing requirements**:
     Write a structured `PROMPT.md` in the worktree detailing what needs fixing, and hand it back to the Implementer.
3. **Approval**: Once satisfied, sign off on the worktree so it can enter the merge train.

### When Acting as Verifier (Integration Level)
1. **Rebase against Master**:
   When designated by the Orchestrator as the next worktree to merge:
   ```bash
   cd .worktrees/<task-name>
   git fetch origin master
   git rebase master
   ```
2. **Resolve Conflicts in Worktree**:
   Resolve all conflicts (e.g. combining test file paths on the `"test"` line in `package.json`, shared types in `src/game.ts`, shared styles in `src/styles.css`). Never let a conflict reach `master`.
3. **Execute Verification Gate**:
   ```bash
   npm run verify
   npm run test:e2e
   ```
   Both suites must pass with 100% green tests and zero type errors.
4. **Handoff to Orchestrator**:
   Notify the Orchestrator that the worktree is green, rebased, and ready for squash merge.
5. **Advance Merge Train**:
   As soon as the Orchestrator squashes Worktree $N$ into `master`, take Worktree $N+1$, rebase it against the newly updated `master`, resolve conflicts, and repeat!
