# Repository Guidelines

## Project Structure & Module Organization

Club Lion is a React, TypeScript, and Vite browser game. `src/App.tsx` composes the interface; `src/components/` contains reusable UI and minigames. Keep progression, purchases, and save validation in `src/game.ts`, persistence in `src/usePlayer.ts`, and shared styles in `src/styles.css`.

Unit tests live in `src/game.test.ts`; browser tests live in `tests/world.spec.ts`. Artwork and licensed fonts belong in `public/assets/` and `public/fonts/`. Consult `DESIGN.md` for visual decisions and `UX-CONTRACT.md` for interaction requirements.

## Build, Test, and Development Commands

Use Node.js 22.18 or newer. Install dependencies with `npm ci`.

- `npm run dev`: start the development server at `http://localhost:5173`.
- `npm run typecheck`: check strict TypeScript types.
- `npm test`: run game-state tests with Node's built-in test runner.
- `npm run verify`: run all unit tests, typecheck, format check, and production build in one command.
- `npm run test:e2e`: run Playwright Chromium tests at desktop and mobile sizes; install the browser first with `npx playwright install chromium`.
- `npm run format:check` / `npm run format`: check or apply Prettier formatting to configured files.
- `npm run build`: typecheck and generate production files in `dist/`.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions

Follow Prettier defaults: two-space indentation, double quotes, and semicolons. Use PascalCase component filenames, camelCase functions, `use`-prefixed hooks, and kebab-case CSS classes. Reuse shared components, design tokens, and domain helpers. Keep TypeScript strict; validate persisted data before using it.

## Testing Guidelines

Name unit tests `*.test.ts` and browser tests `*.spec.ts`. Protect coin balances, one-time rewards, purchase ownership, and save round trips. Exercise changed interactions, keyboard navigation, dialog focus, persistence, and mobile layouts; browser tests also use axe accessibility checks. No numeric coverage threshold is configured. Run relevant tests, typechecking, formatting, and the build before submitting changes (`npm run verify`).

## Commit & Pull Request Guidelines

Use focused Conventional Commits, matching history: `feat: add illustrated savanna` or `fix: restore dialog focus`. Commit meaningful increments often. PRs should explain the resulting behavior, list validation results, link relevant issues, and include desktop/mobile screenshots for visual changes. Highlight save-format changes. Exclude secrets, `node_modules/`, and generated build/test artifacts.

### Multi-Agent Operating Roles & Lifecycle

Club Lion uses a 4-role development lifecycle (documented fully in [`docs/WORKFLOW.md`](docs/WORKFLOW.md)). All models (`gemini-3.8-flash`, `gpt-6.1-sol`, `claude-sonnet-5`) are equal peers and can execute any role:

1. **Orchestrator (Phase level)**: Assigns tasks, creates isolated worktrees with `PROMPT.md`, manages the merge queue, squashes verified worktrees into `master`, prunes branches, and updates `docs/TASK-TRACKER.md`.
2. **Implementer (Task level)**: Develops inside `.worktrees/<task-name>` with RED-GREEN TDD, deletes `PROMPT.md`, and commits with `Implementer: <model> (<agent>)`.
3. **Reviewer (Task level)**: Audits commits in the worktree. Exercises judgment to either make minor fixes directly and commit, or write a new `PROMPT.md` for the Implementer.
4. **Verifier (Integration level)**: Pre-merge integration specialist. Rebases the candidate worktree onto latest `master`, resolves merge conflicts (e.g. `package.json` test scripts, shared types, CSS), and runs `npm run verify` + `npm run test:e2e` to ensure 100% green tests before `master` is touched.

### Merge Train Protocol
- The Verifier rebases Worktree $N$ onto `master`, resolves conflicts, and runs verification.
- The Orchestrator squashes Worktree $N$ into `master` as a single Conventional Commit, deletes the worktree/branch, and updates `docs/TASK-TRACKER.md`.
- The Verifier immediately rebases Worktree $N+1$ onto the updated `master`.
- Repeat until all worktrees are integrated.

### Mandatory Commit & Attribution Standards

#### Standard Worktree Commits (Implementer / Reviewer):
```text
<type>(<scope>): <summary>

Implementer: <model> (<agent>)
```

#### Squashed Integration Commits on `master` (Orchestrator):
```text
<type>(<scope>): <summary>

<bulleted list of feature capabilities, changes, and test additions>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Verifier: <model> (<agent>)
Assigner: <model> (<agent>)
```
*Standard agent/model identifiers:*
- `gpt-6.1-sol (codex)`
- `claude-sonnet-5 (claude code)`
- `gemini-3.8-flash (antigravity)`

## Architecture & Agent Notes

The game is local single-player; progress uses localStorage. Keep interface claims accurate and preserve font licenses. All audio effects and instruments must use procedural Web Audio API synthesis ($0 infrastructure, zero external MP3 assets). For library, framework, SDK, API, CLI, or cloud-service documentation, use Context7: resolve the library ID first, then query each relevant concept separately. Skip Context7 for general programming, business logic, refactoring, and code review.
