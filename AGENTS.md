# Repository Guidelines

## Project Structure & Module Organization

Club Lion is a React, TypeScript, and Vite browser game. `src/App.tsx` composes the interface; `src/components/` contains reusable UI and minigames. Keep progression, purchases, and save validation in `src/game.ts`, persistence in `src/usePlayer.ts`, and shared styles in `src/styles.css`.

Unit tests live in `src/game.test.ts`; browser tests live in `tests/world.spec.ts`. Artwork and licensed fonts belong in `public/assets/` and `public/fonts/`. Consult `DESIGN.md` for visual decisions and `UX-CONTRACT.md` for interaction requirements.

## Build, Test, and Development Commands

Use Node.js 22.18 or newer. Install dependencies with `npm ci`.

- `npm run dev`: start the development server at `http://localhost:5173`.
- `npm run typecheck`: check strict TypeScript types.
- `npm test`: run game-state tests with Node's built-in test runner.
- `npm run test:e2e`: run Playwright Chromium tests at desktop and mobile sizes; install the browser first with `npx playwright install chromium`.
- `npm run format:check` / `npm run format`: check or apply Prettier formatting to configured files.
- `npm run build`: typecheck and generate production files in `dist/`.
- `npm run preview`: serve the production build locally.

## Coding Style & Naming Conventions

Follow Prettier defaults: two-space indentation, double quotes, and semicolons. Use PascalCase component filenames, camelCase functions, `use`-prefixed hooks, and kebab-case CSS classes. Reuse shared components, design tokens, and domain helpers. Keep TypeScript strict; validate persisted data before using it.

## Testing Guidelines

Name unit tests `*.test.ts` and browser tests `*.spec.ts`. Protect coin balances, one-time rewards, purchase ownership, and save round trips. Exercise changed interactions, keyboard navigation, dialog focus, persistence, and mobile layouts; browser tests also use axe accessibility checks. No numeric coverage threshold is configured. Run relevant tests, typechecking, formatting, and the build before submitting changes.

## Commit & Pull Request Guidelines

Use focused Conventional Commits, matching history: `feat: add illustrated savanna` or `fix: restore dialog focus`. Commit meaningful increments often. PRs should explain the resulting behavior, list validation results, link relevant issues, and include desktop/mobile screenshots for visual changes. Highlight save-format changes. Exclude secrets, `node_modules/`, and generated build/test artifacts.

## Architecture & Agent Notes

The game is local single-player; progress uses localStorage. Keep interface claims accurate and preserve font licenses. For library, framework, SDK, API, CLI, or cloud-service documentation, use Context7: resolve the library ID first, then query each relevant concept separately. Skip Context7 for general programming, business logic, refactoring, and code review.
