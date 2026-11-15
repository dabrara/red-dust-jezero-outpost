import { doseStatusFor } from "../game/engine";
import { numbersFor } from "../game/scenarios";
import { DOSE_COPY } from "../game/copy";
import type { GameState, ShiftResult } from "../game/types";
import { AirIcon, BatteryIcon, ShieldIcon, StarIcon } from "./icons";

interface ResourceBarProps {
  state: GameState;
  preview: ShiftResult | null;
  onOpenScience: () => void;
}

function Segments({
  value,
  capacity,
  ghost,
  lowFrom,
  label,
  tone,
}: {
  value: number;
  capacity: number;
  ghost?: number;
  lowFrom: number;
  label: string;
  tone: "gold" | "sky" | "dose";
}) {
  const lowLevel = lowFrom > 0 && value <= lowFrom;
  return (
    <div
      className={`segments segments--${tone}${lowLevel ? " segments--low" : ""}`}
      role="img"
      aria-label={`${label}: ${value} of ${capacity}${
        ghost !== undefined ? `, predicted ${ghost}` : ""
      }${lowLevel ? ", low" : ""}`}
    >
      {Array.from({ length: capacity }, (_, index) => {
        const filled = index < value;
        const ghosted = !filled && ghost !== undefined && index < ghost;
        return (
          <span
            key={index}
            className={`segment${filled ? " segment--filled" : ""}${
              ghosted ? " segment--ghost" : ""
            }${index < lowFrom ? " segment--low" : ""}`}
          >
            {ghosted ? <span className="segment-ghost-value" aria-hidden="true" /> : null}
          </span>
        );
      })}
    </div>
  );
}

export function ResourceBar({ state, preview, onOpenScience }: ResourceBarProps) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const transmitted = state.discoveries.filter((d) => d.transmitted).length;
  const status = doseStatusFor(state.dose, nums.doseLimit);
  const copy = DOSE_COPY[status];
  const doseTicks = Math.round(nums.doseLimit);
  const filledTicks = Math.min(doseTicks, Math.ceil(state.dose));

  return (
    <div className="resources" aria-label="Outpost status">
      <div
        className="res res--power"
        role="group"
        aria-label={`Power. Stored ${state.power} of ${nums.powerCapacity}. Next day brings ${nums.generation}.`}
      >
        <span className="res-head">
          <BatteryIcon width={18} height={18} />
          <span className="res-label">Power</span>
          <span className="res-trend">+{nums.generation}</span>
        </span>
        <span className="res-value">
          {state.power}
          <small>/{nums.powerCapacity}</small>
        </span>
        <Segments
          value={state.power}
          capacity={nums.powerCapacity}
          ghost={preview ? preview.powerAfter : undefined}
          lowFrom={0}
          label="Stored power"
          tone="gold"
        />
      </div>

      <div
        className={`res res--air${state.oxygen <= 3 ? " res--air-low" : ""}`}
        role="group"
        aria-label={`Air. ${state.oxygen} of ${nums.oxygenCapacity}. The crew uses ${nums.oxygenUse} each day.`}
      >
        <span className="res-head">
          <AirIcon width={18} height={18} />
          <span className="res-label">Air</span>
          {state.oxygen <= 3 ? (
            <span className="res-flag res-flag--coral">
              <span aria-hidden="true">▼</span> Low
            </span>
          ) : (
            <span className="res-trend">−{nums.oxygenUse}</span>
          )}
        </span>
        <span className="res-value">
          {state.oxygen}
          <small>/{nums.oxygenCapacity}</small>
        </span>
        <Segments
          value={state.oxygen}
          capacity={nums.oxygenCapacity}
          ghost={preview ? preview.oxygenAfter : undefined}
          lowFrom={3}
          label="Air"
          tone="sky"
        />
      </div>

      <div
        className={`res res--dose res--dose-${status}`}
        role="group"
        aria-label={`Radiation dose: ${state.dose.toFixed(2)} of ${nums.doseLimit} millisieverts. ${copy.missionLine}`}
      >
        <span className="res-head">
          <ShieldIcon width={18} height={18} />
          <span className="res-label">Dose</span>
          <span className={`res-flag${status === "clear" ? " res-flag--teal" : " res-flag--coral"}`}>
            <span aria-hidden="true">{copy.symbol}</span> {copy.label}
          </span>
        </span>
        <span className="res-value">
          {state.dose.toFixed(2)}
          <small>/{nums.doseLimit} mSv</small>
        </span>
        <div
          className="segments segments--dose"
          role="img"
          aria-label={`Dose meter: ${filledTicks} of ${doseTicks} millisieverts used`}
        >
          {Array.from({ length: doseTicks }, (_, index) => (
            <span
              key={index}
              className={`segment${index < filledTicks ? " segment--filled" : ""}${
                index >= Math.round(nums.doseLimit * 0.75) ? " segment--warn" : ""
              }`}
            />
          ))}
        </div>
        {preview && preview.doseAfter !== state.dose ? (
          <span className="res-foot">
            Plan adds +{Math.max(0, preview.doseAfter - state.dose).toFixed(2)} mSv
          </span>
        ) : (
          <span className="res-foot">{state.shielded ? "Soil berm built" : "No soil berm yet"}</span>
        )}
      </div>

      <button
        type="button"
        className="res res--science"
        onClick={onOpenScience}
        aria-label={`Finds: ${state.discoveries.length} collected, ${transmitted} sent to Earth. Open the science panel.`}
      >
        <span className="res-head">
          <StarIcon width={18} height={18} />
          <span className="res-label">Finds</span>
        </span>
        <span className="res-value">
          {state.discoveries.length}
          <small> · {transmitted} sent</small>
        </span>
        <span className="res-foot">Tap for the real data</span>
      </button>
    </div>
  );
}
