# Space Apps 2026 submission pack

Everything to copy into your team's project page, the SI question and the NASA
data fields. Written against the rules judges check first:

- demo is **7 slides max** (including title and ending slide), English
- **NASA open data used** and linked
- **AI use declared**, with a visible watermark on AI-generated images
- **no NASA branding** — no logos, flags or mission insignia
- all links public, no password or sign-up

---

## 1. "Use of Super Intelligence (SI) *" — what to select

The screenshot shows **Visual Design or Image Creation, Writing, Editing, or
Translation** selected. That is correct but incomplete for this project: the
largest AI contribution here was the **code**.

Tick every option on the form that matches this list:

| Category | Applies? | What the SI tool actually did |
| --- | --- | --- |
| Visual Design or Image Creation | **Yes** | The outpost scene, icons and slide graphics are AI-generated SVG/CSS |
| Writing, Editing, or Translation | **Yes** | In-game copy, event cards, source notes, README, this pack |
| Code Generation / Coding (if offered) | **Yes** | TypeScript, React and CSS written with an SI coding agent |
| Audio Generation | No | No AI audio. Read-aloud uses the browser's built-in speech synthesis |
| Video Generation | No | No video; the demo is slides |
| Data Generation | No | NASA values are published measurements, transcribed by hand |

If the form is a single-choice dropdown and "Code" is not available, keep the
selection you have and state the code involvement in the description text — the
disclosure paragraph below covers it. If it is multi-select, add code.

### Paste-ready disclosure (project "Use of AI" field or description)

> **How AI (SI) was used.** We used an SI coding agent throughout the build. It
> wrote the TypeScript/React code, the SVG and CSS artwork for the outpost, the
> in-game copy, the event and source cards, and the first drafts of this
> README and the demo slides. The team directed the work, chose the challenge,
> designed the game rules, checked every NASA figure against its source,
> rejected the parts that were wrong or unfair, and tested the result: 28
> automated checks plus manual play on desktop and phone. No AI-generated
> content contains NASA logos, flags or mission insignia, and no NASA data were
> generated or altered by AI. AI-generated illustrations carry the visible mark
> "Illustration: AI-generated" in the game, and the demo slides carry an
> "AI-generated artwork" watermark. The AI tools used were the Freebuff coding
> agent (Buffy) for code, text and vector art.

---

## 2. NASA Data — link list

Use the resource name as **Link Text** and the URL as **Link URL**. These are the
same sources the game cites in its own "Real data & sources" panel.

| Link Text | Link URL |
| --- | --- |
| MSL/RAD — radiation environment on the Mars surface (Hassler et al. 2014) | https://wrmiss.org/workshops/twentyseventh/Hassler.pdf |
| Galactic cosmic radiation dose review (Guo et al., 2021) | https://link.springer.com/article/10.1007/s00159-021-00136-5 |
| NASA — MOXIE completes its Mars mission (oxygen from CO₂) | https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/ |
| NASA JPL — first weather report from Jezero Crater (MEDA) | https://www.jpl.nasa.gov/news/nasas-first-weather-report-from-jezero-crater-on-mars/ |
| NASA — Mars Relay Network (light-time and relay passes) | https://science.nasa.gov/mars/mars-relay-network |
| NASA — What is Mars solar conjunction and why does it matter | https://www.nasa.gov/solar-system/whats-mars-solar-conjunction-and-why-does-it-matter/ |
| NASA — Mars Exploration Rovers Spirit and Opportunity (2018 dust storm) | https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/ |
| NASA JPL — InSight records the largest quake on another planet (S1222a) | https://www.jpl.nasa.gov/news/nasas-insight-records-monster-quake-on-mars |
| NASA — Mars 2020 Perseverance (first cored rock sample) | https://science.nasa.gov/mission/mars-2020-perseverance/ |
| NASA — Ingenuity Mars Helicopter (72 flights) | https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-helicopter/ |
| NASA OSDR — plant growth study OSD-218 | https://osdr.nasa.gov/bio/repo/data/studies/OSD-218 |
| NASA Space Apps Challenge (challenge and rules) | https://www.spaceappschallenge.org/ |
| Space Apps 2025 Judging Guidelines (the 7-slide and AI rules) | https://assets.spaceappschallenge.org/media/documents/Final_Space_Apps_2025_Judging_Guidelines_for_web.pdf |

## 3. Space Agency Partner & Other Data — link list

| Link Text | Link URL |
| --- | --- |
| React 18 (MIT) | https://react.dev/ |
| Vite 5 (MIT) | https://vite.dev/ |
| TypeScript (Apache-2.0) | https://www.typescriptlang.org/ |
| Vitest (MIT) | https://vitest.dev/ |
| Cloudflare Workers (hosting platform) | https://workers.cloudflare.com/ |
| MDN — Web Speech API (browser read-aloud) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |

No stock photos, icon packs, fonts or third-party datasets are used. All
illustrations are generated in the project as SVG/CSS. Typeface is the device's
system font.

---

## 4. Project page fields (draft)

**Project title:** Red Dust: Jezero Outpost

**High-level summary (one sentence):**
A browser game where 7–12 year-olds run a Mars outpost for 7, 14 or 21 days and
discover that power, air and radiation dose are one budget — built on real NASA
measurements.

**Description:**
Red Dust turns the hardest part of a Mars mission into a 20-minute game. Every
day the player has a solar budget, a tank of air, a radiation dose limit and two
crew task cards. Eight jobs — oxygen plant, science lab, rover trip, greenhouse,
comms dish, storm shelter, soil berm — all spend from the same pool, so nothing
is free. Solar storms force the real choice: shelter and lose a day of work, or
stay out and take the dose.

Four missions (First Days, Storm Season, Dust Season, Conjunction), two guidance
settings and three mission lengths (7, 14, 21 days) share one deterministic
engine, so the forecast children see is exactly what happens. Weather is drawn
from ten real, dated NASA records: the May 2024 solar storm measured by RAD, the
2018 dust storm that ended Opportunity, InSight's magnitude 4.7 marsquake,
Perseverance's first cored sample, Ingenuity's scouting flights and more. Each
event card names its source and states which of its effects are game values
rather than measurements.

The game is designed for its audience: two reading levels, read-aloud, 44–48 px
touch targets, a phone layout with the day's action always in reach, no
accounts, no ads, no analytics, and it runs offline once loaded.

**What is next:** a teacher pack with printable mission cards, a Spanish reading
level, and a mission editor so classrooms can drop in new NASA datasets.

---

## 5. The demo (slideshow)

- File: `public/slides/index.html` (served at `/slides/` on the live site).
- Exactly **7 slides**, including the title slide — the judges' hard limit.
- To make the PDF: open the deck, press `P` or the **PDF** button, print to PDF
  in landscape with background graphics on.
- Upload the PDF to Google Drive / Dropbox set to "anyone with the link", or
  submit the `/slides/` URL. Check the link in a private window before
  submitting.

---

## 6. Before you press submit

- [ ] Public, open-source repository link on the project page (Space Apps
      requires projects to be open source). Push this folder to GitHub and add
      the URL to slide 7.
- [ ] Selected challenge filled in on the project page and in slide 1's kicker.
- [ ] Team members registered and listed.
- [ ] All links open in a private window (site, slides, repo, sources).
- [ ] AI question answered and the in-project disclosures are visible
      (start screen footer, scene watermark, README, slide footers).
- [ ] No NASA logo, flag or mission insignia anywhere in the deck or the game.
