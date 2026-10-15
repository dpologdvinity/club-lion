import type { ShapeId } from "../utils/shapeSorter.ts";

/** Each shape drawn in a 100 × 100 box, so a glyph can be scaled into a hole. */
const PATHS: Record<ShapeId, string> = {
  circle: "M50 4a46 46 0 1 1-0.1 0Z",
  square: "M6 20Q6 6 20 6H80Q94 6 94 20V80Q94 94 80 94H20Q6 94 6 80Z",
  triangle: "M50 6L96 92Q98 96 94 96H6Q2 96 4 92Z",
  star: "M50 2L62 36H98L69 57L80 92L50 71L20 92L31 57L2 36H38Z",
  heart:
    "M50 92C18 68 2 50 2 30C2 14 14 4 28 4C38 4 46 10 50 18C54 10 62 4 72 4C86 4 98 14 98 30C98 50 82 68 50 92Z",
};

/** One of the five sorter shapes, filled with a color. */
export function ShapeGlyph({ shape, fill }: { shape: ShapeId; fill: string }) {
  return <path d={PATHS[shape]} fill={fill} strokeLinejoin="round" />;
}
