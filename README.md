# Red Dust: Jezero Outpost

A browser game for ages 7–12 about running a small Mars outpost for 7, 14 or 21
days. Three meters, one crew, and no real-time help from Earth.

**Play:** `npm install` then `npm run dev`.

## The teaching idea

Every day the player has a solar budget, a tank of air, a radiation dose limit
and two crew task cards. Every job spends from the same pool, so nothing is
free:

| Job | Cost | What it protects |
| --- | --- | --- |
| Oxygen plant | 2 power | Air (the crew breathes 2 units per day) |
| Science lab | 2 power + 1 crew | Finds to send home |
| Rover trip | 3 power + 1 air + 0.3 mSv | Bigger finds, at a real dose cost |
| Greenhouse | 1 power + 1 crew | Food (three harvests) |
| Comms dish | 1 power + 1 crew | Sending finds to Earth |
| Storm shelter | 1 power + 1 crew | Turns a 2 mSv storm into 0.2 mSv |
| Soil berm (once) | 4 power + 1 crew | Cuts every later day's dose to 55% |

A mission can last 7, 14 or 21 days. Longer missions scale their targets (dose
limit, harvests, finds sent home) and ship a little more storage, but the crew
and the solar budget stay the same per day, so planning gets harder rather than
just longer.

The two mechanics that carry the lesson:

1. **Radiation is a budget, not an alarm.** Background dose is real: about
   0.64 mSv per day on the Mars surface. A storm adds about 2 mSv in hours.
   Sheltering works, but it costs a crew task and 1 power, and it pauses
   outdoor and antenna work. Building the soil berm costs a whole day of power,
   and pays back only if another storm comes.
2. **Earth cannot help in a hurry.** One-way light time is 3–22 minutes, and
   during conjunction Earth stops sending for about two weeks. The dish is a
   crew-task job with a real purpose: unfinished work never reaches anyone.

## Weather: real records, shuffled

Each mission draws its weather from a deck of ten events, each tied to a dated
NASA record: a solar storm, a dust storm that ends a rover's mission, a dust
devil that cleans panels, a radiation dip after a storm, a relay pass, the
martian cold, a marsquake, the first cored sample, a helicopter scout, and the
solar conjunction. Some events are fixed per mission (Storm Season always has
two storms; Conjunction always loses the link), the rest are drawn without
repeats on a seeded schedule, so a mission is reproducible from its seed and a
replay reshuffles it. Every event card names its source and says which parts of
its effect are game values.

## Real NASA data used

Nothing in the game calls an API at runtime (so it works offline in a
classroom), and nothing is presented as live space weather. Values were
retrieved on 15 November 2026 and are attributed inside the game, under
**Real data & sources**:

| Data | Value used | Source |
| --- | --- | --- |
| Surface dose, galactic cosmic rays | 0.64 mSv/day | MSL/RAD (Hassler et al. 2014; Guo et al. 2021 review) |
| May 2024 solar storm at Mars | ≈2 mSv unshielded | MSL/RAD, AR13664 event (RAD team 2024) |
| Oxygen from Mars air | 12 g/hour peak, 122 g total | NASA MOXIE results (2023) |
| Jezero weather | about −20 °C, mean −69 to −41 °C | MEDA on Perseverance (2021, 2024) |
| Earth–Mars light time | 3 to 22.4 minutes | NASA Mars Relay Network |
| Solar conjunction | 2019 moratorium, 28 Aug – 7 Sep | NASA |
| Space-plant research | delayed, uncertain results | NASA OSDR OSD-218 |

**What is not real:** power units, air units, crew cards, job costs and the
mission dose limit are invented balancing values. The Science panel lists them
in a table and says so plainly, next to the real values above.

## Architecture

- `src/game/engine.ts` — one deterministic `analyze(state, plan)` used by both
  the plan preview and the resolved day, so preview and result cannot disagree.
- `src/game/config.ts` — every balancing number in one place.
- `src/game/scenarios.ts` — four missions, two guidance settings, three mission
  lengths, per-scenario overrides and the must-have events for each mission.
- `src/game/events.ts` — ten real weather records, each with a source card,
  the parts of its effect that are measured, and the parts that are game values.
- `src/game/schedule.ts` — seeded, deterministic shuffle that decides which
  events arrive on which days.
- `src/game/nasa.ts` — the real measured values, with their caveats.
- `src/game/sources.ts` — source cards: what each one is used for, and what the
  game deliberately does not calculate.
- `src/game/engine.test.ts` — rules tests, one test per real event checking it
  does what its card promises, and an autopilot test that finishes every
  mission, setting and length with all three goals met.
- `src/ui/*` — React components; `BaseScene.tsx` draws the outpost in SVG and
  positions each label from the same viewBox coordinates as its building.

## Accessibility and devices

- 44–48 px touch targets, visible keyboard focus, focus-trapped dialogs.
- Two reading levels (`Simple`, `More detail`) independent of difficulty.
- Optional read-aloud using the browser's speech synthesis, with a manual
  "read this" button when available.
- Reduced-motion setting; no drag-only interactions; labels become a button
  grid on phones instead of a sideways-scrolling strip.
- Saving uses `localStorage`, so a mission is per-device and needs no account.
  Corrupt or outdated saves are rejected rather than trusted.

## Honest limits

- Not tested on physical iOS/Safari or with a screen reader.
- Dose is a simplified single number, not a particle-transport model.
- The soil berm's 45% reduction is a game figure inspired by regolith
  shielding studies, not a validated engineering result.
- Storm, dust and conjunction events are compressed into single days, and the
  event order is shuffled for play, not a real forecast.
- A 21-day mission is still one sitting's worth of choices; it is not a
  month-by-month campaign.

## Host it on GitHub Pages

The build uses relative asset paths, so it works from a project site
(`https://USER.github.io/REPO/`) without configuration.

1. Create a public repository, e.g. `red-dust-jezero-outpost`.
2. Push this folder to `main` with `git push -u origin main`.
3. In the repository: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**. The included workflow (`.github/workflows/deploy.yml`)
   installs, tests, builds and publishes on every push.
4. The game appears at `https://USER.github.io/REPO/` and the 7-slide demo at
   `https://USER.github.io/REPO/slides/`.

Prefer no Actions? Run `npm ci && npm run build` and publish the `dist/`
folder with `npx gh-pages -d dist`, or drag `dist/` into any static host.

## AI (SI) use

This project was built with Super Intelligence (SI) assistance, as the NASA
Space Apps Challenge permits when it is declared:

- **Code:** the TypeScript, React and CSS were written with an SI coding agent,
  directed and reviewed by the team.
- **Text:** in-game copy, event cards, source notes and this README were drafted
  and edited with SI tools.
- **Illustrations:** the outpost scene, icons and slide graphics are
  AI-generated SVG and CSS. A visible "Illustration: AI-generated" mark sits on
  the scene, and the demo slides carry an "AI-generated artwork" watermark.
- **Audio:** none is generated. Read-aloud uses the browser's built-in speech
  synthesis, not a model.
- **Data:** the NASA values are published measurements, transcribed by hand.
  No data was generated or altered by SI.

No NASA logos, flags or mission insignia are used, and no AI-generated content
contains NASA branding. Human review covered every change, all figures, and the
tests listed below.

## Commands

- `npm run dev` — dev server on port 3001
- `npm run build` — typecheck plus production build
- `npm test` — engine and rules tests
