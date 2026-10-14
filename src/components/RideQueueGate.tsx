export type RideIcon = "ferris" | "flume" | "teacups" | "carousel" | "drop";

function Icon({ icon }: { icon: RideIcon }) {
  if (icon === "ferris")
    return (
      <>
        <path
          d="M-14 24 L0 0 L14 24"
          stroke="#b45309"
          strokeWidth="4"
          fill="none"
        />
        <circle r="19" fill="none" stroke="#f59e0b" strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <g key={i}>
              <line
                x2={Math.cos(a) * 19}
                y2={Math.sin(a) * 19}
                stroke="#fbbf24"
                strokeWidth="2"
              />
              <circle
                cx={Math.cos(a) * 19}
                cy={Math.sin(a) * 19}
                r="5"
                fill={["#f472b6", "#38bdf8", "#a3e635"][i % 3]}
              />
            </g>
          );
        })}
      </>
    );
  if (icon === "flume")
    return (
      <>
        {[-14, 0, 14].map((x) => (
          <circle key={x} cx={x} cy={x ? -14 : -20} r="4" fill="#38bdf8" />
        ))}
        <rect x="-20" y="-4" width="34" height="16" rx="7" fill="#a0612f" />
        <ellipse
          cx="14"
          cy="4"
          rx="5"
          ry="8"
          fill="#e9b882"
          stroke="#5b3413"
          strokeWidth="2"
        />
        <path
          d="M-24 16 Q0 8 24 16"
          stroke="#38bdf8"
          strokeWidth="5"
          fill="none"
        />
      </>
    );
  if (icon === "teacups")
    return (
      <>
        <ellipse
          cy="15"
          rx="22"
          ry="5"
          fill="#fef3c7"
          stroke="#b45309"
          strokeWidth="3"
        />
        <path
          d="M17 -2 q9 0 7 8 q-2 6 -9 5"
          stroke="#f59e0b"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M-19 -6 Q-17 14 0 14 Q17 14 19 -6 Z"
          fill="#fde047"
          stroke="#b45309"
          strokeWidth="3"
        />
        <circle cx="-4" cy="4" r="5" fill="#f59e0b" />
        <path
          d="M-3 -1 q4 -5 8 -2"
          stroke="#16a34a"
          strokeWidth="2.5"
          fill="none"
        />
      </>
    );
  if (icon === "carousel")
    return (
      <>
        <path d="M-24 -8 L0 -24 L24 -8 Z" fill="#dc2626" />
        <line y1="-8" y2="22" stroke="#ca8a04" strokeWidth="3" />
        <ellipse
          cy="8"
          rx="13"
          ry="7"
          fill="#fde68a"
          stroke="#92400e"
          strokeWidth="2"
        />
        <path
          d="M8 5 L15 -4 L20 -1 L14 7 Z"
          fill="#fde68a"
          stroke="#92400e"
          strokeWidth="2"
        />
        <path
          d="M-8 14 L-11 22 M7 14 L10 22"
          stroke="#92400e"
          strokeWidth="3"
        />
      </>
    );
  return (
    <>
      <rect x="-5" y="-26" width="10" height="50" rx="3" fill="#e11d48" />
      <rect x="-15" y="-6" width="30" height="10" rx="4" fill="#14b8a6" />
      <path
        d="M-22 -8 V10 M-27 4 L-22 12 L-17 4 M22 -8 V10 M17 4 L22 12 L27 4"
        stroke="#7c3aed"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/** Brass queue posts, a velvet rope and a picture sign (no words to read). */
export function RideQueueGate({
  x,
  y,
  icon,
}: {
  x: number;
  y: number;
  icon: RideIcon;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-20" cy="2" rx="70" ry="9" fill="#00000026" />
      <path
        d="M-70 -30 Q-35 -8 0 -30"
        stroke="#be123c"
        strokeWidth="6"
        fill="none"
      />
      {[-70, 0].map((px) => (
        <g key={px}>
          <rect
            x={px - 4}
            y="-36"
            width="8"
            height="36"
            rx="3"
            fill="#ca8a04"
          />
          <circle
            cx={px}
            cy="-38"
            r="7"
            fill="#fde047"
            stroke="#a16207"
            strokeWidth="2"
          />
        </g>
      ))}
      <rect x="37" y="-100" width="7" height="100" rx="3" fill="#78350f" />
      <circle
        cx="40"
        cy="-128"
        r="34"
        fill="#fffbeb"
        stroke="#f59e0b"
        strokeWidth="5"
      />
      <g transform="translate(40 -128)">
        <Icon icon={icon} />
      </g>
      <g className="sm-twinkle" style={{ "--sm-dur": "1.4s" }}>
        <path
          d="M76 -166 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z"
          fill="#fde047"
        />
      </g>
    </g>
  );
}
