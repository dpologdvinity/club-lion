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

### Merges & Major Integration Commits
When branches, PRs, or major milestone subsystems are integrated:

```text
merge: <summary of integration / branch>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Assigner: gemini-3.8-flash (antigravity)
```

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

---

## Model Roster & Roles

| Model Identifier | Agent Platform | Typical Responsibilities |
| :--- | :--- | :--- |
| `gemini-3.8-flash (antigravity)` | Antigravity | Architecture, specification planning, core data schemas, vector avatar engine, integration controller |
| `claude-sonnet-5 (claude code)` | Claude Code | Motion physics engines, camera mathematics, catalog & secret triggers, save migration engines |
| `gpt-6.1-sol (codex)` | Codex | Ballistics mathematics, interactive modal UI components, touch & input controls, Playwright test suites |
