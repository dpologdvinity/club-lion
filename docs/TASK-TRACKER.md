# Club Lion: Task & Model Attribution Tracker

This document tracks all completed and in-progress tasks across development phases, documenting which AI agent and foundation model implemented each subsystem, the associated git commits, and verification status.

---

## Commit & Merge Attribution Standards

### Standard Commits
All commits made across all worktrees must conclude with the `Implementer` trailer at the very end of the commit message body:

```text
<type>(<scope>): <summary>

<optional description / notes>

Implementer: claude-sonnet-5 (claude code)
```
*(Options: `claude-sonnet-5 (claude code)`, `gpt-6.1-sol (codex)`, `gemini-3.8-flash (antigravity)`)*

### Squashed Integration Commits on `master`
When verified worktrees are squashed into `master`:

```text
<type>(<scope>): <summary>

<bulleted list of feature capabilities, changes, and test additions>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Verifier: <model> (<agent>)
Assigner: <model> (<agent>)
```
*(All models and agents are interchangeable across all roles: Implementer, Reviewer, Verifier, and Assigner.)*

---

## Phase 1: Chibi Avatar, Pet Lion Companion & Downtown Core

Master Spec: [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)  
Implementation Plan: [`docs/plans/2026-10-03-phase-1-chibi-avatar-pet-downtown.md`](2026-10-03-phase-1-chibi-avatar-pet-downtown.md)

| Task | Subsystem Description | Branch / Worktree | Assigned Agent & Model | Commit(s) | Status & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Spec** | Master Design Spec & Phase 1 Plan | `master` | **gemini-3.8-flash (antigravity)** | `2e34370` .. `a7cb17d` | ✅ Approved |
| **Task 1** | Core Entity Types & 10-Slot Wardrobe Taxonomy | `feat/phase-1-avatar-pet-downtown` | **gemini-3.8-flash (antigravity)** | `95c4bed` | ✅ 36/36 tests, strict types clean |
| **Task 2** | Vector Chibi Avatar Component (`Avatar.tsx`) | `feat/phase-1-avatar-pet-downtown` | **gemini-3.8-flash (antigravity)** | `1bb1dd4`, `61e3bbe` | ✅ 46/46 tests, reviewer approved |
| **Task 3** | Pet Companion Trailing Physics Engine (`PetCompanion.tsx`) | `feat/phase-1-pet-companion` | **claude-sonnet-5 (claude code)** | `e31318f` | ✅ 43/43 tests, strict types clean |
| **Task 4** | Panoramic Camera Viewport & Room Engine | `feat/phase-1-camera-viewport` | **claude-sonnet-5 (claude code)** | `d0fae9c` | ✅ 40/40 tests, strict types clean |
| **Task 5** | Le Shop Catalog Secrets & Stella's Salon | `feat/phase-1-catalog-salon` | **claude-sonnet-5 (claude code)** | `5b18953` | ✅ 39/39 tests, build clean |
| **Task 6** | Quick-Chat Action Wheel & Mango Ballistics | `feat/phase-1-actions-ballistics` | **gpt-6.1-sol (codex)** | `90eb40b` | ✅ 41/41 tests, strict types clean |
| **Task 7** | Fantage ID Card & V1-to-V2 Save Migration | `feat/phase-1-player-id-card` | **claude-sonnet-5 (claude code)** | `7f90c00` | ✅ 40/40 tests, build clean |
| **Task 8** | Phase 1 Integration, Full Assembly & E2E Verification | `feat/phase-1-avatar-pet-downtown` | **gemini-3.8-flash (antigravity)** | `af62b72` | ✅ 76/76 unit tests, 70/70 E2E tests, build clean |
| **Phase 1 Merge** | Milestone Integration into `master` | `master` | **gemini-3.8-flash (antigravity)** (Lead, Reviewer & Assigner) | `dcc8094` | ✅ Fully verified; feature branches & worktrees retired |

---

## Phase 2: Savanna Wonder Park & Nightlife Core

Master Spec: [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)  
Implementation Plan: [`docs/plans/2026-10-03-phase-2-savanna-wonder-park-nightlife.md`](2026-10-03-phase-2-savanna-wonder-park-nightlife.md)

