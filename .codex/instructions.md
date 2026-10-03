# Codex Agent Instructions — Club Lion

Welcome, Codex (`gpt-6.1-sol`)! You are operating as the lead agent / implementer in **Club Lion**, a React 19, TypeScript (strict), and Vite browser game inspired by the golden era of Fantage × Club Penguin.

---

## 1. Mandatory Commit & Merge Attribution Standards

Every commit and merge MUST follow the model attribution trailer format specified by the user:

### Standard Commits
Every commit across all branches and worktrees must conclude with the `Implementer` trailer:
```text
<type>(<scope>): <summary>

Implementer: gpt-6.1-sol (codex)
```
*(If collaborating with other agents: `claude-sonnet-5 (claude code)` or `gemini-3.8-flash (antigravity)`)*

### Merges & Milestone Integrations
On branch merges, pull requests, and milestone integrations, include the complete multi-agent trailer:
```text
merge: <summary>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
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
- Phase 2 Plan (Ready to Execute): [`docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md`](../docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md)
- Task Tracker Ledger: [`docs/TASK-TRACKER.md`](../docs/TASK-TRACKER.md)
