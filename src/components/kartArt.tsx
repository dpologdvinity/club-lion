/** Shared kart and animal-driver drawings for Lion Speedway and the kart race. */

export type Animal = "lion" | "zebra" | "giraffe" | "hippo";

/** A front-facing animal driver head in a racing helmet band, about 48 units wide. */
export function AnimalFace({ kind }: { kind: Animal }) {
  const eyes = (y: number, dx: number) => (
    <>
      {[-dx, dx].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="3.6" ry="4.4" fill="#2b2233" />
          <circle cx={x + 1.2} cy={y - 1.6} r="1.3" fill="#fff" />
        </g>
      ))}
    </>
  );
  if (kind === "lion")
    return (
      <g>
        <circle r="24" fill="#d9792b" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 21}
              cy={Math.sin(a) * 21}
              r="7"
              fill={i % 2 ? "#c4651f" : "#e58b33"}
            />
          );
        })}
        <circle cx="-12" cy="-13" r="5" fill="#f6c25c" />
        <circle cx="12" cy="-13" r="5" fill="#f6c25c" />
        <circle r="16" fill="#ffd27a" />
        {eyes(-3, 6)}
        <ellipse cy="6" rx="8" ry="6" fill="#fff0cf" />
        <path d="M-3 3h6l-3 3.5Z" fill="#7a3e22" />
        <path
          d="M-4 8.5q4 3.5 8 0"
          fill="none"
          stroke="#7a3e22"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="-10" cy="5" r="2.6" fill="#ff9d8a" opacity=".7" />
        <circle cx="10" cy="5" r="2.6" fill="#ff9d8a" opacity=".7" />
      </g>
    );
  if (kind === "zebra")
    return (
      <g>
        <path d="M-12-14l-5-14l10 9Z M12-14l5-14l-10 9Z" fill="#f4f4f6" />
        <path d="M-12-16l-3-8l5 5Z M12-16l3-8l-5 5Z" fill="#ffb3c1" />
        <path d="M-6-22q6-12 12 0v8h-12Z" fill="#2b2233" />
        <ellipse rx="17" ry="19" fill="#f8f8fa" />
        {[-13, -6, 1].map((y) => (
          <path
            key={y}
            d={`M-17 ${y}q6 3 9 0M17 ${y}q-6 3 -9 0`}
            fill="none"
            stroke="#2b2233"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <path d="M-5-18q5 5 10 0" stroke="#2b2233" strokeWidth="3" />
        {eyes(-4, 7)}
        <ellipse cy="11" rx="12" ry="8.5" fill="#6d6577" />
        <circle cx="-4.5" cy="10" r="1.8" fill="#2b2233" />
        <circle cx="4.5" cy="10" r="1.8" fill="#2b2233" />
        <path
          d="M-4 15q4 2.5 8 0"
          fill="none"
          stroke="#f8f8fa"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    );
  if (kind === "giraffe")
    return (
      <g>
        {[-7, 7].map((x) => (
          <g key={x}>
            <path
              d={`M${x} -14L${x * 1.2} -28`}
              stroke="#c98a36"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx={x * 1.2} cy="-29" r="4" fill="#8a5424" />
          </g>
        ))}
        <ellipse cx="-17" cy="-10" rx="7" ry="3.6" fill="#f2b443" />
        <ellipse cx="17" cy="-10" rx="7" ry="3.6" fill="#f2b443" />
        <ellipse rx="16" ry="19" fill="#f6c453" />
        {[
          [-9, -12, 4],
          [8, -14, 3.4],
          [-12, 2, 3],
          [11, 0, 3.6],
          [0, -17, 2.6],
        ].map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#c27a2c" />
        ))}
        {eyes(-4, 6.5)}
        <ellipse cy="11" rx="11" ry="8" fill="#ffe2a3" />
        <circle cx="-4" cy="9.5" r="1.6" fill="#8a5424" />
        <circle cx="4" cy="9.5" r="1.6" fill="#8a5424" />
        <path
          d="M-4 14q4 2.5 8 0"
          fill="none"
          stroke="#8a5424"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    );
  return (
    <g>
      <circle cx="-14" cy="-15" r="5.5" fill="#9b86c4" />
      <circle cx="14" cy="-15" r="5.5" fill="#9b86c4" />
      <circle cx="-14" cy="-15" r="2.6" fill="#ffb3c1" />
      <circle cx="14" cy="-15" r="2.6" fill="#ffb3c1" />
      <ellipse cy="-2" rx="19" ry="17" fill="#b6a2dc" />
      {eyes(-7, 7)}
      <ellipse cy="9" rx="20" ry="12" fill="#cbb9ea" />
      <ellipse cx="-6.5" cy="6" rx="2.4" ry="3" fill="#6f5a98" />
      <ellipse cx="6.5" cy="6" rx="2.4" ry="3" fill="#6f5a98" />
      <path
        d="M-8 14q8 4 16 0"
        fill="none"
        stroke="#6f5a98"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Side-view kart facing right, wheels resting on y=0, about 120 units long. */
export function SideKart({
  color,
  number,
  driver,
}: {
  color: string;
  number: number;
  /** Omit to leave the seat free for the player's own avatar. */
  driver?: Animal;
}) {
  const wheel = (x: number, r: number) => (
    <g transform={`translate(${x} ${-r})`}>
      <circle r={r} fill="#23202b" />
      <circle r={r * 0.55} fill="#8c8a99" />
      <circle r={r * 0.22} fill="#e6e2ef" />
    </g>
  );
  return (
    <g>
      <ellipse cx="2" cy="1" rx="62" ry="6" fill="#000" opacity=".18" />
      <path d="M-56-46h22v8h-22Z" fill="#2b2233" />
      <path d="M-50-40l6 18" stroke="#2b2233" strokeWidth="4" />
      <path
        d="M-58-26Q-58-36-46-36H-6Q4-36 12-30L52-22Q62-20 62-14V-10Q62-6 56-6H-52Q-58-6-58-12Z"
        fill={color}
        stroke="#2b2233"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M-48-30H-8Q2-30 8-26"
        fill="none"
        stroke="#fff"
        strokeOpacity=".55"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="28"
        cy="-16"
        r="8.5"
        fill="#fff"
        stroke="#2b2233"
        strokeWidth="2"
      />
      <text
        x="28"
        y="-12.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill="#2b2233"
        fontFamily="system-ui, sans-serif"
      >
        {number}
      </text>
      <path
        d="M8-36l10-14"
        stroke="#2b2233"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="18"
        cy="-50"
        r="5"
        fill="none"
        stroke="#2b2233"
        strokeWidth="3"
      />
      {driver && (
        <g transform="translate(-14 -58) scale(.85)">
          <AnimalFace kind={driver} />
        </g>
      )}
      {wheel(-36, 17)}
      {wheel(40, 14)}
    </g>
  );
}

/** The golden Lion Speedway trophy, standing on y=0, about 90 units tall. */
export function LionTrophy() {
  return (
    <g>
      <path d="M-22 0h44l-5-14h-34Z" fill="#a8620a" />
      <rect x="-7" y="-28" width="14" height="16" fill="#e8a317" />
      <path
        d="M-32-74q-22 0-17 19q4 11 19 9M32-74q22 0 17 19q-4 11-19 9"
        fill="none"
        stroke="#f5b700"
        strokeWidth="7"
      />
      <path
        d="M-32-84h64q0 52-32 58q-32-6-32-58Z"
        fill="#ffcf3d"
        stroke="#b36d00"
        strokeWidth="3"
      />
      <path
        d="M-22-78q2 30 14 42"
        fill="none"
        stroke="#fff6c4"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".8"
      />
      <g transform="translate(0 -58) scale(.62)">
        <AnimalFace kind="lion" />
      </g>
    </g>
  );
}
