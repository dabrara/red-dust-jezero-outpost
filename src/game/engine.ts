import {
  DOSE_RESTRICT_AT,
  DUST_DEVIL_BONUS,
  DUST_STORM_PENALTY,
} from "./config";
import { ACTIVITIES } from "./activities";
import { EVENTS, type GameEvent } from "./events";
import { numbersFor } from "./scenarios";
import { buildSchedule } from "./schedule";
import type {
  ActivityId,
  BreakdownLine,
  DelayedEffect,
  Discovery,
  DiscoveryKind,
  DoseStatus,
  GameState,
  GoalStatus,
  Mode,
  Problem,
  ScenarioId,
  ShiftRecord,
  ShiftResult,
  StormState,
} from "./types";

export interface Analysis {
  result: ShiftResult;
  problems: Problem[];
  feasible: boolean;
  next: GameState;
}

interface EventMods {
  /** Extra (or, for a scout, reduced) rover power cost. */
  roverPower: number;
  greenhouseBonusFood: number;
  storm: boolean;
  commsBlocked: boolean;
  commsFree: boolean;
  crewPenalty: number;
  generationDelta: number;
  doseScale: number;
  nextShiftGenerationPenalty: number;
  specialRock: boolean;
}

const DISCOVERY_LIBRARY: Record<DiscoveryKind, { name: string; note: string }[]> = {
  instrument: [
    {
      name: "Atmosphere reading",
      note: "Pressure and temperature from the lab bench.",
    },
    {
      name: "Dust sample measurement",
      note: "A careful measurement of a pinch of Mars dust.",
    },
    {
      name: "Radiation badge check",
      note: "How much dose the crew's badges collected this day.",
    },
  ],
  rock: [
    { name: "Layered rock sample", note: "A rock from the old river delta." },
    { name: "Crater-edge rock", note: "A rock from the rim of Jezero." },
    { name: "Shiny rock sample", note: "A rock that sparkles in the rover's lamp." },
  ],
  photo: [
    { name: "Delta photograph", note: "A wide photo of the ancient river delta." },
    { name: "Outpost panorama", note: "A photo of the outpost from the ridge." },
  ],
  plant: [
    {
      name: "Harvest report",
      note: "Dr. Nova's notes on how the plants grew under Mars light.",
    },
  ],
};

function eventMods(event: GameEvent | null): EventMods {
  const mods: EventMods = {
    roverPower: 0,
    greenhouseBonusFood: 0,
    storm: false,
    commsBlocked: false,
    commsFree: false,
    crewPenalty: 0,
    generationDelta: 0,
    doseScale: 1,
    nextShiftGenerationPenalty: 0,
    specialRock: false,
  };
  if (!event) return mods;
  switch (event.id) {
    case "solar-storm":
      mods.storm = true;
      break;
    case "forbush-decrease":
      mods.doseScale = 0.8;
      break;
    case "dust-storm":
      mods.nextShiftGenerationPenalty = DUST_STORM_PENALTY;
      break;
    case "dust-devil":
      mods.generationDelta = DUST_DEVIL_BONUS;
      break;
    case "conjunction":
      mods.commsBlocked = true;
      break;
    case "relay-pass":
      mods.commsFree = true;
      break;
    case "cold-snap":
      mods.generationDelta = -1;
      break;
    case "marsquake":
      mods.crewPenalty = 1;
      break;
    case "first-sample":
      mods.roverPower = 1;
      mods.specialRock = true;
      break;
    case "ingenuity-scout":
      mods.roverPower = -1;
      break;
  }
  return mods;
}

function costFor(
  id: ActivityId,
  mods: EventMods,
  nums: ReturnType<typeof numbersFor>,
): { power: number; crew: number } {
  switch (id) {
    case "oxygen":
      return { power: nums.oxygenPower, crew: ACTIVITIES.oxygen.crew };
    case "lab":
      return { power: nums.labPower, crew: ACTIVITIES.lab.crew };
    case "rover":
      return {
        power: Math.max(0, nums.roverPower + mods.roverPower),
        crew: ACTIVITIES.rover.crew,
      };
    case "greenhouse":
      return { power: nums.greenhousePower, crew: ACTIVITIES.greenhouse.crew };
    case "comms":
      return {
        power: mods.commsFree ? 0 : nums.commsPower,
        crew: ACTIVITIES.comms.crew,
      };
    case "shelter":
      return { power: nums.shelterPower, crew: ACTIVITIES.shelter.crew };
    case "shield":
      return { power: nums.shieldPower, crew: ACTIVITIES.shield.crew };
  }
}

