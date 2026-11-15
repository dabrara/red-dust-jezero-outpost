import { useState } from "react";
import {
  MISSION_LENGTHS,
  SCENARIO_LIST,
  missionLengthLabel,
  numbersFor,
} from "../game/scenarios";
import type {
  GameState,
  Mode,
  ReadingLevel,
  ScenarioId,
  Settings,
} from "../game/types";
import {
  BookIcon,
  DishIcon,
  GearIcon,
  HelpIcon,
  LeafIcon,
  MoonIcon,
  ShelterIcon,
  StarIcon,
} from "./icons";

interface StartScreenProps {
  settings: Settings;
  resume: GameState | null;
  onStart: (
    scenarioId: ScenarioId,
    mode: Mode,
    variant: number,
    days: number,
  ) => void;
  onResume: () => void;
  onSettingsChange: (patch: Partial<Settings>) => void;
  onOpenSettings: () => void;
  onOpenScience: () => void;
  onOpenHelp: () => void;
}

const SCENARIO_ICONS = {
  "first-sols": MoonIcon,
  "storm-season": StarIcon,
  "dust-season": DishIcon,
  conjunction: ShelterIcon,
} as const;

export function StartScreen({
  settings,
  resume,
  onStart,
  onResume,
  onSettingsChange,
  onOpenSettings,
  onOpenScience,
  onOpenHelp,
}: StartScreenProps) {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("first-sols");
  const [mode, setMode] = useState<Mode>("guided");
  const [days, setDays] = useState<number>(7);
  const reading: ReadingLevel = settings.reading;
  const nums = numbersFor(scenarioId, mode, days);

  return (
    <div className="start">
      <div className="start-sky" aria-hidden="true">
        <div className="start-earth" />
        <span className="start-star s1" />
        <span className="start-star s2" />
        <span className="start-star s3" />
        <span className="start-star s4" />
      </div>

      <header className="start-header">
        <p className="eyebrow">One week, two or three. Three meters. One crew.</p>
        <h1>
          <span className="logo-mark" aria-hidden="true">
            <MoonIcon width={30} height={30} />
          </span>
          Red Dust
          <span className="logo-sub">Jezero Outpost, Mars</span>
        </h1>
        <p className="start-lede">
          You are the commander of a small Mars outpost. Power, air and
          radiation dose all come out of the same budget. Two crew tasks a day,
          and no real-time help from Earth.
        </p>
      </header>

      <div className="start-grid">
        <section className="start-card" aria-labelledby="scenario-heading">
          <h2 id="scenario-heading">Pick a mission</h2>
          <div className="scenario-list">
            {SCENARIO_LIST.map((scenario) => {
              const Icon = SCENARIO_ICONS[scenario.id];
              const selected = scenario.id === scenarioId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  aria-pressed={selected}
                  className={`scenario-card${selected ? " scenario-card--selected" : ""}`}
                  onClick={() => setScenarioId(scenario.id)}
                >
                  <span className="scenario-icon" aria-hidden="true">
                    <Icon width={22} height={22} />
                  </span>
                  <span className="scenario-text">
                    <span className="scenario-name">{scenario.name}</span>
                    <span className="scenario-tagline">{scenario.tagline}</span>
                  </span>
                  <span className="scenario-focus">{scenario.focus}</span>
                </button>
              );
            })}
          </div>

          <div className="start-options">
            <fieldset className="option-group">
              <legend>Help</legend>
              <label className={`option${mode === "guided" ? " option--on" : ""}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "guided"}
                  onChange={() => setMode("guided")}
                />
                <span>
                  <strong>More guidance</strong>
                  <em>Extra air and power, hints, rescue supply.</em>
                </span>
              </label>
              <label className={`option${mode === "challenge" ? " option--on" : ""}`}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "challenge"}
                  onChange={() => setMode("challenge")}
                />
                <span>
                  <strong>More challenge</strong>
                  <em>Tighter limits, no rescue supply.</em>
                </span>
              </label>
            </fieldset>

            <fieldset className="option-group">
              <legend>Words</legend>
              <label className={`option${reading === "little" ? " option--on" : ""}`}>
                <input
                  type="radio"
                  name="reading"
                  checked={reading === "little"}
                  onChange={() => onSettingsChange({ reading: "little" })}
                />
                <span>
                  <strong>Simple</strong>
                  <em>Short sentences.</em>
                </span>
              </label>
              <label className={`option${reading === "mission" ? " option--on" : ""}`}>
                <input
                  type="radio"
                  name="reading"
                  checked={reading === "mission"}
                  onChange={() => onSettingsChange({ reading: "mission" })}
                />
                <span>
                  <strong>More detail</strong>
                  <em>Longer explanations.</em>
                </span>
              </label>
            </fieldset>

            <fieldset className="option-group">
              <legend>Mission length</legend>
              <div className="length-row">
                {MISSION_LENGTHS.map((option) => (
                  <label
                    key={option}
                    className={`length-chip${days === option ? " length-chip--on" : ""}`}
                  >
                    <input
                      type="radio"
                      name="length"
                      checked={days === option}
                      onChange={() => setDays(option)}
                      className="visually-hidden"
                    />
                    <strong>{option} days</strong>
                    <em>{missionLengthLabel(option)}</em>
                  </label>
                ))}
              </div>
              <p className="length-targets">
                Goals for this mission: send {nums.targetTransmissions} finds ·
                harvest {nums.foodNeeded} crops · stay under {nums.doseLimit} mSv.
              </p>
            </fieldset>
          </div>

          <div className="start-actions">
            <button
              type="button"
              className="btn btn--primary btn--big"
              onClick={() => onStart(scenarioId, mode, 0, days)}
            >
              Start mission
              <span className="btn-sub">{days} days on Mars</span>
            </button>
            {resume ? (
              <button type="button" className="btn btn--secondary" onClick={onResume}>
                Continue
                <span className="btn-sub">
                  Day {resume.shift} · saved on this device
                </span>
              </button>
            ) : null}
          </div>
          <p className="start-hintline">
            <HelpIcon width={16} height={16} /> Tap a building, check the plan,
            then run the day.
          </p>
        </section>

        <aside className="start-side">
          <section className="start-card start-card--small" aria-labelledby="crew-heading">
            <h2 id="crew-heading">Your crew</h2>
            <ul className="crew-list">
              <li>
                <span className="crew-dot crew-dot--gold" aria-hidden="true" />
                <span>
                  <strong>Commander Pip</strong>
                  <em>Rocks and rover trips</em>
                </span>
              </li>
              <li>
                <span className="crew-dot crew-dot--teal" aria-hidden="true" />
                <span>
                  <strong>Dr. Nova</strong>
                  <em>Crops and lab work</em>
                </span>
              </li>
              <li>
                <span className="crew-dot crew-dot--sky" aria-hidden="true" />
                <span>
                  <strong>Engineer Ash</strong>
                  <em>Power, air and shielding</em>
                </span>
              </li>
              <li>
                <span className="crew-dot crew-dot--lav" aria-hidden="true" />
                <span>
                  <strong>Pebble</strong>
                  <em>Helper robot</em>
                </span>
              </li>
            </ul>
            <p className="start-fact">
              On a quiet day Mars gives the crew about 0.64 mSv of radiation.
              That number comes from NASA's RAD instrument.
            </p>
          </section>

          <div className="start-links">
            <button type="button" className="link-btn" onClick={onOpenHelp}>
              <HelpIcon width={18} height={18} /> How to play
            </button>
            <button type="button" className="link-btn" onClick={onOpenScience}>
              <BookIcon width={18} height={18} /> Real data &amp; sources
            </button>
            <button type="button" className="link-btn" onClick={onOpenSettings}>
              <GearIcon width={18} height={18} /> Settings
            </button>
            <span className="start-note">
              <LeafIcon width={16} height={16} /> No account, no ads, no game
              analytics.
            </span>
            <p className="ai-note">
              Made with AI assistance: code, illustrations and text, reviewed by
              a human. No NASA logos or insignia are used.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
