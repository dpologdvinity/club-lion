# Phase 2 integration review

Reviewer: gpt-6.1-sol (codex). Reviewed `986327c..cb9f5a8` in
`feat/phase-2-integration`, plus the narrow review repairs described below.
Decision: approved for the integration verification gate. No outstanding
blocking finding; the Verifier must still run the fresh full gates before merge.

## Findings repaired

- **Medium — coordinate-less ground activation:** `CameraViewport.tsx` treated
  native Enter/Space clicks as pointer coordinates. The RED browser probe moved
  Downtown feet from `(1200,600)` to `(240,560)` on Enter. The ground now ignores
  clicks whose `detail` is zero. Real pointer coordinates and arrow walking retain
  their existing conversion and movement rules. A browser regression covers both
  activation keys and the subsequent 45-unit arrow step.
- **Medium — optional audio interrupted tile movement:** `DanceFloor.tsx` let a
  throwing AudioContext constructor interrupt the tile handler before `onStep`.
  Audio construction/playback now has a local failure boundary; resume and close
  rejections are consumed. The tile still lights and moves the avatar. The
  rejected-resume probe also reached `World.tsx`'s movement chime; its resume and
  close promises now consume failures. Browser regressions cover constructor and
  resume failure without changing payouts or movement rules.

## Inspection evidence

- App, GamesPanel and Dialog retain one modal owner for all seven activities.
  The smoothie content extraction removes the nested dialog. Opener capture
  precedes child activity focus; disconnected openers fall back to the world
  ground. All games return through the picker and refocus their card.
- Live panorama selection uses the registry and canonical `PLACES`. Save visit
  validation therefore accepts the new destinations under both existing save
  versions. Current room and position remain session state.
- Camera pointer conversion divides by the stage scale and adds the camera
  offset once. Walkable projection preserves physical portal reachability.
  Manifest arrivals are inside the destination polygon and outside its triggers;
  the occupied-portal latch avoids repeated catalog opens. World remounting owns
  arrival coordinates independently from the previous room.
- Avatar feet, bounded dance tiles, camera and hoverboard particles share the
  same stage. Keyboard tile focus calls movement so the camera reveals the tile.
  Mango canvas dimensions use untransformed logical CSS pixels.
- DJ results reach `completeDJBeatDrop`; smoothie servings reach the guarded
  `completeSmoothieOrder`. Completion/serve refs prevent duplicate callbacks.
  Coaster integration supplies no reward callback or persisted photo. Spectator
  ride controls accurately say Watch, and the midway booth launches Fruit Catch.
- Room vectors render directly, with no requests for descriptive manifest asset
  names. Preview scenery does not start animation frames. Live reduced-motion
  listeners stop ambient frames, floor pulses and trails. Activity audio is
  procedural; activity frames, contexts and coaster object URLs have cleanup.
- Named controls below the scene expose paths and activities independently of
  camera position. Existing responsive document flow and modal scrolling remain.
  The authored browser coverage includes mobile overflow, focus, inert background,
  direct launches, persistence, scaled alignment and axe scans.

## Validation and limits

- `npm test`: **165 passed, zero failures** after repairs.
  Raw result: `/tmp/task7-review-unit.log`.
- Focused real Chromium probes at **1440×1000 and 390×844**: Enter/Space preserve
  feet, arrows advance 45 stage units, real pointer movement is within one stage
  pixel of the expected scaled coordinate, and no page errors occur.
  Raw result: `/tmp/task7-review-focused.log`.
- Focused Chromium constructor/rejected-resume probes: the selected tile lights,
  feet reach `(1040,560)`, room unmount succeeds, and no page errors occur.
  Raw result: `/tmp/task7-review-audio.log`.
- Touched source/test files were formatted with the repository Prettier version;
  `git diff --check` is clean. Review did not run the full typecheck, build,
  formatting suite or E2E suite; those belong to the root integration Verifier.

## Integration gate follow-up

The root gate on `c2c72b9` passed unit tests, types, formatting and build; browser
verification passed 138 cases and exposed two mobile test assumptions. Trace
inspection and real desktop/mobile input probes established both root causes
before edits. No production code changed in this follow-up.

- **Fractional target versus delivered event:** mobile ground top was
  `256.6875px`, height `300px`, and requested relative y was `282px`. Chromium
  delivered `clientY=538`, instead of the requested absolute `538.6875`.
  `(538-256.6875)/(300/720)=675.15`, exactly matching the avatar; the assertion's
  `676.8` assumed fractional delivery. Desktop also delivered integer coordinates.
  The test now captures the actual click event and ground rect, separately bounds
  input rounding below one CSS pixel, and compares the avatar to that independent
  input with five decimal places. Its pre-click camera offset remains independent,
  so adding the offset twice still fails. The physical portal assertion remains.
  Its loop now observes each actual movement and stops upon entering the source
  trigger, before the navigation effect commits. The earlier loop could issue an
  extra arrow after arrival and move the safe spawn from `100` to `55`.
- **Stale mango ground point:** mobile square point `(200,150)` hits the new
  operable Downtown button. At both sizes, the responsive point `(70%,90%)` hits
  the actual foreground ground. The test now tosses there with ordinary hit-tested
  input, verifies the landing feedback, then activates Downtown and verifies the
  destination. It uses no forced click, mock movement, or interception bypass.

Measured evidence: `/tmp/task7-review-gate-diagnosis.log`. Focused proof runs only
the two changed cases in both desktop and mobile projects:
**4 passed** in `/tmp/task7-review-gate-focused.log`. The post-fix unit run passes
all 165 tests:
`/tmp/task7-review-gate-unit.log`. Root retains the fresh full integration rerun.
