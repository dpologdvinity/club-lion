import React from "react";
import type { AvatarLook, EntityAction } from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";
import {
  PIXEL_FEET_VIEWBOX,
  PIXEL_OUTFIT_VIEWBOX,
  PIXEL_PORTRAIT_VIEWBOX,
  PIXEL_VIEWBOX,
  renderPixelDoll,
} from "./avatar/pixelDoll.ts";

export interface AvatarProps extends React.SVGProps<SVGSVGElement> {
  look?: AvatarLook;
  action?: EntityAction | string;
  size?: number;
  /** "portrait" crops to head and shoulders; "outfit" / "feet" to clothes / shoes. */
  framing?: "full" | "portrait" | "outfit" | "feet";
  /** Slightly larger head so faces stay readable at small world sizes. */
  headBoost?: boolean;
}

/**
 * Renders the Fantage-style pixel doll: a bald base body on a hoverboard with
 * hair, top, bottoms and shoes as stacked pixel-art layers, like Fantage.
 *
 * Canvas coordinates: universal 120×160 coordinate space. Memoized because
 * the world re-renders every walking frame while the look rarely changes.
 */
export const Avatar = React.memo(function Avatar({
  look = DEFAULT_AVATAR_LOOK,
  action = "idle",
  size,
  framing = "full",
  // Kept so callers stay valid; the chibi head is already big at any size.
  headBoost: _headBoost = false,
  width,
  height,
  className = "",
  style,
  ...props
}: AvatarProps) {
  const portrait = framing === "portrait";
  const renderWidth = size ?? width ?? 120;
  // The portrait crop is square; the full figure is 120 × 160
  const renderHeight =
    size !== undefined
      ? Math.round((Number(size) * (portrait ? 1 : 160)) / (portrait ? 1 : 120))
      : (height ?? (portrait ? 120 : 160));

  // Gradient and clip IDs must be unique per instance on the page
  const idPrefix = `av${React.useId()}`;
  const innerLayers = React.useMemo(
    () => renderPixelDoll(look, String(action), idPrefix),
    [look, action, idPrefix],
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={
        portrait
          ? PIXEL_PORTRAIT_VIEWBOX
          : framing === "outfit"
            ? PIXEL_OUTFIT_VIEWBOX
            : framing === "feet"
              ? PIXEL_FEET_VIEWBOX
              : PIXEL_VIEWBOX
      }
      width={renderWidth}
      height={renderHeight}
      className={`chibi-avatar action-${action}${portrait ? " framing-portrait" : ""} ${className}`.trim()}
      role="img"
      aria-label={props["aria-label"] || "Chibi avatar"}
      style={{
        display: "inline-block",
        overflow: framing === "full" ? "visible" : "hidden",
        verticalAlign: "middle",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: innerLayers }}
      {...props}
    />
  );
});

export default Avatar;