export function makeDiscovery(
  kind: DiscoveryKind,
  shift: number,
  existing: Discovery[],
  transmitted = false,
): Discovery {
  const library = DISCOVERY_LIBRARY[kind];
  const index = existing.filter((d) => d.kind === kind).length;
  const entry = library[index % library.length];
  return {
    id: `${kind}-${shift}-${existing.length}`,
    kind,
    name: entry.name,
    note: entry.note,
    shift,
    transmitted,
  };
}

export function transmittedCount(state: GameState): number {
  return state.discoveries.filter((d) => d.transmitted).length;
}

export function pendingTransmissions(state: GameState): number {
  return state.discoveries.length - transmittedCount(state);
}

/** How worried the dose meter should look. */
export function doseStatusFor(dose: number, limit: number): DoseStatus {
  if (dose > limit * DOSE_RESTRICT_AT) return "needs-plan";
  if (dose > limit * 0.5) return "watch";
  return "clear";
}

export function progressGoals(state: GameState): GoalStatus[] {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  return [
    {
      id: "transmit",
      label: `Send ${nums.targetTransmissions} finds to Earth`,
      met: transmittedCount(state) >= nums.targetTransmissions,
    },
    {
      id: "food",
      label: `Harvest ${nums.foodNeeded} crops`,
      met: state.food >= nums.foodNeeded,
    },
    {
      id: "dose",
      label: `Stay under ${nums.doseLimit} mSv`,
      met: state.dose <= nums.doseLimit,
    },
  ];
}

export function isActivityAvailable(
  state: GameState,
  id: ActivityId,
): { ok: boolean; reason?: string } {
  const meta = ACTIVITIES[id];
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const mods = eventMods(event);

  if (state.phase !== "planning") {
    return { ok: false, reason: "This day is already running." };
  }
  if (id === "shield" && state.shielded) {
    return { ok: false, reason: "The soil berm is already built." };
  }
  if (state.doseRestricted && (meta.outdoor || meta.blockedWhenSheltered)) {
    return {
      ok: false,
      reason: "The crew is restricted to indoor work: dose is too high.",
    };
  }
  if (state.plan.includes("shelter") && meta.blockedWhenSheltered) {
    return { ok: false, reason: "Paused while the crew is in the shelter." };
  }
  if (id === "comms") {
    if (mods.commsBlocked) {
      return {
        ok: false,
        reason: "Earth is behind the Sun: no sending during conjunction.",
      };
    }
    if (pendingTransmissions(state) === 0) {
      return { ok: false, reason: "There is nothing new to send home yet." };
    }
  }
  return { ok: true };
}

/** Power this day, including dust losses and weather bonuses. */
export function generationFor(state: GameState): number {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const dust =
    state.delayed.filter(
      (d) => d.dueShift === state.shift && d.kind === "dust-loss",
    ).length * DUST_STORM_PENALTY;
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const weather = event ? eventMods(event).generationDelta : 0;
  return Math.max(0, nums.generation - dust + weather);
}

/** Crew task cards this day, including any required rest and safety checks. */
export function crewTasksFor(state: GameState): number {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const rest = state.delayed.filter(
    (d) => d.dueShift === state.shift && d.kind === "crew-rest",
  ).length;
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const inspection = event ? eventMods(event).crewPenalty : 0;
  return Math.max(1, nums.crewTasks - rest - inspection);
}

export function planCost(state: GameState, plan: ActivityId[]) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const mods = eventMods(event);
  const unique = Array.from(new Set(plan));
  let power = 0;
  let crew = 0;
  for (const id of unique) {
    const cost = costFor(id, mods, nums);
    power += cost.power;
    crew += cost.crew;
  }
  return { power, crew, mods };
}

/**
 * The single source of truth. Preview and resolution both call this, so what
 * the player sees in the plan preview is exactly what the day does.
 */
