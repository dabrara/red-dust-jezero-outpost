import type { DoseStatus, ReadingLevel, ShiftResult } from "./types";

/** Choose wording for the current reading-support setting. */
export function pick(
  level: ReadingLevel,
  little: string,
  mission: string,
): string {
  return level === "little" ? little : mission;
}

/**
 * Pebble's summary after a day. It always describes what the simulation
 * actually did, and it never scolds.
 */
export function pebbleLines(
  result: ShiftResult,
  level: ReadingLevel,
): string[] {
  const lines: string[] = [];

  if (result.willEndMission) {
    if (result.oxygenAfter <= 0) {
      lines.push(
        pick(
          level,
          "The air tank is empty, so Mission Control is bringing the crew home. Everyone is safe.",
          "The air reserve reached empty, so Mission Control ended the mission early. The crew is safe and the outpost is in low-power standby.",
        ),
      );
    } else {
      lines.push(
        pick(
          level,
          "That was too much radiation, so Mission Control is bringing the crew home early. Everyone is safe.",
          `The crew reached ${result.doseAfter.toFixed(1)} mSv, past the ${result.doseLimit} mSv mission limit, so the mission ended early for the crew's health.`,
        ),
      );
    }
  }

  if (result.discoveries.length > 0) {
    const names = result.discoveries.map((d) => d.name).join(" and ");
    lines.push(
      pick(
        level,
        `You found a ${names.toLowerCase()}!`,
        `New find on the shelf: ${names.toLowerCase()}.`,
      ),
    );
  }

  if (result.transmittedNow > 0) {
    lines.push(
      pick(
        level,
        "The dish sent your work to Earth. The reply will take a few minutes to arrive.",
        `You sent ${result.transmittedNow} ${result.transmittedNow === 1 ? "find" : "finds"} to Earth. At this distance the signal takes minutes, not seconds.`,
      ),
    );
  }

  if (result.foodCompleted) {
    lines.push(
      pick(
        level,
        "The crew has enough food growing now. The harvest report comes next day.",
        "The food goal is met. Dr. Nova's harvest report arrives next day.",
      ),
    );
  } else if (result.foodAfter > result.foodBefore) {
    lines.push(
      pick(
        level,
        "The plants grew a little.",
        `Crops harvested: ${result.foodAfter} of ${result.foodNeeded}.`,
      ),
    );
  }

  if (result.storm === "sheltered") {
    lines.push(
      pick(
        level,
        "The crew waited in the buried shelter, so the storm gave them only a little dose.",
        `The crew sheltered: the storm added ${result.doseAdded.toFixed(2)} mSv instead of about 2 mSv, and outdoor work paused.`,
      ),
    );
  } else if (result.storm === "alert") {
    lines.push(
      pick(
        level,
        "The storm reached the base and the crew took the dose.",
        `The storm added radiation. Total dose is now ${result.doseAfter.toFixed(2)} of ${result.doseLimit} mSv.`,
      ),
    );
  } else if (result.doseAdded > 0 && lines.length < 3) {
    lines.push(
      pick(
        level,
        "Space radiation added a little dose today. That happens every day.",
        `Background radiation added ${result.doseAdded.toFixed(2)} mSv. Total: ${result.doseAfter.toFixed(2)} of ${result.doseLimit} mSv.`,
      ),
    );
  }

  if (lines.length < 3) {
    const net = result.oxygenAfter - result.oxygenBefore;
    if (net > 0) {
      lines.push(pick(level, "Your air tank went up.", `Air reserve rose by ${net}.`));
    } else if (net < 0) {
      lines.push(
        pick(
          level,
          `Your air tank went down by ${Math.abs(net)}.`,
          `Air reserve fell by ${Math.abs(net)}.`,
        ),
      );
    } else {
      lines.push(
        pick(level, "Your air stayed the same.", "Air reserve stayed exactly the same."),
      );
    }
  }

  if (lines.length < 4) {
    lines.push(
      pick(
        level,
        `You have ${result.powerAfter} power left.`,
        `${result.powerAfter} power remains in the battery.`,
      ),
    );
  }

  return lines.slice(0, 4);
}

export const DOSE_COPY: Record<
  DoseStatus,
  { label: string; symbol: string; kidLine: string; missionLine: string }
> = {
  clear: {
    label: "Safe",
    symbol: "◆",
    kidLine: "Dose is low. Good.",
    missionLine: "Cumulative dose is well inside the mission limit.",
  },
  watch: {
    label: "Watch",
    symbol: "▲",
    kidLine: "Dose is adding up. Storms cost more.",
    missionLine:
      "Cumulative dose is past half the mission limit. Shelter during storms.",
  },
  "needs-plan": {
    label: "Indoor only",
    symbol: "■",
    kidLine: "Outdoor work is paused. Dose is high.",
    missionLine:
      "Cumulative dose is near the mission limit, so Mission Control has paused outdoor work.",
  },
};
