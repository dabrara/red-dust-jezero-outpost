import { numbersFor } from "./scenarios";
import { transmittedCount } from "./engine";
import type { BadgeDef, GameState } from "./types";

/**
 * Every badge is defined by an explicit, testable rule. Not every badge can be
 * earned in one mission, which is the point: they reward different kinds of
 * understanding.
 */
export const BADGES: BadgeDef[] = [
  {
    id: "careful-planner",
    name: "Careful Planner",
    rule: "Finish the whole mission with at least 3 air and 2 power left, without calling for the rescue supply.",
    when: (state) =>
      state.outcome === "complete" &&
      !state.usedRescue &&
      state.oxygen >= 3 &&
      state.power >= 2,
  },
  {
    id: "curious-explorer",
    name: "Curious Explorer",
    rule: "Collect four different kinds of find: an instrument reading, a rock, a photograph and a harvest report.",
    when: (state) => new Set(state.discoveries.map((d) => d.kind)).size >= 4,
  },
  {
    id: "food-scientist",
    name: "Space Farmer",
    rule: "Harvest every crop the greenhouse can grow and keep the harvest report.",
    when: (state) => {
      const nums = numbersFor(state.scenarioId, state.mode, state.days);
      return (
        state.food >= nums.foodNeeded &&
        state.discoveries.some((d) => d.kind === "plant")
      );
    },
  },
  {
    id: "dose-keeper",
    name: "Dose Keeper",
    rule: "Finish the mission with less than half the dose limit, and shelter through at least one solar storm.",
    when: (state) => {
      const nums = numbersFor(state.scenarioId, state.mode, state.days);
      return (
        state.outcome === "complete" &&
        state.dose <= nums.doseLimit * 0.5 &&
        state.history.some((h) => h.sheltered)
      );
    },
  },
  {
    id: "clear-communicator",
    name: "Clear Communicator",
    rule: "Send at least four finds home, with none left waiting on the shelf.",
    when: (state) => {
      const sent = transmittedCount(state);
      return sent >= 4 && sent === state.discoveries.length;
    },
  },
];

export function earnedBadges(state: GameState): BadgeDef[] {
  return BADGES.filter((badge) => badge.when(state));
}