export function analyze(state: GameState, plan: ActivityId[]): Analysis {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const event = state.eventId ? EVENTS[state.eventId] : null;
  const mods = eventMods(event);
  const unique = Array.from(new Set(plan));
  const problems: Problem[] = [];

  const dueEffects = state.delayed.filter((d) => d.dueShift === state.shift);
  const generation = generationFor(state);
  const crewAvailable = crewTasksFor(state);
  const pool = Math.min(nums.powerCapacity, state.power + generation);
  const sheltered = unique.includes("shelter");
  const alertActive = mods.storm;

  for (const id of unique) {
    const meta = ACTIVITIES[id];
    if (id === "shield" && state.shielded) {
      problems.push({
        severity: "block",
        message: "The soil berm is already built.",
        fix: "Save that power for the oxygen plant or the greenhouse instead.",
      });
    } else if (state.doseRestricted && (meta.outdoor || meta.blockedWhenSheltered)) {
      problems.push({
        severity: "block",
        message: `${meta.short} is paused: the crew is on indoor work only.`,
        fix: "Dose is already high, so Mission Control stopped outdoor work. Choose indoor jobs.",
      });
    } else if (sheltered && meta.blockedWhenSheltered) {
      problems.push({
        severity: "block",
        message: `${meta.short} is paused while the crew is in the shelter.`,
        fix: "Turn off the shelter if you would rather do that job, or keep the crew safe and wait.",
      });
    }
    if (id === "comms" && mods.commsBlocked) {
      problems.push({
        severity: "block",
        message: "Earth is behind the Sun: nothing can be sent during conjunction.",
        fix: "Send your finds on a day when the sky is clear, or use this day for another job.",
      });
    }
  }

  let powerSpent = 0;
  let crewUsed = 0;
  for (const id of unique) {
    const cost = costFor(id, mods, nums);
    powerSpent += cost.power;
    crewUsed += cost.crew;
  }

  if (powerSpent > pool) {
    problems.push({
      severity: "block",
      message: `Your plan uses ${powerSpent} power, but only ${pool} is available.`,
      fix: "Remove a job, or choose a smaller plan for this day.",
    });
  }
  if (crewUsed > crewAvailable) {
    problems.push({
      severity: "block",
      message: `Your plan needs ${crewUsed} crew tasks, but the crew has ${crewAvailable}.`,
      fix: "Take one job out of the plan. Two big jobs are plenty for one day.",
    });
  }
  if (unique.includes("comms") && !mods.commsBlocked && pendingTransmissions(state) === 0) {
    problems.push({
      severity: "block",
      message: "There is nothing new to send home yet.",
      fix: "Collect a discovery first, or use this day for another job.",
    });
  }

  // ----- Air ------------------------------------------------------------
  const oxygenGain = unique.includes("oxygen") ? nums.oxygenGain : 0;
  const roverOxygen = unique.includes("rover") ? nums.roverOxygen : 0;
  const oxygenAfterTopUp = Math.min(nums.oxygenCapacity, state.oxygen + oxygenGain);
  const oxygenAfter = oxygenAfterTopUp - roverOxygen - nums.oxygenUse;
  const airEmpty = oxygenAfter <= 0;

  if (airEmpty) {
    problems.push({
      severity: "warn",
      message: "This plan uses the last of the air.",
      fix:
        "Running the oxygen plant, or dropping the rover trip, keeps air in the tank. If you run this plan, Mission Control brings the crew home safely.",
    });
  } else if (oxygenAfter <= 2) {
    problems.push({
      severity: "warn",
      message: "The air tank will be very low after this day.",
      fix: "The oxygen plant costs power, but it is the only thing that refills the tank.",
    });
  }

  // ----- Radiation ------------------------------------------------------
  const shieldFactor = state.shielded ? nums.shieldFactor : 1;
  let doseAdded = nums.baseDose * shieldFactor * mods.doseScale;
  if (unique.includes("rover")) doseAdded += nums.roverDose;
  let storm: StormState = "none";
  if (mods.storm) {
    storm = sheltered ? "sheltered" : "alert";
    doseAdded += sheltered
      ? nums.stormShelterDose
      : nums.stormDose * shieldFactor;
  }
  const doseAfter = Math.round((state.dose + doseAdded) * 100) / 100;
  const overDose = doseAfter > nums.doseLimit;
  const willEndMission = airEmpty || overDose;

  if (overDose) {
    problems.push({
      severity: "warn",
      message: `This plan takes the crew to ${doseAfter.toFixed(1)} mSv, past the ${nums.doseLimit} mSv mission limit.`,
      fix:
        "Sheltering costs a crew task, and the soil berm lowers every day's dose. If you run this plan, Mission Control brings the crew home early.",
    });
  } else if (doseAfter > nums.doseLimit * DOSE_RESTRICT_AT) {
    problems.push({
      severity: "warn",
      message: "Dose is getting high. Outdoor work will be paused soon.",
      fix: "Shelter during storms, or build the soil berm before the next storm.",
    });
  }

  const exposed =
    mods.storm && !sheltered && unique.some((id) => ACTIVITIES[id].outdoor);
  if (mods.storm && !sheltered && !exposed) {
    problems.push({
      severity: "warn",
      message: "There is a solar storm and the crew is not in the shelter.",
      fix: "The habitat shields some. The buried shelter is much better, and it uses one crew task.",
    });
  }
  if (exposed) {
    problems.push({
      severity: "warn",
      message: "The crew would work outside during the storm.",
      fix: "Use the shelter this day if you would rather protect them. The rover trip can wait.",
    });
  }

  // ----- Apply the plan -------------------------------------------------
  let power = pool - Math.min(powerSpent, pool);
  let oxygen = oxygenAfterTopUp - roverOxygen;
  let food = state.food;
  let discoveries = state.discoveries.map((d) => ({ ...d }));
  const newDiscoveries: Discovery[] = [];
  let transmittedNow = 0;
  let foodCompleted = false;
  const foodBefore = state.food;

  if (unique.includes("lab")) {
    const d = makeDiscovery("instrument", state.shift, discoveries);
    discoveries.push(d);
    newDiscoveries.push(d);
  }
  if (unique.includes("rover")) {
    const rocks = discoveries.filter((d) => d.kind === "rock").length;
    const photos = discoveries.filter((d) => d.kind === "photo").length;
    const kind: DiscoveryKind = mods.specialRock
      ? "rock"
      : rocks <= photos
        ? "rock"
        : "photo";
    const d = makeDiscovery(kind, state.shift, discoveries);
    if (mods.specialRock) {
      d.name = "Delta rock sample";
      d.note = "Commander Pip's prize find from the layered delta.";
    }
    discoveries.push(d);
    newDiscoveries.push(d);
  }
  if (unique.includes("greenhouse")) {
    food = Math.min(nums.foodNeeded, food + 1 + mods.greenhouseBonusFood);
  }
  if (unique.includes("comms") && !mods.commsBlocked) {
    transmittedNow = pendingTransmissions(state);
    discoveries = discoveries.map((d) => (d.transmitted ? d : { ...d, transmitted: true }));
  }

  oxygen = Math.min(nums.oxygenCapacity, Math.max(0, oxygen - nums.oxygenUse));

  const delayedCreated: DelayedEffect[] = [];
  const delayedResolved: DelayedEffect[] = [];
  const delayedNotice: string[] = [];

  if (food >= nums.foodNeeded && foodBefore < nums.foodNeeded) {
    foodCompleted = true;
    delayedCreated.push({
      id: `harvest-${state.shift}`,
      kind: "food-report",
      label: "Harvest report is growing — ready next day",
      createdShift: state.shift,
      dueShift: state.shift + 1,
    });
  }
  if (mods.nextShiftGenerationPenalty > 0) {
    delayedCreated.push({
      id: `dust-${state.shift}`,
      kind: "dust-loss",
      label: `Dust on the panels: next day brings ${mods.nextShiftGenerationPenalty} less power`,
      createdShift: state.shift,
      dueShift: state.shift + 1,
    });
  }
  if (exposed) {
    delayedCreated.push({
      id: `rest-${state.shift}`,
      kind: "crew-rest",
      label: "Crew needs a rest day: 1 crew task next day",
      createdShift: state.shift,
      dueShift: state.shift + 1,
    });
  }

  for (const effect of dueEffects) {
    delayedResolved.push(effect);
    if (effect.kind === "food-report") {
      if (!discoveries.some((d) => d.kind === "plant")) {
        const d = makeDiscovery("plant", state.shift, discoveries);
        discoveries.push(d);
        newDiscoveries.push(d);
      }
      delayedNotice.push("The harvest report finished and landed on the shelf.");
    }
    if (effect.kind === "crew-rest") {
      delayedNotice.push("One crew task went on rest this day.");
    }
    if (effect.kind === "dust-loss") {
      delayedNotice.push("Dust on the panels: today's power is lower.");
    }
  }

  const exposureCount =
    state.exposureCount + (exposed ? 1 : 0);
  const doseRestricted =
    state.doseRestricted || doseAfter > nums.doseLimit * DOSE_RESTRICT_AT;

  const outcome = willEndMission
    ? "early-return"
    : state.shift >= nums.shiftCount
      ? "complete"
      : null;

  // ----- Human-readable numbers ----------------------------------------
  const breakdown: BreakdownLine[] = [
    { label: "Solar power", value: `+${generation} power`, tone: "good" },
    {
      label: "Power used by jobs",
      value: `−${powerSpent} power`,
      tone: powerSpent > 0 ? "bad" : "neutral",
    },
  ];
  if (oxygenGain > 0) {
    breakdown.push({ label: "Oxygen plant", value: `+${oxygenGain} air`, tone: "good" });
  }
  breakdown.push({
    label: "Crew breathing",
    value: `−${nums.oxygenUse} air`,
    tone: "bad",
  });
  if (roverOxygen > 0) {
    breakdown.push({ label: "Rover trip", value: `−${roverOxygen} air`, tone: "bad" });
  }
  breakdown.push({
    label: "Background radiation",
    value: `+${(nums.baseDose * shieldFactor).toFixed(2)} mSv`,
    tone: "bad",
  });
  if (unique.includes("rover")) {
    breakdown.push({ label: "Rover trip dose", value: `+${nums.roverDose} mSv`, tone: "bad" });
  }
  if (mods.storm) {
    breakdown.push({
      label: sheltered ? "Storm, sheltered" : "Solar storm",
      value: `+${(sheltered ? nums.stormShelterDose : nums.stormDose * shieldFactor).toFixed(2)} mSv`,
      tone: "bad",
    });
  }
  breakdown.push({
    label: "Total dose",
    value: `${doseAfter.toFixed(2)} / ${nums.doseLimit} mSv`,
    tone: overDose ? "bad" : "good",
  });

  const record: ShiftRecord = {
    shift: state.shift,
    plan: unique,
    sheltered,
    exposed,
    oxygenRan: unique.includes("oxygen"),
    roverRan: unique.includes("rover"),
    greenhouseRan: unique.includes("greenhouse"),
    shieldBuilt: unique.includes("shield"),
    foodCompleted,
    powerSpent,
    powerAfter: power,
    oxygenAfter: oxygen,
    doseAfter,
    doseAdded: Math.round(doseAdded * 100) / 100,
    newDiscoveryNames: newDiscoveries.map((d) => d.name),
    transmittedNow,
    transmittedTotal: discoveries.filter((d) => d.transmitted).length,
    foodAfter: food,
    eventId: state.eventId,
    eventTitle: event?.title ?? "",
    willEndMission,
  };

  const keptDelayed = [
    ...state.delayed.filter((d) => d.dueShift !== state.shift && d.dueShift > state.shift),
    ...delayedCreated,
  ];

  const shieldBuilt = state.shielded || unique.includes("shield");
  const baseNext: GameState = {
    ...state,
    power,
    oxygen,
    dose: doseAfter,
    shielded: shieldBuilt,
    food,
    discoveries,
    exposureCount,
    doseRestricted,
    delayed: keptDelayed,
    history: [...state.history, record],
    plan: unique,
  };

  let next: GameState = {
    ...baseNext,
    lastResult: null,
    phase: "results",
    outcome,
  };

  if (outcome) next = finalizeMission(next);

  const result: ShiftResult = {
    shift: state.shift,
    plan: unique,
    generation,
    powerBefore: state.power,
    powerPool: pool,
    powerSpent,
    powerAfter: power,
    crewUsed,
    crewAvailable,
    oxygenBefore: state.oxygen,
    oxygenAfter: oxygen,
    oxygenCapacity: nums.oxygenCapacity,
    oxygenGain,
    roverOxygen,
    oxygenUse: nums.oxygenUse,
    doseBefore: state.dose,
    doseAfter,
    doseAdded: Math.round(doseAdded * 100) / 100,
    doseLimit: nums.doseLimit,
    doseStatus: doseStatusFor(doseAfter, nums.doseLimit),
    shielded: shieldFactor < 1,
    shieldBuilt,
    storm,
    discoveries: newDiscoveries,
    transmittedNow,
    transmittedTotal: discoveries.filter((d) => d.transmitted).length,
    foodBefore,
    foodAfter: food,
    foodNeeded: nums.foodNeeded,
    foodCompleted,
    sheltered,
    exposed,
    alertActive,
    delayedCreated,
    delayedResolved,
    delayedNotice,
    eventId: state.eventId,
    eventTitle: event?.title ?? "",
    breakdown,
    willEndMission,
    outcome,
    goals: progressGoals(next),
  };

  next = { ...next, lastResult: result };

  return {
    result,
    problems,
    feasible: !problems.some((p) => p.severity === "block"),
    next,
  };
}

