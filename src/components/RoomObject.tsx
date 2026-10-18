import type { RoomManifest } from "../rooms/types.ts";
import "./roomObjects.css";
import { mat } from "./MaterialDefs";

type Item = RoomManifest["interactives"][number];

const CABINET_COLORS = [
  "#b57863",
  "#7a6fb0",
  "#4f8f9a",
  "#c0607a",
  "#5f9a6a",
  "#c98a3a",
];

/** Each cabinet keeps its own color, picked from its id. */
function cabinetColor(id: string): string {
  let sum = 0;
  for (const char of id) sum += char.charCodeAt(0);
  return CABINET_COLORS[sum % CABINET_COLORS.length];
}

/** Objects live in stage space, so adding one never depends on screen size. */
export function RoomObject({
  item,
  state,
  onActivate,
}: {
  item: Item;
  state: number;
  onActivate: () => void;
}) {
  if (!item.object) return null;
  const { kind, width, height, steps = 2 } = item.object;
  const step = state % steps;
  const active = step !== 0;
  // Doors and multi-step toys are not on/off switches.
  const toggle = steps === 2 && kind !== "door";
  return (
    <button
      type="button"
      className={`room-object object-${kind} ${active ? "object-active" : ""}`}
      style={{ left: item.position.x, top: item.position.y, width, height }}
      aria-label={item.label}
      aria-pressed={item.reaction && toggle ? active : undefined}
      data-object-state={state}
      data-object-step={step}
      onClick={onActivate}
    >
      <svg viewBox="0 0 200 240" preserveAspectRatio="none" aria-hidden="true">
        {kind === "cabinet" && (
          <>
            <path
              d="M20 8H175L185 180V235H15V180L28 145Z"
              fill={cabinetColor(item.id)}
              stroke="#523f51"
              strokeWidth="7"
            />
            <path d="M20 8H175L185 180V235H15V180L28 145Z" fill={mat("wood")} />
            <path
              d="M32 35H163V139H32Z"
              fill="#334e60"
              stroke="#f4d69d"
              strokeWidth="7"
            />
            <path d="M32 35H163V139H32Z" fill={mat("glass")} />
            {item.actionData.gameId === "memory" && (
              <g fill="#f1d89d" stroke="#b78aa0" strokeWidth="3">
                {[0, 1, 2, 3].map((i) => (
                  <g
                    key={i}
                    transform={`translate(${53 + (i % 2) * 49} ${52 + Math.floor(i / 2) * 39})`}
                  >
                    <rect width="36" height="31" rx="4" />
                    <circle
                      cx="18"
                      cy="15"
                      r="7"
                      fill={i % 2 ? "#719a87" : "#c28b6f"}
                    />
                  </g>
                ))}
              </g>
            )}
            {item.actionData.gameId === "bee" && (
              <g>
                <g className="sm-bob">
                  <ellipse cx="84" cy="70" rx="15" ry="10" fill="#ddeacb" />
                  <ellipse cx="110" cy="70" rx="15" ry="10" fill="#ddeacb" />
                  <ellipse cx="97" cy="85" rx="24" ry="17" fill="#e7bd69" />
                  <path
                    d="M88 69v32M103 69v32"
                    stroke="#6c5a42"
                    strokeWidth="6"
                  />
                </g>
                <path d="M125 130v-22" stroke="#87b58a" strokeWidth="5" />
                <circle cx="125" cy="108" r="13" fill="#d49cab" />
                <circle cx="125" cy="108" r="6" fill="#f3d888" />
              </g>
            )}
            {item.actionData.gameId === "paw" && (
              <g fill="#a4c7b1" stroke="#f1d89d" strokeWidth="3">
                <path d="m100 48 18 24h-11v16H93V72H82ZM100 130l-18-24h11V90h14v16h11ZM44 90l20-16v10h17v13H64v10ZM153 90l-20 17V97h-17V84h17V74Z" />
              </g>
            )}
            {!["memory", "bee", "paw"].includes(
              item.actionData.gameId ?? "",
            ) && (
              <text x="97" y="112" fontSize="64" textAnchor="middle">
                {item.icon}
              </text>
            )}
            <path d="M25 155H175L180 185H20Z" fill="#e8c69b" />
            <circle cx="60" cy="165" r="10" fill="#688a79" />
            <circle cx="125" cy="165" r="7" fill="#ce775d" />
            <circle cx="148" cy="165" r="7" fill="#8c96b2" />
            <path d="M65 205H135" stroke="#503f52" strokeWidth="10" />
          </>
        )}
        {kind === "bubbles" && (
          <>
            <path
              d="M35 160H165L150 230H50Z"
              fill="#ca9c65"
              stroke="#8c7049"
              strokeWidth="6"
            />
            <path d="M35 160H165L150 230H50Z" fill={mat("wood")} />
            <ellipse cx="100" cy="160" rx="65" ry="18" fill="#b9e1d1" />
            <path d="M138 160V90" stroke="#dcc18a" strokeWidth="9" />
            <circle
              cx="138"
              cy="68"
              r="25"
              fill="none"
              stroke="#e7d18e"
              strokeWidth="9"
            />
            <g
              className="sm-bob"
              fill="#c4eee0"
              fillOpacity=".7"
              stroke="#f0fff0"
              strokeWidth="4"
            >
              <circle cx="65" cy="91" r="23" />
              <circle cx="90" cy="35" r="17" />
              <circle cx="40" cy="23" r="10" />
            </g>
          </>
        )}
        {kind === "cake" && (
          <>
            <path d="M15 190H185V225H15Z" fill="#ae845a" />
            <path d="M15 190H185V225H15Z" fill={mat("wood")} />
            <ellipse cx="100" cy="185" rx="88" ry="15" fill="#f1dfb7" />
            <path d="M45 135H155V180H45Z" fill="#d9ad72" />
            <path
              d="M45 135q15 25 30 0q15 25 30 0q15 25 30 0q10 25 20 0"
              fill="#fae6c8"
            />
            <path d="M65 95H135V135H65Z" fill="#e6be88" />
            <path d="M65 95q15 20 30 0q15 20 40 0" fill="#fff0d1" />
            <circle cx="100" cy="85" r="12" fill="#d38d71" />
            <path
              d="M25 180V95Q25 15 100 15Q175 15 175 95V180"
              fill="#cde5d3"
              fillOpacity=".25"
              stroke="#f8e6c4"
              strokeWidth="5"
            />
            <path d="M100 15V0" stroke="#9e7954" strokeWidth="9" />
          </>
        )}
        {kind === "splash" && (
          <>
            <ellipse cx="100" cy="190" rx="95" ry="30" fill="#a0dfd2" />
            <ellipse cx="100" cy="190" rx="95" ry="30" fill={mat("water")} />
            <g
              className={active ? "object-splash" : "sm-bob"}
              fill="#d5fff0"
              stroke="#6bbcaf"
              strokeWidth="3"
            >
              <path d="M40 175Q10 95 55 140Q70 45 100 145Q140 55 150 155Q200 100 170 180Z" />
              <circle cx="40" cy="100" r="8" />
              <circle cx="158" cy="82" r="11" />
              <circle cx="100" cy="40" r="7" />
            </g>
            <ellipse
              cx="100"
              cy="195"
              rx="65"
              ry="13"
              fill="none"
              stroke="#efffe5"
              strokeWidth="5"
            />
          </>
        )}
        {kind === "lily" && (
          <>
            <ellipse cx="55" cy="195" rx="50" ry="24" fill="#658e55" />
            <ellipse cx="55" cy="195" rx="50" ry="24" fill={mat("leaves")} />
            <ellipse cx="150" cy="165" rx="47" ry="22" fill="#82ac65" />
            <ellipse cx="150" cy="165" rx="47" ry="22" fill={mat("leaves")} />
            <g
              transform={`translate(${active ? 108 : 12} ${active ? -30 : 0})`}
            >
              <g className="sm-bob">
                <ellipse cx="50" cy="164" rx="33" ry="25" fill="#89b454" />
                <circle cx="32" cy="143" r="14" fill="#a6cc6a" />
                <circle cx="68" cy="143" r="14" fill="#a6cc6a" />
                <circle cx="32" cy="141" r="5" fill="#345644" />
                <circle cx="68" cy="141" r="5" fill="#345644" />
                <path
                  d="M37 168q13 12 26 0"
                  fill="none"
                  stroke="#345644"
                  strokeWidth="4"
                />
              </g>
            </g>
          </>
        )}
        {kind === "chimes" && (
          <g
            className={active ? "object-chime" : "sm-sway"}
            stroke="#765840"
            strokeWidth="4"
          >
            <path d="M100 0V35M20 40Q100 10 180 40" fill="none" />
            {[40, 80, 120, 160].map((x, i) => (
              <g key={x}>
                <path d={`M${x} 35v${75 + (i % 2) * 40}`} fill="none" />
                <path
                  d={`M${x - 20} ${110 + (i % 2) * 40}q20-35 40 0l-10 42h-20Z`}
                  fill={i % 2 ? "#f2d2ae" : "#e9ac90"}
                />
              </g>
            ))}
          </g>
        )}
        {kind === "blender" && (
          <>
            <path
              d="M40 185H160L170 235H30Z"
              fill="#cf8c62"
              stroke="#755b48"
              strokeWidth="5"
            />
            <path d="M40 185H160L170 235H30Z" fill={mat("metal")} />
            <path
              d="M50 45H150L140 185H60Z"
              fill="#d2eee0"
              stroke="#648578"
              strokeWidth="5"
            />
            <path d="M50 45H150L140 185H60Z" fill={mat("glass")} />
            <path
              className="sm-pulse"
              d="M55 100Q100 80 145 100L138 178H62Z"
              fill="#f4bb6a"
            />
            <path
              d="M155 65q65 0 10 85"
              fill="none"
              stroke="#648578"
              strokeWidth="12"
            />
            <path d="M40 30H160V49H40Z" fill="#648578" />
            <circle cx="100" cy="210" r="12" fill="#f9e3ae" />
          </>
        )}
        {kind === "tea" && (
          <>
            <ellipse cx="65" cy="216" rx="60" ry="15" fill="#e5bc83" />
            <ellipse cx="65" cy="216" rx="60" ry="15" fill={mat("wood")} />
            <path
              d="M15 145H110L95 210H30Z"
              fill="#f7e6bf"
              stroke="#9b7956"
              strokeWidth="5"
            />
            <path
              d="M112 155q55 0 10 35"
              fill="none"
              stroke="#f7e6bf"
              strokeWidth="13"
            />
            <g transform={active ? "rotate(-22 155 85)" : undefined}>
              <path
                d="M120 75q-35 70 10 90h50q30-45-5-90Z"
                fill="#7fa68b"
                stroke="#476e5b"
                strokeWidth="5"
              />
              <path
                d="M120 100L80 80l25 55M180 90q45-20 10 45"
                fill="none"
                stroke="#476e5b"
                strokeWidth="10"
              />
              <path
                d="M125 70h50M150 50v20"
                stroke="#476e5b"
                strokeWidth="10"
              />
            </g>
            <g
              className="sm-drift"
              fill="none"
              stroke="#fff2ce"
              strokeWidth="5"
            >
              <path d="M43 130q-20-20 0-40M76 122q-20-20 0-40" />
            </g>
          </>
        )}
        {kind === "oven" && (
          <>
            <rect
              x="12"
              y="20"
              width="176"
              height="215"
              rx="18"
              fill="#d5996c"
              stroke="#77553e"
              strokeWidth="6"
            />
            <rect
              x="12"
              y="20"
              width="176"
              height="215"
              rx="18"
              fill={mat("metal")}
            />
            <rect
              x="32"
              y="85"
              width="136"
              height="125"
              rx="12"
              fill={active ? "#edbc72" : "#5d6258"}
            />
            <rect
              x="32"
              y="85"
              width="136"
              height="125"
              rx="12"
              fill={mat("glass")}
            />
            <path d="M40 76H160" stroke="#f4d6a0" strokeWidth="10" />
            <circle cx="55" cy="48" r="12" fill="#f7dfac" />
            <circle cx="145" cy="48" r="12" fill="#f7dfac" />
            {active && (
              <path
                d="M50 170q0-60 50-50q50-10 50 50Z"
                fill="#e5a449"
                stroke="#a76b35"
                strokeWidth="5"
              />
            )}
          </>
        )}
        {kind === "prizes" && (
          <>
            <rect
              x="18"
              y="5"
              width="164"
              height="230"
              rx="22"
              fill="#c9a4ae"
              stroke="#72566b"
              strokeWidth="6"
            />
            <rect
              x="18"
              y="5"
              width="164"
              height="230"
              rx="22"
              fill={mat("metal")}
            />
            <rect
              x="35"
              y="25"
              width="130"
              height="135"
              rx="14"
              fill="#d5e5d0"
            />
            <rect
              x="35"
              y="25"
              width="130"
              height="135"
              rx="14"
              fill={mat("glass")}
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={i}
                cx={58 + (i % 3) * 41}
                cy={62 + Math.floor(i / 3) * 54}
                r="22"
                fill={["#e8b26b", "#8fb6a1", "#ba8eaf"][i % 3]}
              />
            ))}
            <circle cx="100" cy="186" r="14" fill="#eee0b3" />
            <path d="M60 210H140V230H60Z" fill="#70596c" />
            {active && <circle cx="100" cy="218" r="16" fill="#ecc070" />}
          </>
        )}
        {kind === "disco" && (
          <>
            <path d="M100 0v50" stroke="#d6c49d" strokeWidth="5" />
            <g className="sm-sway">
              <circle
                cx="100"
                cy="117"
                r="65"
                fill={active ? "#d2a1be" : "#a1c2b4"}
                stroke="#e9d9aa"
                strokeWidth="6"
              />
              <circle cx="100" cy="117" r="65" fill={mat("metal")} />
              <path
                d="M37 105h126M40 135h120M55 160h90M65 60q-25 55 0 110M100 53v129M135 60q25 55 0 110"
                fill="none"
                stroke="#e9d9aa"
                strokeWidth="4"
              />
            </g>
          </>
        )}
        {kind === "fireplace" && (
          <>
            <path
              d="M15 70H185V238H15Z"
              fill="#b77d60"
              stroke="#765744"
              strokeWidth="6"
            />
            <path d="M15 70H185V238H15Z" fill={mat("brick")} />
            <path d="M48 235V135Q100 72 152 135V235" fill="#4d4945" />
            <path d="M0 52H200V82H0ZM25 35H175V52H25Z" fill="#d1ac83" />
            {!active && (
              <g className="sm-flicker">
                <path
                  d="M60 215Q35 180 87 135Q75 180 112 120Q172 195 135 218Z"
                  fill="#e9a151"
                />
                <path d="M82 215q-20-30 20-55q-5 25 20 45Z" fill="#ffe2a0" />
              </g>
            )}
            <path
              d="m50 224 90-9m-80-5 75 19"
              stroke="#73503a"
              strokeWidth="12"
            />
          </>
        )}
        {kind === "lamp" && (
          <>
            <path d="M100 70V220M55 230h90" stroke="#806047" strokeWidth="12" />
            {active && (
              <ellipse
                cx="100"
                cy="130"
                rx="95"
                ry="95"
                fill="#ffe8a1"
                opacity=".35"
              />
            )}
            <path
              d="M55 20H145L180 105H20Z"
              fill={active ? "#ffe4a1" : "#b9aa83"}
              stroke="#8e7958"
              strokeWidth="5"
            />
          </>
        )}
        {kind === "books" && (
          <>
            <path
              d="M10 60Q65 30 100 70Q145 30 190 60V205Q140 175 100 212Q65 175 10 205Z"
              fill="#f1dcad"
              stroke="#98704b"
              strokeWidth="5"
            />
            <path d="M100 70V212" stroke="#98704b" strokeWidth="4" />
            <circle
              cx={active ? 145 : 55}
              cy="115"
              r="27"
              fill={active ? "#8eae85" : "#e8ae66"}
            />
            <path d="M25 165h50M125 165h50" stroke="#be9b6c" strokeWidth="5" />
          </>
        )}
        {kind === "plant" && (
          <>
            <path
              d="M45 155H155L135 235H65Z"
              fill="#ba7855"
              stroke="#876044"
              strokeWidth="5"
            />
            <path d="M45 155H155L135 235H65Z" fill={mat("plaster")} />
            <g
              className={active ? "object-chime" : "sm-sway"}
              fill="#6d965e"
              stroke="#486d45"
              strokeWidth="4"
            >
              <path d="M100 170Q5 160 25 80Q100 85 100 170Q90 30 145 20Q190 80 100 170Q200 120 180 75Q120 80 100 170Z" />
            </g>
          </>
        )}
        {kind === "cushion" && (
          <>
            <path
              d={
                active
                  ? "M10 115Q100 150 190 115L180 220Q100 235 20 220Z"
                  : "M10 90Q100 65 190 90L180 220Q100 235 20 220Z"
              }
              fill="#e5b962"
              stroke="#b68343"
              strokeWidth="6"
            />
            <path
              d={
                active
                  ? "M10 115Q100 150 190 115L180 220Q100 235 20 220Z"
                  : "M10 90Q100 65 190 90L180 220Q100 235 20 220Z"
              }
              fill={mat("fabric")}
            />
            <circle cx="100" cy="158" r="32" fill="#f7d88f" />
            <path
              d="M100 108v-16M100 208v16M50 158H34M150 158h16"
              stroke="#f7d88f"
              strokeWidth="6"
            />
          </>
        )}
        {kind === "sandcastle" && (
          <>
            <path
              d="M15 235Q100 215 185 235V150H15Z"
              fill="#e8c88a"
              stroke="#b98f52"
              strokeWidth="5"
            />
            <path d="M15 235Q100 215 185 235V150H15Z" fill={mat("sand")} />
            <path
              d={
                active
                  ? "M40 160V70h30V40h20V70h20V30h20V70h20V160Z"
                  : "M45 160V105h28V85h54V105h28V160Z"
              }
              fill="#f2d9a3"
              stroke="#b98f52"
              strokeWidth="5"
            />
            <path
              d={
                active
                  ? "M40 160V70h30V40h20V70h20V30h20V70h20V160Z"
                  : "M45 160V105h28V85h54V105h28V160Z"
              }
              fill={mat("sand")}
            />
            <path d="M90 160v-30q10-18 20 0v30" fill="#b98f52" />
            {active && (
              <path
                className="sm-sway"
                d="M100 40V5l36 14Z"
                fill="#ee7a9b"
                stroke="#b24d6c"
                strokeWidth="4"
              />
            )}
          </>
        )}
        {kind === "shell" && (
          <>
            <path
              d="M20 215Q100 190 180 215Q100 245 20 215Z"
              fill="#f4e3bd"
              stroke="#c9a96b"
              strokeWidth="5"
            />
            <path
              d={
                active
                  ? "M30 190Q100 20 170 190Q100 215 30 190Z"
                  : "M30 190Q100 110 170 190Q100 215 30 190Z"
              }
              fill="#f7b6c6"
              stroke="#c9738c"
              strokeWidth="5"
            />
            <path
              d="M100 195L60 160M100 195V140M100 195L140 160"
              stroke="#c9738c"
              strokeWidth="4"
              fill="none"
            />
            {active && (
              <circle
                className="object-chime"
                cx="100"
                cy="180"
                r="16"
                fill="#fffaf0"
                stroke="#d8c9a8"
                strokeWidth="4"
              />
            )}
          </>
        )}
        {kind === "beachball" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            <circle
              cx="100"
              cy="150"
              r="70"
              fill="#fff"
              stroke="#a8a8c0"
              strokeWidth="5"
            />
            <path d="M100 80Q60 150 100 220Q70 150 100 80Z" fill="#ee7a9b" />
            <path d="M100 80Q140 150 100 220Q130 150 100 80Z" fill="#6ec3e8" />
            <path d="M30 150Q100 120 170 150Q100 175 30 150Z" fill="#f7d34d" />
          </g>
        )}
        {kind === "jellyfish" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            <path
              d={
                active
                  ? "M30 120Q30 20 100 20Q170 20 170 120Q100 140 30 120Z"
                  : "M30 110Q30 40 100 40Q170 40 170 110Q100 130 30 110Z"
              }
              fill={active ? "#f6a8e0" : "#c9a6f0"}
              stroke="#8a62c4"
              strokeWidth="5"
            />
            <path
              className="sm-sway"
              d="M55 125q-10 40 5 80M85 130q10 40-5 90M115 130q-10 40 5 90M145 125q10 40-5 80"
              fill="none"
              stroke="#b08ae0"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        )}
        {kind === "treasure" && (
          <>
            <path
              d="M20 235V150H180V235Z"
              fill="#b97a45"
              stroke="#7b4b26"
              strokeWidth="6"
            />
            <path d="M20 235V150H180V235Z" fill={mat("wood")} />
            <path
              d={
                active
                  ? "M20 150Q10 70 60 50L150 30Q190 60 180 150Z"
                  : "M20 150Q20 95 100 95Q180 95 180 150Z"
              }
              fill="#cf8d54"
              stroke="#7b4b26"
              strokeWidth="6"
            />
            <path
              d={
                active
                  ? "M20 150Q10 70 60 50L150 30Q190 60 180 150Z"
                  : "M20 150Q20 95 100 95Q180 95 180 150Z"
              }
              fill={mat("wood")}
            />
            <rect x="88" y="150" width="24" height="28" fill="#f7d34d" />
            {active && (
              <g className="object-chime" fill="#f7d34d" stroke="#c9a02a">
                <circle cx="70" cy="125" r="14" strokeWidth="4" />
                <circle cx="105" cy="115" r="14" strokeWidth="4" />
                <circle cx="135" cy="128" r="14" strokeWidth="4" />
              </g>
            )}
          </>
        )}
        {kind === "snowman" && (
          <>
            <circle
              cx="100"
              cy="190"
              r="48"
              fill="#fff"
              stroke="#b4c7e0"
              strokeWidth="5"
            />
            <circle cx="100" cy="190" r="48" fill={mat("snow")} />
            <circle
              cx="100"
              cy="120"
              r="36"
              fill="#fff"
              stroke="#b4c7e0"
              strokeWidth="5"
            />
            <circle cx="100" cy="120" r="36" fill={mat("snow")} />
            <g className={active ? "object-chime" : undefined}>
              <path
                d="M60 90H140M78 90V45H122V90"
                fill="#4a4a6a"
                stroke="#2e2e48"
                strokeWidth="5"
              />
              <path
                d="M80 140Q100 152 120 140"
                fill="none"
                stroke="#2e2e48"
                strokeWidth="4"
              />
            </g>
            <circle cx="88" cy="112" r="4" fill="#2e2e48" />
            <circle cx="112" cy="112" r="4" fill="#2e2e48" />
            <path d="M100 120l24 6-24 4Z" fill="#f08a3c" />
            <path
              className={active ? "sm-sway" : undefined}
              d="M68 150H132L140 168H60Z"
              fill="#e5546e"
              stroke="#a83348"
              strokeWidth="4"
            />
          </>
        )}
        {kind === "snowglobe" && (
          <>
            <path
              d="M45 235H155L145 195H55Z"
              fill="#9a6a4a"
              stroke="#6d4830"
              strokeWidth="5"
            />
            <path d="M45 235H155L145 195H55Z" fill={mat("wood")} />
            <circle
              cx="100"
              cy="120"
              r="75"
              fill={active ? "#dff1ff" : "#eaf6ff"}
              fillOpacity="0.85"
              stroke="#8fb4d8"
              strokeWidth="5"
            />
            <circle cx="100" cy="120" r="75" fill={mat("glass")} />
            <path
              d="M80 190L100 110L120 190Z"
              fill="#5f9a6a"
              stroke="#3f7248"
              strokeWidth="4"
            />
            <g className={active ? "sm-drift" : undefined} fill="#fff">
              {[60, 85, 115, 140, 100, 75, 125].map((x, i) => (
                <circle key={x} cx={x} cy={70 + ((i * 23) % 90)} r="4" />
              ))}
            </g>
          </>
        )}
        {kind === "campfire" && (
          <>
            <path
              d="M30 225L170 195M170 225L30 195"
              stroke="#7b4b26"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <g className={active ? "object-chime" : "sm-flicker"}>
              <path
                d={
                  active
                    ? "M100 30Q150 100 135 160Q100 205 65 160Q50 100 100 30Z"
                    : "M100 100Q130 130 120 170Q100 200 80 170Q70 130 100 100Z"
                }
                fill="#f08a3c"
                stroke="#c24f1e"
                strokeWidth="5"
              />
              <path
                d="M100 140Q116 158 108 178Q100 190 92 178Q84 158 100 140Z"
                fill="#f7d34d"
              />
            </g>
          </>
        )}
        {kind === "alphorn" && (
          <>
            <path
              d="M20 225L160 90"
              stroke="#b97a45"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M150 70Q190 60 185 120Q160 125 140 100Z"
              fill="#d89a5a"
              stroke="#7b4b26"
              strokeWidth="5"
            />
            {active && (
              <g
                className="object-chime"
                fill="none"
                stroke="#6ec3e8"
                strokeWidth="5"
                strokeLinecap="round"
              >
                <path d="M170 40Q190 20 195 45" />
                <path d="M150 30Q165 5 185 15" />
              </g>
            )}
          </>
        )}
        {kind === "yarn" && (
          <>
            <path
              className={active ? "sm-sway" : undefined}
              d={
                active
                  ? "M60 195Q10 215 120 225Q190 232 170 215"
                  : "M70 200Q60 215 80 222"
              }
              fill="none"
              stroke="#e5546e"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <g className={active ? "object-chime" : undefined}>
              <circle
                cx="90"
                cy="165"
                r="52"
                fill="#ee7a9b"
                stroke="#b24d6c"
                strokeWidth="5"
              />
              <circle cx="90" cy="165" r="52" fill={mat("fabric")} />
              <path
                d="M52 150Q90 185 128 140M45 175Q95 200 135 165M70 118Q110 150 120 120"
                fill="none"
                stroke="#b24d6c"
                strokeWidth="4"
              />
            </g>
          </>
        )}
        {kind === "treats" && (
          <>
            <path
              d="M45 110H155L145 235H55Z"
              fill="#cfe8f2"
              fillOpacity="0.8"
              stroke="#7aa3b8"
              strokeWidth="5"
            />
            <path d="M45 110H155L145 235H55Z" fill={mat("glass")} />
            <path
              d={active ? "M35 95H165L158 110H42Z" : "M40 80H160V110H40Z"}
              fill="#e5546e"
              stroke="#a83348"
              strokeWidth="5"
            />
            <g fill="#d89a5a" stroke="#9a6a3a" strokeWidth="3">
              <rect x="65" y="190" width="40" height="14" rx="7" />
              <rect x="95" y="165" width="34" height="14" rx="7" />
              <rect x="70" y="215" width="50" height="14" rx="7" />
            </g>
            {active && (
              <rect
                className="object-chime"
                x="80"
                y="55"
                width="50"
                height="16"
                rx="8"
                fill="#d89a5a"
                stroke="#9a6a3a"
                strokeWidth="3"
              />
            )}
          </>
        )}
        {kind === "popcorn" && (
          <>
            <path
              d="M40 120H160L150 200H50Z"
              fill="#fff"
              stroke="#c24f4f"
              strokeWidth="5"
            />
            <path
              d="M70 120L65 200M100 120V200M130 120L135 200"
              stroke="#e5546e"
              strokeWidth="9"
            />
            <path
              d="M20 120Q100 40 180 120Z"
              fill="#e5546e"
              stroke="#a83348"
              strokeWidth="5"
            />
            <path d="M50 200H150L140 235H60Z" fill="#8a6a4a" />
            <g
              className={active ? "object-chime" : undefined}
              fill="#fff7d6"
              stroke="#e5c56a"
              strokeWidth="3"
            >
              {(active ? [60, 90, 120, 145, 105] : [75, 110, 130]).map(
                (x, i) => (
                  <circle
                    key={x}
                    cx={x}
                    cy={(active ? 85 : 110) - ((i * 17) % 40)}
                    r="10"
                  />
                ),
              )}
            </g>
          </>
        )}
        {kind === "balloons" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            {[
              { x: 60, fill: "#ee7a9b" },
              { x: 100, fill: "#6ec3e8" },
              { x: 140, fill: "#f7d34d" },
            ].map(({ x, fill }, i) => (
              <g key={x}>
                <path
                  d={`M${x} ${active ? 50 + i * 10 : 90 + i * 8}V235`}
                  stroke="#8a7a8a"
                  strokeWidth="3"
                  fill="none"
                />
                <ellipse
                  cx={x}
                  cy={active ? 40 + i * 10 : 80 + i * 8}
                  rx="30"
                  ry="38"
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth="4"
                />
              </g>
            ))}
          </g>
        )}
        {kind === "fishing" && (
          <>
            <path
              d="M30 235L150 40"
              stroke="#8a5a30"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d={active ? "M150 40V185" : "M150 40V140"}
              stroke="#6a6a7a"
              strokeWidth="3"
              fill="none"
            />
            {active ? (
              <g className="object-chime">
                <path
                  d="M120 195Q150 170 180 195Q150 220 120 195Z"
                  fill="#f08a3c"
                  stroke="#c24f1e"
                  strokeWidth="4"
                />
                <path d="M120 195L100 180V210Z" fill="#f08a3c" />
              </g>
            ) : (
              <circle cx="150" cy="140" r="8" fill="#e5546e" />
            )}
          </>
        )}
        {kind === "seagull" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            <path
              d={
                active
                  ? "M20 70Q60 20 100 110Q140 20 180 70Q140 90 100 150Q60 90 20 70Z"
                  : "M30 120Q65 90 100 135Q135 90 170 120Q135 135 100 165Q65 135 30 120Z"
              }
              fill="#fff"
              stroke="#8a9ab0"
              strokeWidth="5"
            />
            <circle cx="100" cy="135" r="6" fill="#2e2e48" />
            <path d="M100 145L125 152L100 158Z" fill="#f7a53c" />
            <path
              d="M85 175V215M115 175V215"
              stroke="#f7a53c"
              strokeWidth="5"
            />
          </g>
        )}
        {kind === "flag" && (
          <>
            <path
              d="M45 235V20"
              stroke="#6a6a7a"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <g className={active ? "object-chime" : "sm-sway"}>
              <path
                d={
                  active
                    ? "M52 28Q100 5 150 28Q175 40 190 28V108Q175 120 150 108Q100 85 52 108Z"
                    : "M52 28Q100 40 150 28V108Q100 120 52 108Z"
                }
                fill="#fff"
                stroke="#2e2e48"
                strokeWidth="5"
              />
              <path
                d="M52 28H150V58H52ZM52 83H150V108H52Z"
                fill="#2e2e48"
                fillOpacity="0.85"
              />
            </g>
          </>
        )}
        {kind === "duck" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            <path
              d="M25 170Q30 225 100 225Q175 225 180 165Q150 180 120 165Q130 120 100 105Q60 100 60 140Q35 150 25 170Z"
              fill="#f7d34d"
              stroke="#c9a02a"
              strokeWidth="5"
            />
            <circle cx="88" cy="132" r="6" fill="#2e2e48" />
            <path
              d={active ? "M60 140L20 120L30 150Z" : "M60 140L30 140L60 152Z"}
              fill="#f08a3c"
              stroke="#c24f1e"
              strokeWidth="3"
            />
          </g>
        )}
        {kind === "sprinkler" && (
          <>
            <path
              d="M70 235H130L120 190H80Z"
              fill="#6ec3e8"
              stroke="#3f8fb8"
              strokeWidth="5"
            />
            <path d="M70 235H130L120 190H80Z" fill={mat("metal")} />
            <circle cx="100" cy="185" r="16" fill="#e5546e" />
            <g
              className={active ? "sm-pulse" : undefined}
              fill="none"
              stroke="#8fd3f4"
              strokeWidth="6"
              strokeLinecap="round"
            >
              {active ? (
                <path d="M100 170Q40 60 15 120M100 170Q100 40 100 20M100 170Q160 60 185 120" />
              ) : (
                <path d="M100 170Q85 140 75 150M100 170Q115 140 125 150" />
              )}
            </g>
          </>
        )}
        {kind === "periscope" && (
          <>
            <path
              d="M40 235H160V200H40Z"
              fill="#5f6b7a"
              stroke="#3e4652"
              strokeWidth="5"
            />
            <path d="M40 235H160V200H40Z" fill={mat("metal")} />
            <g className={active ? "object-chime" : undefined}>
              <path
                d={
                  active
                    ? "M88 200V40H140V75H112V200Z"
                    : "M88 200V150H140V185H112V200Z"
                }
                fill="#7d8a9a"
                stroke="#3e4652"
                strokeWidth="5"
              />
              <path
                d={
                  active
                    ? "M88 200V40H140V75H112V200Z"
                    : "M88 200V150H140V185H112V200Z"
                }
                fill={mat("metal")}
              />
              <rect
                x="122"
                y={active ? 47 : 157}
                width="14"
                height="20"
                rx="4"
                fill="#8fd3f4"
              />
            </g>
          </>
        )}
        {kind === "kayak" && (
          <g className={active ? "object-chime" : "sm-bob"}>
            <path
              d="M10 180Q100 225 190 180Q100 160 10 180Z"
              fill="#f08a3c"
              stroke="#b95a22"
              strokeWidth="5"
            />
            <path
              d="M10 180Q100 225 190 180Q100 160 10 180Z"
              fill={mat("wood")}
            />
            <path
              d={active ? "M40 110L160 210" : "M30 150L170 165"}
              stroke="#8a5a30"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={active ? "M30 100l20 25-14 6Z" : "M20 140l14 22-12 2Z"}
              fill="#f7d34d"
            />
          </g>
        )}
        {kind === "fountain" && (
          <g>
            {step === 0 && (
              <g className="sm-twinkle" fill="#fffbe0">
                <circle cx="80" cy="70" r="5" />
                <circle cx="120" cy="55" r="4" />
                <circle cx="100" cy="90" r="3" />
              </g>
            )}
            {step === 1 && (
              <g
                className="object-splash"
                fill="#8fd3f4"
                stroke="#4aa3d1"
                strokeWidth="3"
              >
                <circle cx="70" cy="80" r="9" />
                <circle cx="130" cy="75" r="10" />
                <circle cx="100" cy="55" r="8" />
                <circle cx="55" cy="110" r="7" />
                <circle cx="145" cy="105" r="7" />
              </g>
            )}
            {step === 2 && (
              <g className="object-splash">
                {[
                  { x: 100, top: 0, w: 16 },
                  { x: 70, top: 50, w: 11 },
                  { x: 130, top: 50, w: 11 },
                ].map((jet) => (
                  <rect
                    key={jet.x}
                    x={jet.x - jet.w}
                    y={jet.top}
                    width={jet.w * 2}
                    height={175 - jet.top}
                    rx={jet.w}
                    fill="#eaf8ff"
                    fillOpacity="0.85"
                    stroke="#8fd3f4"
                    strokeWidth="3"
                  />
                ))}
                <g fill="#e8f7ff" stroke="#4aa3d1" strokeWidth="2">
                  <circle cx="45" cy="70" r="7" />
                  <circle cx="155" cy="65" r="7" />
                  <circle cx="100" cy="-8" r="8" />
                  <circle cx="30" cy="120" r="6" />
                  <circle cx="170" cy="115" r="6" />
                </g>
              </g>
            )}
            {step === 3 && (
              <g fill="none" strokeWidth="9" strokeLinecap="round">
                <path d="M10 170Q100 -40 190 170" stroke="#ff5a5f" />
                <path d="M22 170Q100 -18 178 170" stroke="#ff9f43" />
                <path d="M34 170Q100 4 166 170" stroke="#ffd84d" />
                <path d="M46 170Q100 26 154 170" stroke="#4cc97a" />
                <path d="M58 170Q100 48 142 170" stroke="#4aa8ff" />
                <path d="M70 170Q100 70 130 170" stroke="#a77bff" />
              </g>
            )}
          </g>
        )}
        {kind === "tree" && (
          <g className={step === 1 ? "object-shake" : undefined}>
            <rect x="88" y="150" width="24" height="90" rx="8" fill="#8a5a30" />
            <rect
              x="88"
              y="150"
              width="24"
              height="90"
              rx="8"
              fill={mat("wood")}
            />
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="#5f9a4e"
              stroke="#3f7238"
              strokeWidth="5"
            />
            <circle cx="100" cy="100" r="70" fill={mat("leaves")} />
            <circle cx="60" cy="120" r="40" fill="#6dab58" />
            <circle cx="140" cy="115" r="42" fill="#6dab58" />
            {step === 2 && (
              <text x="100" y="100" fontSize="56" textAnchor="middle">
                🐒
              </text>
            )}
            {step === 3 && (
              <g className="object-fall" fontSize="34" textAnchor="middle">
                <text x="60" y="190">
                  🥭
                </text>
                <text x="105" y="215">
                  🥭
                </text>
                <text x="150" y="195">
                  🥭
                </text>
              </g>
            )}
          </g>
        )}
        {kind === "bush" && (
          <g>
            <path
              d="M10 230Q0 150 60 140Q80 90 130 110Q190 110 190 230Z"
              fill="#5f9a4e"
              stroke="#3f7238"
              strokeWidth="6"
            />
            <path
              d="M10 230Q0 150 60 140Q80 90 130 110Q190 110 190 230Z"
              fill={mat("leaves")}
            />
            {active && (
              <text
                className="object-pop"
                x="100"
                y="120"
                fontSize="70"
                textAnchor="middle"
              >
                {item.id.endsWith("bunny")
                  ? "🐰"
                  : item.id.endsWith("hedgehog")
                    ? "🦔"
                    : "🐦"}
              </text>
            )}
          </g>
        )}
        {kind === "lanterns" && (
          <g>
            <path
              d="M0 30Q100 90 200 30"
              fill="none"
              stroke="#6a4a2a"
              strokeWidth="4"
            />
            {[20, 60, 100, 140, 180].map((x, i) => (
              <rect
                key={x}
                className={active ? "object-glow" : undefined}
                style={active ? { animationDelay: `${i * 0.15}s` } : undefined}
                x={x - 13}
                y={i === 0 || i === 4 ? 40 : i === 2 ? 62 : 52}
                width="26"
                height="38"
                rx="10"
                fill={active ? "#ffd84d" : "#c98a4a"}
                stroke="#8a5a30"
                strokeWidth="4"
              />
            ))}
          </g>
        )}
        {kind === "bunting" && (
          <g className={active ? "sm-sway" : undefined}>
            <path
              d="M0 30Q100 70 200 30"
              fill="none"
              stroke="#6a4a2a"
              strokeWidth="4"
            />
            {[
              ["#ff5a5f", 20],
              ["#ffd84d", 60],
              ["#4cc97a", 100],
              ["#4aa8ff", 140],
              ["#a77bff", 180],
            ].map(([fill, x]) => (
              <path
                key={x}
                d={`M${Number(x) - 14} 42L${Number(x) + 14} 44L${x} 82Z`}
                fill={String(fill)}
              />
            ))}
            {active && (
              <text
                className="object-pop"
                x="100"
                y="45"
                fontSize="52"
                textAnchor="middle"
              >
                🦜
              </text>
            )}
          </g>
        )}
        {kind === "sandbox" && (
          <g>
            <path
              d="M10 150H190L175 230H25Z"
              fill="#c98a4a"
              stroke="#8a5a30"
              strokeWidth="6"
            />
            <path d="M10 150H190L175 230H25Z" fill={mat("wood")} />
            <path d="M25 160H175L165 215H35Z" fill="#f2d9a3" />
            <path d="M25 160H175L165 215H35Z" fill={mat("sand")} />
            {active ? (
              <path
                className="object-pop"
                d="M60 205V140h18v-18h14v18h16v-30h14v30h16v-18h14v18h18V205Z"
                fill="#e8c88a"
                stroke="#b98f52"
                strokeWidth="4"
              />
            ) : (
              <path
                d="M130 200l30-45"
                stroke="#ff5a5f"
                strokeWidth="8"
                strokeLinecap="round"
              />
            )}
          </g>
        )}
        {kind === "swing" && (
          <g>
            <path
              d="M20 240L50 20H150L180 240"
              fill="none"
              stroke="#8a5a30"
              strokeWidth="10"
              strokeLinejoin="round"
            />
            <g className={active ? "object-swing" : undefined}>
              <path
                d="M75 22V170M125 22V170"
                stroke="#6a6a7a"
                strokeWidth="4"
              />
              <rect
                x="60"
                y="165"
                width="80"
                height="16"
                rx="6"
                fill="#ee7a9b"
                stroke="#b24d6c"
                strokeWidth="4"
              />
            </g>
          </g>
        )}
        {kind === "ricecooker" && (
          <g>
            <rect
              x="30"
              y="110"
              width="140"
              height="120"
              rx="30"
              fill="#fff6f0"
              stroke="#d98aa0"
              strokeWidth="6"
            />
            <rect x="60" y="170" width="80" height="22" rx="8" fill="#f7c6d4" />
            <circle
              cx="150"
              cy="200"
              r="7"
              fill={active ? "#ff5a5f" : "#9ccf8a"}
            />
            <g
              className={step === 1 ? "object-shake" : undefined}
              transform={step === 2 ? "rotate(-28 40 110)" : undefined}
            >
              <path
                d="M30 115Q100 50 170 115Z"
                fill="#fff6f0"
                stroke="#d98aa0"
                strokeWidth="6"
              />
              <rect
                x="88"
                y="66"
                width="24"
                height="14"
                rx="6"
                fill="#d98aa0"
              />
            </g>
            {step === 1 && (
              <g
                className="sm-bob"
                fill="none"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
              >
                <path d="M80 50Q65 30 80 10" />
                <path d="M120 50Q135 30 120 10" />
              </g>
            )}
            {step === 2 && (
              <g className="object-pop">
                <ellipse
                  cx="100"
                  cy="112"
                  rx="60"
                  ry="22"
                  fill="#ffffff"
                  stroke="#e8e0d0"
                  strokeWidth="4"
                />
                <text x="100" y="105" fontSize="40" textAnchor="middle">
                  🍚
                </text>
              </g>
            )}
          </g>
        )}
        {kind === "pot" && (
          <g>
            <path d="M40 150V230H160V150Z" fill="#5a6470" />
            <path d="M40 150V230H160V150Z" fill={mat("metal")} />
            <rect
              x="20"
              y="138"
              width="160"
              height="22"
              rx="10"
              fill="#7d8894"
            />
            <rect x="4" y="150" width="26" height="14" rx="6" fill="#3e4650" />
            <rect
              x="170"
              y="150"
              width="26"
              height="14"
              rx="6"
              fill="#3e4650"
            />
            <ellipse cx="100" cy="142" rx="72" ry="14" fill="#e9b25b" />
            {step >= 1 && (
              <g className={step === 1 ? "object-swing" : undefined}>
                <path
                  d="M100 140L150 40"
                  stroke="#b07a46"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <ellipse cx="100" cy="142" rx="22" ry="8" fill="#b07a46" />
              </g>
            )}
            {step === 2 && (
              <g
                className="object-splash"
                fill="#fff4cf"
                stroke="#e9b25b"
                strokeWidth="3"
              >
                <circle cx="60" cy="118" r="10" />
                <circle cx="100" cy="104" r="12" />
                <circle cx="140" cy="118" r="9" />
                <circle cx="80" cy="84" r="7" />
                <circle cx="124" cy="80" r="6" />
              </g>
            )}
            <text x="60" y="146" fontSize="22">
              🍅
            </text>
            <text x="120" y="148" fontSize="22">
              🥬
            </text>
          </g>
        )}
        {kind === "lechon" && (
          <g>
            <rect
              x="10"
              y="200"
              width="180"
              height="20"
              rx="10"
              fill="#c9a77a"
            />
            <path
              d="M20 205Q100 230 180 205"
              fill="none"
              stroke="#8a5a30"
              strokeWidth="8"
            />
            <g key={state} className={active ? "object-shake" : undefined}>
              <ellipse
                cx="100"
                cy="150"
                rx="78"
                ry="46"
                fill="#b9652b"
                stroke="#7a3a14"
                strokeWidth="6"
              />
              <ellipse cx="80" cy="135" rx="40" ry="16" fill="#e39a55" />
              <circle
                cx="172"
                cy="140"
                r="26"
                fill="#b9652b"
                stroke="#7a3a14"
                strokeWidth="6"
              />
              <circle cx="182" cy="134" r="4" fill="#3b1c0b" />
              <ellipse cx="194" cy="148" rx="8" ry="6" fill="#e86b5c" />
            </g>
            <rect x="0" y="146" width="200" height="8" rx="4" fill="#9aa4ae" />
            {active && (
              <g className="sm-twinkle" fill="#fff4ba">
                <circle cx="40" cy="90" r="6" />
                <circle cx="100" cy="80" r="5" />
                <circle cx="160" cy="92" r="6" />
              </g>
            )}
          </g>
        )}
        {kind === "halohalo" && (
          <g>
            <rect
              x="30"
              y="40"
              width="140"
              height="190"
              rx="22"
              fill="#b98ae0"
              stroke="#6a3f8f"
              strokeWidth="6"
            />
            <rect
              x="50"
              y="60"
              width="100"
              height="70"
              rx="14"
              fill="#efe3ff"
            />
            <text x="100" y="112" fontSize="52" textAnchor="middle">
              🍧
            </text>
            <rect
              x="60"
              y="150"
              width="80"
              height="60"
              rx="12"
              fill="#6a3f8f"
            />
            <path
              d="M75 160H125L118 200Q100 206 82 200Z"
              fill="#fff"
              fillOpacity="0.85"
            />
            <rect x="80" y="182" width="40" height="14" fill="#8a5cc7" />
            <rect x="80" y="170" width="40" height="12" fill="#f2b84b" />
            <g className="sm-twinkle" fill="#fff4ba">
              <circle cx="40" cy="30" r="6" />
              <circle cx="170" cy="22" r="5" />
            </g>
          </g>
        )}
        {kind === "fan" && (
          <g>
            <circle
              cx="100"
              cy="110"
              r="90"
              fill="#e8f7ff"
              stroke="#4aa3d1"
              strokeWidth="8"
            />
            <g
              className={step === 0 ? undefined : "sm-spin"}
              style={{
                transformBox: "view-box",
                transformOrigin: "100px 110px",
                animationDuration: step === 2 ? "0.25s" : "1.2s",
              }}
            >
              {[0, 120, 240].map((angle) => (
                <ellipse
                  key={angle}
                  cx="100"
                  cy="62"
                  rx="22"
                  ry="44"
                  fill="#7cc4ea"
                  transform={`rotate(${angle} 100 110)`}
                />
              ))}
            </g>
            <circle cx="100" cy="110" r="16" fill="#4aa3d1" />
            {step === 2 && (
              <g
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
              >
                <path d="M190 80Q210 90 190 100" />
                <path d="M195 120Q220 130 195 140" />
              </g>
            )}
          </g>
        )}
        {kind === "shelf" && (
          <g>
            <rect
              x="10"
              y="20"
              width="180"
              height="215"
              rx="10"
              fill="#c98a4a"
              stroke="#8a5a30"
              strokeWidth="6"
            />
            <rect
              x="10"
              y="20"
              width="180"
              height="215"
              rx="10"
              fill={mat("wood")}
            />
            <rect x="10" y="4" width="180" height="30" rx="8" fill="#ff5a5f" />
            <text
              x="100"
              y="26"
              fontSize="20"
              fontWeight="900"
              fill="#fff"
              textAnchor="middle"
            >
              SARI-SARI
            </text>
            {[90, 150, 210].map((y) => (
              <rect
                key={y}
                x="18"
                y={y}
                width="164"
                height="8"
                fill="#8a5a30"
              />
            ))}
            <g fontSize="30" textAnchor="middle">
              <text x="55" y="84">
                🥫
              </text>
              <text x="100" y="84">
                🧃
              </text>
              <text x="145" y="84">
                🍬
              </text>
              <text x="55" y="144">
                🍞
              </text>
              <text x="100" y="144">
                🥭
              </text>
              <text x="145" y="144">
                🥥
              </text>
              <text x="55" y="204">
                🍪
              </text>
              <text x="100" y="204">
                🧴
              </text>
              <text x="145" y="204">
                🍭
              </text>
            </g>
            {step > 0 && (
              <text
                key={step}
                className="object-pop"
                x="100"
                y="-12"
                fontSize="60"
                textAnchor="middle"
              >
                {["", "🥭", "🍞", "🍬"][step]}
              </text>
            )}
          </g>
        )}
        {kind === "jeepney" && (
          <g className={step === 1 ? "object-shake" : undefined}>
            <path
              d="M10 200V110Q10 80 40 80H170Q190 80 190 110V200Z"
              fill="#e94b3c"
              stroke="#8a2318"
              strokeWidth="5"
            />
            <path
              d="M10 200V110Q10 80 40 80H170Q190 80 190 110V200Z"
              fill={mat("metal")}
            />
            <rect
              x="20"
              y="40"
              width="160"
              height="40"
              rx="12"
              fill="#ffd84d"
              stroke="#c9a02a"
              strokeWidth="5"
            />
            <text
              x="100"
              y="68"
              fontSize="18"
              fontWeight="900"
              fill="#8a2318"
              textAnchor="middle"
            >
              KAINAN
            </text>
            {[30, 75, 120].map((x) => (
              <rect
                key={x}
                x={x}
                y="96"
                width="38"
                height="40"
                rx="6"
                fill="#bfe6ff"
              />
            ))}
            <rect x="10" y="150" width="180" height="10" fill="#4aa8ff" />
            <rect x="10" y="164" width="180" height="8" fill="#ffd84d" />
            <circle cx="50" cy="208" r="22" fill="#333" />
            <circle cx="150" cy="208" r="22" fill="#333" />
            <circle cx="50" cy="208" r="9" fill="#ccc" />
            <circle cx="150" cy="208" r="9" fill="#ccc" />
            <path d="M100 40L90 20H110Z" fill="#c0c7cf" />
            {step === 1 && (
              <text
                className="object-pop"
                x="170"
                y="40"
                fontSize="40"
                textAnchor="middle"
              >
                📣
              </text>
            )}
            {step === 2 && (
              <g className="object-pop" fontSize="28">
                <text x="34" y="128">
                  🦁
                </text>
                <text x="80" y="128">
                  🐵
                </text>
                <text x="125" y="128">
                  🐰
                </text>
              </g>
            )}
          </g>
        )}
        {kind === "karaoke" && (
          <g>
            <rect
              x="40"
              y="90"
              width="120"
              height="145"
              rx="14"
              fill="#3b2a5a"
              stroke="#1f1433"
              strokeWidth="6"
            />
            <rect
              x="40"
              y="90"
              width="120"
              height="145"
              rx="14"
              fill={mat("fabric")}
            />
            <rect
              x="52"
              y="102"
              width="96"
              height="58"
              rx="8"
              fill={active ? "#ff8fab" : "#5a4a7a"}
            />
            <circle
              cx="100"
              cy="196"
              r="26"
              fill="#1f1433"
              stroke="#8a7ab0"
              strokeWidth="5"
            />
            <circle cx="100" cy="196" r="10" fill="#8a7ab0" />
            <path
              d="M150 90Q180 60 170 30"
              fill="none"
              stroke="#333"
              strokeWidth="5"
            />
            <rect x="158" y="8" width="24" height="34" rx="12" fill="#c0c7cf" />
            {active ? (
              <g className="sm-bob" fontSize="34" textAnchor="middle">
                <text x="70" y="140">
                  🎵
                </text>
                <text x="130" y="140">
                  🎶
                </text>
                <text x="40" y="60">
                  ✨
                </text>
              </g>
            ) : (
              <text x="100" y="140" fontSize="30" textAnchor="middle">
                🎤
              </text>
            )}
          </g>
        )}
        {kind === "digspot" && (
          <g>
            <ellipse cx="100" cy="200" rx="95" ry="34" fill="#c98d4a" />
            <ellipse cx="100" cy="200" rx="95" ry="34" fill={mat("sand")} />
            {step === 0 && (
              <>
                <path
                  d="M20 200Q100 120 180 200Z"
                  fill="#e2b06a"
                  stroke="#b07a3a"
                  strokeWidth="5"
                />
                <path d="M20 200Q100 120 180 200Z" fill={mat("sand")} />
              </>
            )}
            {step >= 1 && (
              <>
                <ellipse cx="100" cy="200" rx="70" ry="22" fill="#6e4628" />
                <g className="object-pop" fill="#e2b06a">
                  <circle cx="30" cy="170" r="12" />
                  <circle cx="170" cy="165" r="10" />
                  <circle cx="150" cy="140" r="7" />
                </g>
                <path
                  d="M150 190L190 110"
                  stroke="#8a5a30"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path d="M178 100L200 112L190 130L170 120Z" fill="#9aa4ae" />
              </>
            )}
            {step === 2 && (
              <text
                key={state}
                className="object-pop"
                x="100"
                y="196"
                fontSize="64"
                textAnchor="middle"
              >
                {{
                  "dig-skull": "💀",
                  "dig-bone": "🦴",
                  "dig-shell": "🐚",
                  "dig-tooth": "🦷",
                }[item.id] ?? "🦴"}
              </text>
            )}
          </g>
        )}
        {kind === "volcano" && (
          <g>
            <path
              d="M10 235L80 70H120L190 235Z"
              fill="#8a5a3c"
              stroke="#5e3a22"
              strokeWidth="6"
            />
            <path d="M10 235L80 70H120L190 235Z" fill={mat("rock")} />
            <path
              d="M80 70Q100 90 120 70L112 105Q100 95 88 105Z"
              fill={step === 2 ? "#ff6a2a" : "#5e3a22"}
            />
            {step === 1 && (
              <g className="sm-bob" fill="#c9c3bb">
                <circle cx="95" cy="45" r="18" />
                <circle cx="115" cy="25" r="14" />
                <circle cx="100" cy="5" r="10" />
              </g>
            )}
            {step === 2 && (
              <g className="object-splash">
                <path
                  d="M100 70Q60 0 30 40M100 70Q140 0 170 40M100 70V-20"
                  stroke="#ff8a2a"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                />
                <g fill="#ffd84d">
                  <circle cx="30" cy="40" r="10" />
                  <circle cx="170" cy="40" r="10" />
                  <circle cx="100" cy="-20" r="12" />
                </g>
                <path
                  d="M88 105Q70 170 60 235H80Q92 170 100 110Z"
                  fill="#ff6a2a"
                />
              </g>
            )}
          </g>
        )}
        {kind === "dinoegg" && (
          <g>
            <ellipse cx="100" cy="215" rx="90" ry="22" fill="#a8823e" />
            <path
              d="M15 205Q100 240 185 205"
              stroke="#7a5a26"
              strokeWidth="8"
              fill="none"
            />
            {step < 3 && (
              <g className={step === 1 ? "object-shake" : undefined}>
                <ellipse
                  cx="100"
                  cy="130"
                  rx="62"
                  ry="82"
                  fill="#f2ecd2"
                  stroke="#b8ad84"
                  strokeWidth="5"
                />
                <g fill="#7fc47a">
                  <circle cx="75" cy="100" r="10" />
                  <circle cx="120" cy="150" r="13" />
                  <circle cx="110" cy="80" r="7" />
                </g>
                {step === 2 && (
                  <path
                    d="M45 125L70 110L85 130L105 112L125 132L150 115"
                    stroke="#6e5a3a"
                    strokeWidth="5"
                    fill="none"
                  />
                )}
                {step === 2 && (
                  <circle cx="100" cy="125" r="6" fill="#2b2b2b" />
                )}
              </g>
            )}
            {step === 3 && (
              <g key={state} className="object-pop">
                <path
                  d="M40 210Q50 160 80 170L70 205Z"
                  fill="#f2ecd2"
                  stroke="#b8ad84"
                  strokeWidth="4"
                />
                <path
                  d="M160 210Q150 160 120 170L130 205Z"
                  fill="#f2ecd2"
                  stroke="#b8ad84"
                  strokeWidth="4"
                />
                <text x="100" y="190" fontSize="96" textAnchor="middle">
                  🦕
                </text>
              </g>
            )}
          </g>
        )}
        {kind === "sifter" && (
          <g className={active ? "object-shake" : undefined}>
            <rect
              x="20"
              y="90"
              width="160"
              height="60"
              rx="10"
              fill="#c98a4a"
              stroke="#8a5a30"
              strokeWidth="6"
            />
            <rect
              x="20"
              y="90"
              width="160"
              height="60"
              rx="10"
              fill={mat("wood")}
            />
            <path
              d="M30 100H170M30 115H170M30 130H170M60 95V145M100 95V145M140 95V145"
              stroke="#5e3a22"
              strokeWidth="3"
            />
            <path
              d="M40 150L30 235M160 150L170 235"
              stroke="#8a5a30"
              strokeWidth="8"
            />
            <ellipse cx="100" cy="225" rx="60" ry="12" fill="#e2b06a" />
            {active && (
              <text
                key={state}
                className="object-pop"
                x="100"
                y="80"
                fontSize="54"
                textAnchor="middle"
              >
                💎
              </text>
            )}
          </g>
        )}
        {kind === "ticketbooth" && (
          <g className={step === 1 ? "object-shake" : undefined}>
            <rect
              x="25"
              y="70"
              width="150"
              height="165"
              rx="10"
              fill="#ff8fab"
              stroke="#c0507a"
              strokeWidth="6"
            />
            <rect
              x="25"
              y="70"
              width="150"
              height="165"
              rx="10"
              fill={mat("wood")}
            />
            <path
              d="M15 75L100 15L185 75Z"
              fill="#ffd84d"
              stroke="#c9a02a"
              strokeWidth="6"
            />
            <rect
              x="50"
              y="100"
              width="100"
              height="60"
              rx="8"
              fill="#bfe6ff"
            />
            <text
              x="100"
              y="205"
              fontSize="26"
              fontWeight="900"
              fill="#fff"
              textAnchor="middle"
            >
              TICKETS
            </text>
            <circle cx="100" cy="45" r="12" fill="#c9a02a" />
            {step === 1 && (
              <g
                className="object-pop"
                stroke="#ffd84d"
                strokeWidth="6"
                strokeLinecap="round"
              >
                <path d="M70 30L55 20M130 30L145 20M100 25V5" />
              </g>
            )}
            {step === 2 && (
              <text
                key={state}
                className="object-pop"
                x="100"
                y="150"
                fontSize="52"
                textAnchor="middle"
              >
                🎟️
              </text>
            )}
          </g>
        )}
        {kind === "strongman" && (
          <g>
            <rect
              x="85"
              y="20"
              width="30"
              height="210"
              rx="8"
              fill="#fff8ec"
              stroke="#c98a4a"
              strokeWidth="5"
            />
            <rect
              x="85"
              y="20"
              width="30"
              height="210"
              rx="8"
              fill={mat("wood")}
            />
            {[60, 100, 140, 180].map((y) => (
              <path
                key={y}
                d={`M85 ${y}H115`}
                stroke="#ff8fab"
                strokeWidth="4"
              />
            ))}
            <circle
              cx="100"
              cy="18"
              r="18"
              fill="#ffd84d"
              stroke="#c9a02a"
              strokeWidth="5"
            />
            <rect
              x="78"
              y={[200, 150, 90, 30][step]}
              width="44"
              height="22"
              rx="8"
              fill="#e94b3c"
              className={step > 0 ? "object-pop" : undefined}
              key={state}
            />
            <rect
              x="40"
              y="225"
              width="120"
              height="15"
              rx="6"
              fill="#8a5a30"
            />
            {step === 3 && (
              <g className="sm-twinkle" fill="#ffd84d">
                <circle cx="55" cy="10" r="7" />
                <circle cx="150" cy="20" r="6" />
                <circle cx="140" cy="-5" r="5" />
              </g>
            )}
          </g>
        )}
        {kind === "duckpond" && (
          <g>
            <ellipse
              cx="100"
              cy="190"
              rx="95"
              ry="45"
              fill="#4aa8ff"
              stroke="#2b6fb0"
              strokeWidth="6"
            />
            <ellipse cx="100" cy="185" rx="75" ry="30" fill="#8fd3f4" />
            <ellipse cx="100" cy="185" rx="75" ry="30" fill={mat("water")} />
            <g className="sm-bob" fontSize="34" textAnchor="middle">
              <text x="60" y="195">
                🦆
              </text>
              <text x="105" y="180">
                🦆
              </text>
              <text x="145" y="200">
                🦆
              </text>
            </g>
            {step > 0 && (
              <text
                key={state}
                className="object-pop"
                x="100"
                y="120"
                fontSize="56"
                textAnchor="middle"
              >
                {["", "⭐", "🧸", "🍬"][step]}
              </text>
            )}
          </g>
        )}
        {kind === "trafficlight" && (
          <g>
            <rect x="92" y="150" width="16" height="90" fill="#555" />
            <rect
              x="45"
              y="5"
              width="110"
              height="160"
              rx="18"
              fill="#333"
              stroke="#111"
              strokeWidth="5"
            />
            <rect
              x="45"
              y="5"
              width="110"
              height="160"
              rx="18"
              fill={mat("metal")}
            />
            <circle
              cx="100"
              cy="40"
              r="20"
              fill={step === 1 ? "#ff3b30" : "#5a2a28"}
            />
            <circle
              cx="100"
              cy="85"
              r="20"
              fill={step === 2 ? "#ffd60a" : "#5a5228"}
            />
            <circle
              cx="100"
              cy="130"
              r="20"
              fill={step === 0 ? "#34c759" : "#28502e"}
            />
          </g>
        )}
        {kind === "tires" && (
          <g key={state} className={active ? "object-pop" : undefined}>
            {[180, 135, 90].map((y, i) => (
              <g key={y}>
                <ellipse cx="100" cy={y} rx="80" ry="28" fill="#2b2b2b" />
                <ellipse
                  cx="100"
                  cy={y}
                  rx="40"
                  ry="12"
                  fill={["#ff5a5f", "#ffd84d", "#4aa8ff"][i]}
                />
              </g>
            ))}
            {active && (
              <text x="160" y="60" fontSize="40" textAnchor="middle">
                ✨
              </text>
            )}
          </g>
        )}
        {kind === "echocave" && (
          <g>
            <path
              d="M5 235Q20 40 100 30Q180 40 195 235Z"
              fill="#a85e2c"
              stroke="#7a4220"
              strokeWidth="6"
            />
            <path d="M5 235Q20 40 100 30Q180 40 195 235Z" fill={mat("rock")} />
            <path d="M45 235Q55 110 100 100Q145 110 155 235Z" fill="#2b1a10" />
            {active && (
              <g
                key={state}
                className="object-pop"
                fill="none"
                stroke="#fff4ba"
                strokeWidth="6"
                strokeLinecap="round"
              >
                <path d="M100 150Q120 170 100 190" />
                <path d="M120 135Q150 170 120 205" />
                <path d="M140 120Q180 170 140 220" />
              </g>
            )}
          </g>
        )}
        {kind === "door" && (
          <g>
            <path
              d="M20 235V90Q20 15 100 15Q180 15 180 90V235Z"
              fill="#fff6de"
              stroke="#c98a4a"
              strokeWidth="10"
            />
            <path
              d="M20 235V90Q20 15 100 15Q180 15 180 90V235Z"
              fill={mat("wood")}
            />
            <text x="100" y="160" fontSize="96" textAnchor="middle">
              {item.icon}
            </text>
          </g>
        )}
        {kind === "flower" && (
          <g key={state} className={state > 0 ? "object-pop" : undefined}>
            <path d="M100 240V110" stroke="#3f7238" strokeWidth="12" />
            <path d="M100 190Q60 160 50 190Q80 205 100 190Z" fill="#5f9a4e" />
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx="100"
                cy="62"
                rx="30"
                ry="48"
                transform={`rotate(${angle} 100 100)`}
                fill={
                  {
                    "square-flower-red": "#ff5a5f",
                    "square-flower-orange": "#ff9f43",
                    "square-flower-yellow": "#ffd84d",
                    "square-flower-green": "#4cc97a",
                    "square-flower-blue": "#4aa8ff",
                    "square-flower-purple": "#a77bff",
                  }[item.id] ?? "#ee7a9b"
                }
                stroke="#ffffff"
                strokeWidth="4"
              />
            ))}
            <circle
              cx="100"
              cy="100"
              r="22"
              fill="#ffe08a"
              stroke="#c9a02a"
              strokeWidth="4"
            />
          </g>
        )}
      </svg>
      {item.object.caption !== false && (
        <span className="room-object-caption">{item.label}</span>
      )}
    </button>
  );
}
