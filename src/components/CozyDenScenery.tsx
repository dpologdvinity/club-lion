import { memo } from "react";

export const CozyDenScenery = memo(function CozyDenScenery() {
  return (
    <>
      <path fill="#e7c8ac" d="M0 0H1920V720H0Z" />
      <path d="M0 0H1920V75H0Z" fill="#a87455" />
      <path d="M0 72H1920V90H0Z" fill="#f6dfb9" />
      <path d="M0 520H1920V720H0Z" fill="#b88760" />
      {[555, 600, 650, 710].map((y) => (
        <path key={y} d={`M0 ${y}H1920`} stroke="#996d4f" strokeWidth="3" />
      ))}
      <path d="M0 512H1920V540H0Z" fill="#f3d6ae" />
      <g transform="translate(1080 135)">
        <path
          d="M0 0h340v240H0Z"
          fill="#7fabb0"
          stroke="#9b7355"
          strokeWidth="14"
        />
        <circle cx="260" cy="60" r="33" fill="#ffebb2" />
        <path d="M0 180Q80 110 150 175T340 150V240H0Z" fill="#6c956e" />
        <g fill="#d0dcb2">
          <g className="sm-drift">
            <path d="M15 80q30-40 55 0h-55M170 110q30-40 55 0h-55" />
          </g>
        </g>
        <path d="M170 0v240M0 120h340" stroke="#f7e2bd" strokeWidth="10" />
        <path
          d="M-35-10H65Q25 120 40 240H-35ZM275-10H375V240H300Q315 120 275-10Z"
          fill="#789581"
        />
        <path d="M-30 150h72M300 150h70" stroke="#d8b974" strokeWidth="9" />
      </g>
      <g transform="translate(650 370)">
        <path
          d="M0 80Q-35 0 30 0H170Q235 0 200 80V155H0Z"
          fill="#7c9c84"
          stroke="#486b59"
          strokeWidth="6"
        />
        <path d="M5 88h190v60H5Z" fill="#b3c9a0" />
        <path
          d="M-30 80q20-35 50 0v72h-50ZM180 80q20-35 50 0v72h-50Z"
          fill="#6f9078"
        />
        <path d="M0 156v25M200 156v25" stroke="#73573f" strokeWidth="14" />
      </g>
      <ellipse cx="1000" cy="603" rx="435" ry="62" fill="#d5a26e" />
      <ellipse
        cx="1000"
        cy="603"
        rx="400"
        ry="47"
        fill="none"
        stroke="#edcd96"
        strokeWidth="8"
      />
      <path d="M1080 502h240v60h-240Z" fill="#9b6c49" />
      <ellipse cx="1200" cy="496" rx="145" ry="30" fill="#c89965" />
      <g transform="translate(1630 170)">
        <path
          d="M0 0h195v350H0Z"
          fill="#946846"
          stroke="#704f37"
          strokeWidth="8"
        />
        {[80, 175, 270].map((y) => (
          <g key={y}>
            <path d={`M5 ${y}h185v12H5Z`} fill="#d2a775" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`translate(${15 + i * 27} ${y - 65})`}>
                <rect
                  width="19"
                  height="63"
                  rx="3"
                  fill={["#7f9b89", "#d7b565", "#b77e6a"][i % 3]}
                />
                <path d="M4 10h10M4 50h10" stroke="#f6deab" strokeWidth="3" />
              </g>
            ))}
          </g>
        ))}
      </g>
      <g transform="translate(150 170)">
        <rect width="100" height="120" rx="8" fill="#9e7755" />
        <rect x="10" y="10" width="80" height="100" fill="#eddbad" />
        <path d="M25 88Q30 40 50 35Q80 40 80 88Z" fill="#d7a45b" />
        <circle cx="43" cy="58" r="4" fill="#4c553a" />
        <circle cx="64" cy="58" r="4" fill="#4c553a" />
      </g>
      <path d="M100 390H250V520H100Z" fill="#a97c54" />
      <path
        d="M120 390Q75 320 130 300Q170 320 160 390Q190 300 230 320Q260 365 180 390Z"
        fill="#5a8055"
      />
    </>
  );
});
