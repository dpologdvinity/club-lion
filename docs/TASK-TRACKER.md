# Club Lion: Task & Model Attribution Tracker

This document tracks all completed and in-progress tasks across development phases, documenting which AI agent and foundation model implemented each subsystem, the associated git commits, and verification status.

---

## Commit Message Attribution Standard

All commits made across all worktrees must conclude with the model attribution trailer at the very end of the commit message body:

```text
<type>(<scope>): <summary>

<optional description / notes>

Claude Code (claude-sonnet-5)
```
*(or `Codex (gpt-6.1-sol)`, `Antigravity (Gemini 3.8 Flash)`)*

---

## Phase 1: Chibi Avatar, Pet Lion Companion & Downtown Core

Master Spec: [`docs/plans/2026-10-03-club-lion-expanded-world-design.md`](2026-10-03-club-lion-expanded-world-design.md)  
Implementation Plan: [`docs/plans/2026-10-03-phase-1-chibi-avatar-pet-downtown.md`](2026-10-03-phase-1-chibi-avatar-pet-downtown.md)

| Task | Subsystem Description | Branch / Worktree | Assigned Agent & Model | Commit(s) | Status & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Spec** | Master Design Spec & Phase 1 Plan | `master` | **Antigravity (Gemini 3.8 Flash)** | `2e34370` .. `a7cb17d` | ✅ Approved |
| **Task 1** | Core Entity Types & 10-Slot Wardrobe Taxonomy | `feat/phase-1-avatar-pet-downtown` | **Antigravity (Gemini 3.8 Flash)** | `95c4bed` | ✅ 36/36 tests, strict types clean |
| **Task 2** | Vector Chibi Avatar Component (`Avatar.tsx`) | `feat/phase-1-avatar-pet-downtown` | **Antigravity (Gemini 3.8 Flash)** | `1bb1dd4`, `2c561ef` | ✅ 46/46 tests, reviewer approved |
| **Task 3** | Pet Companion Trailing Physics Engine (`PetCompanion.tsx`) | `feat/phase-1-pet-companion` | **Claude Code (claude-sonnet-5)** | `75a1726` | ✅ 43/43 tests, strict types clean |
| **Task 4** | Panoramic Camera Viewport & Room Engine | `feat/phase-1-camera-viewport` | **Claude Code (claude-sonnet-5)** | `b83643e` | ✅ 40/40 tests, strict types clean |
| **Task 5** | Le Shop Catalog Secrets & Stella's Salon | `feat/phase-1-catalog-salon` | **Claude Code (claude-sonnet-5)** | *In Progress* | 🔄 Pending completion |
| **Task 6** | Quick-Chat Action Wheel & Mango Ballistics | `feat/phase-1-actions-ballistics` | **Codex (gpt-6.1-sol)** | `2aff016` | ✅ 41/41 tests, strict types clean |
| **Task 7** | Fantage ID Card & V1-to-V2 Save Migration | `feat/phase-1-player-id-card` | **Claude Code (claude-sonnet-5)** | *In Progress* | 🔄 Pending completion |
| **Task 8** | Phase 1 Integration, Full Assembly & E2E Verification | `feat/phase-1-avatar-pet-downtown` | **Antigravity (Gemini 3.8 Flash)** | *Pending* | ⏳ Awaiting Tasks 5 & 7 |

---

## Model Roster & Roles

| Agent Platform | Model Identifier | Typical Responsibilities |
| :--- | :--- | :--- |
| **Antigravity** | `Gemini 3.8 Flash` | Architecture, specification planning, core data schemas, vector avatar engine, integration controller |
| **Claude Code** | `claude-sonnet-5` | Motion physics engines, camera mathematics, catalog & secret triggers, save migration engines |
| **Codex** | `gpt-6.1-sol` | Ballistics mathematics, interactive modal UI components, touch & input controls, Playwright test suites |
