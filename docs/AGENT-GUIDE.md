# Agent guide

Read this before multi-file work. The short rules are in `AGENTS.md` (also `CLAUDE.md`).

## Where things live

- `src/App.tsx`: shell (header, panels, dialogs). `src/components/World.tsx`: room view, avatar movement, hotspots (`hotspot()`, `hotspotLabels`).
- `src/game.ts` (+ `game.test.ts`): player save, rewards (`completeX` functions), restore/validation. `src/usePlayer.ts`: persistence.
- `src/rooms/manifests/*.ts`: per-room stage size, hotspots, portals, walkable area. `src/rooms/registry.ts`: room list. Place ids are in `PlaceId`.
- `src/components/*Scenery.tsx`: illustrated SVG rooms; lookup table `ROOM_SCENERY` in `RoomScenery.tsx`; motion classes in `sceneryMotion.css`.
- `src/components/avatar/*` + `Avatar.tsx`: doll avatar layers (face, hair, outfits, accessories). Look fields live in `AvatarLook` / `validateAvatarLook` (`src/types/world.ts`). Keep default look under ~300 SVG elements.
- `src/components/GamesPanel.tsx`: arcade list and `GameId` union. New game: add the id, a card, the component, an `onComplete…` prop through `App.tsx`, a pure module in `src/utils/`, tests, and a room hotspot.
- Rides: `ParkRide*.tsx` (amusement), `WaterRide.tsx` + `waterRides/`. Kart race: `KartRace*.tsx`, `src/utils/kartRace.ts`.
- `src/utils/stampDefinitions.ts`: stamps and one-time coin rewards.
- PWA: `src/pwa/precache.ts`, plugin in `vite.config.ts`, `public/manifest.webmanifest`. GitHub Pages workflow: `.github/workflows/pages.yml` (needs Pages enabled in repo settings by the owner).
- Tests: `src/**/*.test.ts` (node:test), `tests/*.spec.ts` (Playwright, desktop 1440x1000 and mobile 390x844). Header test helpers: `tests/header.ts`.

## Test reality

- On a busy machine, 60 s Playwright timeouts are common. Rerun a suspect alone with `scripts/e2e.sh <spec>:<line> --project=<p>` before blaming your change.
- Known to fail on plain master (not regressions): `stamp-book:5/58/98` (stale stamp tab order and counts), `friends:107`, `spy:30/115`, `world-phase2:197/308/347/431/489`, `phase3:75/125` (instruments key highlight, fishing button detach), `dj-beat:12/77` (axe samples the fading MISS label), `actions-ballistics:98`, `world:356` (Paw Steps timing). If you touch one of these areas, fix the test properly rather than skipping it.
- Playwright WebKit is not iPad Safari. Real-device behavior (audio unlock, PWA install, touch) is untested; flag anything that depends on it.

## Merge protocol (lead)

1. Rebase the worktree branch on `master`. If the branch has several commits and conflicts repeat, squash first: `git reset --soft $(git merge-base HEAD master)` and recommit, then rebase.
2. Typical conflicts: `package.json` test script (union the file lists), `World.tsx` props and hotspots, `GamesPanel.tsx`, `game.ts` imports/fields, `stampDefinitions.ts`, `styles.css`. Additive conflicts: keep both sides, then fix the join (commas, `||`, closing braces). For CSS, take master's file and append the branch's added lines.
3. `npm run verify`, then targeted e2e for the touched areas, then `git merge --ff-only`, `git push origin master`, remove the worktree and branch, delete tmp files.

## Gotchas

- Playwright reports "port already used": a stale dev server from an earlier run holds the port. `scripts/e2e.sh` picks a random port; otherwise find the owner with `ss -ltnp | grep :<port>` and kill that pid.
- Shared job tmp folders get clobbered by other agents; use your own subfolder.
- Editor diagnostics about `--sm-*` custom properties are stale; `npm run typecheck` is the truth.
- `ROOM_SCENERY` motion: every `seconds`-driven animation costs React renders. Prefer CSS.
- Do not enable GitHub Pages or other public surfaces from an agent session; ask the owner.
