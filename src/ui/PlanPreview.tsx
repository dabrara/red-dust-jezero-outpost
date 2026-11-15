import { ACTIVITIES, ACTIVITY_ORDER } from "../game/activities";
import type { Analysis } from "../game/engine";
import { numbersFor } from "../game/scenarios";
import type { ActivityId, GameState, ReadingLevel } from "../game/types";

interface PlanPreviewProps {
  state: GameState;
  analysis: Analysis;
  reading: ReadingLevel;
  onRun: () => void;
  onClear: () => void;
  onUseRescue: () => void;
  onOpenActivity: (id: ActivityId) => void;
}

export function PlanPreview({
  state,
  analysis,
  reading,
  onRun,
  onClear,
  onUseRescue,
  onOpenActivity,
}: PlanPreviewProps) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const { result, problems, feasible } = analysis;
  const plan = ACTIVITY_ORDER.filter((id) => state.plan.includes(id));
  const block = problems.find((p) => p.severity === "block");
  const warn = problems.find((p) => p.severity === "warn");
  const warning = block ?? warn;

  const also: string[] = [];
  if (result.foodAfter > result.foodBefore) {
    also.push(`crops ${result.foodAfter}/${result.foodNeeded}`);
  }
  if (result.transmittedNow > 0) {
    also.push(`${result.transmittedNow} sent to Earth`);
  }
  if (result.shieldBuilt && !state.shielded) {
    also.push("soil berm built");
  }
  if (result.delayedCreated.length > 0) {
    also.push(result.delayedCreated.map((d) => d.label.toLowerCase()).join(" · "));
  }

  const rescueSuggested =
    state.mode === "guided" &&
    !state.usedRescue &&
    state.eventId !== "conjunction" &&
    (state.oxygen <= 3 || Boolean(block));

  const doseUp = result.doseAfter - state.dose;

  return (
    <section className="plan-tray" aria-labelledby="plan-title">
      <div className="tray-head">
        <h2 id="plan-title">
          Day {state.shift} of {nums.shiftCount}
        </h2>
        <div className="tray-meta">
          <span className="chip chip--lav">
            Crew {result.crewUsed}/{result.crewAvailable}
          </span>
          <span className="chip chip--gold">
            Power {result.powerSpent}/{result.powerPool}
          </span>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={onClear}
            disabled={plan.length === 0}
          >
            Undo
          </button>
        </div>
      </div>

      <div className="tray-body">
        <div className="tray-col">
          <h3>This day</h3>
          {plan.length === 0 ? (
            <p className="tray-empty">Tap a building to start.</p>
          ) : (
            <ul className="plan-chips">
              {plan.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="plan-chip"
                    onClick={() => onOpenActivity(id)}
                    aria-label={`${ACTIVITIES[id].short} is in the plan. Open it to remove it.`}
                  >
                    {ACTIVITIES[id].short}
                    <span aria-hidden="true"> ✕</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tray-col">
          <h3>What will happen</h3>
          <ul className="expect-list">
            <li>
              <span className="expect-label">Power left</span>
              <span className="expect-value">{result.powerAfter}</span>
            </li>
            <li>
              <span className="expect-label">Air after</span>
              <span
                className={`expect-value${
                  result.oxygenAfter < result.oxygenBefore
                    ? " expect-value--down"
                    : result.oxygenAfter > result.oxygenBefore
                      ? " expect-value--up"
                      : ""
                }`}
              >
                {result.oxygenAfter}
              </span>
            </li>
            <li>
              <span className="expect-label">Dose after</span>
              <span className={`expect-value${doseUp > 0 ? " expect-value--down" : ""}`}>
                {result.doseAfter.toFixed(2)} mSv
              </span>
            </li>
            <li>
              <span className="expect-label">New find</span>
              <span className="expect-value expect-value--words">
                {result.discoveries.length > 0
                  ? result.discoveries.map((d) => d.name).join(", ")
                  : "none"}
              </span>
            </li>
          </ul>
          {also.length > 0 ? <p className="tray-also">{also.join(" · ")}</p> : null}
        </div>

        <div className="tray-col tray-col--run">
          {warning ? (
            <div
              className={`warn ${block ? "warn--block" : "warn--note"}`}
              role={block ? "alert" : "status"}
            >
              <p className="warn-line">{warning.message}</p>
              <p className="warn-fix">{warning.fix}</p>
            </div>
          ) : null}

          <button
            type="button"
            className="btn btn--primary btn--run"
            onClick={onRun}
            disabled={!feasible}
            aria-describedby={!feasible ? "run-help" : undefined}
          >
            Run This Day
            <span className="btn-sub">
              {result.willEndMission
                ? "This ends the mission"
                : reading === "little"
                  ? "Let's see!"
                  : "Resolve the day"}
            </span>
          </button>
          {!feasible ? (
            <p id="run-help" className="tray-hint">
              Fix the plan first.
            </p>
          ) : null}

          {rescueSuggested ? (
            <button type="button" className="btn btn--ghost btn--small" onClick={onUseRescue}>
              Rescue supply
              <span className="btn-sub">
                +{nums.rescuePower} power, +{nums.rescueOxygen} air · once
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
