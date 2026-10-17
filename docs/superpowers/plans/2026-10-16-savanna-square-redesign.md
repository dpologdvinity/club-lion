# Savanna Square Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Savanna Square into a normal manifest room that keeps its painted look and becomes the most playful room: multi-step objects, picture doors, flower music, a weather toy and a daily butterfly hunt.

**Architecture:** The square gets a manifest and a lazy SVG scenery that draws `savanna.webp`. Its special cases leave `World.tsx`. Fun features ride the existing interactive/object/reaction path, extended with step counts, travel doors and notes. A small `SquareFun` overlay holds weather and butterflies. Pure rules live in `src/utils/squareFun.ts`, and save rules live in `src/game.ts`.

**Tech Stack:** React 19, TypeScript strict, Vite 8, node:test, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-16-savanna-square-redesign-design.md`

## Global Constraints

- No `any`, no `as` casts (except `as const`); `import type { JSX } from "react"`.
- Place id stays `square`, name "Savanna Square"; neighbors Milo, Cleo, Pip stay.
- New save fields are optional and validated on load; old saves must still load (unit test).
- Rewards and stamps happen once, guarded in the pure function.
- Audio only via the shared bus (`playInstrumentNote`, `playPropSound`); no audio files.
- Tap targets ≥ 48 CSS px on a 390 × 844 phone; pictures before words; no fail states; `prefers-reduced-motion` stops motion; axe-clean.
- Every reaction message is read aloud via the existing toast `speak` path.
- Stage is 1536 × 864; the painting (1536 × 1024) is drawn at `y = -160`.
- Say "doll" in identifiers and copy.

## Review Focus

- Butterfly found twice by a double tap: counted once (Task 2 test `findSquareButterfly ignores a repeat find`).
- Day changes while the tab is open: yesterday's progress must not mark today's butterflies found (Task 2 test `a new day starts a fresh hunt`).
- Tampered save (`squareButterflies` with a bad day or out-of-range indexes): dropped, not a crash (Task 2 test `restorePlayer drops a malformed butterfly hunt`).
- Objects small on a phone after the camera scales the 864-high stage: every square button ≥ 48 px (Task 7 test `square tap targets are at least 48px on a phone`).
- Reduced motion: weather, butterflies, dancing and object animation stop (Task 7 test `the square is still under reduced motion`).

---

### Task 1: Square fun rules

**Files:**

- Create: `src/utils/squareFun.ts`
- Test: `src/utils/squareFun.test.ts`

**Interfaces:**

- Produces:
  - `type Weather = "sunny" | "rain" | "rainbow" | "snow"`
  - `const WEATHER_CYCLE: readonly Weather[]` = `["sunny", "rain", "rainbow", "snow"]`
  - `nextWeather(current: Weather): Weather`
  - `const BUTTERFLY_COUNT = 5`
  - `const BUTTERFLY_SPOTS: readonly { x: number; y: number }[]`: 12 stage points inside the walkable area or on scenery, in 1536 × 864 units.
  - `dayKey(date: Date): string` returns local `YYYY-MM-DD`.
  - `butterfliesForDay(day: string): number[]`: 5 distinct indexes into `BUTTERFLY_SPOTS`, the same for the same day. Seed a small deterministic hash (FNV-1a, as in `src/pwa/precache.ts` `versionFor`) of `day`.

- [ ] **Step 1: Write failing tests** in `src/utils/squareFun.test.ts`:
  - `weather cycles sunny, rain, rainbow, snow, sunny`: `nextWeather` chain equals the cycle and wraps.
  - `butterflies are five distinct spots and stable for a day`: `butterfliesForDay("2026-10-16")` has length 5, all distinct, all `< BUTTERFLY_SPOTS.length`, and equal to a second call.
  - `different days usually hide butterflies in different spots`: at least 5 of the days `2026-10-01`…`2026-10-10` give different index sets from `2026-10-16`.
  - `dayKey uses the local calendar day`: `dayKey(new Date(2026, 9, 6, 23, 59))` equals `"2026-10-06"`.
- [ ] **Step 2: Run** `npm test` and expect these 4 to FAIL (module missing).
- [ ] **Step 3: Implement** `src/utils/squareFun.ts` with the interface above.
- [ ] **Step 4: Run** `npm test` and expect PASS.
- [ ] **Step 5: Commit** `feat: add square weather and butterfly rules`.

### Task 2: Butterfly hunt save field and stamp

**Files:**

- Modify: `src/game.ts` (PlayerBase optional field, `restorePlayer`, new function)
- Modify: `src/stamps/catalog.ts` (new stamp)
- Test: `src/game.test.ts`

**Interfaces:**

- Consumes: `butterfliesForDay`, `BUTTERFLY_COUNT` (Task 1).
- Produces:
  - Optional `squareButterflies?: { day: string; found: number[] }` on `PlayerBase`.
  - `findSquareButterfly<T extends PlayerBase>(player: T, day: string, spot: number): T` returns the unchanged player when `spot` is not one of `butterfliesForDay(day)` or was already found today. Otherwise it records the find, resetting `found` when `day` differs. On the 5th find of a day it calls `unlockStamp(…, "square_butterflies")`.
  - Stamp `{ id: "square_butterflies", name: "Butterfly Catcher", category: "world_secrets", icon: "🦋", description: "Found all five butterflies hiding in Savanna Square.", unlockHint: "Look for five butterflies around Savanna Square." }`.

- [ ] **Step 1: Write failing tests** in `src/game.test.ts`:
  - `finding five square butterflies earns Butterfly Catcher once`: find each of `butterfliesForDay(D)` and expect `found.length === 5` and the stamps to contain `square_butterflies` exactly once.
  - `findSquareButterfly ignores a repeat find`: the same spot twice returns the same reference the second time.
  - `findSquareButterfly ignores a spot that is not hiding a butterfly today`.
  - `a new day starts a fresh hunt`: after 2 finds on day A, a find on day B gives `{ day: B, found: [spot] }`.
  - `restorePlayer drops a malformed butterfly hunt`: `{ day: 5 }`, `{ day: "2026-10-16", found: [99] }` and `{ day: "x", found: [] }` each restore with `squareButterflies` undefined, and the rest of the save stays intact.
  - `saves without a butterfly hunt still load`: `restorePlayer(JSON.stringify(newPlayer()))` deep-equals `newPlayer()`.
- [ ] **Step 2: Run** `npm test` and expect FAIL.
- [ ] **Step 3: Implement** the field, validation (day matches `/^\d{4}-\d{2}-\d{2}$/`, found is ≤ 5 distinct safe integers, each `< BUTTERFLY_SPOTS.length`), `findSquareButterfly` and the stamp.
- [ ] **Step 4: Run** `npm test` and expect PASS.
- [ ] **Step 5: Commit** `feat: save the daily butterfly hunt and its stamp`.

### Task 3: Square becomes a manifest room

**Files:**

- Create: `src/rooms/manifests/savannaSquare.ts`, `src/components/SavannaSquareScenery.tsx`
- Modify: `src/rooms/registry.ts`, `src/components/RoomScenery.tsx` (per-scene `height`, default 720; register square 1536 × 864), `src/components/World.tsx` (delete square branches: building labels, fountain button, `place === "square"` neighbor fallback), `src/rooms/roomSpace.ts` (delete `PERCENT_ROOM_OBSTACLES.square`), `src/styles.css` (delete `.scene-square`, `.downtown-label`, `.cafe-label`, `.shop-label` rules if unused)
- Test: `src/rooms/manifests/savannaSquare.test.ts`, existing `tests/world.spec.ts`, `tests/world-obstacles.spec.ts`, `tests/world-phase2.spec.ts`

**Interfaces:**

- Produces: `savannaSquareManifest: RoomManifest` with `id: "square"`, `stageWidth: 1536`, `stageHeight: 864`, a walkable polygon over the painted ground (stage y ≈ 470–860), obstacles for the fountain basin and pond (convert today's percent polygons: x·15.36, y·10.24 − 160), `neighbors` at Milo/Cleo/Pip's current percent spots converted the same way, and portals for Downtown Plaza and Canopy café at the painting's paths.
- `RoomScenery` scene type gains `height?: number`.

- [ ] **Step 1: Write a failing unit test** `savannaSquare.test.ts`: the manifest is registered for `square` and is 1536 × 864. Every portal spawn, neighbor and interactive lies inside the walkable polygon (use `pointInPolygon` from `src/utils/obstacles.ts`) and outside obstacles. Portals reach their reciprocal rooms.
- [ ] **Step 2: Run** `npm test` and expect FAIL.
- [ ] **Step 3: Implement** manifest, scenery (`<image href=… x=0 y=-160 width=1536 height=1024 />`), registry, scene height, and the World/roomSpace/style deletions.
- [ ] **Step 4: Run** `npm test`, `npx tsc --noEmit`, then `scripts/e2e.sh tests/world.spec.ts tests/world-obstacles.spec.ts tests/world-phase2.spec.ts`. Fix square geometry expectations that moved from percent to stage units. Expect all to PASS.
- [ ] **Step 5: Commit** `feat: make Savanna Square a manifest room with its painted scene`.

### Task 4: Multi-step objects and picture doors

**Files:**

- Modify: `src/rooms/types.ts` (new kinds; `object.steps?: number`; `actionData.travel?: PlaceId`), `src/components/RoomObject.tsx` (drawings, step = `state % steps`), `src/components/World.tsx` `hotspot()` (travel), `src/rooms/manifests/savannaSquare.ts`, `src/components/roomObjects.css`
- Test: `src/rooms/manifests/savannaSquare.test.ts`, `tests/living-rooms.spec.ts`

**Interfaces:**

- New `RoomObjectKind`s: `"fountain"`, `"tree"`, `"bush"`, `"lanterns"`, `"bunting"`, `"sandbox"`, `"swing"`, `"door"`.
- `object: { kind; width; height; steps?: number }`, where `steps` defaults to 2 (today's on/off). `RoomObject` receives `step = state % steps` and sets `data-object-step`.
- `reaction` gains optional `messages?: string[]` (one per step; falls back to `message`).
- `actionData.travel?: PlaceId`: `hotspot()` calls `navigate(travel)` after the reaction.
- Square interactives:
  - fountain (3 steps: splash / geyser / rainbow)
  - tree (3 steps: shake / monkey peeks out / mangoes drop)
  - three bushes (2 steps; hidden animals: bunny, hedgehog, bird)
  - lanterns (2 steps)
  - bunting (2 steps: flutter / parrot)
  - sandbox (2 steps: dig / sandcastle)
  - swing (2 steps)
  - doors with icon pictures: café (`travel: "cafe"`), Le Shop (`roomAction: "shop"`), games (`roomAction: "games"`), den (`travel: "den"`), Downtown Plaza (`travel: "downtown-plaza"`), Wonder Park (`travel: "wonder-park-entrance"`), Pet Paradise (`travel: "pet-paradise"`)
- Copy: each step has a short read-aloud message, e.g. fountain `"Splish!"`, `"Whoosh! A big splash!"`, `"Look, a rainbow!"`. Each door reaction message is the place name.

- [ ] **Step 1: Write failing tests**:
  - Unit: every square object with `steps` has `messages.length === steps`. Every door has exactly one of `travel` or `roomAction`.
  - e2e `tests/living-rooms.spec.ts` square row: `name: "Savanna Square"`, `action: "Splash the fountain"`, `kind: "fountain"`, `objects` = square object count, `exit: "Downtown Plaza"`. Add an assertion in a new square-only test that three fountain taps give `data-object-step` 1, 2, 0.
- [ ] **Step 2: Run** `npm test` and `scripts/e2e.sh tests/living-rooms.spec.ts -g "Savanna"`; expect FAIL.
- [ ] **Step 3: Implement** the types, drawings (match `RoomObject.tsx` style: 200 × 240 viewBox, `object-chime`/`sm-*` motion, reduced-motion safe), steps, travel and manifest entries.
- [ ] **Step 4: Run** the same commands and expect PASS. Also run `scripts/e2e.sh tests/living-rooms.spec.ts` to confirm the other rooms are unchanged (default `steps` = 2).
- [ ] **Step 5: Commit** `feat: fill Savanna Square with multi-step objects and picture doors`.

### Task 5: Flower music, dancing neighbors and doll twirl

**Files:**

- Modify: `src/rooms/types.ts` (`actionData.note?: number`), `src/components/World.tsx` (`hotspot()` plays `playInstrumentNote("marimba", note)`; `dancing` state for 3 s after a note; doll twirl on tapping your character), `src/rooms/manifests/savannaSquare.ts` (six `"flower"` objects, kind added to `RoomObjectKind`, notes 0–5), `src/components/RoomObject.tsx`, `src/styles.css`
- Test: `tests/savanna-square.spec.ts` (create)

**Interfaces:**

- `neighbor` buttons get class `is-dancing` while `dancing` is true. The doll gets `is-twirling` for 1 s on tap; the player card still opens from the header avatar.

- [ ] **Step 1: Write failing e2e tests** in `tests/savanna-square.spec.ts`:
  - `flowers play notes and the neighbors dance`: tap the six flowers, expect no page errors, expect `.neighbor.is-dancing` count 3, then none after 3.5 s (use `page.clock`).
  - `the fountain's third tap hums a tune and starts the dance`: tap the fountain 3 times, expect `.neighbor.is-dancing` count 3 (the third step plays notes 0, 2, 4 via `playInstrumentNote("marimba", …)` 150 ms apart).
  - `tapping the doll twirls her`: expect the `.your-character` class to contain `is-twirling`.
