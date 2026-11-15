import type { SourceId } from "./types";

/**
 * Real NASA values used by the game.
 *
 * Every entry here was taken from a published NASA source or a peer-reviewed
 * paper that used NASA data. They are snapshots, not live feeds: the game has
 * no network calls, so nothing in here is presented as "current" space weather.
 * The Science panel prints these exact values next to their sources.
 */
export interface RealFact {
  id: string;
  label: string;
  value: string;
  /** What a child should take away. */
  kidLine: string;
  /** Where the number came from. */
  note: string;
  sourceId: SourceId;
}

export const REAL_FACTS: RealFact[] = [
  {
    id: "gcr-dose",
    label: "Radiation on the Mars surface (galactic cosmic rays)",
    value: "≈ 0.64 mSv per day",
    kidLine:
      "Even on a quiet day, space radiation reaches the ground. On Mars that is about 0.64 mSv a day, measured by NASA's RAD instrument.",
    note:
      "MSL/RAD measured 0.21 mGy/day absorbed dose and 0.64 mSv/day dose equivalent at Gale Crater (Hassler et al. 2014). Later analysis puts the range at roughly 0.25–0.95 mSv/day depending on the solar cycle.",
    sourceId: "nasa-rad-surface",
  },
  {
    id: "storm-dose",
    label: "The May 2024 solar storm seen from Mars",
    value: "≈ 2–3 mSv in one event (about 30 chest X-rays)",
    kidLine:
      "In May 2024 a huge solar storm hit Mars. NASA's RAD measured the biggest dose it had seen since landing — about the same as 30 chest X-rays, all at once.",
    note:
      "Active region AR13664 produced flares and coronal mass ejections through May 2024. RAD's 20 May 2024 event was the largest since landing in 2012, with a dose equivalent of roughly 2 mSv, described by the RAD team as about 30 chest X-rays.",
    sourceId: "nasa-rad-may-2024",
  },
  {
    id: "moxie",
    label: "Making oxygen from Mars air (MOXIE)",
    value: "up to 12 g of oxygen per hour",
    kidLine:
      "A microwave-oven-sized experiment on Perseverance made oxygen out of Mars air — up to 12 grams an hour. That is a start, not enough for a crew.",
    note:
      "MOXIE ran 16 times and made 122 g of oxygen in total, about four hours of breathing for one astronaut. Its best run produced 12 g/hour at 98% purity.",
    sourceId: "nasa-moxie",
  },
  {
    id: "jezero-temp",
    label: "Weather at Jezero Crater (MEDA)",
    value: "about −20 °C by day, mean −69 to −41 °C over a Mars year",
    kidLine:
      "Perseverance's weather station measured about −20 °C when it started, then −25.6 °C half an hour later. A Mars day is cold everywhere.",
    note:
      "MEDA's first Jezero weather report recorded just below −20 °C, falling to −25.6 °C within 30 minutes. A full Mars year of MEDA data gives daily mean air temperatures of 204–232 K (−69 to −41 °C).",
    sourceId: "nasa-meda",
  },
  {
    id: "light-time",
    label: "Radio delay between Earth and Mars",
    value: "about 3 to 22.4 minutes, one way",
    kidLine:
      "A message to Mars takes between 3 and 22 minutes to arrive. You cannot joystick a rover, and you cannot ask Earth for help in a hurry.",
    note:
      "NASA's Mars Relay Network gives the Earth–Mars distance as 54.6 to 400.2 million km, or about 3 to 22.4 minutes of one-way light time.",
    sourceId: "nasa-relay",
  },
  {
    id: "conjunction",
    label: "Solar conjunction: no commands from Earth",
    value: "about two weeks, roughly every 26 months",
    kidLine:
      "When Mars passes behind the Sun, radio noise can corrupt commands, so Earth stops sending them for about two weeks. The crew is on its own.",
    note:
      "NASA's 2019 conjunction command moratorium ran 28 August to 7 September. Conjunction recurs about every 26 months.",
    sourceId: "nasa-conjunction",
  },
  {
    id: "regolith",
    label: "Shielding with dirt",
    value: "a thick layer of regolith cuts the dose",
    kidLine:
      "Piling Mars soil around a shelter is one of the few shielding materials a crew can find on site. Thicker dirt means less radiation.",
    note:
      "NASA and university studies of Martian regolith shielding show large reductions in surface dose for layers of a metre or so. The game uses a simplified 45% reduction and labels it as a game value.",
    sourceId: "nasa-rad-surface",
  },
];

/**
 * Where the game's own numbers come from. Kept separate so nobody can mistake
 * a balancing value for a measurement.
 */
export const GAME_SCALE_NOTES = [
  "Power is counted in 'power units'. A real Mars base would need tens of kilowatts; the unit keeps the arithmetic small enough for a 7-year-old.",
  "Oxygen is counted in 'air units'. One unit is roughly one crew-day of breathing air. The oxygen plant is scaled up from MOXIE, which never ran at crew scale.",
  "Radiation dose uses real units (mSv) and real rates for the daily background. Storm doses are rounded from the May 2024 RAD measurement.",
  "The mission dose limit is a game rule, not a NASA limit. NASA's real limits are set so that added cancer risk stays near 3% over a career.",
];

export const DATA_CAVEAT =
  "These are archived NASA values bundled with the game, not a live feed. Nothing here is a forecast, and none of it is happening right now.";
