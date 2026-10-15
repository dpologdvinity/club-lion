# Handoff (2026-10-15, written by the Claude Code lead session)

Read `AGENTS.md` first (rules, commands, file map). This file is the current state. Delete or rewrite it as work lands.

## Owner and intent

- Owner: Kaitlyn (they/them not stated; use "the owner"). Building Club Lion for their ~3-year-old sister (also fun for them, 20). iPad/phone/laptop, Safari/Chrome PWA. No App Store.
- Owner has given full authority to merge and push `master`. Do not ask permission for that. Do NOT enable GitHub Pages from an agent (blocked by the permission system): the owner turns it on in repo Settings, Pages, Source: GitHub Actions; `.github/workflows/pages.yml` is ready.
- Owner wants (in order of recent emphasis): characters that really look like fashion dolls (reference images in `gallery/avatars/`), a more interactive world (solid fountains and props, reacting props), more games, rides, any pet, picture-first navigation for a non-reader, phone/iPad polish.
- The owner dislikes slow progress and heavy process. Keep updates short and ship small.

## Repo state

- `master` = `af54356` pushed to `origin/master` (https://github.com/dpologdvinity/club-lion, public).
- Done and merged: 13 illustrated rooms + Lion Speedway (kart race), installable offline PWA, smooth CSS scenery motion, phone/iPad layout, 5 amusement rides, 4 water rides, doll avatars rounds 1-4, Bubble Pop, Coloring Book, Mango Bakery, Hide & Seek, Animal Orchestra, Shape Sorter, room hotspots for games, picture-first room tiles, Canyon Rapids repaint, save fixes. ~673 unit tests.
- Uncommitted in the main checkout (leave alone): `.github/workflows/playwright.yml`, `gallery/rooms-current/room-default.png`.

## Unmerged work in `.worktrees/` (Claude agents were mid-flight; check each with `git -C .worktrees/<name> status` and `log master..HEAD`)

| Worktree / branch | Task                                                                                                                                                                                                                                                                                                        | State when written |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `doll-avatar-5`   | much stronger Bratz-doll look: bigger head, huge eyes and plump glossy lips, airbrushed shading, big glossy hair, in-world scale-up. ALSO bug: in-world accessories (earrings etc.) are misplaced; they must be placed from the same anchors/RIG as head/body, including `headBoost`; add anchor unit tests | uncommitted edits  |
| `world-collision` | solid obstacles in every room (fountain, rides, booths...), avatar and pet walk around them, bump reaction, 4 reacting props (fountain, benches, lamps, bushes), debug overlay `?debug=obstacles`                                                                                                           | uncommitted edits  |
| `picture-nav-2`   | phone Map button opens full-screen grid of all destinations                                                                                                                                                                                                                                                 | uncommitted edits  |
| `pets-species`    | choose pet species (lion, bunny, puppy, kitten, duckling, panda, unicorn, dragon)                                                                                                                                                                                                                           | uncommitted edits  |
| `rooms-new`       | two new rooms: Lion Aquarium, Snowflake Rink                                                                                                                                                                                                                                                                | uncommitted edits  |
| `room-music`      | procedural background music per room (Web Audio, quiet, after first gesture)                                                                                                                                                                                                                                | uncommitted edits  |
| `games-puzzle`    | Picture Puzzle (jigsaw) and Balloon Parade                                                                                                                                                                                                                                                                  | uncommitted edits  |
| `test-hygiene`    | fix e2e tests that fail on plain master; 1 commit                                                                                                                                                                                                                                                           | check              |

Editor diagnostics seen mid-flight (missing `./components/RoomMusic`, `PieceArt`, `balloonArch.ts`) are just unfinished agent files. Judge by `npm run verify` in each worktree.

## Known test baseline (fail on plain master, likely not your regression)

`stamp-book:5/58/98`, `friends:107`, `spy:30/115`, `world-phase2:197/308/347/431/489`, `phase3:75/125`, `dj-beat:12/77` (axe samples a fading label), `actions-ballistics:98`, `world:356`. The `test-hygiene` branch fixes many of these; rerun a suspect alone with `scripts/e2e.sh <spec>:<line> --project=<p>` before blaming a change. Under machine load 60 s timeouts are common.

## Known issues and follow-ups

- Avatar still does not match the references; accessory placement bug (above).
- `completeShapeSorterRound` pays every call (only the component guards double pay); `completeAnimalBand` lacks the coin-overflow guard. Harden both in `game.ts` with tests.
- Phone room bar: before `picture-nav-2` lands it is a sideways strip that cuts off buttons.
- Animal art (parrot reads as duck, monkey as dog), sounds, drag on touch: never checked by the owner or on a real iPad. Playwright WebKit is not iPad Safari.
- `.nvmrc` (24) and `.npmrc` (engine-strict) were added; CI uses Node 22 in `pages.yml` and lts in `playwright.yml`.
- Later: the age-category / Toca Boca-style redesign (brainstorm first), BrowserStack for real iPad testing (owner postponed).
- Daydaze (adult nightlife idea) is a separate repo, `~/git/daydaze`. Do not touch it from here.

## Integrating a worktree (what the lead did each time)

1. `git -C .worktrees/<name> rebase master`. If it conflicts repeatedly, squash first (`git reset --soft $(git merge-base HEAD master)`, recommit), then rebase.
2. `npm run verify` in the worktree; targeted `scripts/e2e.sh` for touched areas.
3. In the main checkout: `git merge --ff-only feat/<name>`, `git push origin master`, `git worktree remove --force .worktrees/<name>`, `git branch -d feat/<name>`.
4. Worktrees may contain a `node_modules` symlink to the main checkout; remove the symlink, never the target.

## Using Codex here

`codex` CLI is installed and logged in. Start it in `/home/kaitlyn/git/club-lion`; it reads `AGENTS.md`. Suggested first prompt: "Read AGENTS.md and HANDOFF.md. Finish the unmerged worktrees in order of the table, integrating one at a time per the protocol, then continue with the follow-ups." Use at most 6 CPU cores total.
