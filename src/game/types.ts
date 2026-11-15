/**
 * Shared types for Red Dust: Jezero Outpost.
 *
 * Three meters matter: power, air and radiation dose. Everything else is a
 * goal. Every number the player sees comes from the simulation engine, so the
 * preview and the real shift can never disagree.
 */

export type Mode = "guided" | "challenge";

export type ScenarioId =
  | "first-sols"
  | "storm-season"
  | "dust-season"
  | "conjunction";

export type ReadingLevel = "little" | "mission";

export type ActivityId =
  | "oxygen"
  | "lab"
  | "rover"
  | "greenhouse"
  | "comms"
  | "shelter"
  | "shield";

export type BuildingId =
  | "oxygen-plant"
  | "lab"
  | "greenhouse"
  | "garage"
  | "dish"
  | "shelter"
  | "berm";

export type DiscoveryKind = "instrument" | "plant" | "rock" | "photo";

export type DoseStatus = "clear" | "watch" | "needs-plan";

export type Phase = "planning" | "results" | "scrapbook";

export type Outcome = "complete" | "early-return" | null;

export type DelayKind = "food-report" | "crew-rest" | "dust-loss";

export type StormState = "none" | "alert" | "sheltered";

export type EventId =
  | "solar-storm"
  | "forbush-decrease"
  | "dust-storm"
  | "dust-devil"
  | "conjunction"
  | "relay-pass"
  | "cold-snap"
  | "marsquake"
  | "first-sample"
  | "ingenuity-scout";

export type SourceId =
  | "nasa-rad-surface"
  | "nasa-rad-may-2024"
  | "nasa-moxie"
  | "nasa-meda"
  | "nasa-relay"
  | "nasa-conjunction"
  | "nasa-osdr-plant"
  | "nasa-dust-storm"
  | "nasa-dust-devil"
  | "nasa-insight-quake"
  | "nasa-first-sample"
  | "nasa-ingenuity";

export interface Discovery {
  id: string;
  kind: DiscoveryKind;
  name: string;
  note: string;
  shift: number;
  transmitted: boolean;
}

export interface DelayedEffect {
  id: string;
  kind: DelayKind;
  label: string;
  createdShift: number;
  dueShift: number;
}

export interface GoalStatus {
  id: "transmit" | "food" | "dose";
  label: string;
  met: boolean;
}

export interface Problem {
  severity: "block" | "warn";
  message: string;
  fix: string;
}

export interface BreakdownLine {
  label: string;
  value: string;
  tone: "good" | "bad" | "neutral";
}

export interface ShiftRecord {
  shift: number;
  plan: ActivityId[];
  sheltered: boolean;
  exposed: boolean;
  oxygenRan: boolean;
  roverRan: boolean;
  greenhouseRan: boolean;
  shieldBuilt: boolean;
  foodCompleted: boolean;
  powerSpent: number;
  powerAfter: number;
  oxygenAfter: number;
  doseAfter: number;
  doseAdded: number;
  newDiscoveryNames: string[];
  transmittedNow: number;
  transmittedTotal: number;
  foodAfter: number;
  eventId: EventId | null;
  eventTitle: string;
  willEndMission: boolean;
}

export interface ShiftResult {
  shift: number;
  plan: ActivityId[];
  generation: number;
  powerBefore: number;
  powerPool: number;
  powerSpent: number;
  powerAfter: number;
  crewUsed: number;
  crewAvailable: number;
  oxygenBefore: number;
  oxygenAfter: number;
  oxygenCapacity: number;
  oxygenGain: number;
  roverOxygen: number;
  oxygenUse: number;
  doseBefore: number;
  doseAfter: number;
  doseAdded: number;
  doseLimit: number;
  doseStatus: DoseStatus;
  shielded: boolean;
  shieldBuilt: boolean;
  storm: StormState;
  discoveries: Discovery[];
  transmittedNow: number;
  transmittedTotal: number;
  foodBefore: number;
  foodAfter: number;
  foodNeeded: number;
  foodCompleted: boolean;
  sheltered: boolean;
  exposed: boolean;
  alertActive: boolean;
  delayedCreated: DelayedEffect[];
  delayedResolved: DelayedEffect[];
  delayedNotice: string[];
  eventId: EventId | null;
  eventTitle: string;
  breakdown: BreakdownLine[];
  willEndMission: boolean;
  outcome: Outcome;
  goals: GoalStatus[];
}

export interface GameState {
  version: 1;
  scenarioId: ScenarioId;
  mode: Mode;
  variant: number;
  /** Mission length in days (a Mars day is a day: 24 h 39 min). */
  days: number;
  /** Which real NASA event is scheduled for each day. Fixed at mission start. */
  events: Partial<Record<number, EventId>>;
  shift: number;
  phase: Phase;
  power: number;
  oxygen: number;
  dose: number;
  shielded: boolean;
  plan: ActivityId[];
  food: number;
  discoveries: Discovery[];
  exposureCount: number;
  doseRestricted: boolean;
  delayed: DelayedEffect[];
  history: ShiftRecord[];
  usedRescue: boolean;
  eventId: EventId | null;
  outcome: Outcome;
  lastResult: ShiftResult | null;
}

export interface Settings {
  reading: ReadingLevel;
  reducedMotion: boolean;
  sound: boolean;
  readAloud: boolean;
}

export type BadgeId =
  | "careful-planner"
  | "curious-explorer"
  | "food-scientist"
  | "dose-keeper"
  | "clear-communicator";

export interface BadgeDef {
  id: BadgeId;
  name: string;
  rule: string;
  when: (state: GameState) => boolean;
}
