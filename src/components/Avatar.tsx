import React from "react";
import type { AvatarLook, EntityAction } from "../types/world.ts";
import { DEFAULT_AVATAR_LOOK } from "../types/world.ts";
import { generateAvatarLayersString } from "./avatarSvg.ts";

export interface AvatarProps extends React.SVGProps<SVGSVGElement> {
  look?: AvatarLook;
  action?: EntityAction | string;
  size?: number;
}

/**
 * Renders a vector Y2K fashion-doll avatar SVG with layered clothing,
 * glam makeup looks, hairstyles, accessories, and action animations.
 *
 * Canvas coordinates: universal 120×160 coordinate space.
 */
export function Avatar({
  look = DEFAULT_AVATAR_LOOK,
  action = "idle",
  size,
  width,
  height,
  className = "",
  style,
  ...props
}: AvatarProps) {
  const renderWidth = size ?? width ?? 120;
  const renderHeight =
    size !== undefined
      ? Math.round((Number(size) * 160) / 120)
      : (height ?? 160);

  // Gradient and clip IDs must be unique per instance on the page
  const idPrefix = `av${React.useId()}`;
  const innerLayers = React.useMemo(() => {
    return generateAvatarLayersString(look, action, idPrefix);
  }, [look, action, idPrefix]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 160"
      width={renderWidth}
      height={renderHeight}
      className={`chibi-avatar action-${action} ${className}`.trim()}
      role="img"
      aria-label={props["aria-label"] || "Chibi avatar"}
      style={{
        display: "inline-block",
        overflow: "visible",
        verticalAlign: "middle",
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: innerLayers }}
      {...props}
    />
  );
}

export default Avatar;
