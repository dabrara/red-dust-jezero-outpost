import { SCIENCE_NOTES, SOURCE_LIST } from "../game/sources";
import { DATA_CAVEAT, GAME_SCALE_NOTES, REAL_FACTS } from "../game/nasa";
import { numbersFor } from "../game/scenarios";
import { Modal } from "./Modal";
import type { GameState } from "../game/types";

interface ScienceDrawerProps {
  state: GameState | null;
  onClose: () => void;
}

const STATUS_LABEL = {
  archived: "Archived record",
  measurement: "Real measurement",
  "research-finding": "Research finding",
  reference: "Reference",
} as const;

export function ScienceDrawer({ state, onClose }: ScienceDrawerProps) {
  const nums = numbersFor(
    state?.scenarioId ?? "first-sols",
    state?.mode ?? "guided",
    state?.days ?? 7,
  );

  const rows: [string, string][] = [
    ["Mission length", `${nums.shiftCount} days`],
    ["Power at start / capacity", `${nums.startPower} / ${nums.powerCapacity} units`],
    ["Solar power each day", `${nums.generation} units`],
    ["Air at start / capacity", `${nums.startOxygen} / ${nums.oxygenCapacity} units`],
    ["Air the crew uses each day", `${nums.oxygenUse} units`],
    ["Oxygen plant", `${nums.oxygenPower} power → +${nums.oxygenGain} air`],
    ["Science lab", `${nums.labPower} power + 1 crew task`],
    ["Rover trip", `${nums.roverPower} power + ${nums.roverOxygen} air + ${nums.roverDose} mSv`],
    ["Greenhouse", `${nums.greenhousePower} power + 1 crew task → 1 crop`],
    ["Send finds to Earth", `${nums.commsPower} power + 1 crew task`],
    ["Storm shelter", `${nums.shelterPower} power + 1 crew task`],
    ["Soil berm (once)", `${nums.shieldPower} power + 1 crew task → daily dose ×${nums.shieldFactor}`],
    ["Crew task cards each day", `${nums.crewTasks}`],
    ["Daily background dose", `${nums.baseDose} mSv (real RAD measurement)`],
    ["Solar storm dose", `+${nums.stormDose} mSv outside shelter, +${nums.stormShelterDose} mSv inside`],
    ["Mission dose limit", `${nums.doseLimit} mSv (game rule)`],
  ];

  return (
    <Modal
      id="science"
      title="Real NASA data, and where the game takes over"
      onClose={onClose}
      wide
      closeLabel="Close"
    >
      <p className="lead">
        Red Dust is a game, but the radiation on the meter is real. NASA's RAD
        instrument measured how much radiation reaches the Mars surface, and the
        storms in this game are based on real records. Power and air are game
        units, because a real outpost budget would not fit on one screen.
      </p>

      <section className="science-section">
        <h3>Real numbers used in the game</h3>
        <p className="fineprint">{DATA_CAVEAT}</p>
        <div className="source-list">
          {REAL_FACTS.map((fact) => (
            <article key={fact.id} className="source-card fact-card">
              <header>
                <span className="chip chip--sky">Real NASA data</span>
                <h4>{fact.label}</h4>
              </header>
              <p className="fact-value">{fact.value}</p>
              <p className="source-kid">{fact.kidLine}</p>
              <details>
                <summary>Where this comes from</summary>
                <p>{fact.note}</p>
                <p>
                  <a
                    href={SOURCE_LIST.find((s) => s.id === fact.sourceId)?.url ?? "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {SOURCE_LIST.find((s) => s.id === fact.sourceId)?.title}
                  </a>
                </p>
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className="science-section">
        <h3>Where the game takes over</h3>
        <ul className="honest-list">
          {GAME_SCALE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>{SCIENCE_NOTES.lifeSupport}</li>
          <li>{SCIENCE_NOTES.protection}</li>
          <li>{SCIENCE_NOTES.greenhouse}</li>
          <li>{SCIENCE_NOTES.data}</li>
        </ul>
        <div className="numbers-table-wrap">
          <table className="numbers-table">
            <caption>
              Current game values ({state?.mode === "challenge" ? "More challenge" : "More guidance"})
            </caption>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {state ? (
        <section className="science-section">
          <h3>Your finds this mission</h3>
          {state.discoveries.length === 0 ? (
            <p>No finds yet. The lab, the rover and the greenhouse all make them.</p>
          ) : (
            <ul className="collection-list">
              {state.discoveries.map((discovery) => (
                <li key={discovery.id}>
                  <strong>{discovery.name}</strong>
                  <span>Day {discovery.shift}</span>
                  <span className={`chip ${discovery.transmitted ? "chip--teal" : "chip--ghost"}`}>
                    {discovery.transmitted ? "Sent to Earth" : "Waiting on the shelf"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="science-section">
        <h3>Sources actually reviewed and used</h3>
        <p className="fineprint">
          All source notes are bundled inside the game, so it still works with no
          internet. Everything was retrieved on 15 November 2026.
        </p>
        <div className="source-list">
          {SOURCE_LIST.map((card) => (
            <article key={card.id} className="source-card">
              <header>
                <span
                  className={`chip ${
                    card.status === "measurement"
                      ? "chip--sky"
                      : card.status === "archived"
                        ? "chip--lav"
                        : card.status === "reference"
                          ? "chip--ghost"
                          : "chip--teal"
                  }`}
                >
                  {STATUS_LABEL[card.status]}
                </span>
                <h4>{card.title}</h4>
              </header>
              <dl className="source-meta">
                <div>
                  <dt>Organisation</dt>
                  <dd>{card.organisation}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{card.date}</dd>
                </div>
                <div>
                  <dt>Retrieved</dt>
                  <dd>{card.retrieved}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a href={card.url} target="_blank" rel="noreferrer noopener">
                      {card.url}
                    </a>
                  </dd>
                </div>
              </dl>
              <p className="source-kid">{card.kidLine}</p>
              <details>
                <summary>What the game does with it</summary>
                <ul>
                  {card.usedFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h5>What the game does not calculate</h5>
                <ul>
                  {card.notModelled.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary>Note for adults and judges</summary>
                <p>{card.adultNote}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
    </Modal>
  );
}
