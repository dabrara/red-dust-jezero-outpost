import { BADGES } from "../game/badges";
import { buildScrapbook } from "../game/scrapbook";
import type { BadgeId, GameState, ReadingLevel } from "../game/types";
import { BaseScene } from "./BaseScene";
import { BookIcon, MoonIcon, StarIcon } from "./icons";

interface MissionScrapbookProps {
  state: GameState;
  reading: ReadingLevel;
  reducedMotion: boolean;
  onPlayAgain: () => void;
  onTryAnother: () => void;
  onOpenScience: () => void;
}

const BADGE_GLYPH: Record<BadgeId, string> = {
  "careful-planner": "◆",
  "curious-explorer": "✦",
  "food-scientist": "❋",
  "dose-keeper": "⛨",
  "clear-communicator": "◎",
};

export function MissionScrapbook({
  state,
  reading,
  reducedMotion,
  onPlayAgain,
  onTryAnother,
  onOpenScience,
}: MissionScrapbookProps) {
  const book = buildScrapbook(state);

  return (
    <section className="scrapbook" aria-labelledby="scrapbook-title">
      <header className="scrapbook-head">
        <p className="eyebrow">
          <MoonIcon width={16} height={16} /> Mission scrapbook
        </p>
        <h1 id="scrapbook-title">{book.headline}</h1>
        <p className="scrapbook-sub">{book.subline}</p>
        <div className="scrapbook-actions">
          <button type="button" className="btn btn--primary" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="btn btn--secondary" onClick={onTryAnother}>
            Another mission
          </button>
          <button type="button" className="btn btn--ghost" onClick={onOpenScience}>
            <BookIcon width={16} height={16} /> Real data
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              try {
                window.print();
              } catch {
                // printing is optional
              }
            }}
          >
            Print
          </button>
        </div>
      </header>

      <div className="scrapbook-grid">
        <div className="scrapbook-scene">
          <BaseScene
            state={state}
            plan={state.lastResult?.plan ?? []}
            selected={null}
            onSelect={() => undefined}
            reducedMotion={reducedMotion}
            reading={reading}
            interactive={false}
          />
        </div>

        <div className="scrapbook-cards">
          <section className="panel">
            <h2>Goals</h2>
            <ul className="goal-list">
              {book.goals.map((goal) => (
                <li key={goal.id} className={goal.met ? "goal goal--met" : "goal"}>
                  <span className="goal-mark" aria-hidden="true">
                    {goal.met ? "✓" : "○"}
                  </span>
                  {goal.label}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Badges</h2>
            {book.badges.length === 0 ? (
              <p>No badges this time. Badges are not a score.</p>
            ) : (
              <ul className="badge-list">
                {book.badges.map((badge) => (
                  <li key={badge.id} className="badge-card">
                    <span className="badge-glyph" aria-hidden="true">
                      {BADGE_GLYPH[badge.id]}
                    </span>
                    <strong>{badge.name}</strong>
                  </li>
                ))}
              </ul>
            )}
            <details className="badge-rest">
              <summary>All badge rules</summary>
              <ul>
                {BADGES.map((badge) => (
                  <li key={badge.id}>
                    <strong>{badge.name}:</strong> {badge.rule}
                  </li>
                ))}
              </ul>
            </details>
          </section>
        </div>
      </div>

      <section className="panel">
        <h2>Finds</h2>
        {book.discoveries.length === 0 ? (
          <p>The shelf stayed empty.</p>
        ) : (
          <ul className="collection-list">
            {book.discoveries.map((discovery) => (
              <li key={discovery.id}>
                <StarIcon width={16} height={16} />
                <strong>{discovery.name}</strong>
                <span className={`chip ${discovery.transmitted ? "chip--teal" : "chip--ghost"}`}>
                  {discovery.transmitted ? "Sent to Earth" : "Kept"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {book.earlyReturn ? (
        <section className="panel early-return">
          <h2>What happened</h2>
          <ol>
            <li>{book.earlyReturn.cause}</li>
            <li>{book.earlyReturn.missedChance}</li>
            <li>{book.earlyReturn.alternative}</li>
          </ol>
        </section>
      ) : null}

      <section className="panel">
        <h2>Three choices</h2>
        <ul className="highlight-list">
          {book.highlights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="panel reflection">
        <h2>One question</h2>
        <p className="reflection-question">{book.reflection}</p>
      </section>

      <details className="panel scrapbook-more">
        <summary>Final reserves and stats</summary>
        <div className="reserve-grid">
          <div>
            <span className="reserve-label">Power</span>
            <strong>
              {book.finalPower}
              <small>/{book.powerCapacity}</small>
            </strong>
          </div>
          <div>
            <span className="reserve-label">Air</span>
            <strong>
              {book.finalOxygen}
              <small>/{book.oxygenCapacity}</small>
            </strong>
          </div>
          <div>
            <span className="reserve-label">Dose</span>
            <strong>
              {book.finalDose.toFixed(2)}
              <small>/{book.doseLimit} mSv</small>
            </strong>
          </div>
        </div>
        <p className="fineprint">
          {book.stats.shiftsPlayed} days · {book.stats.oxygenRuns} oxygen runs ·{" "}
          {book.stats.roverTrips} rover trips · {book.stats.shelterSols} shelter
          days · {book.stats.transmissions} sent to Earth
        </p>
        <p className="fineprint">
          {book.sheltered
            ? "The soil berm was built, so every day after it gave less dose."
            : "No soil berm was built this mission."}
        </p>
      </details>

      <details className="panel scrapbook-more" id="review-decisions">
        <summary>Review my decisions</summary>
        <ol className="history-list">
          {state.history.map((record) => (
            <li key={record.shift}>
              <h3>Day {record.shift}</h3>
              <p>
                {record.plan.length === 0 ? "Rested." : record.plan.join(", ")}
                {record.eventTitle ? ` · ${record.eventTitle}` : ""}
              </p>
              <p className="fineprint">
                Power left {record.powerAfter} · air {record.oxygenAfter} · dose{" "}
                {record.doseAfter.toFixed(2)} mSv
                {record.newDiscoveryNames.length > 0
                  ? ` · found ${record.newDiscoveryNames.join(", ")}`
                  : ""}
              </p>
            </li>
          ))}
        </ol>
      </details>

      <p className="scrapbook-foot">
        Jezero Outpost is a made-up base. The radiation numbers and the storm
        records are real NASA data; the power and air units are game values.
      </p>
    </section>
  );
}
