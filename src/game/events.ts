import type { BuildingId, EventId, SourceId } from "./types";

export type EventKind = "radiation" | "dust" | "comms" | "opportunity" | "supply";

export interface GameEvent {
  id: EventId;
  kind: EventKind;
  title: string;
  /** Short line, ages 7–8. */
  kidText: string;
  /** A little more explanation, ages 9–12. */
  fullText: string;
  known: string;
  affects: string[];
  effects: string[];
  teaches: string;
  /**
   * "measured" - the number comes from a NASA instrument.
   * "archived" - a real, dated NASA record; the size of the game effect is a
   *              simplification and is labelled as one.
   *
   * There are no invented events: every card below is tied to a real record.
   */
  basis: "measured" | "archived";
  sourceId: SourceId;
  building?: BuildingId;
}

export const EVENTS: Record<EventId, GameEvent> = {
  "solar-storm": {
    id: "solar-storm",
    kind: "radiation",
    title: "Solar Storm",
    kidText:
      "The Sun just threw a storm at Mars. The crew can wait inside the buried shelter, but outdoor work stops.",
    fullText:
      "A solar storm is hitting Mars. Radiation from the Sun arrives in hours, so there is no time to ask Earth what to do. The crew can move into the storm shelter, which cuts their dose a lot, but rover trips and antenna work stop while they are inside.",
    known:
      "In May 2024, active region AR13664 fired flares and coronal mass ejections at both Earth and Mars. On 20 May, NASA's RAD on Curiosity measured the biggest radiation event since landing: about 2 mSv, roughly 30 chest X-rays, for an unshielded astronaut on the surface.",
    affects: ["Storm shelter", "Rover garage", "Comms dish", "Dose"],
    effects: [
      "Shelter on: +0.2 mSv instead of +2 mSv",
      "Outdoor and antenna work pause while sheltered",
      "Rover work during a storm costs an extra rest task next day",
    ],
    teaches:
      "A storm can double a whole mission's dose in one day. Shielding it away costs power and a day of work.",
    basis: "measured",
    sourceId: "nasa-rad-may-2024",
    building: "shelter",
  },
  "forbush-decrease": {
    id: "forbush-decrease",
    kind: "radiation",
    title: "Radiation Dip",
    kidText:
      "A cloud from the Sun is shielding Mars. Today's radiation is lower than usual — 20% lower.",
    fullText:
      "A coronal mass ejection is passing over Mars and its magnetic field pushes some cosmic rays away. NASA's RAD saw exactly this in May 2024: the early storms lowered the surface dose rate by up to about 20% before the big event arrived.",
    known:
      "RAD observed Forbush decreases at Mars: CMEs passing the planet temporarily reduce the galactic cosmic ray dose rate. During the May 2024 activity the effect reached about 20%.",
    affects: ["Dose"],
    effects: ["Background dose is 20% lower today", "Nothing else changes"],
    teaches:
      "Space weather is not only bad news. A passing CME can shield the surface as well as storm it.",
    basis: "measured",
    sourceId: "nasa-rad-may-2024",
  },
  "dust-storm": {
    id: "dust-storm",
    kind: "dust",
    title: "Dust Storm",
    kidText:
      "Dust is covering the solar panels. Tomorrow brings less power. This is a made-up size of storm.",
    fullText:
      "Thick dust is in the air and settling on the solar panels, so tomorrow's sunlight brings less power. The size of this storm is a game choice; real Mars dust storms can last for weeks, and one global storm in 2018 ended the Opportunity rover.",
    known:
      "Mars global dust storms are real. The 2018 storm darkened the sky for months and ended Opportunity's mission. The game's 2-unit power loss is a simplified, chosen number.",
    affects: ["Power", "Next day"],
    effects: ["Next day: 2 less power", "Nothing else changes"],
    teaches:
      "Solar power depends on the sky. Dust, not just daylight, decides how much power a base gets.",
    basis: "archived",
    sourceId: "nasa-dust-storm",
    building: "oxygen-plant",
  },
  "dust-devil": {
    id: "dust-devil",
    kind: "supply",
    title: "Dust Devil",
    kidText:
      "A little whirlwind blew the dust off the solar panels. You get 2 extra power today.",
    fullText:
      "A dust devil spun across the solar array and cleaned it. NASA's rovers have seen this happen. Today's power is 2 units higher than usual, and it is a free gift you did not plan for.",
    known:
      "Dust devils really do clean solar panels on Mars; they helped keep Spirit and Opportunity running for years. The size of this bonus is a game choice.",
    affects: ["Power"],
    effects: ["+2 power today", "Nothing else changes"],
    teaches:
      "Mars weather can help as well as hurt. Missions get lucky sometimes.",
    basis: "archived",
    sourceId: "nasa-dust-devil",
    building: "oxygen-plant",
  },
  conjunction: {
    id: "conjunction",
    kind: "comms",
    title: "Solar Conjunction",
    kidText:
      "Mars is behind the Sun. Earth will not send anything today, so the dish cannot send your work home.",
    fullText:
      "Mars is passing behind the Sun. Radio signals can be scrambled by the Sun's noise, so Earth stops sending commands for about two weeks. There is no help line today, and the dish cannot send your discoveries home until the conjunction ends.",
    known:
      "NASA's 2019 conjunction command moratorium ran from 28 August to 7 September. Conjunction happens about every 26 months and forces crews to work without Earth.",
    affects: ["Comms dish", "Earth support"],
    effects: [
      "Sending discoveries home is unavailable today",
      "No rescue supply while Earth is quiet",
    ],
    teaches:
      "Deep-space crews cannot depend on real-time help. Sometimes the plan has to wait for the sky to clear.",
    basis: "archived",
    sourceId: "nasa-conjunction",
    building: "dish",
  },
  "relay-pass": {
    id: "relay-pass",
    kind: "comms",
    title: "Relay Pass",
    kidText:
      "An orbiter is overhead, so sending your work home is free today.",
    fullText:
      "A spacecraft in Mars orbit is passing overhead and will carry your data to Earth. The rover cannot see Earth directly for about 12 hours a day, so nearly everything goes home through an orbiter. Because the relay does the work, sending costs no power today. (The free-power rule is a game simplification.)",
    known:
      "NASA's Mars Relay Network carries surface data through orbiters. NASA notes that rovers lack line-of-sight to Earth for about 12 hours a day because Mars rotates.",
    affects: ["Comms dish", "Power"],
    effects: ["Sending costs 0 power today (still 1 crew task)", "Nothing else changes"],
    teaches:
      "Communication is infrastructure. Orbiters, not just antennas, decide when data can travel.",
    basis: "archived",
    sourceId: "nasa-relay",
    building: "dish",
  },
  "cold-snap": {
    id: "cold-snap",
    kind: "dust",
    title: "Cold Snap",
    kidText:
      "It is a very cold day. The heaters use power, so you get 1 less today.",
    fullText:
      "A cold snap has arrived. MEDA on Perseverance measured daily mean air temperatures at Jezero between about −69 °C and −41 °C across a Mars year, and the coldest days pull more power into heating. Today the outpost has one unit less to spend.",
    known:
      "MEDA measured daily mean air temperatures at Jezero from 204 to 232 K (−69 to −41 °C) across a full Mars year, with seasonal swings of about 22 K.",
    affects: ["Power"],
    effects: ["−1 power today", "Nothing else changes"],
    teaches:
      "Keeping a crew warm is part of the power budget, not a background detail.",
    basis: "measured",
    sourceId: "nasa-meda",
    building: "oxygen-plant",
  },
  marsquake: {
    id: "marsquake",
    kind: "dust",
    title: "Marsquake",
    kidText:
      "The ground shook. The crew must check the outpost, so one crew job is used up.",
    fullText:
      "A marsquake rattled the outpost. Nothing is broken, but the crew spends time checking seals and racks before doing science. InSight recorded more than 1,300 marsquakes, including a magnitude 4.7 event on 4 May 2022 — the largest quake detected on another planet.",
    known:
      "InSight's S1222a event on 4 May 2022 had a moment magnitude of 4.7 and about five times the seismic moment of the next largest event. InSight detected over 1,313 marsquakes before its mission ended in December 2022. The lost crew task is a game value.",
    affects: ["Crew tasks"],
    effects: ["1 crew task is spent on inspection today", "Nothing else changes"],
    teaches:
      "A real base has to spend time on safety checks, and that time comes out of science.",
    basis: "archived",
    sourceId: "nasa-insight-quake",
    building: "lab",
  },
  "first-sample": {
    id: "first-sample",
    kind: "opportunity",
    title: "First Sample",
    kidText:
      "There is a rock worth drilling. A rover trip costs 1 extra power and brings back a special sample.",
    fullText:
      "The team has spotted a rock worth drilling. Perseverance cored its first rock sample at Jezero in September 2021, and samples like it are why the rover landed in this crater. A trip to drill costs one more power than usual and brings back a special find.",
    known:
      "Perseverance collected its first rock core, nicknamed Rochette, in September 2021 at Jezero Crater. The samples are being cached for a future return to Earth. The extra power cost is a game value.",
    affects: ["Rover garage", "Power"],
    effects: [
      "Rover trip costs +1 power today",
      "The trip brings back a special sample",
      "Waiting loses nothing",
    ],
    teaches:
      "The most valuable science can be the most expensive trip. Sampling is a power decision.",
    basis: "archived",
    sourceId: "nasa-first-sample",
    building: "garage",
  },
  "ingenuity-scout": {
    id: "ingenuity-scout",
    kind: "opportunity",
    title: "Helicopter Scout",
    kidText:
      "A small helicopter scouted the route, so the rover trip costs 1 less power today.",
    fullText:
      "A small helicopter has already flown the route and sent back pictures, so the rover does not have to feel its way. Ingenuity made the first powered flight on another planet in April 2021 and went on to fly dozens of times, scouting for Perseverance.",
    known:
      "Ingenuity's first flight was on 19 April 2021, the first powered, controlled flight on another planet. It flew 72 times before being retired in January 2024. The one-unit saving is a game value.",
    affects: ["Rover garage", "Power"],
    effects: ["Rover trip costs 1 less power today", "Nothing else changes"],
    teaches:
      "Scouting first can make the same trip cheaper. Information is part of the budget.",
    basis: "archived",
    sourceId: "nasa-ingenuity",
    building: "garage",
  },
};
