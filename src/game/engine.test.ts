import { describe, expect, it } from "vitest";
import {
  analyze,
  createGame,
  crewTasksFor,
  doseStatusFor,
  generationFor,
  isActivityAvailable,
  makeDiscovery,
  nextShift,
  progressGoals,
  runShift,
  useRescue,
} from "./engine";
import {
  MISSION_LENGTHS,
  SCENARIOS,
  SCENARIO_LIST,
  numbersFor,
} from "./scenarios";
import { buildSchedule, eventCountFor } from "./schedule";
import { EVENTS } from "./events";
import { SOURCES } from "./sources";
import { REAL_FACTS } from "./nasa";
import type { ActivityId, GameState, Mode, ScenarioId } from "./types";

function game(
  scenarioId: ScenarioId = "first-sols",
  mode: Mode = "guided",
  days = 7,
): GameState {
  return createGame(scenarioId, mode, 0, days);
}

function withState(state: GameState, patch: Partial<GameState>): GameState {
  return { ...state, ...patch };
}

/** Run one day with an explicit plan, returning the resolved state. */
function playDay(state: GameState, plan: ActivityId[]): GameState {
  const analysis = analyze(state, plan);
  expect(analysis.feasible, `plan ${JSON.stringify(plan)} should be legal`).toBe(
    true,
  );
  return runShift({ ...state, plan });
}

/**
 * A simple, sensible commander: keep air alive, take shelter in storms, grow
 * food, send finds home, and build the berm on long missions when there is
 * spare power. Used to prove every mission and length is winnable by a
 * reasonable strategy, not just by one hand-tuned script.
 */
function autoPlan(state: GameState): ActivityId[] {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const pending = state.discoveries.filter((d) => !d.transmitted).length;
  const sent = state.discoveries.filter((d) => d.transmitted).length;
  const late = state.shift >= state.days - 1;
  const storm = event?.id === "solar-storm";

  const want: ActivityId[] = [];
  if (storm) want.push("shelter");
  if (state.oxygen - nums.oxygenUse <= 5) want.push("oxygen");
  if (
    !state.shielded &&
    state.days > 7 &&
    state.shift <= 4 &&
    state.power >= nums.shieldPower
  ) {
    want.push("shield");
  }
  if (state.food < nums.foodNeeded) want.push("greenhouse");
  if (pending > 0 && (pending >= 2 || sent + pending >= nums.targetTransmissions || late)) {
    want.push("comms");
  }
  if (state.discoveries.length < nums.targetTransmissions) want.push("lab");
  if (want.length === 0) want.push("oxygen");

  const plan: ActivityId[] = [];
  for (const id of want) {
    if (plan.includes(id)) continue;
    if (analyze(state, [...plan, id]).feasible) plan.push(id);
  }
  if (plan.length > 0) return plan;
  for (const id of ["oxygen", "lab", "greenhouse", "shelter", "comms"] as ActivityId[]) {
    if (analyze(state, [id]).feasible) return [id];
  }
  return [];
}

describe("mission length", () => {
  it("offers 7, 14 and 21 day missions with scaled targets", () => {
    expect(MISSION_LENGTHS).toEqual([7, 14, 21]);
    const week = numbersFor("first-sols", "guided", 7);
    const fortnight = numbersFor("first-sols", "guided", 14);
    const threeWeeks = numbersFor("first-sols", "guided", 21);

    expect(week.shiftCount).toBe(7);
    expect(fortnight.shiftCount).toBe(14);
    expect(threeWeeks.shiftCount).toBe(21);

    expect(week.doseLimit).toBe(8);
    expect(fortnight.doseLimit).toBe(16);
    expect(threeWeeks.doseLimit).toBe(24);

    expect(week.foodNeeded).toBe(3);
    expect(threeWeeks.foodNeeded).toBe(9);
    expect(threeWeeks.targetTransmissions).toBe(9);

    // Longer missions ship more supplies, not just tougher targets.
    expect(threeWeeks.powerCapacity).toBe(week.powerCapacity + 4);
    expect(threeWeeks.oxygenCapacity).toBe(week.oxygenCapacity + 4);
  });

  it("builds each mission with its chosen length", () => {
    const state = game("storm-season", "challenge", 21);
    expect(state.days).toBe(21);
    expect(numbersFor(state.scenarioId, state.mode, state.days).shiftCount).toBe(21);
  });
});

