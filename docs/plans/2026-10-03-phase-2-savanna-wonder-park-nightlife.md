# Phase 2: Savanna Wonder Park & Nightlife Core Implementation Plan

> **For Codex (`gpt-6.1-sol`) & Multi-Agent Implementers:**
> Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.
> All commits must conclude with the mandatory attribution trailer: `Implementer: <model> (<agent>)`.

**Goal:** Expand Club Lion with the vibrant Savanna Wonder Park (theme park rides & kinetic spectacles), Club Pulse nightlife (interactive light-up dance floor & DJ Beat Drop rhythm mini-game), Canopy Café Smoothie Kitchen, and equipable hoverboard sparkle trails.

**Architecture:** Extends the declarative `RoomManifest` engine, procedural Web Audio synthesizer, layered vector SVG avatar engine, and local storage save progression system. Decoupled and multiplayer-ready.

**Tech Stack:** React 19, TypeScript (strict), Vite, Web Audio API (procedural synthesis, zero MP3 assets), Node test runner (`node --test`), Playwright Chromium for E2E browser verification.

**Master Spec Reference:** [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)

---

## Global Constraints

- **Language & Runtime:** Node.js 22.18+, TypeScript in strict mode, React 19.
- **Zero Heavy Audio Assets ($0 constraint):** All DJ beats, coaster rattles, splash sounds, and dance floor music must use procedural Web Audio oscillator synthesis (zero external audio files).
- **Zero Cost ($0 infrastructure):** 100% playable offline and locally in localStorage.
- **Attribution Convention (MANDATORY):**
  - Standard commit trailer: `Implementer: gpt-6.1-sol (codex)` (or appropriate model).
  - Merge trailer: `Implementer: ...`, `Reviewer: ...`, `Assigner: ...`.
- **Testing Standard:** All business logic, rhythm timing, scoring, and ride states must have unit tests run via `npm test` and verification via `npm run verify`.

---

### Task 1: Hoverboard Glide & Footprint Sparkle Trail Engine

**Files:**
- Create: `src/utils/particleTrail.ts`
- Create: `src/utils/particleTrail.test.ts`
- Modify: `src/components/World.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `computeSparkleParticles(avatarPos, boardId, timeMs): SparkleParticle[]`
- Produces: Faster walk speed multiplier (`1.5x`) when `player.look.boardId` is equipped.

- [ ] **Step 1: Write failing unit test for particle trail generator**
Create `src/utils/particleTrail.test.ts` testing trail particle generation, decay lifespan, color matching by board type (`hover_leaf` green, `star_cruiser` gold, `neon_pulse` cyan), and velocity spread.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "cannot find module ./particleTrail.ts"

- [ ] **Step 3: Implement `src/utils/particleTrail.ts`**
Export `SparkleParticle` type and `generateSparkleStep(prevParticles, currentPos, isMoving, boardId, deltaMs)`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/utils/particleTrail.ts src/utils/particleTrail.test.ts
git commit -m "feat(boards): implement hoverboard glide speed and sparkle trail engine" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 2: Wonder Park Declarative Room Manifests & Kinetic Track Engine

**Files:**
- Create: `src/rooms/manifests/wonderParkEntrance.ts`
- Create: `src/rooms/manifests/wonderParkMidway.ts`
- Create: `src/utils/kineticRides.ts`
- Create: `src/utils/kineticRides.test.ts`
- Modify: `src/rooms/types.ts`

**Interfaces:**
- Produces: `computeCoasterTrackPosition(t: number): { x: number, y: number, angle: number }`
- Produces: `wonderParkEntranceManifest` (2800×720 panoramic stage with roller coaster backdrop, ferris wheel, and flume splashdown).

- [ ] **Step 1: Write failing unit test for roller coaster spline mathematics**
Create `src/utils/kineticRides.test.ts` testing looped parametric curve interpolation, coaster car banking angles, and loop-de-loop crest acceleration.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "cannot find module ./kineticRides.ts"

- [ ] **Step 3: Implement `src/utils/kineticRides.ts` and room manifests**
Implement closed-loop spline evaluator and declarative manifests for Wonder Park Entrance & Midway with portals to Downtown and rides.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/rooms/manifests/ src/utils/kineticRides.ts src/utils/kineticRides.test.ts src/rooms/types.ts
git commit -m "feat(wonder-park): add panoramic room manifests and kinetic coaster track engine" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 3: Club Pulse Interactive Dance Floor & DJ Booth Stage

**Files:**
- Create: `src/rooms/manifests/clubPulse.ts`
- Create: `src/components/DanceFloor.tsx`
- Create: `src/utils/danceFloorRhythm.ts`
- Create: `src/utils/danceFloorRhythm.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: 8×6 grid interactive disco dance tiles that illuminate under avatar footfalls and pulse to procedural synth BPM.
- Produces: DJ Booth interactive hotspot triggering `DJ Beat Drop` minigame dialog.

- [ ] **Step 1: Write failing unit test for dance floor tile lighting and tempo sync**
Create `src/utils/danceFloorRhythm.test.ts` testing BPM pulse quantization, tile color cycling, and avatar step detection.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "cannot find module ./danceFloorRhythm.ts"

- [ ] **Step 3: Implement `danceFloorRhythm.ts`, `DanceFloor.tsx`, and `clubPulse.ts` manifest**
Implement responsive CSS grid with dynamic CSS custom properties for tile illumination and avatar step reactions.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/rooms/manifests/clubPulse.ts src/components/DanceFloor.tsx src/utils/danceFloorRhythm.ts src/utils/danceFloorRhythm.test.ts src/styles.css
git commit -m "feat(nightlife): add Club Pulse manifest and interactive light-up dance floor" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 4: DJ Beat Drop Rhythm Mini-Game Engine

