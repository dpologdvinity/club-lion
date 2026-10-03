import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAvatarLook,
  DEFAULT_AVATAR_LOOK,
  CATALOG_ITEMS,
  EQUIP_SLOTS,
  isValidEquipSlot,
  DEFAULT_PET_STATE,
  type AvatarLook,
  type EquipSlot,
  type PetState,
  type WorldEntity,
  type RoomManifest,
} from "./world.ts";

test("DEFAULT_AVATAR_LOOK contains valid initial slots", () => {
  assert.equal(validateAvatarLook(DEFAULT_AVATAR_LOOK), true);
  assert.equal(DEFAULT_AVATAR_LOOK.skinTone, "warm");
  assert.ok(DEFAULT_AVATAR_LOOK.hairId);
  assert.ok(DEFAULT_AVATAR_LOOK.outfitId);
  assert.ok(DEFAULT_AVATAR_LOOK.shoesId);
});

test("CATALOG_ITEMS has registered secret items with triggers", () => {
  const secrets = CATALOG_ITEMS.filter((i) => i.isSecret);
  assert.ok(secrets.length >= 3);
  assert.ok(secrets.some((s) => s.id === "barista_apron"));
  const apron = secrets.find((s) => s.id === "barista_apron");
  assert.ok(apron?.secretTriggerId, "Secret item must define secretTriggerId");
});

test("EQUIP_SLOTS defines all 10 wardrobe taxonomy slots", () => {
  const expectedSlots: EquipSlot[] = [
    "hair_back",
    "hair_front",
    "headwear",
    "eyewear",
    "top_inner",
    "top_outer",
    "bottom",
    "shoes",
    "handheld",
    "board",
  ];
  assert.equal(EQUIP_SLOTS.length, 10);
  for (const slot of expectedSlots) {
    assert.ok(EQUIP_SLOTS.includes(slot), `Missing slot: ${slot}`);
    assert.equal(isValidEquipSlot(slot), true);
  }
  assert.equal(isValidEquipSlot("invalid_slot"), false);
});

test("validateAvatarLook rejects invalid or incomplete look objects", () => {
  assert.equal(validateAvatarLook(null), false);
  assert.equal(validateAvatarLook(undefined), false);
  assert.equal(validateAvatarLook("string"), false);
  assert.equal(validateAvatarLook({}), false);
  assert.equal(
    validateAvatarLook({
      ...DEFAULT_AVATAR_LOOK,
      skinTone: "",
    }),
    false,
  );
  assert.equal(
    validateAvatarLook({
      ...DEFAULT_AVATAR_LOOK,
      hairId: 123,
    }),
    false,
  );
  assert.equal(
    validateAvatarLook({
      ...DEFAULT_AVATAR_LOOK,
      boardId: 999,
    }),
    false,
  );
  const lookWithBoard: AvatarLook = {
    ...DEFAULT_AVATAR_LOOK,
    boardId: "hover_leaf",
  };
  assert.equal(validateAvatarLook(lookWithBoard), true);
});

test("PetState and WorldEntity schemas instantiate cleanly", () => {
  assert.equal(DEFAULT_PET_STATE.species, "lion");
  assert.equal(typeof DEFAULT_PET_STATE.position.x, "number");
  assert.equal(typeof DEFAULT_PET_STATE.position.y, "number");

  const entity: WorldEntity = {
    id: "entity-1",
    name: "Player 1",
    look: DEFAULT_AVATAR_LOOK,
    pet: DEFAULT_PET_STATE,
    position: { x: 200, y: 150 },
    action: "idle",
    bubble: "Hello savanna!",
    badgeTitle: "Explorer",
    isLocalPlayer: true,
  };
  assert.equal(entity.name, "Player 1");
  assert.equal(entity.isLocalPlayer, true);
  assert.equal(entity.pet?.name, "Leo");
});

test("RoomManifest structure matches declarative room specifications", () => {
  const manifest: RoomManifest = {
    id: "test_plaza",
    name: "Test Plaza",
    district: "downtown",
    stageWidth: 2400,
    stageHeight: 720,
    backgroundAsset: "bg_plaza.svg",
    walkablePolygon: [
      [0, 500],
      [2400, 500],
      [2400, 720],
      [0, 720],
    ],
    depthLayers: [{ id: "lamppost_1", y: 550, asset: "lamp.svg" }],
    portals: [
      {
        targetRoomId: "cafe",
        targetSpawn: { x: 100, y: 500 },
        triggerBounds: { x1: 50, y1: 450, x2: 150, y2: 550 },
        label: "Enter Café",
      },
    ],
    interactives: [
      {
        id: "coffee_cart",
        type: "shop",
        position: { x: 300, y: 520 },
        actionData: { catalogId: "le_shop" },
      },
    ],
    ambientAudioPreset: "plaza_chatter",
    scriptedNpcs: [],
  };
  assert.equal(manifest.district, "downtown");
  assert.equal(manifest.stageWidth, 2400);
});
