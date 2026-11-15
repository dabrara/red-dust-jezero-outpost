import { BASE_NUMBERS, type Numbers } from "./config";
import type { EventId, Mode, ScenarioId } from "./types";

export interface Scenario {
  id: ScenarioId;
  name: string;
  tagline: string;
  blurb: string;
  focus: string;
  numbers: { guided: Partial<Numbers>; challenge: Partial<Numbers> };
  /** Real events this mission always includes (a mission can repeat one). */
  mustEvents: EventId[];
  /** The rest of the deck: real events drawn at random, never repeated twice in a run. */
  eventPool: EventId[];
  notes: string;
}

export const MISSION_LENGTHS = [7, 14, 21] as const;
export type MissionLength = (typeof MISSION_LENGTHS)[number];

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  "first-sols": {
    id: "first-sols",
    name: "First Days",
    tagline: "A gentle first mission",
    blurb:
      "Room to breathe and one storm to survive. The best place to learn how power, air and dose fit together.",
    focus: "Learning the outpost",
    numbers: {
      guided: { startPower: 9, startOxygen: 9, generation: 4 },
      challenge: {
        startPower: 6,
        startOxygen: 7,
        generation: 3,
        powerCapacity: 10,
        oxygenCapacity: 10,
      },
    },
    mustEvents: ["solar-storm"],
    eventPool: [
      "dust-devil",
      "relay-pass",
      "cold-snap",
      "forbush-decrease",
      "first-sample",
      "ingenuity-scout",
      "marsquake",
    ],
    notes:
      "The tutorial mission. One storm always arrives; the rest of the weather is drawn at random.",
  },
  "storm-season": {
    id: "storm-season",
    name: "Storm Season",
    tagline: "The Sun is not finished yet",
    blurb:
      "Two solar storms on the way. Shelter each one and lose the work, or take the dose and keep working.",
    focus: "Radiation trade-offs",
    numbers: {
      guided: { startPower: 9, startOxygen: 9, generation: 4, doseLimit: 8 },
      challenge: {
        startPower: 6,
        startOxygen: 7,
        generation: 3,
        powerCapacity: 10,
        oxygenCapacity: 10,
        doseLimit: 7,
      },
    },
    mustEvents: ["solar-storm", "solar-storm"],
    eventPool: [
      "conjunction",
      "forbush-decrease",
      "cold-snap",
      "dust-devil",
      "relay-pass",
      "marsquake",
    ],
    notes:
      "Two storms always arrive. On a 7-day mission that is 4 mSv against an 8 mSv limit, so one shelter day or the berm is needed.",
  },
  "dust-season": {
    id: "dust-season",
    name: "Dust Season",
    tagline: "When the sky goes brown",
    blurb:
      "Dust cuts your solar power. Every job competes for the same shrinking battery.",
    focus: "Power budgeting",
    numbers: {
      guided: { startPower: 8, startOxygen: 9, generation: 4, doseLimit: 10 },
      challenge: {
        startPower: 5,
        startOxygen: 7,
        generation: 3,
        powerCapacity: 10,
        oxygenCapacity: 10,
        doseLimit: 10,
      },
    },
    mustEvents: ["dust-storm", "dust-storm"],
    eventPool: [
      "dust-devil",
      "cold-snap",
      "relay-pass",
      "marsquake",
      "ingenuity-scout",
      "forbush-decrease",
    ],
    notes:
      "Two dust storms always arrive and each costs 2 power the following day. Dust devils and relay passes give some back.",
  },
  conjunction: {
    id: "conjunction",
    name: "Conjunction",
    tagline: "Two weeks with no help line",
    blurb:
      "Earth is behind the Sun. No sending, no rescue supply, no advice. The crew is on its own.",
    focus: "Autonomy and planning ahead",
    numbers: {
      guided: { startPower: 9, startOxygen: 9, generation: 4, doseLimit: 9 },
      challenge: {
        startPower: 6,
        startOxygen: 7,
        generation: 3,
        powerCapacity: 10,
        oxygenCapacity: 10,
        doseLimit: 9,
      },
    },
    mustEvents: ["conjunction", "solar-storm"],
    eventPool: [
      "relay-pass",
      "forbush-decrease",
      "dust-devil",
      "first-sample",
      "cold-snap",
      "marsquake",
    ],
    notes:
      "Sending is blocked during conjunction. A commander who leaves transmission to the last days cannot finish the goal.",
  },
};

export const SCENARIO_LIST: Scenario[] = [
  SCENARIOS["first-sols"],
  SCENARIOS["storm-season"],
  SCENARIOS["dust-season"],
  SCENARIOS.conjunction,
];

/**
 * Build the numbers for a scenario, guidance setting and mission length.
 *
 * The dose limit, food target and transmission target scale with the mission
 * length, because 21 days of background radiation cannot fit inside a 7-day
 * limit. Everything else is unchanged, which is what makes long missions
 * harder: the same solar budget has to last three times as long.
 */
export function numbersFor(
  scenarioId: ScenarioId,
  mode: Mode,
  days = 7,
): Numbers {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["first-sols"];
  const base = { ...BASE_NUMBERS, ...scenario.numbers[mode] };
  const scale = days / 7;
  // A longer mission ships more supplies: two extra units of storage per week.
  const extra = Math.round((days - 7) / 7) * 2;
  return {
    ...base,
    shiftCount: days,
    powerCapacity: base.powerCapacity + extra,
    oxygenCapacity: base.oxygenCapacity + extra,
    startPower: base.startPower + extra,
    startOxygen: base.startOxygen + extra,
    doseLimit: Math.round(base.doseLimit * scale * 10) / 10,
    foodNeeded: Math.max(3, Math.round(base.foodNeeded * scale)),
    targetTransmissions: Math.max(3, Math.round(base.targetTransmissions * scale)),
  };
}

export function missionLengthLabel(days: number): string {
  if (days <= 7) return "1 week";
  if (days <= 14) return "2 weeks";
  return "3 weeks";
}