- [ ] **Step 2: Run** `scripts/e2e.sh tests/savanna-square.spec.ts` and expect FAIL.
- [ ] **Step 3: Implement.** Decide whether tapping the doll still opens the card: keep the card on the header avatar and make the doll tap twirl.
- [ ] **Step 4: Run** the same and expect PASS. Run `scripts/e2e.sh tests/world.spec.ts -g "ID Card"` and update the player-card opener there if it tapped the doll.
- [ ] **Step 5: Commit** `feat: flower music, dancing neighbors and a doll twirl in the square`.

### Task 6: Weather toy and butterfly hunt overlay

**Files:**

- Create: `src/components/SquareFun.tsx`, `src/components/squareFun.css`
- Modify: `src/rooms/types.ts` (`fun?: "square"` on `RoomManifest`), `src/rooms/manifests/savannaSquare.ts`, `src/components/World.tsx` (render `<SquareFun …/>` inside the camera stage when `manifest.fun === "square"`), `src/App.tsx` (pass `onFindButterfly` that calls `findSquareButterfly(p, dayKey(new Date()), spot)`)
- Test: `tests/savanna-square.spec.ts`

**Interfaces:**

- `SquareFun({ found: number[]; day: string; onFind: (spot: number) => void; onSay: (message: string) => void })` renders:
  - A weather toy button at stage `(1380, 140)`, labelled "Change the weather", that cycles `nextWeather`. Overlay class `weather-${w}`, CSS-only drops and flakes, and a frog croak via `playPropSound("bubble")` on rain.
  - One `button.square-butterfly` per unfound spot of `butterfliesForDay(day)`, labelled "Butterfly".
  - A jar counter showing `found.length / 5`.
  - A confetti burst when it reaches 5 (CSS).
  - Messages: weather names ("Rain!", "A rainbow!", "Snow!", "Sunshine!"); a butterfly says "You found a butterfly!", and the fifth says "All five butterflies! Party time!".

