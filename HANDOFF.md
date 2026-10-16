# Handoff (2026-10-15)

Read `AGENTS.md` for project rules, commands, and the code map.

## Current state

- All original worktrees landed in table order: doll-avatar-5, world-collision, picture-nav-2, pets-species, rooms-new, room-music, games-puzzle, test-hygiene.
- Added aquarium/rink rooms, pet species, Picture Puzzle, Balloon Parade, picture navigation, collision-aware movement, and room music.
- Reward follow-ups reject previously paid Shape Sorter rounds, Animal Orchestra coin overflow, and unsafe shared stamp bonuses.
- Unit tests use native recursive discovery; new `src/**/*.test.ts` files need no package-script edits. Latest local verification passed 776 tests, typecheck, formatting, and production build.
- Leave owner files alone: `.github/agents/`, `.github/hooks/`, `gallery/rooms-current/room-default.png`.

## Browser integration follow-up

- Browser checks run on GitHub, per the owner. Run selected files with `gh workflow run playwright.yml -f specs="tests/x.spec.ts tests/y.spec.ts"`; normal pushes still run all four shards and the offline-PWA test.
- Full run 38717162497 exposed 47 failures. Fixes cover mobile Map-sheet navigation, portal PIN/spawn behavior, focus restoration expectations, hidden phone headings, clock/axe interaction, moving balloon clicks, puzzle selection, Paw Steps timing, and camera-coordinate fixtures.
- Hoverboard particles now use pixel positions with pixel velocities, preventing exaggerated drift in wide rooms.
- Full run 38777758561 passed three browser shards; only stale phone map counts and a camera-frame timing assertion remained. Phone-layout run 38779101103 now passes verify, PWA, and all four browser shards.
- MouseEvent rounding in zoomed-out rooms required a 2-stage-pixel setup tolerance; obstacle point/segment assertions remain strict. Phone label geometry is checked atomically after layout settles.
- Baseline full run 38779506997 passed verify, all four browser shards, and PWA. Check the latest run after further changes; do not claim browser success from local verification alone.

## Remaining follow-ups

- Reference doll refinement: tapered face, lifted eyes with finer liner, softer skin highlights, selected-color hair gradients, longer half-up layers, cascading wave highlights, and woven topknot. Existing saves and wardrobe options preserved. Visual resemblance still needs owner feedback.
- Doll accessory head transforms already share `RIG.head` / `RIG.headBoost`, with regression coverage in `avatarSvg.test.ts`. Visual resemblance to `gallery/avatars/` still needs owner feedback.
- Registry follow-up: arcade cards, progress labels, and derived game IDs are in `src/games/catalog.ts`. Room manifests own hotspot labels, icons, and typed game launch IDs; adding these no longer needs World UI tables. Automatic test discovery removes test-list conflicts. Stamp metadata is now separate in `src/stamps/catalog.ts`; unlock evaluation and compatible exports remain in `src/utils/stampDefinitions.ts`.
- Animal art, sounds, and touch dragging still need owner/real-iPad assessment. Playwright Chromium and WebKit do not replace real iPad Safari. BrowserStack was postponed.
- The age-category / Toca Boca-style redesign requires brainstorming with the owner before implementation.

## Owner preferences and boundaries

- Prioritize development speed; keep updates and tool output short. Integrate one branch at a time and avoid repeated exploration.
- Merging and pushing `master` is authorized. Do not enable GitHub Pages or other public surfaces. `pages.yml` remains manual-only until the owner enables Pages.
- `.nvmrc` selects Node 24; CI follows it.
- Daydaze is a separate repo at `~/git/daydaze`; do not touch it from this task.
