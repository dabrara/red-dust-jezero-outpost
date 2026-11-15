import { numbersFor } from "./scenarios";
import { earnedBadges } from "./badges";
import { progressGoals, transmittedCount } from "./engine";
import type {
  BadgeDef,
  Discovery,
  GameState,
  GoalStatus,
  ShiftRecord,
} from "./types";

export interface Scrapbook {
  headline: string;
  subline: string;
  goals: GoalStatus[];
  goalsMet: number;
  badges: BadgeDef[];
  discoveries: Discovery[];
  transmitted: Discovery[];
  waiting: Discovery[];
  food: number;
  foodNeeded: number;
  foodComplete: boolean;
  finalPower: number;
  finalOxygen: number;
  finalDose: number;
  doseLimit: number;
  powerCapacity: number;
  oxygenCapacity: number;
  sheltered: boolean;
  highlights: string[];
  reflection: string;
  earlyReturn?: {
    cause: string;
    missedChance: string;
    alternative: string;
  };
  stats: {
    shiftsPlayed: number;
    roverTrips: number;
    labSols: number;
    oxygenRuns: number;
    shelterSols: number;
    transmissions: number;
    exposures: number;
  };
}

export function buildScrapbook(state: GameState): Scrapbook {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const goals = progressGoals(state);
  const goalsMet = goals.filter((g) => g.met).length;
  const transmitted = state.discoveries.filter((d) => d.transmitted);
  const waiting = state.discoveries.filter((d) => !d.transmitted);
  const foodComplete = state.food >= nums.foodNeeded;

  const stats = {
    shiftsPlayed: state.history.length,
    roverTrips: state.history.filter((h) => h.roverRan).length,
    labSols: state.history.filter((h) => h.plan.includes("lab")).length,
    oxygenRuns: state.history.filter((h) => h.oxygenRan).length,
    shelterSols: state.history.filter((h) => h.sheltered).length,
    transmissions: transmittedCount(state),
    exposures: state.exposureCount,
  };

  const doseOver = state.dose > nums.doseLimit;
  const headline =
    state.outcome === "early-return"
      ? "The crew is home safe"
      : goalsMet === goals.length
        ? "Mission complete — the outpost held!"
        : "Mission complete — with more to try";

  const subline =
    state.outcome === "early-return"
      ? doseOver
        ? "Mission Control called an early return because of radiation dose. Nobody was hurt, and your notes came home too."
        : "Mission Control called an early return when the air ran low. Nobody was hurt, and your notes came home too."
      : goalsMet === goals.length
        ? "You kept the air moving, grew food and sent your finds to Earth — with the real dose of a Mars mission on the meter."
        : `You finished all ${state.days} days. Some goals are still waiting for next time — that is useful information, not a failure.`;

  return {
    headline,
    subline,
    goals,
    goalsMet,
    badges: earnedBadges(state),
    discoveries: state.discoveries,
    transmitted,
    waiting,
    food: state.food,
    foodNeeded: nums.foodNeeded,
    foodComplete,
    finalPower: state.power,
    finalOxygen: state.oxygen,
    finalDose: state.dose,
    doseLimit: nums.doseLimit,
    powerCapacity: nums.powerCapacity,
    oxygenCapacity: nums.oxygenCapacity,
    sheltered: state.shielded,
    highlights: buildHighlights(state, foodComplete),
    reflection: buildReflection(state, foodComplete, goalsMet),
    earlyReturn:
      state.outcome === "early-return" ? explainEarlyReturn(state) : undefined,
    stats,
  };
}

