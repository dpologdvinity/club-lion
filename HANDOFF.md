# Handoff (2026-10-15)

Read `AGENTS.md` for project rules, commands, and the code map.

## Current state

- All original worktrees landed in table order: doll-avatar-5, world-collision, picture-nav-2, pets-species, rooms-new, room-music, games-puzzle, test-hygiene.
- Added aquarium/rink rooms, pet species, Picture Puzzle, Balloon Parade, picture navigation, collision-aware movement, and room music.
- Coins are gone: no wallet, prices or payouts. Shop, closet and salon are free; games count plays, bests, stamps and stars. Saves that still contain `coins` load and drop it. Premium salon unlock ids in old `owned` lists are dropped on load because every option is free.
- Unit tests use native recursive discovery; new `src/**/*.test.ts` files need no package-script edits. Latest local verification passed 776 tests, typecheck, formatting, and production build.
- Leave owner files alone: `.github/agents/`, `.github/hooks/`, `gallery/rooms-current/room-default.png`.

## Browser integration follow-up

- Browser checks run on GitHub, per the owner. Run selected files with `gh workflow run playwright.yml -f specs="tests/x.spec.ts tests/y.spec.ts"`; normal pushes still run all four shards and the offline-PWA test.
- Full run 38717162497 exposed 47 failures. Fixes cover mobile Map-sheet navigation, portal PIN/spawn behavior, focus restoration expectations, hidden phone headings, clock/axe interaction, moving balloon clicks, puzzle selection, Paw Steps timing, and camera-coordinate fixtures.
- Hoverboard particles now use pixel positions with pixel velocities, preventing exaggerated drift in wide rooms.
- Full run 38777758561 passed three browser shards; only stale phone map counts and a camera-frame timing assertion remained. Phone-layout run 38779101103 now passes verify, PWA, and all four browser shards.
- MouseEvent rounding in zoomed-out rooms required a 2-stage-pixel setup tolerance; obstacle point/segment assertions remain strict. Phone label geometry is checked atomically after layout settles.
- Baseline full run 38779506997 passed verify, all four browser shards, and PWA. Check the latest run after further changes; do not claim browser success from local verification alone.

- Mango Run is back (it was dropped from the arcade in 9692c47): toddler rules with no lives and an All done! button; card in `src/games/catalog.ts`, arcade hotspot `arcade-mango-run`, e2e in `tests/mango-run.spec.ts`.
- Lola's Kainan (`src/rooms/manifests/kainan.ts`, `KainanScenery.tsx`) adds eight object kinds to `RoomObject.tsx`, neighbor Lola, the rondalla room track and the Halo-Halo game (`src/utils/haloHalo.ts`, `HaloHalo.tsx`, `completeHaloHalo`, stamp `halo_halo_chef`); e2e in `tests/halo-halo.spec.ts` and the living-rooms row.
- Carry-anywhere props: `RoomManifest.props`, `RoomProps.tsx` (+ `roomProps.css`), pure rules in `src/utils/roomProps.ts`; e2e `tests/room-props.spec.ts`. Next idea: persist spots in the save and let the doll hold a prop.

## Living neighborhood rooms

- Savanna Square is now a manifest room (`src/rooms/manifests/savannaSquare.ts`, `SavannaSquareScenery.tsx`, `SquareFun.tsx`) with multi-step objects (`object.steps`, `reaction.messages`), picture doors (`actionData.travel`), flower notes (`actionData.note`, `tune`), a weather toy and a daily butterfly hunt. Rooms that lead back to the square use stage-unit arrival points (660, 639). Spec and plan live in `docs/superpowers/`.

- Sunset Beach (sandcastle, seashell, beach ball), Splash Oasis (duck, sprinkler), Scout HQ (periscope), Canyon Rapids (kayak), Wonder Park Entrance (balloons), Coastal Pier (fishing, seagull), Lion Speedway (flag), Mt. Mist (campfire, alphorn), Pet Paradise (yarn, treat jar), Carnival Midway (popcorn), Lion Aquarium (jellyfish, treasure) and Snowflake Rink (snowman, snow globe) have living objects. Water, café, arcade and den now use independent illustrated SVG scenery, CSS ambient motion and manifest-owned stage objects. Visible actions include frog hops, tea pouring, oven pastries, surprise balls, light colors, hearth/lamp switches and storybook pages. Saved den decorations, greetings, games, shop and leaderboard remain connected.
- Add future objects, neighbors and destinations through each room manifest; add new object drawings in `RoomObject.tsx` only when existing kinds do not fit. `DESIGN.md` documents the extension path. Room reactions walk the doll/camera toward their object so phone users see the result.
- Targeted browser coverage lives in `tests/living-rooms.spec.ts`; uses GitHub Actions. Local room verification passes 791 unit tests plus typecheck, format and build. Check the branch's latest GitHub run before claiming browser success.

## Remaining follow-ups

- Reference doll refinement: tapered face, lifted eyes with finer liner, softer skin highlights, selected-color hair gradients, longer half-up layers, cascading wave highlights, and woven topknot. Existing saves and wardrobe options preserved. Visual resemblance still needs owner feedback.
- Doll accessory head transforms already share `RIG.head` / `RIG.headBoost`, with regression coverage in `avatarSvg.test.ts`. Visual resemblance to `gallery/avatars/` still needs owner feedback.
- Registry follow-up: arcade cards, progress labels, and derived game IDs are in `src/games/catalog.ts`. Room manifests own hotspot labels, icons, and typed game launch IDs; adding these no longer needs World UI tables. Automatic test discovery removes test-list conflicts. Stamp metadata is now separate in `src/stamps/catalog.ts`; unlock evaluation and compatible exports remain in `src/utils/stampDefinitions.ts`.
- Animal art, sounds, and touch dragging still need owner/real-iPad assessment. Playwright Chromium and WebKit do not replace real iPad Safari. BrowserStack was postponed.
- The age-category / Toca Boca-style redesign requires brainstorming with the owner before implementation.

- Cast debt: about 39 `as` casts remain in `src` (CLAUDE.md forbids them). Ten are copies of the `webkitAudioContext` lookup that `getAudioContextClass` in `src/utils/audioBus.ts` already owns; consolidate those first.

## Owner preferences and boundaries

- Prioritize development speed; keep updates and tool output short. Integrate one branch at a time and avoid repeated exploration.
- Merging and pushing `master` is authorized. Do not enable GitHub Pages or other public surfaces. `pages.yml` remains manual-only until the owner enables Pages.
- `.nvmrc` selects Node 24; CI follows it.
- Daydaze is a separate repo at `~/git/daydaze`; do not touch it from this task.
