# Club Lion interaction contract

The user requested a Club Penguin-like website using lions. The first complete slice is a local, single-player game with an explorable savanna, scripted neighbors, character styling, an in-game coin shop, and an arcade of three mini-games: Memory Safari, Mango Run, and Bee Stop. [DESIGN.md](DESIGN.md) owns visual decisions. [src/game.ts](src/game.ts) owns progression rules. [src/beeStop.ts](src/beeStop.ts) owns Bee Stop scoring.

## Canonical UI map

| Capability | Canonical owner                         | Behavior                                                                                       | Verification              |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------- |
| Dialog     | src/components/Dialog.tsx               | Native showModal, named title, inert background, Escape, focus restoration, internal scrolling | tests/world.spec.ts       |
| Form       | src/components/Panels.tsx and World.tsx | Named fields; noValidate; explicit name error and focus; bounded local chat                    | tests/world.spec.ts       |
| Scrollbar  | src/styles.css                          | Global tokenized visible scrollbar; system colors under forced colors                          | Browser layout inspection |
| Toast      | src/App.tsx                             | One stable live status region, one cleared timer                                               | tests/world.spec.ts       |
| Progress   | src/game.ts                             | Validated versioned save; guarded purchases and one-time adventure rewards                     | src/game.test.ts          |
| Arcade     | src/components/GamesPanel.tsx           | Three named games; the panel owns selection and hands rewards back to src/game.ts              | tests/world.spec.ts       |
| Bee Stop   | src/beeStop.ts                          | Pure round, band, sweep, and payout rules with no React or DOM dependency                      | src/beeStop.test.ts       |

## Flows and invariants

- Clicking the world or using arrow/WASD keys while its button is focused moves the lion within the foreground. Movement never captures keys in chat or modal inputs.
- Map choices, destination previews, and My den navigate to the same place and record the visit. Navigation is immediate and reversible.
- Neighbors are scripted game characters. Greeting the same lion twice cannot inflate adventure progress. Chat and emotes stay on the current screen and are not transmitted or stored.
- Style edits use a preview draft. Save requires a nonblank name of at most 16 characters and applies the chosen color and owned accessory. Closing the dialog discards the draft. This is a small, reversible customization flow, so cancellation does not need a confirmation.
- A new lion starts with 250 coins and the forest scarf. Shop purchases atomically deduct the fixed catalog price once, enforce ownership and sufficient balance, and immediately equip the accessory or place the item in the den. These are fictional game coins with no real-money checkout.
- Each of the three starter adventures awards 50 coins once. The neighborhood adventure requires 3 distinct greetings; the game adventure requires a completed game; the home adventure requires a den visit. There are no daily resets in this slice.
- Memory Safari has 6 shuffled pairs, no time limit, and a move counter. Card pairs lock while resolving. Finishing awards 60 coins once for that game. Closing an incomplete game awards no coins; replay starts a fresh board. Pending timers are canceled on unmount.
- Mango Run steers from held arrow or WASD keys and from the on-screen pad shown on coarse-pointer devices. A direction stays active until it is released, and losing page focus or hiding the tab releases every direction. Pausing freezes the trail in place, resuming continues it, Escape resumes a paused run instead of closing the game, and every obstacle pattern leaves a full lane open. Escape timing includes the lion’s hitbox, a reaction margin, and the actual movement speed in reduced-motion mode; waves leave time to cross the trail after the previous wall clears. Rocks occupy entire blocked lanes, and safe and risky mango trails alternate. Steering stays in the left half of the trail to keep incoming hazards visible. Completing a run pays its score once and persists the personal best.
- The arcade lists all three games by name with the Bee Stop best score, and hands each result to `src/game.ts`. Selecting a game is the only way into it; closing the dialog discards the choice along with any unfinished run.
- Bee Stop is 10 rounds with no fail state, so every round is always scored and every completed run counts as a played game. The bee sweeps faster and its scoring bands narrow each round, and the flower spot is a fixed sequence so skill carries between runs instead of luck deciding a round. Bands are perfect 100, good 60, okay 30, miss 0, and the payout is 120, 90, 60, 35, or 15 coins by total score. The best score only ever rises. The flower bar is a single button that accepts a pointer, Space, or Enter, and ignores held-key repeats so one press scores one round. The bee position is written to a transform during the frame loop, and the animation frame is canceled on unmount.
- Under reduced motion the bee hops between a fixed number of visible steps per second instead of gliding. Scoring and round length are identical, and the petal bloom records one petal per round rather than only perfect stops, so a run without perfects still shows progress.
- Fruit Catch is a 30-second keyboard and touch game. Catching ripe fruit scores 10 points and earns 2 coins; catching rotten fruit costs one of three hearts. Its best score persists, while older saves default it to zero. All games returns to the shared picker and discards an unfinished run.
- Non-sensitive progress is saved in versioned localStorage. Invalid saves recover to a fresh player. `beeStopBest` is an additive field, so a save written before Bee Stop existed restores with a best of 0 instead of being rejected, and a tampered value is capped at the maximum score. Storage failures show a persistent warning while leaving the game usable. Other browser tabs receive saved changes through the storage event; simultaneous edits follow browser last-write-wins behavior.
- Local-only, non-shareable room and dialog state remains in React. No account, network request, retention policy, billing workflow, or private data is required.

## Accessibility and verification

English interface, native semantics, keyboard movement, named controls, field associations, visible focus, accessible modal behavior, reduced motion, and responsive document flow are baseline requirements. Browser tests exercise desktop and mobile, success and validation paths, lost storage, rewards, persistence, all three mini-games, and automated WCAG AA scans.

The Browser plugin is unavailable in this session. Verification uses Playwright Chromium against the Vite server, with temporary screenshots and reports outside source control.
