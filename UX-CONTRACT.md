# Club Lion interaction contract

The user requested a Club Penguin-like website using lions. The first complete slice is a local, single-player game with an explorable savanna, scripted neighbors, character styling, an in-game coin shop, Memory Safari, Mango Run, and Fruit Catch. [DESIGN.md](DESIGN.md) owns visual decisions. [src/game.ts](src/game.ts) owns progression rules.

## Canonical UI map

| Capability | Canonical owner                         | Behavior                                                                                       | Verification              |
| ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------- |
| Dialog     | src/components/Dialog.tsx               | Native showModal, named title, inert background, Escape, focus restoration, internal scrolling | tests/world.spec.ts       |
| Form       | src/components/Panels.tsx and World.tsx | Named fields; noValidate; explicit name error and focus; bounded local chat                    | tests/world.spec.ts       |
| Scrollbar  | src/styles.css                          | Global tokenized visible scrollbar; system colors under forced colors                          | Browser layout inspection |
| Toast      | src/App.tsx                             | One stable live status region, one cleared timer                                               | tests/world.spec.ts       |
| Progress   | src/game.ts                             | Validated versioned save; guarded purchases and one-time adventure rewards                     | src/game.test.ts          |

## Flows and invariants

- Clicking the world or using arrow/WASD keys while its button is focused moves the lion within the foreground. Movement never captures keys in chat or modal inputs.
- Map choices, destination previews, and My den navigate to the same place and record the visit. Navigation is immediate and reversible.
- Neighbors are scripted game characters. Greeting the same lion twice cannot inflate adventure progress. Chat and emotes stay on the current screen and are not transmitted or stored.
- Style edits use a preview draft. Save requires a nonblank name of at most 16 characters and applies the chosen color and owned accessory. Closing the dialog discards the draft. This is a small, reversible customization flow, so cancellation does not need a confirmation.
- A new lion starts with 250 coins and the forest scarf. Shop purchases atomically deduct the fixed catalog price once, enforce ownership and sufficient balance, and immediately equip the accessory or place the item in the den. These are fictional game coins with no real-money checkout.
- Each of the three starter adventures awards 50 coins once. The neighborhood adventure requires 3 distinct greetings; the game adventure requires a completed game; the home adventure requires a den visit. There are no daily resets in this slice.
- Memory Safari has 6 shuffled pairs, no time limit, and a move counter. Card pairs lock while resolving. Finishing awards 60 coins once for that game. Closing an incomplete game awards no coins; replay starts a fresh board. Pending timers are canceled on unmount.
- Mango Run steers from held arrow or WASD keys and from the on-screen pad shown on coarse-pointer devices. A direction stays active until it is released, and losing page focus or hiding the tab releases every direction. Pausing freezes the trail in place, resuming continues it, Escape resumes a paused run instead of closing the game, and every obstacle pattern leaves a full lane open. Escape timing includes the lion’s hitbox, a reaction margin, and the actual movement speed in reduced-motion mode; waves leave time to cross the trail after the previous wall clears. Rocks occupy entire blocked lanes, and safe and risky mango trails alternate. Steering stays in the left half of the trail to keep incoming hazards visible. Completing a run pays its score once and persists the personal best.
- The arcade offers Fruit Catch as a 30-second keyboard and touch game. Catching ripe fruit scores 10 points and earns 2 coins; catching rotten fruit costs one of three hearts. The best score persists, while older saves default it to zero.
- Non-sensitive progress is saved in versioned localStorage. Invalid saves recover to a fresh player. Storage failures show a persistent warning while leaving the game usable. Other browser tabs receive saved changes through the storage event; simultaneous edits follow browser last-write-wins behavior.
- Local-only, non-shareable room and dialog state remains in React. No account, network request, retention policy, billing workflow, or private data is required.

## Accessibility and verification

English interface, native semantics, keyboard movement, named controls, field associations, visible focus, accessible modal behavior, reduced motion, and responsive document flow are baseline requirements. Browser tests exercise desktop and mobile, success and validation paths, lost storage, rewards, persistence, a completed mini-game, and automated WCAG AA scans.

The Browser plugin is unavailable in this session. Verification uses Playwright Chromium against the Vite server, with temporary screenshots and reports outside source control.
