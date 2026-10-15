# Handoff (2026-10-15, written by the Claude Code lead session)

Read `AGENTS.md` first (rules, commands, file map). This file is the current state. Delete or rewrite it as work lands.

## Owner and intent

- Owner: Kaitlyn (they/them not stated; use "the owner"). Building Club Lion for their ~3-year-old sister (also fun for them, 20). iPad/phone/laptop, Safari/Chrome PWA. No App Store.
- Owner has given full authority to merge and push `master`. Do not ask permission for that. Do NOT enable GitHub Pages from an agent (blocked by the permission system): the owner turns it on in repo Settings, Pages, Source: GitHub Actions; `.github/workflows/pages.yml` is ready.
- Owner wants (in order of recent emphasis): characters that really look like fashion dolls (reference images in `gallery/avatars/`), a more interactive world (solid fountains and props, reacting props), more games, rides, any pet, picture-first navigation for a non-reader, phone/iPad polish.
- The owner dislikes slow progress and heavy process. Keep updates short and ship small.

## Repo state

- `master` = `7a8b99b` pushed to `origin/master` (https://github.com/dpologdvinity/club-lion, public).
- Done and merged: 13 illustrated rooms + Lion Speedway (kart race), installable offline PWA, smooth CSS scenery motion, phone/iPad layout, 5 amusement rides, 4 water rides, doll avatars rounds 1-4, Bubble Pop, Coloring Book, Mango Bakery, Hide & Seek, Animal Orchestra, Shape Sorter, Picture Puzzle, Balloon Parade, picture-first navigation, aquarium/rink, pet species, world collision, test hygiene, Canyon Rapids repaint, save fixes. 774 unit tests.
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

## Process changes (owner request, 2026-10-15)

- Full browser suite runs on GitHub, not locally: `.github/workflows/playwright.yml` = `verify`, 4 e2e shards, PWA test, on every push/PR to `master`. Locally run only `npm run verify` and targeted `scripts/e2e.sh`. Watch with `gh run list`, `gh run view <id> --log-failed`.
- Merge each branch as soon as its own checks pass. Do not batch. Keep at most about 4 parallel agents (8 overloaded the 12-core machine to load 50).
- `pages.yml` is manual-only until the owner enables Pages; then restore its `push` trigger.
- Room music is merged (`roomMusic.ts`, `RoomMusic.tsx`); follows the World speaker toggle.
- Merged and pushed in order: world collision, picture navigation, pet species, aquarium/rink rooms, Puzzle + Balloon Parade, and test hygiene. Reward follow-up now caps Shape Sorter at its three rounds and rejects Animal Orchestra coin overflow.

## Next steps for Codex (in order)

1. Completed: all listed worktrees were verified and integrated in table order; GitHub Actions runs the browser checks.
2. Optional: reduce merge conflicts by splitting shared game registries (test list, game cards, hotspots, stamps); this is deferred because it is structural work with no immediate product need.
3. Optional: open one PR per branch and `gh pr merge --auto --squash` so CI gates the merge.
4. Done: `completeShapeSorterRound` stops paying after all rounds; `completeAnimalBand` rejects coin overflow. Unit tests cover both.
5. Doll avatar: make it match `gallery/avatars/*.jpg`; fix accessory anchors (not yet done).
6. The shell hook that rewrites Bash calls blocked Claude agents (owner config); not an issue for Codex.

## Known test baseline (fail on plain master, likely not your regression)

`stamp-book:5/58/98`, `friends:107`, `spy:30/115`, `world-phase2:197/308/347/431/489`, `phase3:75/125`, `dj-beat:12/77` (axe samples a fading label), `actions-ballistics:98`, `world:356`. The `test-hygiene` branch fixes many of these; rerun a suspect alone with `scripts/e2e.sh <spec>:<line> --project=<p>` before blaming a change. Under machine load 60 s timeouts are common.

## Known issues and follow-ups

- Avatar still does not match the references; accessory placement bug (above).
- Puzzle and Balloon Parade are implemented; other avatar visual-match/accessory-anchor work remains.
- GitHub Actions for the latest push is pending; check `gh run list` / `gh run view` for browser results.
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
