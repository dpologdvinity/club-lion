# Phase 5: Sunset Beach, Mt. Mist Alpine Slopes, Pet Paradise & Community Servers

* **Date:** 2026-10-04
* **Status:** In Progress / Orchestration Active
* **Lead Orchestrator:** Antigravity (`gemini-3.8-flash`)
* **Implementers & Reviewers:** Claude Code (`claude-sonnet-5`), Codex (`gpt-6.1-sol`), Antigravity (`gemini-3.8-flash`)
* **Specification Target:** Phase 5 from [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)

---

## 1. Overview & Goals

Phase 5 expands the Club Lion world beyond the central savanna and urban core into diverse geographic biomes—the sunny oceanfronts of **Sunset Beach**, the alpine snow peaks of **Mt. Mist**, the rushing torrents of **Canyon Rapids**, and the dedicated companion familiar sanctuary at **Pet Paradise**—while strictly upholding our core architectural tenets:

1. **$0 Infrastructure Rule:** Zero external runtime services or API costs required. All biomes, minigames, servers, and physics run 100% locally on client hardware.
2. **Procedural Web Audio Rule:** All new soundscapes (ocean waves, foghorn, sled whoosh, rapids, pet purrs) synthesized procedurally via Web Audio API (zero MP3 assets).
3. **Multi-Agent Lifecycle:** Orchestrator creates isolated worktrees, Implementers use RED-GREEN TDD, Reviewers audit diffs, and Verifier gates integration into `master`.
4. **Context Conservation:** Background execution with stdout redirection (`> log 2>&1`), compact state-based inspection, no token flooding.

---

## 2. Task Breakdown

### Task 1: Global Environmental Lighting & Time-of-Day Pipeline
- **Artifacts:**
  - `src/utils/environmentalLighting.ts` & `src/utils/environmentalLighting.test.ts`
  - `src/components/LightingControls.tsx`
- **Core Requirements:**
  - Four distinct time-of-day atmospheric states: `day`, `sunset`, `dusk`, `night`.
  - Dynamic ambient color grading matrices, sky gradient shifts, and star/firefly particle overlays that adapt any room scenery without duplicating artwork.
  - Header/world toggle widget allowing manual selection or automatic local time matching.
  - Full persistence in player preferences.

### Task 2: Sunset Beach, Coastal Boardwalk & Nautical Foghorn
- **Artifacts:**
  - `src/rooms/manifests/sunsetBeach.ts` & `src/rooms/manifests/sunsetBeach.test.ts`
  - `src/rooms/manifests/coastalPier.ts` & `src/rooms/manifests/coastalPier.test.ts`
  - `src/utils/nauticalAudio.ts` & `src/utils/nauticalAudio.test.ts`
- **Core Requirements:**
  - Sprawling 2400×720 beach & wooden pier manifests with sandy cabanas, crashing ocean waves, and historic lighthouse.
  - Interactive nautical brass foghorn: pulling chain triggers a procedural two-tone booming low-frequency horn with spatial echo.
  - Portals connecting from Downtown Plaza to Sunset Beach, and from Sunset Beach to Coastal Pier and Shipwreck Cove.

### Task 3: Mt. Mist Alpine Basecamp & Extreme Sled Downhill Minigame
- **Artifacts:**
  - `src/rooms/manifests/mtMistBasecamp.ts` & `src/rooms/manifests/mtMistBasecamp.test.ts`
  - `src/utils/sledPhysics.ts` & `src/utils/sledPhysics.test.ts`
  - `src/components/SledRun.tsx`
- **Core Requirements:**
  - 2400×720 snowy mountain basecamp with pine forests and gliding aerial gondola cableway.
  - Downhill obstacle racing minigame: steer avatar on a wooden sled dodging pine trees and snowdrifts, hit speed boost ramps, perform trick jumps, and collect golden pinecones for coins.

### Task 4: Canyon Rapids River Surf Stunt Minigame
- **Artifacts:**
  - `src/rooms/manifests/canyonRapids.ts` & `src/rooms/manifests/canyonRapids.test.ts`
  - `src/utils/riverSurfEngine.ts` & `src/utils/riverSurfEngine.test.ts`
  - `src/components/RiverSurf.tsx`
- **Core Requirements:**
  - Red rock canyon river manifest with rushing water rapids and spray foam particles.
  - Stunt surfing minigame: carve back and forth across rushing rapids, time ramp air launches, grind river logs, and string arrow-key trick combos for high scores.

### Task 5: Pet Paradise Nursery & Grooming Care Engine
- **Artifacts:**
  - `src/rooms/manifests/petParadise.ts` & `src/rooms/manifests/petParadise.test.ts`
  - `src/utils/petCare.ts` & `src/utils/petCare.test.ts`
  - `src/components/PetCareModal.tsx`
- **Core Requirements:**
  - Cozy pet nursery manifest with bubble baths, grooming cushions, and agility play runs.
  - Interactive pet care modal: bubble bath sponge scrubbing, mane brushing, honey snack feeding, and happiness hearts calculation.
  - Persisted pet happiness level and companion emote reactions.

### Task 6: Named Community Servers & Custom Lounges ($0 Stack)
- **Artifacts:**
  - `src/utils/customServers.ts` & `src/utils/customServers.test.ts`
  - `src/components/ServerListModal.tsx`
- **Core Requirements:**
  - In addition to standard official servers, players can create custom named lounges (e.g., *"Savanna Chill"*, *"Late Night Lo-Fi"*).
  - Optional password lock, participant capacity limits, and host moderation controls (kick/mute).
  - Full local-first multiplayer loopback adapter integration.

### Task 7: Full Phase 5 World Integration, Stamp Book Additions & Playwright E2E Suite
- **Artifacts:**
  - `src/rooms/registry.ts`, `src/App.tsx`, `src/styles.css`
  - `src/utils/stampDefinitions.ts` (new stamps for Phase 5 achievements)
  - `tests/phase5.spec.ts`
- **Core Requirements:**
  - Seamless navigation between all 18 world rooms.
  - Comprehensive Playwright Chromium suite covering all new biomes, minigames, foghorn, sled run, pet care, and custom servers.
  - 100% pass rate with zero accessibility violations across desktop and mobile viewports.

---

## 3. Verification & Merge Gates

- **Inside Worktrees:** `npm test` (~150ms) for rapid RED-GREEN TDD cycles.
- **Integration Gate:** Single full gate on rebased worktree before squashing into `master`:
  - `npm test` (all unit tests passing)
  - `npm run typecheck` (strict TypeScript with zero errors)
  - `npm run format:check` (Prettier compliance)
  - `npm run build` (production build verification)
  - `npx playwright test tests/phase5.spec.ts` (desktop and mobile Chromium suites)
