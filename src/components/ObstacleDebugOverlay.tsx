import type { RoomFrame } from "../rooms/roomSpace.ts";
import { obstacleCenter } from "../utils/worldProps.ts";
import "./ObstacleDebugOverlay.css";

/** `?debug=obstacles`: draws solid scenery, its body clearance ring, and the walkable floor. */
export function ObstacleDebugOverlay({ frame }: { frame: RoomFrame }) {
  const { space, radius, size, unit } = frame;
  const labelSize = unit === "px" ? 16 : 3;
  const walkable = space.walkable.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg
      className="obstacle-debug"
      viewBox={`0 0 ${size.width} ${size.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        points={walkable}
        fill="none"
        stroke="#00e0ff"
        strokeDasharray="10 6"
        vectorEffect="non-scaling-stroke"
        strokeWidth={2}
      />
      {space.obstacles.map((obstacle) => {
        const center = obstacleCenter(obstacle);
        const shape =
          obstacle.shape === "ellipse" ? (
            <>
              <ellipse
                cx={obstacle.center.x}
                cy={obstacle.center.y}
                rx={obstacle.rx}
                ry={obstacle.ry}
                fill="rgba(255, 60, 60, 0.35)"
                stroke="#ff3c3c"
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
              />
              <ellipse
                cx={obstacle.center.x}
                cy={obstacle.center.y}
                rx={obstacle.rx + radius}
                ry={obstacle.ry + radius}
                fill="none"
                stroke="#ffe14d"
                strokeDasharray="6 5"
                vectorEffect="non-scaling-stroke"
                strokeWidth={1.5}
              />
            </>
          ) : (
            <>
              <polygon
                points={obstacle.points.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="rgba(255, 60, 60, 0.35)"
                stroke="#ff3c3c"
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
              />
            </>
          );
        return (
          <g key={obstacle.id}>
            {shape}
            <text
              x={center.x}
              y={center.y}
              fontSize={labelSize}
              fill="#fff"
              stroke="#000"
              strokeWidth={unit === "px" ? 3 : 0.4}
              paintOrder="stroke"
              textAnchor="middle"
            >
              {obstacle.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
