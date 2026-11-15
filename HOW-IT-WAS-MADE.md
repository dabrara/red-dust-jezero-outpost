# How Red Dust: Jezero Outpost was made

A short build summary: the idea, the stack, the architecture, the data, the
testing and the deployment — plus what you still need to do before submitting.

---

## 1. In one paragraph

Red Dust is a static React app with no backend. All the game logic lives in a
deterministic TypeScript engine: a single function, `analyze(state, plan)`,
computes what a day would cost, and the same function runs the day, so the
preview and the result cannot disagree. Missions are generated from a seed
(which weather arrives on which day), all balancing numbers live in one config
file, and every real NASA value is embedded with a source card and a "what this
game does not model" note. It is built with Vite, tested with Vitest, and
deployed as static assets on Cloudflare Workers through Freebuff Sites.

---

## 2. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | TypeScript 5.6 | The rules engine is the product; types keep the state honest |
| UI | React 18 | Small, familiar, no router needed |
| Build | Vite 5 | Fast dev server, static output, zero server runtime |
| Tests | Vitest 2 | Same transform pipeline as the app, runs in ms |
| Styling | One hand-written CSS file | Design tokens, no framework weight, full control of print/phone rules |
| Art | Inline SVG + CSS gradients | Sharp at any size, no image assets, no third-party artwork |
| State | `useState` + `localStorage` | A mission is single-player and local; no accounts |
| Hosting | Cloudflare Workers static assets | Free, global, one deployable folder |

Bundle: ~270 kB JS (≈84 kB gzipped) and ~45 kB CSS (≈10 kB gzipped). No
analytics, no trackers, no network calls at runtime.

---

## 3. Repository map

```
src/
  App.tsx               screen flow, announcements, modals, mobile run dock
  main.tsx              React entry
  styles.css            design tokens + layout + phone/print rules
  game/
    types.ts            GameState, ActivityId, EventId, SourceId, ScenarioId
    config.ts           BASE_NUMBERS: every balancing value in one place
    scenarios.ts        four missions, guidance overrides, length scaling
    activities.ts       the eight jobs: cost, crew, copy
    engine.ts           analyze(), runShift(), nextShift(), goals, badges
    events.ts           ten real weather records + their effects
    schedule.ts         seeded shuffle (mulberry32) for a mission's weather
    sources.ts          source cards: real values, what is not modelled
    nasa.ts             the measured numbers with caveats
    copy.ts             Pebble's summaries at two reading levels
    scrapbook.ts        end-of-mission book, badges, stats
    save.ts             localStorage with a validating sanitizer
    engine.test.ts      28 tests, including an autopilot winnability check
  ui/                   18 components: scene, meters, cards, dialogs
public/slides/          the 7-slide demo deck and its screenshots
SUBMISSION.md           form answers, SI disclosure, NASA link lists
```

---

## 4. How a day works

1. **State.** `GameState` holds power, air, dose, food, discoveries, the plan,
   delayed effects, the day number, and the event map for the mission.
2. **Plan.** Tapping a building toggles one activity. Every activity has a
   power cost, a crew cost, and sometimes air or dose.
3. **Analyze.** `analyze(state, plan)` returns the full forecast (power left,
   air after, dose after, new finds) plus a list of problems, each either a
   `block` or a `warn`. The preview panel and the run button read this.
4. **Run.** `runShift` re-runs the same analysis, then commits it: spends
   resources, adds dose (background + storm, modified by the berm), applies
   event effects, resolves delayed harvests and dust losses, records
   discoveries, and checks the three failure conditions (air 0, dose limit,
   mission end).
5. **Results → next day.** Results are shown in plain language (two reading
   levels), then `nextShift` advances the day, attaches the next event from
   `state.events`, and applies that event's modifiers.

Failure never dead-ends: the mission ends with an honest scrapbook page and a
"try this next time" note. Guided mode also offers one rescue supply.

---

## 5. The science model

Three things are real; everything else is labelled as a game value.

| Real | Value | Where it acts |
| --- | --- | --- |
| Background dose (MSL/RAD) | 0.64 mSv/day | Charged every day |
| May 2024 solar storm (RAD/AR13664) | ≈2 mSv unshielded | Storm day; shelter cuts it to 0.2 |
| Shelter protection | 90% reduction | Game application of "buried shelter" |
| Soil berm | 55% of later daily dose | Inspired by regolith studies, not a validated design |
| One-way light time | 3–22.4 min | Comms is a crew job; results only count when sent |
| Conjunction | 2019 moratorium, 28 Aug – 7 Sep | Sending blocked in the Conjunction mission |
| MEDA temperatures | mean −69 to −41 °C | Cold-snap days cost 1 power |
| MOXIE | 12 g/h peak, 122 g total | Oxygen plant costs 2 power per refill |
| OSDR OSD-218 | delayed/uncertain plant results | Harvests land the next day |
| InSight S1222a | Mw 4.7, 4 May 2022 | Marsquake event: one crew task goes to inspection |
| Opportunity / 2018 storm | mission ended by dust | Dust storm: −2 power the following day |
| Perseverance | first core, Sept 2021 | First-sample event: +1 power, special find |
| Ingenuity | first flight 19 Apr 2021, 72 flights | Scout event: rover costs 1 power less |

