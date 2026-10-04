# Phase 3 Implementation Plan: Splash Oasis, World Instruments, Runway Showdown & Stamp Book

Master Spec: [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)  
Roadmap Phase: **Phase 3**  
Target Completion: All tasks tested, verified, and integrated into `master`.

---

## Task Breakdown

### Task 1: The 25+ Savanna Stamp Book Progression & Save Migration
- **Description:** Implement the collectible stamp progression system with 25+ stamps across World Secrets, Park & Water Thrills, Fashion & Style, and Arcade Mastery.
- **Files to create/modify:**
  - Create: `src/utils/stampDefinitions.ts` (definitions, categories, unlock predicates)
  - Create: `src/utils/stampDefinitions.test.ts`
  - Create: `src/components/StampBook.tsx` (Fantage-style album with stamp slots, tooltips, completion badge)
  - Modify: `src/game.ts` (unlockStamp mutator, checkStampUnlocks, save format support)
  - Modify: `src/game.test.ts`
- **Output:** Pure logic + UI for stamp collection, backward-compatible save persistence.

---

### Task 2: Interactive World Instruments & Procedural Web Audio Jam Engine
- **Description:** $0 asset procedural Web Audio instruments (Piano, Savanna Marimba, Drum Kit, Giant Floor Piano) with shared room harmonic scale (C Major / A Minor pentatonic) so jamming always sounds musical.
- **Files to create/modify:**
  - Create: `src/utils/instrumentSynths.ts` (Web Audio procedural synthesis for piano, marimba, drums, floor keys)
  - Create: `src/utils/instrumentSynths.test.ts`
  - Create: `src/components/InstrumentModal.tsx` (Interactive playable 8-key wooden keyboard overlay, number keys `1`-`8`, touch pads)
  - Modify: `src/styles.css`
- **Output:** Procedural instruments playable by click/keyboard with zero MP3 assets.

---

### Task 3: Waterhole Angler Cozy Dock Fishing Minigame
- **Description:** Calming dock fishing minigame with line casting, ripple shadows, bite reflex timing, fish rarity (Golden Catfish, Baobab Perch, Striped Tilapia, Old Boot), and coin payouts.
- **Files to create/modify:**
  - Create: `src/utils/fishingEngine.ts` (casting trajectory, bite window, reeling tension, catch tables)
  - Create: `src/utils/fishingEngine.test.ts`
  - Create: `src/components/WaterholeAngler.tsx` (Modal minigame with procedural splash/reel audio, catch pop-up)
  - Modify: `src/game.ts` (completeFishingCatch mutator, fish caught ledger)
  - Modify: `src/game.test.ts`
- **Output:** Complete fishing minigame with Web Audio sound effects and coin rewards.

---

### Task 4: Splash Oasis Waterpark Rooms & Kinetic Wave / Dump Bucket Engine
- **Description:** Panoramic waterpark rooms with animated Tsunami Wave Pool and 1,000-Gallon Tipping Dump Bucket physics.
- **Files to create/modify:**
  - Create: `src/utils/waterparkPhysics.ts` (sinusoidal wave bobbing, bucket fill/tip cycle, splashdown radius)
  - Create: `src/utils/waterparkPhysics.test.ts`
  - Create: `src/rooms/manifests/splashOasisEntry.ts` (Wave pool beach, dump bucket fortress)
  - Create: `src/rooms/manifests/splashOasisRiver.ts` (Lazy River Oasis with tube floaters)
  - Modify: `src/rooms/types.ts`
- **Output:** Waterpark room manifests and kinetic water animation physics.

---

### Task 5: Top Models Fashion Show Runway Minigame
- **Description:** Timed runway styling challenge in Uptown Runway. Theme called (Y2K, Savanna Chic, Retro, Neon); style avatar within 30s timer for judge score and coins.
- **Files to create/modify:**
  - Create: `src/utils/fashionScoring.ts` (style tag taxonomy, theme matching formula, star rating)
  - Create: `src/utils/fashionScoring.test.ts`
  - Create: `src/components/TopModelsRunway.tsx` (30s styling timer, catwalk sequence, flashbulbs, score card)
  - Modify: `src/game.ts` (fashion show score & reward mutator)
  - Modify: `src/game.test.ts`
- **Output:** Fashion styling minigame with scored catwalk and awards.

---

### Task 6: Full Phase 3 World Integration & Playwright E2E Suite
- **Description:** Wire all new rooms, minigames, instruments, and stamp book into the live world navigation and write comprehensive desktop/mobile Playwright E2E tests.
- **Files to create/modify:**
  - Modify: `src/rooms/registry.ts`
  - Modify: `src/components/World.tsx`
  - Modify: `src/components/GamesPanel.tsx`
  - Modify: `src/App.tsx`
  - Create: `tests/stamp-book.spec.ts`
  - Create: `tests/waterhole-angler.spec.ts`
  - Create: `tests/instruments.spec.ts`
  - Create: `tests/top-models.spec.ts`
  - Create: `tests/world-phase3.spec.ts`
- **Output:** Seamless world exploration across all 9 districts, 100% green verification.

---

## Execution Standards
- Strict RED-GREEN TDD inside isolated task worktrees.
- Lean verification inside worktree (`npm test` ~100ms).
- Silent background runner for Claude / Codex with zero stdout leakage into context.
- Single official integration gate at merge time (`npm run verify` + `test:e2e`).
- Squashed conventional commits on `master` with complete multi-agent attribution trailers.
