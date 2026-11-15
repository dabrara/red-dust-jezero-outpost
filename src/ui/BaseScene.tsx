import { ACTIVITIES, BUILDINGS } from "../game/activities";
import type {
  ActivityId,
  BuildingId,
  GameState,
  ReadingLevel,
} from "../game/types";
import { BUILDING_ICONS } from "./BuildingCard";

interface BaseSceneProps {
  state: GameState;
  plan: ActivityId[];
  selected: BuildingId | null;
  onSelect: (id: BuildingId) => void;
  reducedMotion: boolean;
  reading: ReadingLevel;
  interactive?: boolean;
}

const SCENE_W = 900;
const SCENE_H = 520;

/**
 * Label anchors use the SAME coordinates the buildings are drawn with, so a
 * label always points at its building at every screen size. `side` decides
 * whether the label sits above or below that anchor.
 */
const HOTSPOTS: { id: BuildingId; x: number; y: number; side: "above" | "below" }[] = [
  { id: "oxygen-plant", x: 120, y: 244, side: "above" },
  { id: "lab", x: 530, y: 300, side: "above" },
  { id: "greenhouse", x: 700, y: 304, side: "above" },
  { id: "dish", x: 836, y: 250, side: "above" },
  { id: "garage", x: 150, y: 474, side: "below" },
  { id: "shelter", x: 470, y: 472, side: "below" },
  { id: "berm", x: 762, y: 476, side: "below" },
];

const CREW_ANCHORS: Record<string, { x: number; y: number }> = {
  habitat: { x: 330, y: 402 },
  lab: { x: 540, y: 398 },
  greenhouse: { x: 700, y: 396 },
  garage: { x: 200, y: 478 },
  dish: { x: 806, y: 396 },
  shelter: { x: 470, y: 456 },
};