describe("random event schedule", () => {
  it("places the right number of events inside the mission", () => {
    for (const days of MISSION_LENGTHS) {
      const schedule = buildSchedule("storm-season", 0, days);
      const scheduled = Object.keys(schedule).map(Number);
      expect(scheduled.length).toBe(
        Math.max(
          SCENARIOS["storm-season"].mustEvents.length,
          Math.min(eventCountFor(days), days - 1),
        ),
      );
      for (const day of scheduled) {
        expect(day).toBeGreaterThanOrEqual(2);
        expect(day).toBeLessThanOrEqual(days);
        expect(EVENTS[schedule[day]!]).toBeTruthy();
      }
    }
  });

  it("is deterministic for a mission but changes on replay", () => {
    const first = buildSchedule("dust-season", 0, 14);
    const same = buildSchedule("dust-season", 0, 14);
    expect(same).toEqual(first);

    const replays = [1, 2, 3, 4].map((variant) =>
      JSON.stringify(buildSchedule("dust-season", variant, 14)),
    );
    expect(new Set(replays).size).toBeGreaterThan(1);
  });

  it("always includes the events a mission promises", () => {
    for (const days of MISSION_LENGTHS) {
      const schedule = buildSchedule("storm-season", 3, days);
      const ids = Object.values(schedule);
      expect(ids.filter((id) => id === "solar-storm").length).toBeGreaterThanOrEqual(2);

      const conjunction = Object.values(buildSchedule("conjunction", 1, days));
      expect(conjunction).toContain("conjunction");
    }
  });

  it("gives every mission a different weather sequence", () => {
    const seen = new Set<string>();
    for (const scenario of SCENARIO_LIST) {
      seen.add(JSON.stringify(buildSchedule(scenario.id, 0, 14)));
    }
    expect(seen.size).toBe(SCENARIO_LIST.length);
  });
});

describe("every event is a real, sourced NASA record", () => {
  it("has an archive or a measurement behind it, with a source card", () => {
    for (const event of Object.values(EVENTS)) {
      expect(["measured", "archived"]).toContain(event.basis);
      expect(SOURCES[event.sourceId], `${event.id} source`).toBeTruthy();
      expect(event.known.length).toBeGreaterThan(40);
      expect(event.effects.length).toBeGreaterThanOrEqual(2);
      expect(event.teaches.length).toBeGreaterThan(10);
    }
  });

  it("points every real measurement at a source card", () => {
    for (const fact of REAL_FACTS) {
      expect(SOURCES[fact.sourceId], `${fact.id} source`).toBeTruthy();
      expect(fact.value.length).toBeGreaterThan(3);
      expect(fact.note.length).toBeGreaterThan(40);
    }
  });

  it("keeps the modelled numbers tied to those records", () => {
    const storm = EVENTS["solar-storm"];
    expect(storm.kidText).toContain("shelter");
    const relay = EVENTS["relay-pass"];
    expect(relay.effects.join(" ")).toContain("0 power");
  });
});

describe("real events change the simulation as their cards promise", () => {
  it("solar storm: 2 mSv unsheltered, 0.2 mSv sheltered", () => {
    const storm = withState(game("storm-season"), { shift: 2, eventId: "solar-storm" });
    expect(analyze(storm, ["oxygen"]).result.doseAfter).toBeCloseTo(2.64, 2);
    expect(analyze(storm, ["oxygen", "shelter"]).result.doseAfter).toBeCloseTo(0.84, 2);
    expect(analyze(storm, ["shelter", "rover"]).feasible).toBe(false);
  });

  it("radiation dip: background dose is 20% lower", () => {
    const state = withState(game(), { eventId: "forbush-decrease" });
    expect(analyze(state, []).result.doseAfter).toBeCloseTo(0.51, 2);
  });

  it("dust storm: next day brings 2 less power", () => {
    const state = withState(game("dust-season"), { shift: 2, eventId: "dust-storm" });
    const after = playDay(state, []);
    const tomorrow = nextShift(after);
    expect(generationFor(tomorrow)).toBe(
      numbersFor("dust-season", "guided", 7).generation - 2,
    );
  });

  it("dust devil: 2 extra power today", () => {
    const state = withState(game(), { eventId: "dust-devil" });
    expect(analyze(state, []).result.generation).toBe(
      numbersFor("first-sols", "guided", 7).generation + 2,
    );
  });

  it("conjunction: sending is blocked", () => {
    const state = withState(game("conjunction"), {
      shift: 3,
      eventId: "conjunction",
      discoveries: [makeDiscovery("instrument", 1, [])],
    });
    expect(isActivityAvailable(state, "comms").ok).toBe(false);
    expect(analyze(state, ["comms"]).feasible).toBe(false);
  });

  it("relay pass: sending costs no power", () => {
    const state = withState(game(), {
      eventId: "relay-pass",
      discoveries: [makeDiscovery("instrument", 1, [])],
    });
    const analysis = analyze(state, ["comms"]);
    expect(analysis.feasible).toBe(true);
    expect(analysis.result.powerSpent).toBe(0);
    expect(analysis.result.transmittedNow).toBe(1);
  });

  it("cold snap: one less power today", () => {
    const state = withState(game(), { eventId: "cold-snap" });
    expect(analyze(state, []).result.generation).toBe(
      numbersFor("first-sols", "guided", 7).generation - 1,
    );
  });

  it("marsquake: one crew task goes on inspection", () => {
    const state = withState(game(), { eventId: "marsquake" });
    expect(crewTasksFor(state)).toBe(
      numbersFor("first-sols", "guided", 7).crewTasks - 1,
    );
    expect(analyze(state, ["lab", "greenhouse"]).feasible).toBe(false);
  });

  it("first sample: rover costs 1 more power and returns a special find", () => {
    const state = withState(game(), { eventId: "first-sample" });
    const result = analyze(state, ["rover"]).result;
    expect(result.powerSpent).toBe(
      numbersFor("first-sols", "guided", 7).roverPower + 1,
    );
    expect(result.discoveries[0]?.name).toBe("Delta rock sample");
  });

  it("helicopter scout: rover costs 1 less power", () => {
    const state = withState(game(), { eventId: "ingenuity-scout" });
    const result = analyze(state, ["rover"]).result;
    expect(result.powerSpent).toBe(
      numbersFor("first-sols", "guided", 7).roverPower - 1,
    );
  });
});

