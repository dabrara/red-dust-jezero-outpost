import { SCENARIOS } from "./scenarios";
import type { EventId, ScenarioId } from "./types";

/**
 * Event scheduling.
 *
 * Which real NASA events hit the outpost, and on which day, is decided once
 * when a mission starts, from a seeded shuffle. The same mission and replay
 * number always produce the same weather (so a preview can never disagree with
 * the result), but a new replay gets a different sequence.
 */

function hashString(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small deterministic PRNG: same seed, same weather. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How many events a mission of this length gets. */
export function eventCountFor(days: number): number {
  return Math.max(3, Math.min(11, Math.round(days / 2.3)));
}

export function buildSchedule(
  scenarioId: ScenarioId,
  variant: number,
  days: number,
): Partial<Record<number, EventId>> {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["first-sols"];
  const random = mulberry32(hashString(`${scenarioId}:${variant}:${days}`));

  const count = Math.max(
    scenario.mustEvents.length,
    Math.min(eventCountFor(days), days - 1),
  );

  // Days 2..days can host an event; keep two clear days between surprises.
  const candidates = shuffle(
    Array.from({ length: Math.max(0, days - 1) }, (_, index) => index + 2),
    random,
  );
  const chosenDays: number[] = [];
  for (const day of candidates) {
    if (chosenDays.length >= count) break;
    if (chosenDays.every((picked) => Math.abs(picked - day) >= 2)) {
      chosenDays.push(day);
    }
  }
  // Very short missions may not fit the spacing rule; fill in what is left.
  if (chosenDays.length < count) {
    for (const day of candidates) {
      if (chosenDays.length >= count) break;
      if (!chosenDays.includes(day)) chosenDays.push(day);
    }
  }
  chosenDays.sort((a, b) => a - b);

  const deck: EventId[] = [
    ...scenario.mustEvents,
    ...shuffle(scenario.eventPool, random),
  ];

  const schedule: Partial<Record<number, EventId>> = {};
  chosenDays.forEach((day, index) => {
    const event = deck[index % deck.length];
    if (event) schedule[day] = event;
  });
  return schedule;
}

/** Human-readable list of what is coming, for the science panel. */
export function describeSchedule(
  scenarioId: ScenarioId,
  variant: number,
  days: number,
): string[] {
  const schedule = buildSchedule(scenarioId, variant, days);
  return Object.keys(schedule)
    .map(Number)
    .sort((a, b) => a - b)
    .map((day) => `Day ${day}: ${schedule[day]}`);
}
