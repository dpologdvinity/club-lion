# Club Lion

Browser game for kids 3+ (the owner's ~3-year-old sister, plus the owner, 20). Plays on iPad, phone and laptop in Safari/Chrome as an installable PWA. No App Store. Illustrated 2D SVG rooms, fashion-doll avatars (Y2K glam doll style, see `gallery/avatars/` references), rides, a kart race and mini games. Say "doll" in UI copy, identifiers and comments; never use the brand name. The age-category / Toca Boca-style redesign comes later; brainstorm with the owner before starting it.

Stack: React 19, TypeScript strict, Vite 8, Node 22+. Saves are localStorage. Design: `DESIGN.md`. Interaction rules: `UX-CONTRACT.md`. Current state and open work: `HANDOFF.md`.

## Commands

- `npm run verify`: unit tests, typecheck, Prettier check, build. Run before every commit that changes code.
- `npm test`: unit tests only (~5 s). New `src/**/*.test.ts` files are discovered automatically.
- `scripts/e2e.sh tests/x.spec.ts --project=desktop`: targeted Playwright on a private port, 1 worker, 6 cores, low priority. Never run the whole suite locally: GitHub Actions runs `verify`, the full e2e (4 shards) and the PWA test on every push and PR to `master` (`.github/workflows/playwright.yml`). Check results with `gh run list` / `gh run view`.
- GitHub browser checks: `gh workflow run playwright.yml -f specs="tests/x.spec.ts tests/y.spec.ts"` runs selected files; omit `specs` for the full suite.
- `npm run test:pwa`: offline-install test (needs a production build).
- `npm run format`: Prettier.

## Where things live

- `src/App.tsx` shell; `src/components/World.tsx` room view, movement, and special hotspot behavior (`hotspot()`). Labels, icons, and arcade launch IDs belong to the room manifests.
- `src/game.ts` save, rewards (`completeX`), `restorePlayer` validation. `src/usePlayer.ts` persistence.
- `src/rooms/manifests/*.ts` per-room stage, hotspots, portals, walkable area; `src/rooms/registry.ts`.
- `src/components/*Scenery.tsx` SVG rooms; table `ROOM_SCENERY` in `RoomScenery.tsx`; motion classes `sm-*` in `sceneryMotion.css`.
- `src/components/avatar/*` + `Avatar.tsx` doll avatar; look fields in `src/types/world.ts`.
- `src/games/catalog.ts`: arcade cards, progress labels, and `GameId`; `src/components/GamesPanel.tsx` renders the games. New game: pure logic in `src/utils/`, component, `completeX` in `game.ts`, card in the catalogue, stamp metadata in `src/stamps/catalog.ts`, room hotspot with `label`, `icon`, and typed `actionData.gameId`, unit test + `tests/<game>.spec.ts`.
- `src/stamps/catalog.ts`: stamp metadata; `src/utils/stampDefinitions.ts`: unlock checks and eligibility, with compatible re-exports.
- Tests: `src/**/*.test.ts` (node:test) and `tests/*.spec.ts` (Playwright desktop 1440x1000, mobile 390x844).

## Code rules

- No `any`, no `as` casts (except `as const`), no global `JSX` namespace (`import type { JSX } from "react"`).
- Validate persisted data on load. New save fields are optional; old saves must still load (add a unit test). Rewards pay once (guard double taps and re-renders in the pure function, not only the component).
- Scenery motion is CSS (`sm-*`), not React state. Audio is procedural Web Audio only (shared bus `src/utils/audioBus.ts`); no audio files.
- Kid UX: touch targets 48 px or more, pictures before words, no fail states, big icon buttons, `prefers-reduced-motion` respected, axe-clean.
- Match surrounding code. Conventional Commits.

## Parallel work

- One task per worktree: `git worktree add .worktrees/<name> -b feat/<name> master`. Never commit to master from a worktree.
- At most 6 of 12 CPU cores: `taskset -c 0-5 nice -n 10` for heavy commands, Playwright 1-2 workers (`scripts/e2e.sh` does this).
- Finish a task as ONE commit (`git reset --soft $(git merge-base HEAD master)` then commit), `npm run verify` green. Merge each branch as soon as its own checks pass (do not wait; waiting makes branches drift and conflict). Integrate one branch at a time: rebase on master, resolve conflicts (usually `package.json` test script, `World.tsx`, `GamesPanel.tsx`, `game.ts`, `stampDefinitions.ts`, `styles.css`: keep both sides), verify, targeted e2e, `git merge --ff-only`, push, remove worktree and branch.
- Clean up: stop dev servers, delete `.tmp-*` files and temp folders. Do not use `pkill -f` or `ps | grep` patterns that match your own shell.
- The owner allows merging and pushing `master`. Do not enable GitHub Pages or other public surfaces from an agent session; ask the owner.