/** Three important choices and what they caused, based on what happened. */
function buildHighlights(state: GameState, foodComplete: boolean): string[] {
  const out: string[] = [];
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const stormSols = state.history.filter(
    (h) => h.eventId === "solar-storm",
  );
  const shelteredStorm = stormSols.find((h) => h.sheltered);
  const exposedStorm = stormSols.find((h) => h.exposed);

  if (shelteredStorm) {
    out.push(
      `You sheltered the crew during the storm on day ${shelteredStorm.shift}. Outdoor and antenna work waited, but the storm added only 0.2 mSv instead of about 2 mSv.`,
    );
  } else if (exposedStorm) {
    out.push(
      `The crew worked outside during the storm on day ${exposedStorm.shift}. They took the full dose and lost a crew task to rest the next day.`,
    );
  } else if (state.shielded) {
    out.push(
      "You built the soil berm. It cost a whole day of power and crew time, and every later day gave less dose because of it.",
    );
  }

  if (foodComplete) {
    out.push(
      `You harvested all ${nums.foodNeeded} crops. The lamps cost power on every one of those days.`,
    );
  } else if (state.food > 0) {
    out.push(
      `You harvested ${state.food} of ${nums.foodNeeded} crops. The rest were still growing when the mission ended.`,
    );
  } else {
    out.push(
      "The greenhouse stayed empty. Nothing was destroyed — growing food simply needs a crew task and lamp power.",
    );
  }

  const sent = transmittedCount(state);
  if (sent > 0) {
    out.push(
      `You sent ${sent} ${sent === 1 ? "find" : "finds"} to Earth. Each transmission used a crew task, and during conjunction the dish could not send at all.`,
    );
  } else {
    out.push(
      "No finds were sent to Earth. The shelf is full of work that nobody has seen yet.",
    );
  }

  if (out.length < 3) {
    const trips = state.history.filter((h) => h.roverRan).length;
    out.push(
      trips > 0
        ? `You sent the rover out ${trips} ${trips === 1 ? "time" : "times"}. Each trip cost extra air and a little extra dose.`
        : "You kept the crew inside the whole mission. That is the cheapest way to keep dose low.",
    );
  }

  return out.slice(0, 3);
}

function buildReflection(
  state: GameState,
  foodComplete: boolean,
  goalsMet: number,
): string {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  if (!foodComplete) {
    return "What could you save earlier to make room for one more greenhouse day?";
  }
  if (transmittedCount(state) < nums.targetTransmissions) {
    return "Which day could you have used to send your finds home?";
  }
  if (state.dose > nums.doseLimit * 0.75) {
    return "Which storm would you shelter through next time, now that you know what a storm costs?";
  }
  if (state.oxygen <= 2) {
    return "What could you do two days earlier to keep more air in the tank?";
  }
  if (!state.shielded) {
    return "The soil berm costs a whole day. Would it have paid for itself in the next storm?";
  }
  if (goalsMet < 3) {
    return "Which goal would you like to finish first on your next mission?";
  }
  return "What would you try differently on your next mission?";
}

function explainEarlyReturn(state: GameState) {
  const nums = numbersFor(state.scenarioId, state.mode, state.days);
  const last = state.history[state.history.length - 1] as ShiftRecord | undefined;
  const doseOver = state.dose > nums.doseLimit;

  const cause = last
    ? doseOver
      ? `On day ${last.shift} the crew's dose reached ${last.doseAfter.toFixed(2)} mSv, past the ${nums.doseLimit} mSv limit. That day added ${last.doseAdded.toFixed(2)} mSv.`
      : `On day ${last.shift} the air tank reached empty. That day used ${
          last.oxygenRan
            ? "the oxygen plant but still spent more air than it made"
            : "air without refilling the tank"
        }.`
    : "The mission ended early.";

  const missed = [...state.history]
    .reverse()
    .find((h) => !h.oxygenRan && h.powerAfter >= nums.oxygenPower);

  const missedChance = doseOver
    ? "The soil berm costs 4 power once and lowers every later day. Sheltering through one storm costs a crew task and 1 power."
    : missed
      ? `On day ${missed.shift} you finished with ${missed.powerAfter} power — enough for the oxygen plant.`
      : "There was no spare power on an earlier day, so the oxygen plant was hard to fit in.";

  const alternative = doseOver
    ? "Next time, watch the dose meter the day before a storm: shelter costs one crew task, not the mission."
    : "Next time, run the oxygen plant whenever the tank is at half or below, before adding an extra rover trip or experiment.";

  return { cause, missedChance, alternative };
}
