# Phase 1: Chibi Avatar, Companion Pet Lion & Downtown Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Club Lion into the golden-era Fantage × Club Penguin experience by implementing customizable 2D chibi human avatars, companion pet lions with trailing physics, the panoramic Downtown Plaza with Le Shop catalog secrets and Stella's salon, the Fantage-style ID card, and the quick-chat action wheel.

**Architecture:** Built on a declarative `RoomManifest` schema and network-serializable `WorldEntity` packets. Decouples local single-player execution from future multiplayer room servers, utilizes an 8-layer vector SVG paper-doll anchor matrix for avatars, and employs spring-damper physics for companion pets.

**Tech Stack:** React 19, TypeScript (strict), Vite, Web Audio API, Node built-in test runner (`node --test`), Playwright Chromium for browser verification.

**Spec:** [docs/plans/2026-10-03-club-lion-expanded-world-design.md](docs/plans/2026-10-03-club-lion-expanded-world-design.md)

## Global Constraints

- **Language & Engine:** TypeScript in strict mode; React 19; Node.js 22.18+.
- **Zero Heavy Audio Assets:** All sound effects, instruments, and music must be synthesized via procedural Web Audio API (zero external MP3 files).
- **Zero-Cost ($0) Architecture:** Code and assets must remain 100% runnable offline and locally with local storage, architected for Supabase Auth/PostgreSQL free tiers ($0).
- **Styling & Assets:** Vector SVG rendering for avatars and pets with 120×160px coordinate canvas; CSS modules / shared tokens in `src/styles.css`.
- **Testing Standard:** All business logic, ballistics, pet trailing, and inventory state must have unit tests run via `npm test`.

## Review Focus

1. **Avatar Layer Misalignment:** Equipping headwear over front hair or jackets over inner tops must never clip or float outside the 120×160 anchor coordinates.
2. **Pet Follower Snapping / Glitching:** Rapid directional shifts or teleports must smoothly lerp the pet without jittering or getting stuck in boundary walls.
3. **Save Format V1-to-V2 Migration:** Existing `club-lion-player-v1` saves in localStorage must cleanly upgrade to `v2` without corrupting coins or owned accessories.
4. **Touch & Click Boundary Consistency:** Clicking interactive objects (fountain, door, shop counter) while walking must not trigger accidental movement past the door trigger.
5. **Secret Clickable State Preservation:** Unlocking a catalog secret item must immediately add it to owned inventory, award the stamp, and persist across page refreshes.

---

### Task 1: Core Entity Types & 10-Slot Wardrobe Taxonomy

**Files:**
- Create: `src/types/world.ts`
- Create: `src/types/world.test.ts`
- Modify: `src/game.ts:1-50`

**Interfaces:**
- Produces:
  - `AvatarLook`: `{ skinTone, eyeStyle, hairId, hairColor, outfitId, shoesId, boardId?, handheldId? }`
  - `EquipSlot`: `"hair_back" | "hair_front" | "headwear" | "eyewear" | "top_inner" | "top_outer" | "bottom" | "shoes" | "handheld" | "board"`
  - `PetState`: `{ id, name, species: "lion", color, accessory?, position, mood }`
  - `WorldEntity`: `{ id, name, look, pet?, position, action, bubble?, badgeTitle?, isLocalPlayer? }`
  - `CatalogItem`: `{ id, name, price, slot: EquipSlot, isSecret?: boolean, secretTriggerId?: string }`

- [ ] **Step 1: Write failing unit test for entity schemas and catalog validator**

Create `src/types/world.test.ts` testing item categorization, slot validation, and avatar look defaults:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { validateAvatarLook, DEFAULT_AVATAR_LOOK, CATALOG_ITEMS } from "./world.ts";

test("DEFAULT_AVATAR_LOOK contains valid initial slots", () => {
  assert.equal(validateAvatarLook(DEFAULT_AVATAR_LOOK), true);
  assert.equal(DEFAULT_AVATAR_LOOK.skinTone, "warm");
});

