import { ACTIVITIES, type BuildingDef } from "../game/activities";
import { pick } from "../game/copy";
import { numbersFor } from "../game/scenarios";
import type { ActivityId, GameState, ReadingLevel } from "../game/types";
import {
  AirIcon,
  BermIcon,
  DishIcon,
  GreenhouseIcon,
  RoverIcon,
  ScienceIcon,
  ShelterIcon,
} from "./icons";

export const BUILDING_ICONS = {
  "oxygen-plant": AirIcon,
  lab: ScienceIcon,
  greenhouse: GreenhouseIcon,
  garage: RoverIcon,
  dish: DishIcon,
  shelter: ShelterIcon,
  berm: BermIcon,
} as const;

interface BuildingCardProps {
  building: BuildingDef;
  state: GameState;
  reading: ReadingLevel;
  planned: boolean;
  available: { ok: boolean; reason?: string };
  cost: { power: number; crew: number };
  onToggle: (id: ActivityId) => void;
  onClose: () => void;
}

function Cost({ label, count }: { label: string; count: number }) {
  return (
    <span className="cost-line">
      <span className="cost-label">{label}</span>
      {count === 0 ? (
        <span className="cost-none">none</span>
      ) : (
        <span className={`pips pips--${label.toLowerCase()}`} aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <span key={index} className="pip" />
          ))}
        </span>
      )}
    </span>
  );
}

export function BuildingCard({
  building,
  state,
  reading,
  planned,
  available,
  cost,
  onToggle,
  onClose,
}: BuildingCardProps) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const activity = building.activity;
  const def = ACTIVITIES[activity];
  const Icon = BUILDING_ICONS[building.id];
  const waiting = state.discoveries.filter((d) => !d.transmitted).length;

  return (
    <section className="panel building-card" aria-labelledby="building-title">
      <div className="building-head">
        <span className={`building-icon${planned ? " building-icon--on" : ""}`} aria-hidden="true">
          <Icon width={24} height={24} />
        </span>
        <div>
          <h2 id="building-title">{building.name}</h2>
          <p className="building-sub">{pick(reading, def.kidLine, def.action)}</p>
        </div>
        <button
          type="button"
          className="btn btn--icon"
          onClick={onClose}
          aria-label="Close this card"
        >
          ✕
        </button>
      </div>

      <div className="cost-row">
        <Cost label="Power" count={cost.power} />
        <Cost label="Crew" count={cost.crew} />
      </div>

      {activity === "greenhouse" ? (
        <p className="stat-inline">
          Crops harvested: {state.food} of {nums.foodNeeded}
        </p>
      ) : null}
      {activity === "comms" ? (
        <p className="stat-inline">
          {waiting === 0 ? "Nothing waiting to send." : `${waiting} waiting for Earth.`}
        </p>
      ) : null}
      {activity === "rover" ? (
        <p className="stat-inline">
          Extra air {nums.roverOxygen} · extra dose +{nums.roverDose} mSv
        </p>
      ) : null}
      {activity === "shield" ? (
        <p className="stat-inline">
          {state.shielded
            ? "Built. Daily dose is already lower."
            : `Cuts daily dose to ${Math.round(nums.shieldFactor * 100)}% for the rest of the mission.`}
        </p>
      ) : null}
      {activity === "shelter" ? (
        <p className="stat-inline">
          A storm costs +{nums.stormDose} mSv outside, +{nums.stormShelterDose} mSv inside.
        </p>
      ) : null}

      <button
        type="button"
        className={`btn btn--toggle${planned ? " btn--on" : ""}`}
        onClick={() => onToggle(activity)}
        aria-pressed={planned}
        disabled={!available.ok && !planned}
      >
        <span aria-hidden="true">{planned ? "✓" : "+"}</span>{" "}
        {planned ? "Remove from this day" : "Add to this day"}
      </button>

      {!available.ok ? (
        <p className="blocked-note" role="status">
          <span aria-hidden="true">▲</span> {available.reason}
        </p>
      ) : null}

      <p className="teach-note">{def.teaches}</p>

      <details className="more-detail">
        <summary>More about this job</summary>
        <p>{def.fullLine}</p>
      </details>
    </section>
  );
}
