import { test, expect, type Page } from "@playwright/test";
import { ROOM_MANIFESTS } from "../src/rooms/registry";
import { AVATAR_RADIUS } from "../src/rooms/roomSpace";
import {
  isFreePoint,
  isFreeSegment,
  type Point,
  type RoomSpace,
} from "../src/utils/obstacles";

const plaza = ROOM_MANIFESTS["downtown-plaza"]!;
const plazaSpace: RoomSpace = {
  walkable: plaza.walkablePolygon,
  obstacles: plaza.obstacles ?? [],
};
const fountain = plazaSpace.obstacles.find((o) => o.prop === "fountain");

async function travel(page: Page, name: string) {
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}

async function avatarStage(page: Page): Promise<Point> {
  const character = page.locator(".your-character");
  return {
    x: Number(await character.getAttribute("data-stage-x")),
    y: Number(await character.getAttribute("data-stage-y")),
  };
}

/** Screen point for a stage point, using the camera offset and scale the viewport applies. */
async function screenPoint(page: Page, stage: Point) {
  const ground = await page.locator(".camera-viewport-ground").boundingBox();
  if (!ground) throw new Error("ground not visible");
  const offset = Number(
    await page.locator(".camera-viewport").getAttribute("data-camera-offset"),
  );
  const scale = ground.height / plaza.stageHeight;
  return {
    x: ground.x + (stage.x - offset) * scale,
    y: ground.y + stage.y * scale,
  };
}

/** Records every avatar stage position while the avatar walks. */
async function recordWalk(page: Page, ms: number): Promise<Point[]> {
  return page.evaluate(
    (duration) =>
      new Promise<Point[]>((resolve) => {
        const samples: { x: number; y: number }[] = [];
        const character =
          document.querySelector<HTMLElement>(".your-character");
        const started = performance.now();
        const sample = () => {
          if (character) {
            const x = Number(character.dataset.stageX);
            const y = Number(character.dataset.stageY);
            const last = samples.at(-1);
            if (!last || last.x !== x || last.y !== y) samples.push({ x, y });
          }
          if (performance.now() - started < duration)
            requestAnimationFrame(sample);
          else resolve(samples);
        };
        sample();
      }),
    ms,
  );
}

async function clickStage(page: Page, stage: Point) {
  const point = await screenPoint(page, stage);
  await page.mouse.click(point.x, point.y);
}

async function settle(page: Page, target: Point) {
  await expect
    .poll(
      async () => {
        const at = await avatarStage(page);
        return Math.hypot(at.x - target.x, at.y - target.y) < 1;
      },
      { timeout: 15000 },
    )
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/?debug=obstacles");
  await travel(page, "Downtown Plaza");
});

test("the avatar walks around the Plaza fountain and never overlaps it", async ({
  page,
}) => {
  expect(fountain).toBeDefined();
  if (!fountain || fountain.shape !== "ellipse") return;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // Start west of the fountain, then click a spot on its far side.
  const west = { x: fountain.center.x - 260, y: 690 };
  await clickStage(page, west);
  await settle(page, west);
  const east = { x: fountain.center.x + 260, y: 690 };
  const walk = recordWalk(page, 3000);
  await clickStage(page, east);
  const samples = await walk;
  await settle(page, east);

  let previous = west;
  for (const sample of samples) {
    expect(isFreePoint(sample, plazaSpace, AVATAR_RADIUS)).toBe(true);
    expect(isFreeSegment(previous, sample, plazaSpace, AVATAR_RADIUS)).toBe(
      true,
    );
    previous = sample;
  }
  expect(errors).toEqual([]);
});

test("a click inside the fountain ends on its edge", async ({ page }) => {
  if (!fountain || fountain.shape !== "ellipse") throw new Error("no fountain");
  await clickStage(page, { x: fountain.center.x, y: fountain.center.y + 10 });
  await expect
    .poll(async () => {
      const at = await avatarStage(page);
      return isFreePoint(at, plazaSpace, AVATAR_RADIUS);
    })
    .toBe(true);
  const at = await avatarStage(page);
  const reach = Math.hypot(
    at.x - fountain.center.x,
    (at.y - fountain.center.y) * (fountain.rx / fountain.ry),
  );
  expect(reach).toBeGreaterThan(fountain.rx - 4);
  expect(reach).toBeLessThan(fountain.rx + AVATAR_RADIUS + 12);
});

test("portals still reach their rooms around the obstacles", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const portal = plaza.portals.find((p) => p.targetRoomId === "club-pulse");
  if (!portal) throw new Error("no club pulse portal");
  const { x1, x2, y1, y2 } = portal.triggerBounds;
  await page.getByRole("button", { name: "Map", exact: true }).waitFor();
  // Walk onto the trigger by clicking inside it.
  const centre = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  await clickStage(page, centre);
  await expect(
    page.getByRole("heading", { name: "Club Pulse", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  expect(errors).toEqual([]);
});

test("arrow keys slide along and never push into the fountain", async ({
  page,
}) => {
  if (!fountain || fountain.shape !== "ellipse") throw new Error("no fountain");
  const west = { x: fountain.center.x - 200, y: 690 };
  await clickStage(page, west);
  await settle(page, west);
  await page.locator(".camera-viewport-ground").focus();
  const samples: Point[] = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("ArrowRight");
    samples.push(await avatarStage(page));
  }
  for (const sample of samples) {
    expect(isFreePoint(sample, plazaSpace, AVATAR_RADIUS)).toBe(true);
  }
});

test("walking onto a bench seat sits the avatar and shows hearts", async ({
  page,
}) => {
  const bench = plazaSpace.obstacles.find((o) => o.prop === "bench");
  test.skip(!bench, "Downtown Plaza has no bench in this layout");
  if (!bench?.seat) return;
  await page.getByRole("button", { name: "Sit on the bench" }).click();
  await expect(page.locator(".world-prop-hearts").first()).toBeVisible({
    timeout: 20000,
  });
});
