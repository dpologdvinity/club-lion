import { renderJewelry } from "../avatarSvg.ts";
import { DEFAULT_AVATAR_LOOK } from "../../types/world.ts";
import { escapeXml } from "./shared.ts";

/** Fitting coordinates belong to the art, never to the player's saved look. */
export const ILLUSTRATED_LAYERS = [
  {
    id: "hair-blowout",
    slot: "hair-back",
    transform: "matrix(.95 0 0 .8 10 0)",
  },
  { id: "base-warm", slot: "body", transform: "matrix(1 0 0 1 0 0)" },
  {
    id: "shoes-lavender-platforms",
    slot: "shoes",
    transform: "matrix(.575 0 0 .28 218 1120)",
  },
  {
    id: "bottom-flares-indigo",
    slot: "bottom",
    transform: "matrix(.82 0 0 .8 42 298)",
  },
  { id: "top-holo-halter", slot: "top", transform: "matrix(.8 0 0 .6 70 148)" },
  {
    id: "hair-blowout",
    slot: "hair-front",
    transform: "matrix(.95 0 0 .8 10 0)",
  },
] as const;

export type IllustratedSlot =
  (typeof ILLUSTRATED_LAYERS)[number]["slot"] | "jewelry";
export type IllustratedAsset = (typeof ILLUSTRATED_LAYERS)[number]["id"];

/** Art fitting proof. Deliberately separate from Avatar until wardrobe coverage is complete. */
export function generateIllustratedDollSvg(
  assets: Readonly<Record<IllustratedAsset, string>>,
  hidden: readonly IllustratedSlot[] = [],
  idPrefix = "illustrated-doll",
): string {
  const p = `doll-${idPrefix.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const clothedLegs = !hidden.includes("bottom");
  const layers = ILLUSTRATED_LAYERS.filter(
    (layer) => !hidden.includes(layer.slot),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1536" width="1024" height="1536" role="img" aria-label="Illustrated doll layer fitting preview">
    <defs>
      <filter id="${p}-cutout" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="2" intercept="-.7" /></feComponentTransfer></filter>
      <clipPath id="${p}-fringe"><path d="M0 0H1024V185H0Z M0 185H380V400H0Z M650 185H1024V400H650Z" /></clipPath>
      <clipPath id="${p}-body"><path d="M0 0H1024V650H0Z M640 650H810V980H640Z M280 1350H510V1536H280Z M570 1350H750V1536H570Z" /></clipPath>
    </defs>
    ${layers
      .map((layer) => {
        const clip =
          layer.slot === "hair-front"
            ? `${p}-fringe`
            : layer.slot === "body" && clothedLegs
              ? `${p}-body`
              : undefined;
        const underlay =
          layer.slot === "hair-back"
            ? `<path d="M360 115Q510 35 660 120L680 440Q520 490 355 430Z" fill="#211009" />`
            : "";
        return `<g class="illustrated-${layer.slot}"${clip ? ` clip-path="url(#${clip})"` : ""}>${underlay}<image href="${escapeXml(assets[layer.id])}" width="1024" height="1536" transform="${layer.transform}" filter="url(#${p}-cutout)" /></g>`;
      })
      .join("\n")}
    ${hidden.includes("jewelry") ? "" : `<g class="illustrated-jewelry" transform="matrix(4.25 0 0 6 262 74)">${renderJewelry({ ...DEFAULT_AVATAR_LOOK, jewelryId: "silver_hoops" })}</g>`}
  </svg>`;
}
