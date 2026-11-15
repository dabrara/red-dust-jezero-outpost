import { ACTIVITY_ORDER, ACTIVITIES } from "../game/activities";
import { pebbleLines } from "../game/copy";
import type { GameState, ReadingLevel, ShiftResult } from "../game/types";
import { LeafIcon, SoundIcon, StarIcon } from "./icons";

interface ShiftResultsProps {
  state: GameState;
  result: ShiftResult;
  reading: ReadingLevel;
  isLast: boolean;
  onNext: () => void;
  onReadAloud?: () => void;
  readAloudAvailable: boolean;
}

export function ShiftResults({
  result,
  reading,
  isLast,
  onNext,
  onReadAloud,
  readAloudAvailable,
}: ShiftResultsProps) {
  const lines = pebbleLines(result, reading).slice(0, 3);
  const plan = ACTIVITY_ORDER.filter((id) => result.plan.includes(id));

  return (
    <section className="panel results" aria-labelledby="results-title">
      <div className="results-head">
        <div>
          <p className="eyebrow">Day {result.shift} done</p>
          <h2 id="results-title">
            {result.willEndMission
              ? "The crew is coming home"
              : result.storm === "sheltered"
                ? "Sheltered through the storm"
                : result.foodCompleted
                  ? "The crops are in"
                  : result.discoveries.length > 0
                    ? "New find"
                    : "A quiet day"}
          </h2>
        </div>
        {readAloudAvailable && onReadAloud ? (
          <button
            type="button"
            className="btn btn--icon"
            onClick={onReadAloud}
            aria-label="Read the result aloud"
          >
            <SoundIcon width={16} height={16} />
          </button>
        ) : null}
      </div>

      <div className="pebble">
        <span className="pebble-avatar" aria-hidden="true">
          <span className="pebble-eye" />
          <span className="pebble-eye" />
        </span>
        <ul className="pebble-lines">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {result.discoveries.length > 0 ? (
        <ul className="discovery-list">
          {result.discoveries.map((discovery) => (
            <li key={discovery.id} className="discovery-card">
              <span className="discovery-icon" aria-hidden="true">
                {discovery.kind === "plant" ? (
                  <LeafIcon width={18} height={18} />
                ) : (
                  <StarIcon width={18} height={18} />
                )}
              </span>
              <strong>{discovery.name}</strong>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="result-list">
        {plan.length === 0 ? (
          <li>The crew rested.</li>
        ) : (
          plan.map((id) => (
            <li key={id}>
              <span className="tick" aria-hidden="true">
                ✓
              </span>
              {ACTIVITIES[id].short}
              {id === "oxygen" ? ` +${result.oxygenGain} air` : ""}
              {id === "rover" ? ` −${result.roverOxygen} air` : ""}
              {id === "greenhouse" ? ` ${result.foodAfter}/${result.foodNeeded}` : ""}
              {id === "comms" ? ` ${result.transmittedNow} sent` : ""}
              {id === "shield" ? " built" : ""}
            </li>
          ))
        )}
      </ul>

      <div className="dose-line" role="status">
        <span aria-hidden="true">☢</span>
        <span>
          Dose {result.doseBefore.toFixed(2)} → <strong>{result.doseAfter.toFixed(2)} mSv</strong>{" "}
          of {result.doseLimit}
          {result.storm !== "none"
            ? result.storm === "sheltered"
              ? " · storm, sheltered"
              : " · storm, unshielded"
            : ""}
        </span>
      </div>

      <div className="goal-row" aria-label="Mission goals">
        {result.goals.map((goal) => (
          <span key={goal.id} className={goal.met ? "goal-pill goal-pill--met" : "goal-pill"}>
            <span aria-hidden="true">{goal.met ? "✓" : "○"}</span> {goal.label}
          </span>
        ))}
      </div>

      <details className="more-detail">
        <summary>The numbers</summary>
        <ul className="breakdown">
          {result.breakdown.map((line) => (
            <li key={line.label} className={`breakdown-line breakdown-line--${line.tone}`}>
              <span>{line.label}</span>
              <strong>{line.value}</strong>
            </li>
          ))}
        </ul>
        {result.delayedCreated.length > 0 ? (
          <p className="delayed-line">
            <span aria-hidden="true">⏳</span>{" "}
            {result.delayedCreated.map((effect) => effect.label).join(" · ")}
          </p>
        ) : null}
        {result.delayedNotice.length > 0 ? (
          <p className="delayed-line">{result.delayedNotice.join(" ")}</p>
        ) : null}
      </details>

      <button type="button" className="btn btn--primary btn--run" onClick={onNext}>
        {isLast ? "See the scrapbook" : `Next day (${result.shift + 1})`}
      </button>
    </section>
  );
}
