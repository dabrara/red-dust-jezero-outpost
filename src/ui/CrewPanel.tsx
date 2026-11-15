import { numbersFor } from "../game/scenarios";
import { doseStatusFor, progressGoals } from "../game/engine";
import type { Analysis } from "../game/engine";
import type { GameState, ReadingLevel } from "../game/types";

interface CrewPanelProps {
  state: GameState;
  analysis: Analysis | null;
  reading: ReadingLevel;
}

function pebbleHint(state: GameState, analysis: Analysis | null): string {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);

  if (state.eventId === "solar-storm" && !state.plan.includes("shelter")) {
    return "A storm is here. The buried shelter turns 2 mSv into 0.2 mSv.";
  }
  if (state.eventId === "conjunction" && state.plan.includes("comms")) {
    return "Earth is behind the Sun. The dish cannot send today.";
  }
  if (!state.plan.includes("oxygen") && state.oxygen <= 5) {
    return "The crew breathes air every day. The oxygen plant makes more.";
  }
  if (state.dose > nums.doseLimit * 0.5 && !state.shielded) {
    return "Dose is adding up. The soil berm is a one-time cost that lasts all mission.";
  }
  if (analysis && analysis.problems.length > 0) {
    return analysis.problems[0].message;
  }
  if (state.plan.length === 0) {
    return "Pick one job. You can undo it.";
  }
  if (state.food < nums.foodNeeded && state.shift >= nums.shiftCount - 3) {
    return "The greenhouse still has food to grow.";
  }
  if (state.power >= nums.powerCapacity - 1) {
    return "Your battery is nearly full.";
  }
  return "Thin air, cold nights, real choices.";
}

export function CrewPanel({ state, analysis, reading }: CrewPanelProps) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const hint = pebbleHint(state, analysis);
  const goals = progressGoals(state);
  const status = doseStatusFor(state.dose, nums.doseLimit);
  const goalDetail: Record<string, string> = {
    transmit: `${state.discoveries.filter((d) => d.transmitted).length}/${nums.targetTransmissions}`,
    food: `${state.food}/${nums.foodNeeded}`,
    dose: `${state.dose.toFixed(2)}/${nums.doseLimit} mSv`,
  };

  return (
    <section className="panel hint-panel" aria-labelledby="hint-title">
      <h2 id="hint-title" className="visually-hidden">
        Pebble's tip
      </h2>
      <p className="pebble-hint">
        <span className="pebble-mini" aria-hidden="true">
          <span className="pebble-eye" />
          <span className="pebble-eye" />
        </span>
        <span>
          <strong>Pebble:</strong> {hint}
        </span>
      </p>

      <ul className="goal-list goal-list--compact">
        {goals.map((goal) => (
          <li key={goal.id} className={goal.met ? "goal goal--met" : "goal"}>
            <span className="goal-mark" aria-hidden="true">
              {goal.met ? "✓" : "○"}
            </span>
            {goal.label}
            <small>{goalDetail[goal.id]}</small>
          </li>
        ))}
      </ul>

      {status === "needs-plan" ? (
        <p className="delayed-line">
          <span aria-hidden="true">■</span> Outdoor work is paused until dose stops rising.
        </p>
      ) : null}

      {reading === "mission" && state.delayed.length > 0 ? (
        <p className="delayed-line">
          <span aria-hidden="true">⏳</span>{" "}
          {state.delayed.map((d) => `${d.label} (day ${d.dueShift})`).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
