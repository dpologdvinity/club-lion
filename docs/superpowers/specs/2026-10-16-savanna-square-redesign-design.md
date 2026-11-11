# Savanna Square redesign

Date: 2026-10-16. Status: draft for owner review.

## Intent

Savanna Square is the first room a child sees. Today it is one painted background (`public/assets/savanna.webp`) with three small text labels, a fountain emoji and three neighbor lions, special-cased in `src/components/World.tsx`. Almost nothing reacts.

Goal (owner: "option 1", "needs to be way more entertaining"): keep the familiar painted look, but make the square the most playful room in the game for a 3-year-old who cannot read, and make it a normal manifest room like every other room.

Success looks like:

- A child can spend minutes tapping things in the square without opening a menu.
- Every main place is reachable from a big picture door in the room, with no reading needed.
- The square uses the same manifest, scenery, object and test paths as the other rooms.

Assumptions (owner did not answer the scope question, so all four fun pieces are in): reacting objects, music and dancing, a weather toy, and a daily butterfly hunt.

## Structure

- New manifest `src/rooms/manifests/savannaSquare.ts`, registered in `src/rooms/registry.ts` for place id `square`. The id, name, neighbors (Milo, Cleo, Pip), default spawn and "Return to Savanna Square" button stay the same, so old saves and visited lists keep working.
- New `src/components/SavannaSquareScenery.tsx` draws `savanna.webp` as an SVG `<image>` and is lazy-registered in `ROOM_SCENERY`.
- Stage is 1536 × 864. The painting (1536 × 1024) is placed with its top 160 px of sky cropped, so 16:9 desktops show no side bars and phones pan sideways.
- `RoomScenery` reads the stage height per scene instead of the hard-coded `720`.
- Removed from `World.tsx`: the square's hard-coded building labels, fountain button, neighbor fallback and other `place === "square"` branches. `src/rooms/roomSpace.ts` drops its percent-unit square obstacles; the manifest's `walkablePolygon` and `obstacles` replace them in stage units.

## Fun

All reactions are read aloud (existing `speak`), need no reading, cannot fail, and calm down under `prefers-reduced-motion`. Every tap target is at least 48 CSS px on a 390 px phone.

1. Reacting objects. Multi-step objects use the existing tap counter (`data-object-state`) and draw a different step per count (`state % steps`).
   - Fountain: splash, then geyser, then rainbow.
   - Big tree: shake, monkey peeks out, mangoes drop.
   - Three bushes: each hides a surprise animal (bunny, hedgehog, bird) that pops out and scurries off.
   - Lantern string: lights glow one by one around the square.
   - Bunting flags: flutter, then a parrot lands.
   - Sandbox: dig, then a sandcastle grows.
   - Swing: swings, with a happy sound.
2. Music and dancing.
   - Flower xylophone: a row of six flowers, each plays one note through the existing instrument synth on the shared audio bus.
   - Fountain hum: a short gurgle melody on the third fountain step.
   - Neighbors dance (CSS) for a few seconds after any music.
   - Tapping your own doll does a twirl. The player card stays reachable from the header avatar.
3. Weather toy. A sun-and-cloud prop cycles sunny, rain (drops, puddles, frog croak), rainbow, snow, sunny. It is a CSS overlay on the square only, and the state is not saved.
4. Butterfly hunt. Five butterflies hide at spots chosen per calendar day (seeded by date). Tapping one makes it flutter to a jar counter. Finding all five shows a confetti party and earns a new stamp `square_butterflies` once. Progress is stored in an optional save field `squareButterflies: { day: string; found: number[] }`, validated on load; a different day resets it.
5. Picture doors. These are big illustrated buttons at each building: café (cup), Le Shop (dress), games (joystick), den (house), Downtown Plaza (fountain), Wonder Park (ferris wheel) and Pet Paradise (paw). Each wiggles and says its name, then travels. They are manifest portals or room actions, and replace the small text labels.

## Code placement

- Pure logic in `src/utils/squareFun.ts`: weather cycle, daily butterfly spots, butterfly progress update. Unit tests go in `src/utils/squareFun.test.ts`.
- Save field and stamp: `src/game.ts` (`findSquareButterfly`, pure, guarded against double taps), `src/stamps/catalog.ts` and `src/utils/stampDefinitions.ts`.
- Object drawings: new kinds in `src/components/RoomObject.tsx` and `src/rooms/types.ts`.
- Weather overlay and butterflies: a small `SquareFun.tsx` rendered by `World` when the manifest opts in (`fun: "square"`), so World does not regain room special cases.

## Testing

- Unit tests: weather cycle, butterfly day seeding and reset, save validation and old saves without the field, stamp paid once.
- `tests/living-rooms.spec.ts`: the square row (illustrated scene, objects work, reduced motion, axe).
- New `tests/savanna-square.spec.ts`: picture doors travel and speak, weather cycles, finding five butterflies gives the stamp once and survives reload, flower notes play without errors, tap targets are at least 48 px on phone.
- Existing square tests (`tests/world.spec.ts`, `tests/world-obstacles.spec.ts`, `tests/world-phase2.spec.ts`) are updated where geometry moves from percent to stage units.

## Out of scope

- New art style or a redrawn square (option 2; owner decision later).
- Changes to other rooms, games or the doll.
