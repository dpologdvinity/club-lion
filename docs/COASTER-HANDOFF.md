# Task 6 integration handoff

Mount `RollerCoasterRide` inside the existing wide `Dialog`. The component owns the ride body only; it does not add another dialog or world routing.

```tsx
<Dialog title="Savanna Screamer" wide onClose={backToArcade}>
  <RollerCoasterRide
    look={player.look}
    pet={player.pet}
    onClose={backToArcade}
    onFinish={({ elapsedSeconds, photoTaken }) => {
      // Optional session feedback only; there is no coin payout or save change.
    }}
  />
</Dialog>
```

- `look?: AvatarLook` defaults to the standard avatar; `pet?: PetState` adds the pet passenger. `onClose` is required. Optional `onFinish` reports a naturally completed circuit once per run. Exiting early reports nothing. Replays are distinct runs.
- `coasterPhysics.ts` integrates velocity and arc-length distance over the Task 2 `kineticRides` track. Its public track angle is degrees. The 50ms maximum frame delta, 120Hz internal integration, and simulated elapsed clock prevent hidden-tab jumps. Visibility changes reset the frame clock and mute sound; hidden frames advance zero time.
- The photo gate is the loop exit (`COASTER_PHOTO_PROGRESS`, normalized arc length). A one-time photo flag resets on replay. The local downloadable SVG uses the actual Avatar and PetCompanion renderers and the current look/pet at the gate. It is a souvenir composition of that landmark, without a camera flash. No save field, persistent-save claim, network request, coin reward, or game-count update was added.
- View/download appear after completion. Photo failure allows replay; audio setup/resume failure leaves gameplay working. Blob URLs are revoked on replay, exit, or unmount. RAF, visibility/media listeners, oscillators/noise nodes and AudioContext are cleaned up on exit/unmount. Finish cancels further frames and stops audio.
- Gentle view defaults to `prefers-reduced-motion`, follows preference changes, and offers an explicit toggle: the circuit stays in a steady wide camera with no shake or car rotation. Ordinary view follows the cart with scenery parallax and bounded shake. Passenger CSS animations are disabled in both views.
- Review at `/tests/fixtures/coaster.html`. `tests/coaster.spec.ts` covers keyboard start/focus, natural completion, local image/download, replay, URL/frame cleanup, Escape without completion, large deltas, hidden-tab pause/resume, audio failure, reduced motion, viewport fit and axe. Browser tests use a controlled RAF queue around the real physics to keep runs quick; no runtime test hooks were added.

Implementer validation: `npm test` only. The initial RED run failed on the missing physics module; GREEN passes all 149 tests in the full unit suite. Integration Verifier owns typecheck, formatting gate, production build and browser proof. When running browser proof, prestart Vite, then use `node node_modules/@playwright/test/cli.js test tests/coaster.spec.ts` with the shared server running; keep logs in `/tmp`.