/** A finished mission gets any harvest report that was still growing. */
function finalizeMission(state: GameState): GameState {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  if (state.food < nums.foodNeeded) return state;
  if (state.discoveries.some((d) => d.kind === "plant")) return state;
  const d = makeDiscovery("plant", state.shift, state.discoveries);
  return { ...state, discoveries: [...state.discoveries, d] };
}

export function forecast(state: GameState): Analysis {
  return analyze(state, state.plan);
}

export function runShift(state: GameState): GameState {
  if (state.phase !== "planning") return state;
  const analysis = analyze(state, state.plan);
  if (!analysis.feasible) return state;
  return analysis.next;
}

export function nextShift(state: GameState): GameState {
  if (state.phase !== "results") return state;
  if (state.outcome) {
    return { ...state, phase: "scrapbook" };
  }
  const shift = state.shift + 1;
  return {
    ...state,
    shift,
    phase: "planning",
    plan: [],
    lastResult: null,
    eventId: state.events[shift] ?? null,
  };
}

export function useRescue(state: GameState): GameState {
  if (state.phase !== "planning" || state.mode === "challenge" || state.usedRescue) {
    return state;
  }
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  return {
    ...state,
    power: Math.min(nums.powerCapacity, state.power + nums.rescuePower),
    oxygen: Math.min(nums.oxygenCapacity, state.oxygen + nums.rescueOxygen),
    usedRescue: true,
  };
}