Game values (power units, air units, crew cards, job costs, dose limits,
rescue supply) are invented for balance and are listed as such in the in-game
Science panel.

---

## 6. Weather: real records, shuffled

`events.ts` holds ten events, each with a `sourceId` that must exist in
`sources.ts`; a test enforces that. Each event resolves to a small set of
modifiers: storm, dose scale, power delta, crew penalty, comms blocked/free,
rover cost, next-day penalty, special find.

`schedule.ts` builds the mission's weather with a seeded `mulberry32` PRNG:
a scenario lists `mustEvents` (Storm Season always gets two storms) and an
`eventPool`; the pool is shuffled and dealt into distinct days from day 2 to the
last day, with the count scaling by mission length. Same seed → same mission;
replaying increments the variant → new weather.

---

## 7. Mission length

`numbersFor(scenarioId, mode, days)` returns the whole rule set for a mission:

- dose limit scales linearly (8 → 16 → 24 mSv)
- harvest and transmission targets scale (3 → 6 → 9)
- two extra units of power and air storage, and of starting supply, per extra week
- everything else (generation, crew, job costs) stays the same

So a 21-day mission is not "the same game, longer": the same daily budget has to
carry three times the work. An autopilot test proves every combination is still
finishable.

---

## 8. Interface and accessibility

- The outpost is drawn once in SVG; building labels are positioned from the
  same viewBox coordinates, so they never drift from the drawing.
- Two reading levels (`Simple`, `More detail`) independent of difficulty.
- Read-aloud through the Web Speech API, always with a manual "read this"
  button; no autoplay.
- Focus-trapped dialogs, visible focus rings, `aria-live` announcements of each
  day's result, 44–48 px touch targets.
- Phone layout: labels become a two-column button grid, meters reflow to 2×2,
  a fixed bottom bar carries the day's run action, and the plan tray's duplicate
  button is hidden. Reduced-motion and high-contrast focus are respected.
- Saves are validated on load; a corrupt or outdated save is rejected rather
  than trusted.

---

## 9. Verification

| Check | What it covers |
| --- | --- |
| `npx tsc --noEmit` | Types across engine and UI |
| `npx vitest run` (28 tests) | Costs, forecasts, failures, events, schedule, real-source integrity, winnability |
| `npm run build` | Typecheck + production bundle |
| Browser checks | Desktop and 390 px phone: no horizontal overflow, run dock, event card, results, science panel |
| Live checks | Deployment reachable, new bundle hash, slides route |

The standout test is the **autopilot**: a simple, sensible strategy (keep air
alive, shelter in storms, grow food, send finds, build the berm on long
missions) plays every scenario × setting × length (24 runs) and must finish with
all three goals met. That is what keeps balancing honest when numbers change.

---

## 10. Deployment

1. `npm run build` → `dist/` (static HTML/CSS/JS + the slides folder).
2. `deploy/manifest.json` describes the Worker: entrypoint, compatibility date,
   `assetsDirectory: "../dist"`, SPA fallback.
3. Deployed with Freebuff Sites to
   https://site-ff250ea6ea2349699923b8feaf6c826e.freebuff.page
   (published; the slides live at `/slides/`).
4. No environment variables, no secrets, no database — nothing to configure.

---

## 11. AI (SI) use

The project is AI-assisted and says so in four places: the start-screen footer,
a visible watermark on the illustration, the `ai-disclosure` meta tag, and the
README. What the SI agent did: all code, all SVG/CSS art, all copy, the tests
and the slide deck. What the human did: the concept and the constraint list, the
science checks against primary sources, the design and fairness decisions, the
rejections, the testing on real screens, and the submission.

Rules that shaped the build:

- No NASA logos, flags or mission insignia anywhere.
- AI-generated artwork carries a visible mark (scene corner, slide corner).
- AI involvement is declared in text and metadata.

---

## 12. Known limits (and what to say if a judge asks)

- Dose is one simplified number, not a particle-transport model.
- The berm's 45% reduction is a plausible game figure, not a validated design.
- Storms and conjunctions are compressed into single days.
- Weather order is shuffled for play; it is not a forecast.
- Not tested on physical iOS Safari or with a screen reader; tested in a desktop
  Chromium and at phone widths.
- A 21-day mission is still one sitting, not a campaign.

---

## 13. Run it yourself

```bash
npm ci          # install (lockfile is committed)
npm run dev     # http://localhost:3001
npm test        # 28 tests
npm run build   # production build to dist/
```