- [ ] **Step 1: Write failing e2e tests**:
  - `the weather toy cycles rain, rainbow, snow and sun`: overlay class sequence and no page errors.
  - `finding all five butterflies earns the stamp once and survives reload`: tap all `.square-butterfly`, expect toast `New stamp: Butterfly Catcher!`, saved stamps contain it once, reload shows 0 butterflies left and the counter at 5/5.
- [ ] **Step 2: Run** `scripts/e2e.sh tests/savanna-square.spec.ts` and expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same and expect PASS.
- [ ] **Step 5: Commit** `feat: weather toy and daily butterfly hunt in the square`.

### Task 7: Kid-UX checks, docs and merge

**Files:**

- Modify: `tests/savanna-square.spec.ts`, `UX-CONTRACT.md`, `HANDOFF.md`, `DESIGN.md` (square section)

- [ ] **Step 1: Add tests**:
  - `square tap targets are at least 48px on a phone`: on the mobile project, every visible button in `.camera-viewport` has `min(width, height) ≥ 48`.
  - `the square is still under reduced motion`: `emulateMedia({ reducedMotion: "reduce" })`, every `.camera-viewport [class]` has `animationName === "none"` after toggling weather and tapping the fountain.
  - `the square passes axe`: AxeBuilder with `wcag2a`, `wcag2aa`, `wcag21aa` and no violations.
- [ ] **Step 2: Run** `scripts/e2e.sh tests/savanna-square.spec.ts` and fix until PASS.
- [ ] **Step 3: Update docs**:
  - UX-CONTRACT: the square's objects, doors, music, weather and hunt rules.
  - HANDOFF: the square is now a manifest room.
  - DESIGN: the extension path for the square.
- [ ] **Step 4: Run** `npm run verify`, then the full suite on GitHub (`gh workflow run playwright.yml --ref <branch>`), and expect all green.
- [ ] **Step 5:** Squash to one commit, rebase on master, `git merge --ff-only`, push, remove the worktree.
