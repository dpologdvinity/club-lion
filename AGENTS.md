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

### Mandatory Model Attribution Standards
Every git commit across all branches and worktrees MUST end with the `Implementer` trailer:
```text
<type>(<scope>): <summary>

Implementer: <model> (<agent>)
```
*Standard agent/model identifiers:*
- `gpt-6.1-sol (codex)`
- `claude-sonnet-5 (claude code)`
- `gemini-3.8-flash (antigravity)`

On branch merges, pull requests, and milestone integrations, include the complete multi-agent trailer:
```text
merge: <summary>

Implementer: <model> (<agent>)
Reviewer: <model> (<agent>)
Assigner: <model> (<agent>)
```

## Task Tracking & Worktree Workflow

All multi-agent tasks and phase milestones are tracked in `docs/TASK-TRACKER.md`. When developing multi-step features:
1. Create an isolated worktree: `git worktree add .worktrees/<task-name> -b feat/<task-name>`.
2. Work inside `.worktrees/<task-name>`.
3. Verify changes with `npm run verify` and `npm run test:e2e`.
4. Commit with the appropriate `Implementer:` trailer.
5. Merge into target branch with the merge trailer, then clean up:
   `git worktree remove --force .worktrees/<task-name>` and `git branch -d feat/<task-name>`.
6. Update `docs/TASK-TRACKER.md` on `master` to record completed tasks.

## Architecture & Agent Notes

The game is local single-player; progress uses localStorage. Keep interface claims accurate and preserve font licenses. All audio effects and instruments must use procedural Web Audio API synthesis ($0 infrastructure, zero external MP3 assets). For library, framework, SDK, API, CLI, or cloud-service documentation, use Context7: resolve the library ID first, then query each relevant concept separately. Skip Context7 for general programming, business logic, refactoring, and code review.