**Files:**
- Create: `src/components/DJBeatDrop.tsx`
- Create: `src/utils/rhythmEngine.ts`
- Create: `src/utils/rhythmEngine.test.ts`
- Modify: `src/game.ts`
- Modify: `src/game.test.ts`

**Interfaces:**
- Produces: 4-lane falling beat note engine (`D`, `F`, `J`, `K` or arrow keys / touch buttons) with `Perfect` (±45ms), `Great` (±90ms), `Good` (±140ms), and `Miss` timing windows.
- Produces: Combo streak multipliers (`1x`, `2x`, `3x`, `4x`), coin payout logic, and high score persistence in `PlayerV2`.

- [ ] **Step 1: Write failing unit test for timing windows, scoring bands, and combo chain multipliers**
Add tests in `src/utils/rhythmEngine.test.ts` and `src/game.test.ts` verifying hit judgment classification, score calculation, coin rewards, and save validation.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "rhythmEngine is not defined"

- [ ] **Step 3: Implement `src/utils/rhythmEngine.ts`, `completeDJBeatDrop` in `src/game.ts`, and `DJBeatDrop.tsx`**
Implement procedural Web Audio drum synthesis (synthesized 808 kick, snare, hi-hat, synth bass drop), note chart generation, and keyboard/touch input listeners.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/DJBeatDrop.tsx src/utils/rhythmEngine.ts src/utils/rhythmEngine.test.ts src/game.ts src/game.test.ts
git commit -m "feat(minigames): implement DJ Beat Drop rhythm game and procedural synth audio" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 5: Canopy Café Smoothie Kitchen (Cozy Crafting Minigame)

**Files:**
- Create: `src/components/SmoothieKitchen.tsx`
- Create: `src/utils/smoothieRecipes.ts`
- Create: `src/utils/smoothieRecipes.test.ts`
- Modify: `src/game.ts`

**Interfaces:**
- Produces: Order queue, ingredient dispensers (Mango, Pineapple, Baobab Berry, Coconut Milk, Crushed Ice, Honey drizzle), blender minigame, and coin payouts.

- [ ] **Step 1: Write failing unit test for recipe validator and customer order fulfillment**
Create `src/utils/smoothieRecipes.test.ts` validating ingredient combinations, cup filling percentages, time bonus awards, and coin calculation.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "cannot find module ./smoothieRecipes.ts"

- [ ] **Step 3: Implement `src/utils/smoothieRecipes.ts` and `src/components/SmoothieKitchen.tsx`**
Implement drag-and-drop / click-to-pour dispensing, blender whirlpool canvas animation, Web Audio blender buzz, and serving tray.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/SmoothieKitchen.tsx src/utils/smoothieRecipes.ts src/utils/smoothieRecipes.test.ts src/game.ts
git commit -m "feat(minigames): add Canopy Café Smoothie Kitchen cozy crafting minigame" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 6: Savanna Screamer Roller Coaster Interactive Ride Mode

**Files:**
- Create: `src/components/RollerCoasterRide.tsx`
- Create: `src/utils/coasterPhysics.ts`
- Create: `src/utils/coasterPhysics.test.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: First-person / 2.5D cart ride mode across Savanna Wonder Park, camera shaking, procedural wind audio, and passenger photo snap souvenir.

- [ ] **Step 1: Write failing unit test for coaster acceleration, gravity G-forces, and photo timing**
Create `src/utils/coasterPhysics.test.ts` validating velocity integration, drop acceleration, loop-de-loop centrifugal checks, and photo capture trigger.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "cannot find module ./coasterPhysics.ts"

- [ ] **Step 3: Implement `src/utils/coasterPhysics.ts` and `src/components/RollerCoasterRide.tsx`**
Implement canvas track renderer with dynamic parallax mountains, procedural wind noise generator, and ride completion souvenir photo.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/RollerCoasterRide.tsx src/utils/coasterPhysics.ts src/utils/coasterPhysics.test.ts src/styles.css
git commit -m "feat(rides): implement Savanna Screamer roller coaster ride mode and photo capture" -m "Implementer: gpt-6.1-sol (codex)"
```

---

### Task 7: Phase 2 Integration, World Navigation & Full E2E Verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/World.tsx`
- Modify: `tests/world.spec.ts`
- Modify: `docs/TASK-TRACKER.md`

**Interfaces:**
- Connects Wonder Park & Club Pulse portals to world map navigation and stage transitions.
- Integrates `SmoothieKitchen`, `DJBeatDrop`, and `RollerCoasterRide` into the arcade and room action triggers.
- Runs comprehensive Playwright browser verification across desktop and mobile viewports.

- [ ] **Step 1: Wire Phase 2 destinations and minigames into `App.tsx` and `World.tsx`**
- [ ] **Step 2: Run all unit tests, typechecking, and format checks**
Run: `npm run verify`
Expected: PASS with 0 errors

- [ ] **Step 3: Add and run Playwright end-to-end browser tests in `tests/world.spec.ts`**
Run: `npm run test:e2e`
Expected: PASS across desktop and mobile viewports

- [ ] **Step 4: Commit**
```bash
git add src/App.tsx src/components/World.tsx tests/world.spec.ts docs/TASK-TRACKER.md
git commit -m "feat: assemble Phase 2 Wonder Park, Club Pulse nightlife, and minigames" -m "Implementer: gpt-6.1-sol (codex)"
```
