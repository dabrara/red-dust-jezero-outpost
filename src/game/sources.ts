import type { SourceId } from "./types";

/**
 * Source cards. Only sources that were actually read are listed, and each one
 * says what the game does NOT do with it.
 *
 * All sources retrieved 15 November 2026.
 */
export interface SourceCard {
  id: SourceId;
  organisation: string;
  title: string;
  url: string;
  date: string;
  retrieved: string;
  status: "archived" | "measurement" | "research-finding" | "reference";
  kidLine: string;
  usedFor: string[];
  notModelled: string[];
  adultNote: string;
}

const RETRIEVED = "15 November 2026";

export const SOURCES: Record<SourceId, SourceCard> = {
  "nasa-rad-surface": {
    id: "nasa-rad-surface",
    organisation: "NASA MSL/RAD team (Hassler et al., Science; Guo et al., A&A Review)",
    title: "Radiation environment on the surface of Mars: MSL/RAD dose measurements",
    url: "https://link.springer.com/article/10.1007/s00159-021-00136-5",
    date: "2021 review of measurements from 2012 onward",
    retrieved: RETRIEVED,
    status: "measurement",
    kidLine:
      "NASA's RAD instrument measured the radiation on the Mars surface: about 0.64 mSv every day from cosmic rays.",
    usedFor: [
      "The daily background dose in every day (0.64 mSv).",
      "The 'radiation is always there, not just in storms' lesson on the dose meter.",
      "The 45% reduction used for the soil berm is a game simplification of regolith shielding studies.",
    ],
    notModelled: [
      "The game does not model the full particle spectrum, secondary neutrons or body self-shielding.",
      "It does not calculate cancer risk. The dose meter is not a medical forecast.",
    ],
    adultNote:
      "MSL/RAD measured 0.21 ± 0.04 mGy/day absorbed dose and 0.64 ± 0.12 mSv/day dose equivalent at Gale Crater. Later work gives a solar-cycle range of roughly 0.25–0.95 mSv/day. The game pins the daily value at 0.64 mSv so children see a stable number.",
  },
  "nasa-rad-may-2024": {
    id: "nasa-rad-may-2024",
    organisation: "NASA MSL/RAD team (Hassler, lunar and planetary science presentations)",
    title: "The May 2024 solar storm measured on the Mars surface",
    url: "https://wrmiss.org/workshops/twentyseventh/Hassler.pdf",
    date: "Active region AR13664, 8–20 May 2024; RAD results presented 2024",
    retrieved: RETRIEVED,
    status: "measurement",
    kidLine:
      "In May 2024 a big solar storm hit Mars. RAD measured about 2 mSv in one event, like 30 chest X-rays at once.",
    usedFor: [
      "The 'Solar Storm' event: 2 mSv unshielded, 0.2 mSv in the storm shelter.",
      "The explanation that storms arrive in hours, so Earth cannot advise in time.",
    ],
    notModelled: [
      "The game's storm is not dated inside the fiction: it is an archived event, not current space weather.",
      "Shielding values for the habitat and shelter are game choices, not RAD measurements.",
    ],
    adultNote:
      "AR13664 produced flares and CMEs through May 2024, hitting both Earth and Mars. RAD's 20 May 2024 event was the largest since landing, with a peak dose rate near 8,100 µGy/day and a dose equivalent around 2 mSv, described by the team as roughly 30 chest X-rays. The game rounds this to 2 mSv.",
  },
  "nasa-moxie": {
    id: "nasa-moxie",
    organisation: "NASA / MIT Haystack Observatory",
    title: "MOXIE completes its Mars mission",
    url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/",
    date: "Released 6 September 2023",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "MOXIE made oxygen out of Mars air: up to 12 grams an hour, 122 grams in total. That is a start, not a crew-sized supply.",
    usedFor: [
      "The oxygen plant job and the 'making air costs power' trade-off.",
      "The Science panel fact about oxygen production.",
    ],
    notModelled: [
      "The game's oxygen plant is much larger than MOXIE, which was a small technology demonstration.",
      "Air units are game units, not kilograms of oxygen.",
    ],
    adultNote:
      "MOXIE produced 122 g of oxygen over 16 runs, about four hours of breathing for one astronaut, with a best rate of 12 g/hour at 98% purity. The game scales this up and says so.",
  },
  "nasa-meda": {
    id: "nasa-meda",
    organisation: "NASA JPL / MEDA team (Munguira et al., JGR Planets)",
    title: "Weather at Jezero Crater from MEDA on Perseverance",
    url: "https://www.jpl.nasa.gov/news/nasas-first-weather-report-from-jezero-crater-on-mars/",
    date: "First report 6 April 2021; one-Mars-year analysis 2024",
    retrieved: RETRIEVED,
    status: "measurement",
    kidLine:
      "Perseverance's weather station measured about −20 °C, dropping to −25.6 °C half an hour later. Mars is cold and dusty.",
    usedFor: [
      "The Jezero Crater setting and the cold, dusty feel of the illustrations.",
      "The dust storm event: dust on the panels means less solar power.",
    ],
    notModelled: [
      "Temperature is not a gameplay resource; the crew is assumed to be inside a heated habitat.",
      "The game does not forecast weather. Dust events are authored, not live.",
    ],
    adultNote:
      "MEDA's first Jezero weather report recorded just below −20 °C, falling to −25.6 °C within 30 minutes. A full Mars year of MEDA data gives daily mean air temperatures of 204–232 K (−69 to −41 °C). Dust storm size in the game (2 power) is a balancing choice.",
  },
  "nasa-relay": {
    id: "nasa-relay",
    organisation: "NASA Science — Mars Relay Network",
    title: "Mars Relay Network: distance and light time",
    url: "https://science.nasa.gov/mars/mars-relay-network",
    date: "Updated 17 February 2025",
    retrieved: RETRIEVED,
    status: "reference",
    kidLine:
      "Earth and Mars are 54.6 to 400.2 million km apart, so a radio message takes about 3 to 22.4 minutes one way.",
    usedFor: [
      "The 'reply takes minutes' line on the comms card and in results.",
      "The pacing rule that the crew cannot ask Earth mid-day.",
    ],
    notModelled: [
      "The game does not simulate data rates, orbiters or antenna passes.",
      "Sending is one crew task and a small power cost, and the delay is quoted, not played out in real time.",
    ],
    adultNote:
      "Distances and light times are NASA's published range. The game quotes the range rather than computing today's geometry, because it has no ephemeris.",
  },
  "nasa-conjunction": {
    id: "nasa-conjunction",
    organisation: "NASA — Mars solar conjunction",
    title: "What's Mars solar conjunction, and why does it matter?",
    url: "https://www.nasa.gov/solar-system/whats-mars-solar-conjunction-and-why-does-it-matter/",
    date: "Published 23 August 2019 (2019 moratorium: 28 August – 7 September)",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "When Mars passes behind the Sun, Earth stops sending commands for about two weeks, roughly every 26 months.",
    usedFor: [
      "The 'Solar Conjunction' event: sending is blocked and Earth cannot help that day.",
      "The autonomy lesson: crews must plan ahead because nobody is on the line.",
    ],
    notModelled: [
      "The game blocks one day rather than two weeks; that is a deliberate compression.",
      "No command corruption model is implemented.",
    ],
    adultNote:
      "NASA's 2019 command moratorium ran 28 August to 7 September, with missions still collecting science but not receiving commands. Conjunction recurs about every 26 months. The game compresses the moratorium into one blocked day.",
  },
  "nasa-dust-storm": {
    id: "nasa-dust-storm",
    organisation: "NASA",
    title: "Opportunity's mission ends after a planet-wide dust storm",
    url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    date: "Global dust storm June 2018; mission declared over 13 February 2019",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "In 2018 a dust storm covered the whole planet and blocked so much sunlight that Opportunity could not recharge.",
    usedFor: [
      "The dust storm event and its next-day power loss.",
      "The lesson that solar power depends on how clear the sky is.",
    ],
    notModelled: [
      "The game's 2-unit loss is a chosen number, not a measurement of that storm.",
      "Storms last one day in the game; real global storms can last weeks.",
    ],
    adultNote:
      "The 2018 global dust storm darkened the Martian sky for months and ended Opportunity's mission when its solar-powered batteries could no longer be recharged. The game compresses the event and scales the power loss for play.",
  },
  "nasa-dust-devil": {
    id: "nasa-dust-devil",
    organisation: "NASA",
    title: "Mars Exploration Rovers: dust devils and solar panels",
    url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    date: "MER mission pages, 2004–2019; consulted 2026",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "Dust devils really do clean solar panels on Mars, which helped Spirit and Opportunity keep working.",
    usedFor: [
      "The dust devil event: +2 power for one day.",
      "The idea that weather can help a mission as well as hurt it.",
    ],
    notModelled: [
      "The bonus size is a game value.",
      "The game does not model panel dust accumulation over time.",
    ],
    adultNote:
      "Dust-cleaning events on Spirit and Opportunity are well documented and were a real factor in extending those missions. The +2 power bonus is a balancing value.",
  },
  "nasa-insight-quake": {
    id: "nasa-insight-quake",
    organisation: "NASA JPL / InSight science team (Kawamura et al., GRL)",
    title: "InSight records the largest quake on another planet",
    url: "https://www.jpl.nasa.gov/news/nasas-insight-records-monster-quake-on-mars",
    date: "Event 4 May 2022 (day 1222); mission retired 21 December 2022",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "InSight felt a magnitude 4.7 marsquake in May 2022 — the biggest quake ever detected on another planet.",
    usedFor: [
      "The marsquake event, which costs the crew an inspection task.",
      "The dose/energy theme that a real base must spend time on safety.",
    ],
    notModelled: [
      "The game does not model structural damage.",
      "Crew inspection time is a game cost, not an InSight measurement.",
    ],
    adultNote:
      "S1222a on 4 May 2022 had a moment magnitude of 4.7 (first estimated at about 5), roughly five times the seismic moment of the next largest event. InSight detected over 1,313 marsquakes before dust on its solar panels ended the mission in December 2022.",
  },
  "nasa-first-sample": {
    id: "nasa-first-sample",
    organisation: "NASA JPL / Perseverance",
    title: "Perseverance collects its first Mars rock sample",
    url: "https://science.nasa.gov/mission/mars-2020-perseverance/",
    date: "First cored rock, September 2021",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "Perseverance drilled its first rock core at Jezero in 2021. Samples like it are the reason the rover went there.",
    usedFor: [
      "The first-sample event: a rover trip that costs extra power for a special find.",
      "The explanation of why sample return matters.",
    ],
    notModelled: [
      "The extra power cost is a game value.",
      "The game does not simulate drilling or caching.",
    ],
    adultNote:
      "Perseverance collected its first rock core in September 2021 at Jezero Crater; samples are being cached for a future Mars Sample Return campaign. The drilling cost in the game is a balancing value.",
  },
  "nasa-ingenuity": {
    id: "nasa-ingenuity",
    organisation: "NASA JPL / Ingenuity",
    title: "Ingenuity: first powered flight on another planet",
    url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-helicopter/",
    date: "First flight 19 April 2021; retired January 2024",
    retrieved: RETRIEVED,
    status: "archived",
    kidLine:
      "Ingenuity flew in the Martian air in 2021 — the first powered flight on another planet — and scouted routes for the rover.",
    usedFor: [
      "The helicopter scout event: a cheaper rover trip because the route is already known.",
      "The idea that information can save power.",
    ],
    notModelled: [
      "The 1-power saving is a game value.",
      "The game does not simulate flight or imaging.",
    ],
    adultNote:
      "Ingenuity's first flight was 19 April 2021; it eventually flew 72 times and was retired in January 2024 after rotor damage. The scouting benefit is simplified into a one-day power discount.",
  },
  "nasa-osdr-plant": {
    id: "nasa-osdr-plant",
    organisation: "NASA Open Science Data Repository (OSDR)",
    title:
      "OSD-218: Plant development on ISS differs from development on the ground",
    url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-218",
    date: "Initial release 24 February 2018 (DOI 10.26030/pddm-th52)",
    retrieved: RETRIEVED,
    status: "research-finding",
    kidLine:
      "Scientists found plants can grow differently in space. Our greenhouse is a pretend version of that research.",
    usedFor: [
      "The greenhouse storyline: food takes several days and results arrive later.",
      "Treating plant results as science, not as free food or free air.",
    ],
    notModelled: [
      "The game does not simulate plant biology, gene expression or radiation effects on crops.",
      "Harvest units are game units, not calories or kilograms.",
    ],
    adultNote:
      "OSD-218 is an Arabidopsis thaliana spaceflight study comparing ISS-grown plants with ground controls. Used as thematic grounding for delayed plant-science results only.",
  },
};

export const SOURCE_LIST: SourceCard[] = Object.values(SOURCES);

/** Short honesty notes shown with the science panel. */
export const SCIENCE_NOTES = {
  balancing:
    "Power units, air units, crew cards and job costs are invented balancing values for play. They are not NASA engineering measurements and not a life-support model.",
  dose:
    "Dose is shown in real units (mSv). The daily background rate and the storm dose come from NASA's RAD measurements; the mission limit is a game rule, not a NASA limit.",
  lifeSupport:
    "The air tank is a simplified model. A real outpost would have many more systems, sensors and backups, and the oxygen plant is scaled far above MOXIE.",
  protection:
    "The soil berm's 45% reduction is a simplification of regolith shielding studies. The game does not model particle physics or body self-shielding.",
  greenhouse:
    "The greenhouse grows food for the crew in this game. Real Mars greenhouses are still research.",
  data:
    "Every weather card is tied to a real, dated NASA record or measurement. Which ones arrive, and when, is shuffled for each mission - the events are real, the schedule is not a forecast.",
  offline:
    "All source material is written into the game, so it works in a classroom with no internet.",
};
