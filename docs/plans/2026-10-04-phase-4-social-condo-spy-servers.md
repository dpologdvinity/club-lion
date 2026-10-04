# Phase 4: Player Accounts, Cloud Sync, Friends, Condo, Jukebox & Spy Command Center

* **Date:** 2026-10-04
* **Status:** In Progress / Orchestration Active
* **Lead Orchestrator:** Antigravity (`gemini-3.8-flash`)
* **Implementers & Reviewers:** Claude Code (`claude-sonnet-5`), Codex (`gpt-6.1-sol`), Antigravity (`gemini-3.8-flash`)
* **Specification Target:** Phase 4 from [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)

---

## 1. Overview & Goals

Phase 4 completes the core social, expressive, and spatial multiplayer foundations of Club Lion while strictly adhering to:
1. **$0 Infrastructure Rule:** Zero external runtime services or API costs required. Everything functions 100% locally with local-first offline saves and mockable network adapters.
2. **Procedural Web Audio Rule:** All music tracks and sound effects generated dynamically via Web Audio API oscillators and envelopes (zero MP3 assets).
3. **Multi-Agent Lifecycle:** Orchestrator creates isolated worktrees, Implementers use RED-GREEN TDD, Reviewers audit diffs, and Verifier gates integration into `master`.
4. **Context Conservation:** Background execution with stdout redirection (`> log 2>&1`), compact state-based inspection, no token flooding.

---

## 2. Task Breakdown

### Task 1: Procedural Web Audio Jukebox & Persistent Global Audio Controls
- **Artifacts:**
  - `src/utils/proceduralJukebox.ts` & `src/utils/proceduralJukebox.test.ts`
  - `src/components/AudioControls.tsx`
  - `src/components/JukeboxModal.tsx`
- **Core Requirements:**
  - Synthesize 4 distinct musical tracks procedurally:
    1. *Savanna Nightclub* (4-on-the-floor kick, synth bass arpeggio, snare)
    2. *Canopy Lo-Fi Lounge* (warm electric piano chords, vinyl crackle noise, acoustic brush)
    3. *Waterhole Twilight* (pan flute melody, ambient water ripple, evening crickets)
    4. *Carnival Calliope* (mechanical organ waltz in 3/4 time)
  - Seamless loop scheduling via Web Audio `AudioContext.currentTime`.
  - Pinned header widget with master volume slider (0–100%), independent Music/SFX toggles, and instant `M` key mute shortcut.
  - Interactive Jukebox modal for selecting and previewing tracks.

### Task 2: Isometric Condo Customization & 16×16 Furniture Grid Engine
- **Artifacts:**
  - `src/utils/condoGrid.ts` & `src/utils/condoGrid.test.ts`
  - `src/rooms/manifests/penthouseCondo.ts`
  - `src/components/Condo.tsx`
- **Core Requirements:**
  - 16×16 isometric floor tile grid with standard coordinate projections:
    - Screen $(x, y) \leftrightarrow$ Grid $(col, row)$.
  - Furniture placement, rotation (4 cardinal orientations: N, E, S, W), boundary clamping, and collision prevention.
  - Mathematical isometric depth sorting $(row + col + zIndex)$ ensuring correct rendering order without visual clipping.
  - Decor catalogue: Velvet Modular Sofa, Grand Jukebox, Neon Lion Crest, Baobab Bonsai, Pet Lion Cushion.
  - Serializable room layout string persisted additively in player profile.

### Task 3: Secret Scout Command Center & Laser Grid / Cipher Spy Puzzles
- **Artifacts:**
  - `src/utils/spyPuzzles.ts` & `src/utils/spyPuzzles.test.ts`
  - `src/rooms/manifests/secretScoutBase.ts`
  - `src/components/SpyTerminal.tsx`
- **Core Requirements:**
  - Classified subterranean command center manifest ("The Pride" Secret Scout Agency).
  - Hidden speakeasy / phone booth entrance in Downtown Plaza with 4-digit security PIN unlock.
  - Spy Terminal minigame with two distinct challenge modes:
    1. *Laser Tripwire Grid:* Navigate timing-pulsed security beams across a multi-stage grid without tripping alarms.
    2. *Classified Agent Cipher:* Crack substitution ciphers with hint letters and savanna spy intelligence clues.
  - Award spy ranks and special agent badge in PlayerCard.

### Task 4: Local-First Entity Network Protocol & Multi-Room Spatial Server
- **Artifacts:**
  - `src/utils/networkProtocol.ts` & `src/utils/networkProtocol.test.ts`
  - `src/utils/roomNetworkSync.ts` & `src/utils/roomNetworkSync.test.ts`
- **Core Requirements:**
  - Compact delta entity array encoding (`[entityId, x, y, heading, action, timestamp]`, <40 bytes per packet).
  - Spatial room partitioning (`roomId` routing) isolating traffic so each room handles 5–25 avatars smoothly.
  - Linear interpolation (`lerp`) and dead reckoning for smooth 60 FPS remote avatar movement across 12–15Hz network updates.
  - Mock local WebSocket server adapter allowing full multiplayer simulation in local tests with zero cloud dependencies.

### Task 5: Friends System, Social Presence & "Jump to Friend" Fast-Travel
- **Artifacts:**
  - `src/utils/socialGraph.ts` & `src/utils/socialGraph.test.ts`
  - `src/components/FriendsPanel.tsx`
- **Core Requirements:**
  - Friend request management (send, accept, decline, remove).
  - Real-time online/offline presence status and current room location display.
  - "Jump to Friend" action that teleports the player directly to the friend's room at a safe, non-trigger spawn coordinate.
  - Social interactions: High-five and tandem groove dance emotes.
  - Player search by username and recent room visitors list.

### Task 6: Full World Integration, Account Modal & Playwright E2E Suite
- **Artifacts:**
  - `src/components/AccountModal.tsx`
  - `src/rooms/registry.ts` & `src/App.tsx` & `src/styles.css`
  - `tests/phase4.spec.ts`
- **Core Requirements:**
  - Local-first guest account with voluntary registration/login modal.
  - Downtown Plaza phone booth portal into Secret Scout Base and elevator into Penthouse Condo.
  - Header audio controls with volume slider and `M` key hotkey.
  - Comprehensive Playwright E2E test suite covering:
    - Jukebox music playing and volume/mute controls.
    - Condo furniture placement, rotation, and persistence.
    - Spy puzzle terminal completion and reward award.
    - Friends panel social interactions and Jump-to-Friend navigation.
    - Zero accessibility violations and responsive layout verification.

---

## 3. Verification & Merge Gates

- **Inside Worktrees:** `npm test` (~190ms) for rapid RED-GREEN TDD cycles.
- **Integration Gate:** Single full gate on rebased worktree before squashing into `master`:
  - `npm test` (all unit tests passing)
  - `npm run typecheck` (strict TypeScript with zero errors)
  - `npm run format:check` (Prettier compliance)
  - `npm run build` (production build verification)
  - `npx playwright test tests/phase4.spec.ts` (desktop and mobile Chromium suites)