export function toggleActivity(state: GameState, id: ActivityId): GameState {
  if (state.phase !== "planning") return state;
  if (state.plan.includes(id)) {
    return { ...state, plan: state.plan.filter((x) => x !== id) };
  }
  if (!isActivityAvailable(state, id).ok) return state;
  let plan = [...state.plan, id];
  if (id === "shelter") {
    plan = plan.filter((x) => !ACTIVITIES[x].blockedWhenSheltered);
  }
  return { ...state, plan };
}

export function clearPlan(state: GameState): GameState {
  if (state.phase !== "planning") return state;
  return { ...state, plan: [] };
}

export function createGame(
  scenarioId: ScenarioId,
  mode: Mode,
  variant = 0,
  days = 7,
): GameState {
  const nums = numbersFor(scenarioId, mode, days);
  const events = buildSchedule(scenarioId, variant, days);
  return {
    version: 1,
    scenarioId,
    mode,
    variant,
    days,
    events,
    shift: 1,
    phase: "planning",
    power: nums.startPower,
    oxygen: nums.startOxygen,
    dose: 0,
    shielded: false,
    plan: [],
    food: 0,
    discoveries: [],
    exposureCount: 0,
    doseRestricted: false,
    delayed: [],
    history: [],
    usedRescue: false,
    eventId: events[1] ?? null,
    outcome: null,
    lastResult: null,
  };
}

export function currentEvent(state: GameState): GameEvent | null {
  return state.eventId ? (EVENTS[state.eventId] ?? null) : null;
}