function Plant({
  stage,
  x,
  y,
  delay,
}: {
  stage: number;
  x: number;
  y: number;
  delay: number;
}) {
  const height = stage === 0 ? 6 : stage === 1 ? 16 : stage === 2 ? 24 : 30;
  return (
    <g
      className="plant"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x} ${y})`}
    >
      <rect x={-7} y={0} width={14} height={7} rx={2} className="plant-pot" />
      {stage === 0 ? (
        <circle cx={0} cy={-3} r={3} className="seed" />
      ) : (
        <>
          <path d={`M0,-1 L0,${-height}`} className="stem" />
          <path d={`M0,${-height * 0.55} q-9,-5 -11,-12 q9,0 11,8`} className="leaf" />
          <path d={`M0,${-height * 0.75} q9,-5 11,-12 q-9,0 -11,8`} className="leaf" />
          {stage >= 3 ? (
            <>
              <circle cx={0} cy={-height - 3} r={4} className="bloom" />
              <circle cx={0} cy={-height - 3} r={7} className="bloom-glow" />
            </>
          ) : null}
        </>
      )}
    </g>
  );
}

export function BaseScene({
  state,
  plan,
  selected,
  onSelect,
  reducedMotion,
  reading,
  interactive = true,
}: BaseSceneProps) {
  const active = new Set(plan);
  const sheltered = active.has("shelter");
  const oxygen = active.has("oxygen");
  const lab = active.has("lab");
  const rover = active.has("rover");
  const greenhouse = active.has("greenhouse");
  const comms = active.has("comms");
  const shielding = active.has("shield") || state.shielded;
  const plantStage = Math.min(3, state.food);
  const samples = Math.min(5, state.discoveries.length);

  const crewAnchor = sheltered
    ? "shelter"
    : lab
      ? "lab"
      : greenhouse
        ? "greenhouse"
        : rover
          ? "garage"
          : comms
            ? "dish"
            : "habitat";
  const anchor = CREW_ANCHORS[crewAnchor];

  const sceneClass = [
    "scene-svg",
    reducedMotion ? "reduced-motion" : "",
    oxygen ? "scene--air" : "",
    lab ? "scene--science" : "",
    rover ? "scene--rover" : "",
    greenhouse ? "scene--greenhouse" : "",
    comms ? "scene--comms" : "",
    sheltered ? "scene--shelter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="scene-panel" aria-labelledby="scene-title">
      <div className="scene-head">
        <h2 id="scene-title">Jezero Outpost</h2>
        <p className="scene-sub">
          {!interactive
            ? "How the outpost finished the mission."
            : reading === "little"
              ? "Tap a building."
              : "Tap a building to add or remove its job."}
        </p>
      </div>

      <div className="scene">
        <span className="scene-watermark" aria-hidden="true">
          Illustration: AI-generated
        </span>
        <svg
          className={sceneClass}
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5d2f33" />
              <stop offset="45%" stopColor="#b4624a" />
              <stop offset="78%" stopColor="#e39a6b" />
              <stop offset="100%" stopColor="#f3c396" />
            </linearGradient>
            <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c0724c" />
              <stop offset="45%" stopColor="#a85436" />
              <stop offset="100%" stopColor="#7c3722" />
            </linearGradient>
            <linearGradient id="moduleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fdf1de" />
              <stop offset="100%" stopColor="#e2c7ab" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8f2d8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#6fc39a" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lavGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd08a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffd08a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="earthGrad" cx="34%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#cfe9ff" />
              <stop offset="55%" stopColor="#7fb6e8" />
              <stop offset="100%" stopColor="#3d6f9e" />
            </radialGradient>
          </defs>

          <rect width="900" height="520" fill="url(#sky)" />

          <g className="stars">
            {[
              [70, 48, 1.2],
              [180, 30, 0.9],
              [330, 62, 1],
              [470, 26, 1.1],
              [600, 54, 0.8],
              [720, 34, 1],
              [860, 66, 0.9],
            ].map(([x, y, r], index) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={r}
                className="star"
                style={{ animationDelay: `${index * 0.6}s` }}
              />
            ))}
          </g>

          {/* Earth, seen from Mars */}
          <g className="earth" opacity="0.85">
            <circle cx="196" cy="92" r="13" fill="url(#earthGrad)" />
            <circle cx="196" cy="92" r="19" fill="none" stroke="#ffe9c9" strokeWidth="1" opacity="0.35" />
          </g>
          <circle cx="248" cy="60" r="2.4" fill="#e9d7c4" opacity="0.8" />
          <circle cx="272" cy="78" r="1.7" fill="#e9d7c4" opacity="0.7" />

          {/* Distant hills */}
          <path
            d="M0,300 Q90,268 190,292 T400,286 T620,296 T900,278 L900,352 L0,352 Z"
            fill="#8f4a35"
            opacity="0.55"
          />

          {/* Ground */}
          <path
            d="M0,352 Q120,336 250,346 T520,340 T760,350 T900,334 L900,520 L0,520 Z"
            fill="url(#groundGrad)"
          />
          <ellipse cx="300" cy="486" rx="70" ry="12" fill="#5f2a1a" opacity="0.3" />
          <ellipse cx="640" cy="500" rx="90" ry="14" fill="#5f2a1a" opacity="0.26" />

          {/* Solar array on the ridge (background detail) */}
          <g opacity="0.9" transform="translate(238 300)">
            {[0, 44, 88].map((dx) => (
              <g key={dx} transform={`translate(${dx} 0)`}>
                <rect x="0" y="0" width="38" height="22" rx="2" fill="#3b4a6b" stroke="#8fa3c9" strokeWidth="1.4" transform="skewX(-12)" />
                <path d="M2 6 h34 M2 12 h34 M2 18 h34" stroke="#8fa3c9" strokeWidth="0.8" opacity="0.7" transform="skewX(-12)" />
                <rect x="16" y="20" width="3" height="16" fill="#cbb9a4" />
              </g>
            ))}
          </g>

          {/* Oxygen plant (MOXIE-style) */}
          <g className={`b-air${oxygen ? " is-on" : ""}`}>
            <ellipse cx="120" cy="382" rx="58" ry="10" fill="#5f2a1a" opacity="0.28" />
            <rect x="70" y="378" width="100" height="9" rx="4.5" fill="#d9b79a" />
            <rect x="74" y="298" width="30" height="82" rx="15" fill="#f1e3d2" stroke="#c9a98c" strokeWidth="2" />
            <rect x="136" y="298" width="30" height="82" rx="15" fill="#f1e3d2" stroke="#c9a98c" strokeWidth="2" />
            <rect x="70" y="252" width="104" height="50" rx="16" fill="url(#moduleGrad)" stroke="#c9a98c" strokeWidth="2" />
            <rect x="86" y="264" width="30" height="22" rx="8" className="air-window" />
            <circle cx="150" cy="275" r="14" className="air-vent" />
            <g className="fan">
              <path d="M150 261 L150 289 M136 275 L164 275 M140 265 L160 285 M160 265 L140 285" stroke="#2ec4b6" strokeWidth="3" strokeLinecap="round" />
            </g>
            <g className="airflow">
              <path d="M64 246 q-14 -8 -6 -20" fill="none" stroke="#bff0e4" strokeWidth="4" strokeLinecap="round" />
              <circle cx="46" cy="202" r="4" fill="#bff0e4" />
            </g>
          </g>

          {/* Habitat dome */}
          <g className="b-hab">
            <ellipse cx="330" cy="384" rx="104" ry="16" fill="#5f2a1a" opacity="0.28" />
            <path d="M226 382 A104 104 0 0 1 434 382 Z" fill="url(#moduleGrad)" stroke="#c9a98c" strokeWidth="2" />
            {state.power > 0 ? (
              <ellipse cx="330" cy="340" rx="92" ry="60" fill="url(#glowGrad)" />
            ) : null}
            {[288, 330, 372].map((x) => (
              <rect key={x} x={x - 17} y={324} width={34} height={26} rx={9} className={`hab-window${state.power > 0 ? " lit" : ""}`} />
            ))}
            <rect x="308" y="352" width="44" height="32" rx="10" className="hab-door" />
            <circle cx="343" cy="368" r="2.6" fill="#8a6a58" />
            <path d="M330 278 v-24" stroke="#d9b79a" strokeWidth="3" strokeLinecap="round" />
            <circle cx="330" cy="250" r="5" className="beacon" />
          </g>

          {/* Science lab */}
          <g className={`b-science${lab ? " is-on" : ""}`}>
            <ellipse cx="530" cy="382" rx="70" ry="11" fill="#5f2a1a" opacity="0.26" />
            <path d="M462 382 A68 68 0 0 1 598 382 Z" fill="url(#moduleGrad)" stroke="#c9a98c" strokeWidth="2" />
            {lab ? <ellipse cx="530" cy="352" rx="70" ry="46" fill="url(#glowGrad)" /> : null}
            <rect x="494" y="330" width="72" height="34" rx="10" className={`sci-window${lab ? " lit" : ""}`} />
            {Array.from({ length: samples }, (_, index) => (
              <circle key={index} cx={506 + (index % 5) * 12} cy={347 - (index % 2) * 3} r={3.4} className="sample" />
            ))}
            <circle cx="530" cy="322" r="8" className="sci-lens" />
          </g>

          {/* Greenhouse */}
          <g className={`b-green${greenhouse ? " is-on" : ""}`}>
            <ellipse cx="700" cy="382" rx="62" ry="10" fill="#5f2a1a" opacity="0.26" />
            <path d="M638 382 A62 62 0 0 1 762 382 Z" fill="url(#glassGrad)" stroke="#7fc4a3" strokeWidth="2.5" />
            <path d="M700 320 v62" fill="none" stroke="#b6e8c9" strokeWidth="1.6" opacity="0.8" />
            {greenhouse ? <rect x="646" y="344" width="18" height="6" rx="3" className="grow-lamp" /> : null}
            <Plant stage={plantStage} x={676} y={372} delay={0} />
            <Plant stage={Math.max(0, plantStage - 1)} x={700} y={374} delay={0.8} />
            <Plant stage={Math.max(0, plantStage - 2)} x={722} y={372} delay={1.4} />
          </g>

          {/* Communications dish */}
          <g className={`b-dish${comms ? " is-on" : ""}`}>
            <path d="M836 380 v-56" stroke="#d9b79a" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="836" cy="382" rx="26" ry="8" fill="#5f2a1a" opacity="0.26" />
            <g transform="translate(836 320)">
              <g className="dish-head">
                <ellipse cx="0" cy="-20" rx="34" ry="16" transform="rotate(-38)" fill="#f3e7d8" stroke="#b98f70" strokeWidth="2.5" />
                <path d="M0 0 L 0 -22" stroke="#d9b79a" strokeWidth="7" strokeLinecap="round" />
                <circle cx="-19" cy="-34" r="5" fill="#2ec4b6" />
              </g>
            </g>
            {comms ? (
              <g className="signal">
                <circle cx="806" cy="268" r="8" fill="none" stroke="#bfe9dd" strokeWidth="2.4" />
                <circle cx="806" cy="268" r="16" fill="none" stroke="#bfe9dd" strokeWidth="2" opacity="0.7" />
              </g>
            ) : null}
          </g>

          {/* Rover garage */}
          <g className={`b-garage${rover ? " is-on" : ""}`}>
            <ellipse cx="150" cy="472" rx="90" ry="11" fill="#5f2a1a" opacity="0.26" />
            <rect x="58" y="404" width="150" height="66" rx="14" fill="url(#moduleGrad)" stroke="#c9a98c" strokeWidth="2" />
            <rect x="70" y="414" width="126" height="20" rx="8" className="garage-door" />
            <rect x="86" y="440" width="22" height="16" rx="4" className="crate" />
            <path d="M232 452 h132" className="rover-path" fill="none" strokeDasharray="8 10" strokeWidth="3" />
            <circle cx="372" cy="454" r="14" className="rover-target" />
            <g className="rover" transform="translate(150 448)">
              <g className="rover-inner">
                <rect x="-26" y="-16" width="52" height="22" rx="8" fill="#ffd166" stroke="#c99a2e" strokeWidth="2" />
                <circle cx="-14" cy="8" r="7" fill="#6b4a38" />
                <circle cx="12" cy="8" r="7" fill="#6b4a38" />
                <path d="M26 -8 h14" stroke="#c99a2e" strokeWidth="3" strokeLinecap="round" />
                <circle cx="0" cy="-20" r="5" className="rover-lamp" />
              </g>
            </g>
          </g>

          {/* Storm shelter, half buried */}
          <g className={`b-shelter${sheltered ? " is-on" : ""}`}>
            <ellipse cx="470" cy="470" rx="74" ry="11" fill="#5f2a1a" opacity="0.26" />
            {sheltered ? <ellipse cx="470" cy="436" rx="86" ry="52" fill="url(#lavGlow)" /> : null}
            <path d="M398 468 A72 62 0 0 1 542 468 Z" fill="#d8c3ab" stroke="#a98466" strokeWidth="2.5" />
            <path d="M398 468 A72 62 0 0 1 542 468" fill="none" stroke="#bfa287" strokeWidth="6" strokeLinecap="round" />
            <rect x="448" y="430" width="44" height="38" rx="10" className={`hatch${sheltered ? " closed" : ""}`} />
            <circle cx="484" cy="450" r="3" fill="#7a5b48" />
          </g>

          {/* Soil berm: the shielding upgrade */}
          <g className={`b-berm${shielding ? " is-on" : ""}`}>
            <ellipse cx="762" cy="474" rx="68" ry="9" fill="#5f2a1a" opacity="0.26" />
            {[
              [706, 452, 28],
              [732, 452, 28],
              [758, 452, 28],
              [784, 452, 28],
              [810, 452, 26],
              [718, 434, 28],
              [746, 434, 28],
              [774, 434, 28],
              [802, 434, 26],
              [734, 416, 28],
              [764, 416, 28],
              [794, 416, 26],
            ].map(([x, y, w]) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={w}
                height={16}
                rx={6}
                fill={shielding ? "#c98a63" : "#b07a58"}
                stroke="#8a5233"
                strokeWidth="1.6"
              />
            ))}
            {shielding ? (
              <text x="762" y="470" textAnchor="middle" fontSize="13" fontWeight="800" fill="#4b2a18">
                ✓
              </text>
            ) : null}
          </g>

          <g className="crew-layer" style={{ transform: `translate(${anchor.x}px, ${anchor.y}px)` }}>
            {[-30, 2, 34].map((offset, index) => (
              <g key={offset} className={`crew crew--${index}`} transform={`translate(${offset} 0)`}>
                <circle cx="0" cy="-16" r="7.5" className="crew-helmet" />
                <rect x="-6" y="-10" width="12" height="14" rx="5" className="crew-body" />
                <rect x="-9" y="-4" width="6" height="9" rx="3" className="crew-pack" />
              </g>
            ))}
          </g>
        </svg>

        {interactive ? (
          <div className="hotspot-layer">
            {HOTSPOTS.map(({ id, x, y, side }) => {
              const building = BUILDINGS[id];
              const activity = building.activity;
              const planned = plan.includes(activity);
              const Icon = BUILDING_ICONS[id];
              const nothingToSend =
                activity === "comms" &&
                state.discoveries.every((d) => d.transmitted);
              const conjunction = state.eventId === "conjunction";
              const alreadyBuilt = activity === "shield" && state.shielded;
              const blocked =
                alreadyBuilt ||
                (activity === "comms" && conjunction) ||
                (state.doseRestricted &&
                  (ACTIVITIES[activity].outdoor ||
                    ACTIVITIES[activity].blockedWhenSheltered)) ||
                (sheltered && ACTIVITIES[activity].blockedWhenSheltered);
              const isSelected = selected === id;
              const stateWord = planned
                ? "in this day's plan"
                : alreadyBuilt
                  ? "already built"
                  : blocked
                    ? "paused"
                    : nothingToSend
                      ? "nothing to send yet"
                      : "not in the plan";

              return (
                <button
                  key={id}
                  type="button"
                  className={`hotspot hotspot--${side}${
                    planned ? " hotspot--active" : ""
                  }${blocked ? " hotspot--blocked" : ""}${
                    isSelected ? " hotspot--selected" : ""
                  }`}
                  style={{
                    left: `${(x / SCENE_W) * 100}%`,
                    top: `${(y / SCENE_H) * 100}%`,
                  }}
                  onClick={() => onSelect(id)}
                  aria-pressed={planned}
                  aria-label={`${building.name}: ${stateWord}. ${building.kidLine}`}
                >
                  <span className="hotspot-icon" aria-hidden="true">
                    <Icon width={16} height={16} />
                  </span>
                  <span className="hotspot-name">{building.name}</span>
                  {planned || alreadyBuilt ? (
                    <span className="hotspot-mark" aria-hidden="true">
                      ✓
                    </span>
                  ) : blocked ? (
                    <span className="hotspot-mark" aria-hidden="true">
                      ■
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