test("CATALOG_ITEMS has registered secret items with triggers", () => {
  const secrets = CATALOG_ITEMS.filter((i) => i.isSecret);
  assert.ok(secrets.length >= 3);
  assert.ok(secrets.some((s) => s.id === "barista_apron"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/types/world.test.ts`
Expected: FAIL with "cannot find module ./world.ts"

- [ ] **Step 3: Implement `src/types/world.ts`**

Define `AvatarLook`, `EquipSlot`, `PetState`, `WorldEntity`, `RoomManifest`, `CATALOG_ITEMS`, and `validateAvatarLook`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/types/world.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/world.ts src/types/world.test.ts src/game.ts
git commit -m "feat: define world entity types and 10-slot wardrobe taxonomy"
```

---

### Task 2: Vector Chibi Avatar Component (`Avatar.tsx`)

**Files:**
- Create: `src/components/Avatar.tsx`
- Create: `src/components/Avatar.test.tsx` (or Node-compatible SVG string generator unit test `src/components/avatarSvg.ts` & `src/components/avatarSvg.test.ts`)
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `AvatarLook` from `src/types/world.ts`
- Produces: `<Avatar look={look} action={action} size={size} />` rendering the layered SVG paper doll.

- [ ] **Step 1: Write failing test for avatar SVG layer composition**

Create `src/components/avatarSvg.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { generateAvatarSvgString } from "./avatarSvg.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";

test("generateAvatarSvgString outputs stacked SVG layers in correct order", () => {
  const svg = generateAvatarSvgString(DEFAULT_AVATAR_LOOK, "idle");
  assert.ok(svg.includes("avatar-body"));
  assert.ok(svg.includes("avatar-eyes"));
  assert.ok(svg.includes("avatar-hair-front"));
});

test("generates custom skin tone fill correctly", () => {
  const darkLook = { ...DEFAULT_AVATAR_LOOK, skinTone: "deep" as const };
  const svg = generateAvatarSvgString(darkLook, "idle");
  assert.ok(svg.includes("#5c3826"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/components/avatarSvg.test.ts`
Expected: FAIL with "cannot find module ./avatarSvg.ts"

- [ ] **Step 3: Implement `src/components/avatarSvg.ts` and `src/components/Avatar.tsx`**

Implement the 120×160 coordinate vector layers: base body, skin tones, anime eyes, outfits, hair with highlight dyes, and React wrapper `<Avatar />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/components/avatarSvg.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/avatarSvg.ts src/components/avatarSvg.test.ts src/components/Avatar.tsx src/styles.css
git commit -m "feat: implement vector chibi avatar engine with paper-doll layering"
```

---

### Task 3: Pet Companion Trailing Physics Engine

**Files:**
- Create: `src/utils/petFollower.ts`
- Create: `src/utils/petFollower.test.ts`
- Create: `src/components/PetCompanion.tsx`

**Interfaces:**
- Consumes: `PetState` from `src/types/world.ts`
- Produces:
  - `computePetTrailingStep(currentPetPos, targetAvatarPos, lastAvatarHeading, deltaSeconds): { newPos, mood, isTrotting }`
  - `<PetCompanion pet={pet} isTrotting={isTrotting} />`

- [ ] **Step 1: Write failing test for pet follower spring-damper math**

Create `src/utils/petFollower.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { computePetTrailingStep } from "./petFollower.ts";

test("pet moves toward trailing offset behind avatar position", () => {
  const currentPet = { x: 100, y: 100 };
  const avatarPos = { x: 200, y: 100 };
  const step = computePetTrailingStep(currentPet, avatarPos, "right", 0.016);
  assert.ok(step.newPos.x > 100, "Pet should advance towards target offset");
  assert.equal(step.isTrotting, true);
});

test("pet settles and sits when within resting distance", () => {
  const currentPet = { x: 165, y: 100 };
  const avatarPos = { x: 200, y: 100 };
  const step = computePetTrailingStep(currentPet, avatarPos, "right", 0.016);
  assert.equal(step.isTrotting, false, "Pet should sit when close enough");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/petFollower.test.ts`
Expected: FAIL with "cannot find module ./petFollower.ts"

- [ ] **Step 3: Implement `src/utils/petFollower.ts` and `src/components/PetCompanion.tsx`**

Implement smooth spring-damper following calculation, boundary clamping, trot/sit states, and render the SVG lion companion with color coats and equipable accessories.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/petFollower.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/petFollower.ts src/utils/petFollower.test.ts src/components/PetCompanion.tsx
git commit -m "feat: add companion pet lion trailing physics and sprite component"
```

---

### Task 4: Declarative Room Engine & Panoramic Camera Viewport

**Files:**
- Create: `src/rooms/types.ts`
- Create: `src/rooms/camera.ts`
- Create: `src/rooms/camera.test.ts`
- Create: `src/rooms/manifests/downtownPlaza.ts`
- Create: `src/components/CameraViewport.tsx`

**Interfaces:**
- Consumes: `RoomManifest`, `WorldEntity`
- Produces:
  - `computeCameraOffset(avatarX, stageWidth, viewportWidth): number`
  - `<CameraViewport manifest={downtownPlaza} entities={entities} onPortal={...} />`

- [ ] **Step 1: Write failing test for camera viewport horizontal follow & edge damping**

Create `src/rooms/camera.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { computeCameraOffset } from "./camera.ts";

test("camera clamps at left edge when avatar is near start", () => {
  const offset = computeCameraOffset(150, 2400, 1200);
  assert.equal(offset, 0, "Camera should not scroll past left bound");
});

test("camera centers on avatar when in mid-stage", () => {
  const offset = computeCameraOffset(1200, 2400, 1200);
  assert.equal(offset, 600, "Camera should center avatar (1200 - 600)");
});

test("camera clamps at right edge when avatar is near end", () => {
  const offset = computeCameraOffset(2300, 2400, 1200);
  assert.equal(offset, 1200, "Camera should clamp to (stageWidth - viewportWidth)");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/rooms/camera.test.ts`
Expected: FAIL with "cannot find module ./camera.ts"

- [ ] **Step 3: Implement camera math and `CameraViewport.tsx` with Downtown Plaza manifest**

Implement `computeCameraOffset` in `src/rooms/camera.ts`, create `downtownPlaza.ts` with marble fountain, café/boutique doorways, and depth-sorted lampposts.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/rooms/camera.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/rooms/types.ts src/rooms/camera.ts src/rooms/camera.test.ts src/rooms/manifests/downtownPlaza.ts src/components/CameraViewport.tsx
git commit -m "feat: add declarative room manifest engine and panoramic camera viewport"
```

---

### Task 5: Le Shop Catalog Secrets & Stella's Salon

**Files:**
- Create: `src/components/CatalogModal.tsx`
- Create: `src/components/SalonModal.tsx`
- Modify: `src/game.ts`
- Modify: `src/game.test.ts`

**Interfaces:**
- Consumes: `CATALOG_ITEMS`, `Player` state
- Produces:
  - `<CatalogModal isOpen={open} onClose={...} onBuy={...} onSecretUnlock={...} />`
  - `<SalonModal isOpen={open} onClose={...} onStyleSave={...} />`

- [ ] **Step 1: Write failing test in `src/game.test.ts` for unlocking secret catalog items**

Add to `src/game.test.ts`:
```typescript
test("unlockSecretCatalogItem adds secret item to player inventory and stamps secret", () => {
  const player = getInitialPlayer();
  const updated = unlockSecretCatalogItem(player, "barista_apron");
  assert.ok(updated.owned.includes("barista_apron"));
  assert.ok(updated.stamps.includes("secret_barista"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "unlockSecretCatalogItem is not defined"

- [ ] **Step 3: Implement secret unlock logic in `src/game.ts` and create `CatalogModal.tsx` & `SalonModal.tsx`**

Implement page-flipping catalog with clickable secret trigger hotspots (coffee steam, price tag star) and Stella's salon with hair cuts and streak dye palette.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game.ts src/game.test.ts src/components/CatalogModal.tsx src/components/SalonModal.tsx
git commit -m "feat: add Le Shop flip catalog with secret clickables and Stella's salon"
```

---

### Task 6: Quick-Chat & Emote Action Wheel + Mango Ballistics

**Files:**
- Create: `src/utils/ballistics.ts`
- Create: `src/utils/ballistics.test.ts`
- Create: `src/components/ActionWheel.tsx`
- Create: `src/components/MangoToss.tsx`

**Interfaces:**
- Produces:
  - `computeArcTrajectory(startX, startY, targetX, targetY, t): { x, y }`
  - `<ActionWheel onEmote={...} onAction={...} onPhrase={...} />`
  - `<MangoToss onImpact={...} />`

- [ ] **Step 1: Write failing test for mango parabolic arc ballistics**

Create `src/utils/ballistics.test.ts`:
```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { computeArcTrajectory } from "./ballistics.ts";

test("trajectory starts at origin (t=0) and reaches target (t=1)", () => {
  const start = { x: 50, y: 80 };
  const target = { x: 200, y: 120 };
  const atStart = computeArcTrajectory(start.x, start.y, target.x, target.y, 0);
  const atEnd = computeArcTrajectory(start.x, start.y, target.x, target.y, 1);
  assert.equal(atStart.x, 50);
  assert.equal(atStart.y, 80);
  assert.equal(atEnd.x, 200);
  assert.equal(atEnd.y, 120);
});

test("midpoint (t=0.5) has negative Y apex elevation (parabolic arc)", () => {
  const mid = computeArcTrajectory(50, 100, 250, 100, 0.5, 60);
  assert.ok(mid.y < 100, "Apex should arc upward above straight line");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/utils/ballistics.test.ts`
Expected: FAIL with "cannot find module ./ballistics.ts"

- [ ] **Step 3: Implement `src/utils/ballistics.ts`, `ActionWheel.tsx`, and `MangoToss.tsx`**

Implement ballistic math, radial emote action wheel (Hearts, Stars, Laugh, Dance, Wave, Jam), and click-to-toss mango canvas layer.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/utils/ballistics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/ballistics.ts src/utils/ballistics.test.ts src/components/ActionWheel.tsx src/components/MangoToss.tsx
git commit -m "feat: add quick-chat action wheel and interactive mango ballistics"
```

---

### Task 7: Fantage-Style ID Card & Guest-to-Cloud Save V2 Migration

**Files:**
- Create: `src/components/PlayerCard.tsx`
- Modify: `src/usePlayer.ts`
- Modify: `src/game.ts`
- Modify: `src/game.test.ts`

**Interfaces:**
- Consumes: `Player` v2 state with `look`, `pet`, `starRank`, `moodQuote`, `stamps`
- Produces: `<PlayerCard player={player} onClose={...} onQuoteUpdate={...} />`

- [ ] **Step 1: Write failing test in `src/game.test.ts` for V1 to V2 save migration**

Add to `src/game.test.ts`:
```typescript
test("migratePlayerSave cleanly upgrades v1 save to v2 without losing coins or items", () => {
  const v1Save = {
    version: 1,
    name: "Leo",
    coins: 450,
    color: "gold",
    accessory: "scarf",
    owned: ["scarf", "glasses"],
    met: ["milo"],
    visited: ["square"],
    gamesPlayed: 3,
    beeStopBest: 80,
    pawStepsBest: 5,
    fruitCatchBest: 120,
    claimed: ["neighbors"],
    decor: ["plant"],
  };
  const v2 = migratePlayerSave(v1Save);
  assert.equal(v2.version, 2);
  assert.equal(v2.coins, 450);
  assert.ok(v2.look.outfitId);
  assert.equal(v2.pet.color, "gold");
  assert.equal(v2.starRank, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL with "migratePlayerSave is not defined"

- [ ] **Step 3: Implement `migratePlayerSave` in `src/game.ts` and create `PlayerCard.tsx`**

Implement save schema v2 migration, star rank leveling calculations, and render the Fantage-style ID Card with medal ribbons, custom mood quotes, and avatar/pet preview.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/game.ts src/game.test.ts src/usePlayer.ts src/components/PlayerCard.tsx
git commit -m "feat: add Fantage ID card and v1-to-v2 player save migration"
```

---

### Task 8: Integration, Full Assembly & Verification

**Files:**
- Modify: `src/App.tsx`
- Modify: `tests/world.spec.ts`

**Interfaces:**
- Wire up `CameraViewport` in `src/App.tsx` displaying `downtownPlaza` with local player avatar and pet lion, top persistent audio control bar, action wheel, and dialogs.

- [ ] **Step 1: Wire up all Phase 1 components in `src/App.tsx`**
- [ ] **Step 2: Run unit tests and typecheck**

Run: `npm run typecheck && npm test`
Expected: PASS with zero errors

- [ ] **Step 3: Run Playwright end-to-end browser test**

Run: `npm run test:e2e`
Expected: PASS across desktop and mobile viewports

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx tests/world.spec.ts
git commit -m "feat: assemble Phase 1 world view, avatar engine, pet companion, and Downtown Plaza"
```
