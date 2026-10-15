# Club Lion

Browser game for kids 3+ (the owner's ~3-year-old sister, plus the owner, 20). Plays on iPad, phone and laptop in Safari/Chrome as an installable PWA. No App Store. Illustrated 2D SVG rooms, Bratz-style fashion-doll avatars, rides, a kart race and mini games. Say "doll" in UI copy, identifiers and comments; never use the brand name. The age-category / Toca Boca-style redesign is planned for later; do not start it without a brainstorm with the owner.

Stack: React 19, TypeScript strict, Vite 8, Node 22+. Save data is localStorage. Details and gotchas: `docs/AGENT-GUIDE.md` (read it before multi-file work). Design: `DESIGN.md`. Interaction rules: `UX-CONTRACT.md`. Keep interface claims accurate and preserve font licenses in `public/fonts/`.

## Commands

- `npm run verify`: unit tests + typecheck + Prettier check + build. Run before every commit that changes code.
- `npm test`: unit tests only (~5 s). Add new `*.test.ts` files to the `test` script in `package.json`.
- `scripts/e2e.sh tests/x.spec.ts --project=desktop`: targeted Playwright on a private port, 1 worker, 6 cores, low priority. Never run the whole suite on a busy machine.
- `npm run test:pwa`: offline-install test (needs a production build).
- `npm run format`: Prettier. Screenshots go in `gallery/`; do not Read images you do not need (they cost tokens).

## Code rules

- No `any`, no `as` casts (except `as const`), no global `JSX` namespace (`import type { JSX } from "react"`). Validate persisted data on load; new save fields are optional and old saves must still load (add a unit test).
- Logic in pure `src/utils/*.ts` with tests; UI in `src/components/`; saves and rewards in `src/game.ts`. Rewards pay once (guard against double taps and re-renders).
- Room scenery: SVG in `src/components/<Room>Scenery.tsx`, registered in `ROOM_SCENERY` (`RoomScenery.tsx`). Animate with the `sm-*` CSS classes (`sceneryMotion.css`), not React state. `clock: true` only if motion must follow game logic. Wrap static layers in `memo`.
- Audio is procedural Web Audio only (shared bus in `src/utils/audioBus.ts`); no audio files.
- Kid UX: touch targets 48 px or more, pictures before words, no fail states, big icon buttons, `prefers-reduced-motion` respected, axe-clean.
- Library or framework docs: use Context7 (resolve the library id first). Skip it for general programming and refactors.
- Match the surrounding code; Conventional Commits; end commits with `Implementer: <model> (claude code)`.

## Working with parallel agents

- One task per git worktree: `git worktree add .worktrees/<name> -b feat/<name> master`. Never commit to master from a worktree.
- CPU limit: at most 6 of 12 cores total. Prefix heavy commands with `taskset -c 0-5 nice -n 10`; Playwright 1-2 workers.
- Finish by squashing to ONE commit (`git reset --soft $(git merge-base HEAD master)`), `npm run verify`, then report the sha. The lead rebases, re-verifies, fast-forwards master and pushes. Do not push.
- Clean up when done: stop dev servers, delete `.tmp-*` files and your tmp folder, remove merged worktrees and branches.
- Never use `pkill -f` or `ps | grep` patterns that match your own shell command line.
- The owner has granted full authority to merge and push `master` in this repo. Actions that create public surfaces (for example enabling GitHub Pages) can be blocked by the permission system; do not work around a block, tell the owner.

<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
<!-- caveman-end -->