| Task | Subsystem Description | Branch / Worktree | Assigned Agent & Model | Commit(s) | Status & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Task 1** | Hoverboard Glide & Footprint Sparkle Trail Engine | `feat/phase-2-task-1-trails` | **claude-sonnet-5 (claude code)** | `bc772e0` → `3c52baa` | ✅ Completed, reviewed & verified; 87/87 unit tests, 74/74 E2E; types, format & build clean |
| **Task 2** | Wonder Park Declarative Room Manifests & Kinetic Track Engine | `feat/phase-2-task-2-coaster`<br/>(`.worktrees/phase-2-task-2-coaster`) | **claude-sonnet-5 (claude code)** | - | 🚀 In Progress (Dispatched) |
| **Task 3** | Club Pulse Interactive Dance Floor & DJ Booth Stage | `feat/phase-2-task-3-dance` | *Open to any agent* | - | ⏳ Planned |
| **Task 4** | DJ Beat Drop Web Audio Rhythm Minigame | `feat/phase-2-task-4-dj-beat` | **claude-sonnet-5 (claude code)** | `dc18077` → `d5d0f78` | ✅ Completed, reviewed & verified; 107/107 unit tests, 82/82 E2E; types, format & build clean |
| **Task 5** | Canopy Café Smoothie Kitchen Minigame | `feat/phase-2-task-5-smoothie` | **claude-sonnet-5 (claude code)** | `d627ec3` → `1487713` | ✅ Completed, reviewed & verified; 117/117 unit tests, 88/88 E2E; types, format & build clean |
| **Task 6** | Savanna Screamer Roller Coaster Interactive Ride Mode | `feat/phase-2-task-6-coaster` | *Open to any agent* | - | ⏳ Planned |
| **Task 7** | Full Phase 2 Integration, World Routing & Playwright E2E Suite | `feat/phase-2-integration` | *Open to any agent* | - | ⏳ Planned |
| **Phase 2 Merge Train** | Serial Rebase & Squash Integration | `master` | **Verifier & Orchestrator** | - | ⏳ Pending Review & Verification |

---

### Review and integration evidence — Tasks 1, 4, and 5

Reviewed and verified by **gpt-6.1-sol (codex)**; merged in order **1 → 4 → 5** with the requested three-agent attribution trailers. The final combined gate passed **117/117 unit tests** and **88/88 desktop/mobile Playwright tests**, strict types, Prettier, and the production build. All 11 unit-test files are included in `npm test`.

Codex review fixes and regression tests cover click-target accuracy, idle/reduced-motion sparkle behavior, missed-beat combo resets, peak combos, held keys, dialog focus, note timing, recipe guidance, one-time serving, audio fallback, and reward overflow. DJ best scores and smoothie counts are optional additive save fields; both v1 and v2 migrations preserve their progress. Audio uses procedural Web Audio oscillators and generated noise only, with no external audio assets or runtime audio requests.

The minigames were verified in standalone browser fixtures. Their world/arcade routing remains part of **Task 7**; the remaining Phase 2 tasks and milestone are still pending. Concurrent workflow and tracker documentation changes were preserved.

---

## Agent Roster & Universal Interchangeability

There are **no fixed or primary roles**. All agents and models are fully interchangeable peers capable of executing any task, architecture, physics, frontend, minigame, test suite, review, or milestone merge:

| Model Identifier | Agent Platform | Role Flexibility |
| :--- | :--- | :--- |
| `gemini-3.8-flash (antigravity)` | Antigravity | Any role: Lead Orchestrator, Assigner, Architect, Implementer, Reviewer |
| `claude-sonnet-5 (claude code)` | Claude Code | Any role: Implementer, Reviewer, Assigner, Architect, Tester |
| `gpt-6.1-sol (codex)` | Codex | Any role: Reviewer, Merger, Implementer, Assigner, Tester |

### Active Phase 2 Operating Configuration
- **Lead Orchestrator & Assigner:** Antigravity (`gemini-3.8-flash`)
- **Implementer:** Claude Code (`claude-sonnet-5`)
- **Reviewer & Merger:** Codex (`gpt-6.1-sol`)
*(Flexible and dynamically adjustable at any time)*

