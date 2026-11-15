import { useEffect, useState } from "react";
import {
  clearPlan as clearPlanState,
  createGame,
  currentEvent,
  forecast,
  isActivityAvailable,
  nextShift,
  planCost,
  runShift,
  toggleActivity as toggle,
  useRescue,
} from "./game/engine";
import { BUILDINGS } from "./game/activities";
import { pebbleLines } from "./game/copy";
import { numbersFor, SCENARIOS } from "./game/scenarios";
import {
  clearGame,
  loadGame,
  loadSettings,
  saveGame,
  saveSettings,
} from "./game/save";
import type {
  ActivityId,
  BuildingId,
  GameState,
  Mode,
  ScenarioId,
  Settings,
  ShiftResult,
} from "./game/types";
import { BaseScene } from "./ui/BaseScene";
import { BuildingCard } from "./ui/BuildingCard";
import { CrewPanel } from "./ui/CrewPanel";
import { EventCard } from "./ui/EventCard";
import { MissionScrapbook } from "./ui/MissionScrapbook";
import { Modal } from "./ui/Modal";
import { PlanPreview } from "./ui/PlanPreview";
import { ResourceBar } from "./ui/ResourceBar";
import { ScienceDrawer } from "./ui/ScienceDrawer";
import { SettingsPanel } from "./ui/SettingsPanel";
import { ShiftResults } from "./ui/ShiftResults";
import { StartScreen } from "./ui/StartScreen";
import { TutorialOverlay } from "./ui/TutorialOverlay";
import { useSound, useSpeech } from "./ui/audio";
import { BookIcon, GearIcon, HelpIcon, MoonIcon, MutedIcon, SoundIcon } from "./ui/icons";

type ModalKind =
  | "settings"
  | "science"
  | "help"
  | "tutorial"
  | "restart"
  | null;

const TUTORIAL_KEY = "reddust.tutorial.v1";

function tutorialSeen(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_KEY) === "1";
  } catch {
    return false;
  }
}

