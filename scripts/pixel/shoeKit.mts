/**
 * Shoe kit sprites (shoe-kit-NNN.png) on the doll's 64×96 grid, drawn from
 * the recipes in src/components/avatar/pixelShoeKit.ts.
 * Run: node --experimental-strip-types scripts/pixel/shoeKit.mts
 */
import { renderAll, shade } from "./sprites.mts";
import {
  SHOE_KIT,
  type ShoeKitEntry,
} from "../../src/components/avatar/pixelShoeKit.ts";

/** One foot; `x` is the inner edge, `dir` -1 for the left foot, 1 for the right. */
function foot(e: ShoeKitEntry, x: number, dir: -1 | 1): string {
  const f = e.color;
  const a = e.accent;
  const toe = x + dir * 9; // toes point outwards like the doll's stance
  const lo = Math.min(x, toe);
  const parts: string[] = [];
  const shaft = e.cut === "highboots" ? 68 : e.cut === "boots" ? 77 : undefined;
  if (shaft !== undefined) {
    parts.push(
      `<rect x="${dir < 0 ? x - 6.6 : x}" y="${shaft}" width="6.6" height="${85 - shaft}" fill="${f}"/>`,
      `<rect x="${dir < 0 ? x - 6.6 : x}" y="${shaft}" width="6.6" height="1.6" fill="${a}"/>`,
    );
  }
  if (e.cut === "sandals") {
    parts.push(
      `<rect x="${lo}" y="87" width="9" height="1.6" fill="${e.sole}"/>`,
      `<rect x="${lo + 1}" y="84.6" width="7" height="1.2" fill="${f}"/>`,
      `<rect x="${dir < 0 ? x - 2 : x + 1}" y="83.4" width="1.2" height="4" fill="${f}"/>`,
    );
    return parts.join("");
  }
  parts.push(
    `<path d="M${x} 84H${toe - dir}Q${toe} 85.6 ${toe} 88H${x}Z" fill="${f}"/>`,
  );
  if (e.cut === "sneakers")
    parts.push(
      `<rect x="${lo}" y="87.4" width="9" height="1.6" fill="${e.sole}"/>`,
      `<rect x="${lo + 2}" y="85" width="4" height="1" fill="${a}"/>`,
    );
  else if (e.cut === "heels")
    parts.push(
      `<rect x="${dir < 0 ? x - 6 : x}" y="81.6" width="6" height="1.4" fill="${a}"/>`,
      `<rect x="${lo}" y="87.6" width="9" height="0.8" fill="${shade(f, -0.35)}"/>`,
    );
  else if (e.cut === "flats")
    parts.push(
      `<rect x="${lo + 3}" y="84.4" width="3" height="1.2" fill="${a}"/>`,
    );
  else
    parts.push(
      `<rect x="${lo}" y="87.6" width="9" height="1.2" fill="${shade(f, -0.4)}"/>`,
    );
  return parts.join("");
}

await renderAll(
  SHOE_KIT.map((e) => ({
    name: `shoe-kit-${e.id.slice(5)}`,
    svg: foot(e, 31.4, -1) + foot(e, 32.6, 1),
    shading: true as const,
  })),
);
console.log(`${SHOE_KIT.length} shoe sprites written`);