describe("core rules stay honest", () => {
  it("trades power for air in the oxygen plant", () => {
    const result = playDay(game(), ["oxygen"]).lastResult;
    expect(result?.powerSpent).toBe(2);
    expect(result?.powerAfter).toBe(10);
    expect(result?.oxygenAfter).toBe(10);
  });

  it("blocks overspending power and crew", () => {
    const broke = withState(game(), { power: 0 });
    expect(analyze(broke, ["shield", "lab"]).feasible).toBe(false);
    expect(analyze(game(), ["lab", "rover", "greenhouse"]).feasible).toBe(false);
  });

  it("shows exactly what the day will do", () => {
    const state = withState(game(), { plan: ["oxygen", "lab"] as ActivityId[] });
    const preview = analyze(state, state.plan).result;
    const actual = runShift(state).lastResult;
    expect(preview.powerAfter).toBe(actual?.powerAfter);
    expect(preview.oxygenAfter).toBe(actual?.oxygenAfter);
    expect(preview.doseAfter).toBe(actual?.doseAfter);
    expect(preview.foodAfter).toBe(actual?.foodAfter);
  });

  it("lets the berm cut every later day, and be built only once", () => {
    const after = playDay(game(), ["shield"]);
    expect(after.shielded).toBe(true);
    expect(after.dose).toBeCloseTo(0.64, 2);
    expect(isActivityAvailable(withState(after, { phase: "planning" }), "shield").ok).toBe(
      false,
    );
    expect(analyze(after, ["lab"]).result.doseAfter).toBeCloseTo(0.99, 2);
  });

  it("ends the mission when dose passes the limit", () => {
    const state = withState(game(), { dose: 7.9 });
    const after = playDay(state, []);
    expect(after.outcome).toBe("early-return");
    expect(after.lastResult?.willEndMission).toBe(true);
  });

  it("pauses outdoor work when dose is high", () => {
    const state = withState(game(), { doseRestricted: true });
    expect(isActivityAvailable(state, "rover").ok).toBe(false);
    expect(isActivityAvailable(state, "lab").ok).toBe(true);
    expect(doseStatusFor(6.5, 8)).toBe("needs-plan");
  });

  it("reports the harvest the following day", () => {
    const after = playDay(withState(game(), { food: 2 }), ["greenhouse"]);
    expect(after.lastResult?.foodCompleted).toBe(true);
    const tomorrow = nextShift(after);
    const resolved = analyze(tomorrow, []);
    expect(resolved.result.delayedNotice.length).toBeGreaterThan(0);
    expect(resolved.next.discoveries.some((d) => d.kind === "plant")).toBe(true);
  });

  it("limits the rescue supply to once, and never in challenge mode", () => {
    const once = useRescue(game());
    expect(once.usedRescue).toBe(true);
    expect(useRescue(once)).toBe(once);
    expect(useRescue(game("first-sols", "challenge"))).toEqual(
      game("first-sols", "challenge"),
    );
  });
});

describe("every mission and length can be finished", () => {
  it("a sensible strategy meets all three goals in every setting", () => {
    for (const scenario of SCENARIO_LIST) {
      for (const mode of ["guided", "challenge"] as Mode[]) {
        for (const days of MISSION_LENGTHS) {
          let state = createGame(scenario.id, mode, 0, days);
          let guard = 0;
          while (state.phase !== "scrapbook" && guard < days * 3 + 4) {
            guard += 1;
            if (state.phase === "results") {
              state = nextShift(state);
              continue;
            }
            state = playDay(state, autoPlan(state));
          }
          const label = `${scenario.id} / ${mode} / ${days} days`;
          expect(state.outcome, `${label} should finish`).toBe("complete");
          expect(
            progressGoals(state).every((goal) => goal.met),
            `${label} should meet every goal`,
          ).toBe(true);
        }
      }
    }
  }, 60000);
});
