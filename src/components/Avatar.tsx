import React from "react";
import type { AvatarLook, EntityAction } from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";
import { PORTRAIT_VIEWBOX, generateAvatarLayersString } from "./avatarSvg.ts";

export interface AvatarProps extends React.SVGProps<SVGSVGElement> {
  look?: AvatarLook;
  action?: EntityAction | string;
  size?: number;
  /** "portrait" crops to head and shoulders so the face reads large. */
  framing?: "full" | "portrait";
  /** Slightly larger head so faces stay readable at small world sizes. */
  headBoost?: boolean;
}

/**
 * Renders a vector Y2K fashion-doll avatar SVG with layered clothing,
 * glam makeup looks, hairstyles, accessories, and action animations.
 *
 * Canvas coordinates: universal 120×160 coordinate space. Memoized because
 * the world re-renders every walking frame while the look rarely changes.
 */
export const Avatar = React.memo(function Avatar({
  look = DEFAULT_AVATAR_LOOK,
  action = "idle",
  size,
  framing = "full",
  headBoost = false,
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
  const innerLayers = React.useMemo(() => {
    return generateAvatarLayersString(look, action, idPrefix, headBoost);
  }, [look, action, idPrefix, headBoost]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={portrait ? PORTRAIT_VIEWBOX : "0 0 120 160"}
      width={renderWidth}
      height={renderHeight}
      className={`chibi-avatar action-${action}${portrait ? " framing-portrait" : ""} ${className}`.trim()}
      role="img"
      aria-label={props["aria-label"] || "Chibi avatar"}
      style={{
        display: "inline-block",
        overflow: portrait ? "hidden" : "visible",
        verticalAlign: "middle",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: innerLayers }}
      {...props}
    />
  );
});

export default Avatar;
