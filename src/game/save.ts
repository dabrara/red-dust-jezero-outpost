import { SCENARIOS } from "./scenarios";
import type { ActivityId, GameState, Settings } from "./types";
import { ACTIVITY_ORDER } from "./activities";

const GAME_KEY = "reddust.game.v1";
const SETTINGS_KEY = "reddust.settings.v1";

export const DEFAULT_SETTINGS: Settings = {
  reading: "little",
  reducedMotion: false,
  sound: false,
  readAloud: false,
};

function storage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(GAME_KEY, JSON.stringify({ savedAt: Date.now(), state }));
  } catch {
    // A full or blocked storage should never break the game.
  }
}

export function loadGame(): GameState | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: unknown };
    return sanitizeState(parsed.state);
  } catch {
    return null;
  }
}

export function clearGame(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(GAME_KEY);
  } catch {
    // ignore
  }
}

export function saveSettings(settings: Settings): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadSettings(): Settings {
  const store = storage();
  if (!store) return { ...DEFAULT_SETTINGS };
  try {
    const raw = store.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      reading: parsed.reading === "mission" ? "mission" : "little",
      reducedMotion: Boolean(parsed.reducedMotion),
      sound: Boolean(parsed.sound),
      readAloud: Boolean(parsed.readAloud),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** A saved mission may be old or hand-edited, so check it before trusting it. */
function sanitizeState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Partial<GameState>;
  if (s.version !== 1) return null;
  if (!s.scenarioId || !(s.scenarioId in SCENARIOS)) return null;
  if (s.mode !== "guided" && s.mode !== "challenge") return null;
  if (s.phase !== "planning" && s.phase !== "results" && s.phase !== "scrapbook") {
    return null;
  }
  if (typeof s.shift !== "number" || s.shift < 1 || s.shift > 60) return null;
  if (typeof s.power !== "number" || typeof s.oxygen !== "number") return null;
  if (typeof s.dose !== "number" || typeof s.food !== "number") return null;
  if (!Array.isArray(s.plan) || !Array.isArray(s.discoveries)) return null;
  if (!Array.isArray(s.history) || !Array.isArray(s.delayed)) return null;

  const plan = s.plan.filter((id): id is ActivityId =>
    ACTIVITY_ORDER.includes(id as ActivityId),
  );

  return {
    ...(s as GameState),
    plan: Array.from(new Set(plan)),
    discoveries: s.discoveries.filter(
      (d) => d && typeof d.id === "string" && typeof d.name === "string",
    ),
    days:
      typeof s.days === "number" && s.days >= 7 && s.days <= 21
        ? Math.round(s.days)
        : 7,
    events:
      s.events && typeof s.events === "object"
        ? (s.events as GameState["events"])
        : {},
    power: Math.max(0, Math.min(30, s.power)),
    oxygen: Math.max(0, Math.min(30, s.oxygen)),
    dose: Math.max(0, Math.min(100, s.dose)),
    food: Math.max(0, Math.min(10, s.food)),
    shielded: Boolean(s.shielded),
    exposureCount: Math.max(0, Number(s.exposureCount) || 0),
    doseRestricted: Boolean(s.doseRestricted),
    usedRescue: Boolean(s.usedRescue),
    outcome:
      s.outcome === "complete" || s.outcome === "early-return" ? s.outcome : null,
    lastResult: s.lastResult ?? null,
    variant: Number(s.variant) || 0,
    eventId: s.eventId ?? null,
  };
}