function markTutorialSeen(): void {
  try {
    window.localStorage.setItem(TUTORIAL_KEY, "1");
  } catch {
    // ignore
  }
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [game, setGame] = useState<GameState | null>(null);
  const [onStartScreen, setOnStartScreen] = useState(true);
  const [saved, setSaved] = useState<GameState | null>(() => loadGame());
  const [selected, setSelected] = useState<BuildingId | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [announcement, setAnnouncement] = useState("");

  const play = useSound(settings.sound);
  const { speak, supported } = useSpeech(settings.readAloud);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!game) return;
    saveGame(game);
    setSaved(game);
  }, [game]);

  const patchSettings = (patch: Partial<Settings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const announce = (text: string) => setAnnouncement(text);

  const startMission = (
    scenarioId: ScenarioId,
    mode: Mode,
    variant: number,
    days: number,
  ) => {
    const fresh = createGame(scenarioId, mode, variant, days);
    setGame(fresh);
    setOnStartScreen(false);
    setSelected(null);
    play("good");
    announce(
      `${SCENARIOS[scenarioId].name}. Day 1 of ${numbersFor(scenarioId, mode, days).shiftCount}. ${mode === "guided" ? "More guidance" : "More challenge"}.`,
    );
    if (!tutorialSeen()) setModal("tutorial");
  };

  const resumeMission = () => {
    if (!saved) return;
    setGame(saved);
    setOnStartScreen(false);
    setSelected(null);
    announce(`Mission resumed at day ${saved.shift}.`);
  };

  const toggleActivity = (id: ActivityId) => {
    if (!game) return;
    const next = toggle(game, id);
    if (next === game) return;
    setGame(next);
    play("tap");
  };

  const clearPlan = () => {
    if (!game) return;
    setGame(clearPlanState(game));
    play("tap");
  };

  const handleRun = () => {
    if (!game) return;
    const next = runShift(game);
    if (next === game) return;
    setGame(next);
    setSelected(null);
    const result = next.lastResult;
    if (result) {
      const summary = pebbleLines(result, "mission").join(" ");
      announce(
        `Day ${result.shift} complete. Air ${result.oxygenAfter}. Power ${result.powerAfter}. Dose ${result.doseAfter.toFixed(2)} of ${result.doseLimit} millisieverts. ${summary}`,
      );
      play(
        result.willEndMission
          ? "warn"
          : result.discoveries.length > 0
            ? "good"
            : "tap",
      );
      if (settings.readAloud) speak(`Day ${result.shift} complete. ${summary}`);
    }
  };

  const handleNext = () => {
    if (!game) return;
    const next = nextShift(game);
    setGame(next);
    setSelected(null);
    play(next.phase === "scrapbook" ? "finish" : "tap");
    announce(
      next.phase === "scrapbook"
        ? "Mission scrapbook ready."
        : `Day ${next.shift} of ${numbersFor(next.scenarioId, next.mode, next.days).shiftCount}.`,
    );
  };

  const handleRescue = () => {
    if (!game) return;
    setGame(useRescue(game));
    play("good");
    announce("Mission Control sent a rescue supply once: extra power and air.");
  };

  const restartMission = () => {
    if (!game) return;
    setGame(createGame(game.scenarioId, game.mode, game.variant, game.days));
    setSelected(null);
    play("tap");
    announce("Mission restarted at day 1.");
  };

  const restartWithEvents = () => {
    if (!game) return;
    startMission(game.scenarioId, game.mode, game.variant + 1, game.days);
  };

  const backToMissions = () => {
    clearGame();
    setSaved(null);
    setGame(null);
    setOnStartScreen(true);
    setSelected(null);
    setModal(null);
    announce("Choose a mission.");
  };

  const reading = settings.reading;
  const nums = game ? numbersFor(game.scenarioId, game.mode, game.days) : null;
  const analysis = game && game.phase === "planning" ? forecast(game) : null;

  const scenePlan = game
    ? game.phase === "results"
      ? (game.lastResult?.plan ?? [])
      : game.plan
    : [];

  const readEventAloud = () => {
    if (!game) return;
    const event = currentEvent(game);
    if (!event) return;
    speak(
      `${event.title}. ${reading === "little" ? event.kidText : event.fullText} ${event.effects.join(". ")}`,
    );
  };

  const readResultAloud = () => {
    if (!game?.lastResult) return;
    speak(pebbleLines(game.lastResult, "mission").join(" "));
  };

  return (
    <div
      className={`app${settings.reducedMotion ? " app--reduced" : ""}`}
      data-reading={reading}
    >
      <a className="skip-link" href="#main">
        Skip to the game
      </a>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      {onStartScreen ? (
        <StartScreen
          settings={settings}
          resume={saved}
          onStart={startMission}
          onResume={resumeMission}
          onSettingsChange={patchSettings}
          onOpenSettings={() => setModal("settings")}
          onOpenScience={() => setModal("science")}
          onOpenHelp={() => setModal("help")}
        />
      ) : game && nums ? (
        <>
          <header className="app-header">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">
                <MoonIcon width={24} height={24} />
              </span>
              <span className="brand-text">
                <strong>Red Dust</strong>
                <small>Jezero Outpost · Mars</small>
              </span>
            </div>

            <div className="shift-badge">
              <p className="shift-label">
                Day <strong>{game.shift}</strong> of {nums.shiftCount}
              </p>
              <div className="shift-dots" aria-hidden="true">
                {Array.from({ length: nums.shiftCount }, (_, index) => (
                  <span
                    key={index}
                    className={`shift-dot${index < game.shift ? " shift-dot--on" : ""}`}
                  />
                ))}
              </div>
              <p className="shift-scenario">
                {SCENARIOS[game.scenarioId].name} ·{" "}
                {game.mode === "guided" ? "More guidance" : "More challenge"}
              </p>
            </div>

            <nav className="secondary-controls" aria-label="Game controls">
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setModal("help")}
              >
                <HelpIcon width={18} height={18} />
                <span className="ctrl-label">Help</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setModal("science")}
              >
                <BookIcon width={18} height={18} />
                <span className="ctrl-label">Science</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                aria-pressed={settings.sound}
                onClick={() => patchSettings({ sound: !settings.sound })}
              >
                {settings.sound ? (
                  <SoundIcon width={18} height={18} />
                ) : (
                  <MutedIcon width={18} height={18} />
                )}
                <span className="ctrl-label">
                  {settings.sound ? "Sound on" : "Sound off"}
                </span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setModal("settings")}
              >
                <GearIcon width={18} height={18} />
                <span className="ctrl-label">Settings</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => setModal("restart")}
              >
                <span aria-hidden="true">↺</span>
                <span className="ctrl-label">Restart</span>
              </button>
            </nav>
          </header>

          {game.phase !== "scrapbook" ? (
            <ResourceBar
              state={game}
              preview={analysis?.result ?? null}
              onOpenScience={() => setModal("science")}
            />
          ) : null}

          {game.phase === "scrapbook" ? (
            <MissionScrapbook
              state={game}
              reading={reading}
              reducedMotion={settings.reducedMotion}
              onPlayAgain={restartWithEvents}
              onTryAnother={backToMissions}
              onOpenScience={() => setModal("science")}
            />
          ) : (
            <>
              <main className="layout" id="main">
                <BaseScene
                  state={game}
                  plan={scenePlan}
                  selected={selected}
                  onSelect={(id) => {
                    setSelected(id);
                    play("tap");
                  }}
                  reducedMotion={settings.reducedMotion}
                  reading={reading}
                  interactive={game.phase === "planning"}
                />

                <aside className="layout-side" aria-label="Day details">
                  {game.phase === "planning" &&
                  game.eventId &&
                  currentEvent(game) ? (
                    <EventCard
                      eventId={game.eventId}
                      reading={reading}
                      onOpenScience={() => setModal("science")}
                      onReadAloud={readEventAloud}
                      readAloudAvailable={supported && settings.readAloud}
                    />
                  ) : null}

                  {game.phase === "results" && game.lastResult ? (
                    <ShiftResults
                      state={game}
                      result={game.lastResult as ShiftResult}
                      reading={reading}
                      isLast={
                        game.lastResult.shift >= nums.shiftCount ||
                        game.outcome !== null
                      }
                      onNext={handleNext}
                      onReadAloud={readResultAloud}
                      readAloudAvailable={supported && settings.readAloud}
                    />
                  ) : null}

                  {game.phase === "planning" ? (
                    selected ? (
                      <BuildingCard
                        building={BUILDINGS[selected]}
                        state={game}
                        reading={reading}
                        planned={game.plan.includes(
                          BUILDINGS[selected].activity,
                        )}
                        available={isActivityAvailable(
                          game,
                          BUILDINGS[selected].activity,
                        )}
                        cost={planCost(game, [BUILDINGS[selected].activity])}
                        onToggle={toggleActivity}
                        onClose={() => setSelected(null)}
                      />
                    ) : (
                      <CrewPanel state={game} analysis={analysis} reading={reading} />
                    )
                  ) : null}
                </aside>
              </main>

              {game.phase === "planning" && analysis ? (
                <PlanPreview
                  state={game}
                  analysis={analysis}
                  reading={reading}
                  onRun={handleRun}
                  onClear={clearPlan}
                  onUseRescue={handleRescue}
                  onOpenActivity={(id) => {
                    const building = BUILDINGS[
                      Object.keys(BUILDINGS).find(
                        (key) =>
                          BUILDINGS[key as BuildingId].activity === id,
                      ) as BuildingId
                    ];
                    setSelected(building.id);
                  }}
                />
              ) : null}

              {/* Phones put the plan tray far below the outpost, so the day's
                  main action rides along at the bottom of the screen. */}
              {game.phase === "planning" && analysis && modal === null ? (
                <div className="mobile-run-dock">
                  <div className="mobile-run-meta">
                    <span>
                      Crew {analysis.result.crewUsed}/
                      {analysis.result.crewAvailable}
                    </span>
                    <span>
                      Power {analysis.result.powerSpent}/
                      {analysis.result.powerPool}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleRun}
                    disabled={!analysis.feasible}
                  >
                    Run This Day
                    <span className="btn-sub">
                      {analysis.result.willEndMission
                        ? "This ends the mission"
                        : "Let's see!"}
                    </span>
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}

      {modal === "settings" ? (
        <SettingsPanel
          settings={settings}
          readAloudSupported={supported}
          onChange={patchSettings}
          onClose={() => setModal(null)}
          onRestart={restartMission}
        />
      ) : null}

      {modal === "science" ? (
        <ScienceDrawer state={game} onClose={() => setModal(null)} />
      ) : null}

      {modal === "tutorial" ? (
        <TutorialOverlay
          reading={reading}
          onApplyPlan={(plan) => {
            if (!game) return;
            let next = clearPlanState(game);
            for (const id of plan) next = toggle(next, id);
            setGame(next);
          }}
          onFinish={() => {
            markTutorialSeen();
            setModal(null);
          }}
          onSkip={() => {
            markTutorialSeen();
            setModal(null);
          }}
        />
      ) : null}

      {modal === "help" ? (
        <Modal
          id="help"
          title="How to play"
          onClose={() => setModal(null)}
          footer={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setModal("tutorial")}
            >
              Show me the tutorial again
            </button>
          }
        >
          <div className="help-body">
            <h3>The idea</h3>
            <p>
              You are the commander of a small Mars outpost. Each day you choose
              which jobs get the power units and which get the two crew task
              cards. One job means less for the others — that is the whole game.
            </p>
            <p>
              Three meters matter: <strong>power</strong>, <strong>air</strong>{" "}
              and <strong>dose</strong> (radiation). Dose is measured in mSv, the
              unit NASA uses. About 0.64 mSv arrives every day on the Mars
              surface, and a solar storm can add about 2 mSv in hours.
            </p>
            <h3>Each day</h3>
            <p className="fineprint">
              A Mars day is called a sol: 24 hours and 39 minutes. Days here
              are sols.
            </p>
            <ol>
              <li>Tap a building, then add its job to your plan.</li>
              <li>Check the plan preview at the bottom of the screen.</li>
              <li>
                Press <strong>Run This Day</strong> and watch the outpost respond.
              </li>
              <li>Read Pebble's summary, then take the next day.</li>
            </ol>
            <h3>Controls that always work</h3>
            <ul>
              <li>Every control is a button, so Tab and Enter work everywhere.</li>
              <li>No dragging is needed. Tapping the plus and minus is enough.</li>
              <li>Warnings tell you how to fix a plan before you run it.</li>
              <li>
                Help, Science, Sound and Settings stay in the header, and nothing
                is hidden behind hovering.
              </li>
            </ul>
            <h3>If a plan goes wrong</h3>
            <p>
              Nobody is hurt in this game. If the air runs out or the dose passes
              the mission limit, Mission Control brings the crew home early and
              the scrapbook explains what happened. You can always restart from
              Settings.
            </p>
            <h3>Why Earth cannot help</h3>
            <p>
              Mars is 3 to 22 minutes away by radio, so nobody can talk you
              through a storm. During conjunction, when Mars passes behind the
              Sun, Earth stops sending commands at all. That is why the crew has
              to plan ahead.
            </p>
            <h3>Saved on this device</h3>
            <p>
              Your mission is saved in this browser only. No account, no
              tracking, no leaderboard.
            </p>
          </div>
        </Modal>
      ) : null}

      {modal === "restart" ? (
        <Modal
          id="restart"
          title="Restart this mission?"
          onClose={() => setModal(null)}
        >
          <p>
            This starts the same mission again from day 1 and clears the
            current one from this device.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                restartMission();
                setModal(null);
              }}
            >
              Restart mission
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setModal(null)}
            >
              Keep playing
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
