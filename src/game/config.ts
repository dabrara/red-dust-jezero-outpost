/**
 * Balancing values for the prototype.
 *
 * The RADIATION numbers are the only measured values here: 0.64 mSv per day of
 * background dose, and a 2 mSv solar storm, both from MSL/RAD. Everything else
 * (power units, air units, crew cards, costs) is an invented balancing value
 * for play. The Science panel says exactly this, with sources.
 */
export interface Numbers {
  shiftCount: number;
  /** Power units in the battery. */
  powerCapacity: number;
  /** Air units in the tank. One unit ≈ one crew-day of breathing air. */
  oxygenCapacity: number;
  startPower: number;
  startOxygen: number;
  /** Solar power added at the start of each day. */
  generation: number;
  /** Air the crew breathes each day. */
  oxygenUse: number;
  /** Crew task cards available each day. */
  crewTasks: number;
  oxygenPower: number;
  oxygenGain: number;
  labPower: number;
  roverPower: number;
  roverOxygen: number;
  /** Extra dose from a rover trip, in mSv. */
  roverDose: number;
  greenhousePower: number;
  commsPower: number;
  shelterPower: number;
  shieldPower: number;
  /** Fraction of background dose that remains once the berm is built. */
  shieldFactor: number;
  /** Measured background dose per day, mSv (MSL/RAD). */
  baseDose: number;
  /** Extra dose from a solar storm with only the habitat for shielding. */
  stormDose: number;
  /** Extra dose from a solar storm while the crew is in the storm shelter. */
  stormShelterDose: number;
  /** Mission dose limit, mSv. A game rule, not a NASA limit. */
  doseLimit: number;
  /** Harvests needed for the food goal. */
  foodNeeded: number;
  targetTransmissions: number;
  rescuePower: number;
  rescueOxygen: number;
}

export const BASE_NUMBERS: Numbers = {
  shiftCount: 7,
  powerCapacity: 12,
  oxygenCapacity: 12,
  startPower: 9,
  startOxygen: 9,
  generation: 4,
  oxygenUse: 2,
  crewTasks: 2,
  oxygenPower: 2,
  oxygenGain: 3,
  labPower: 2,
  roverPower: 3,
  roverOxygen: 1,
  roverDose: 0.3,
  greenhousePower: 1,
  commsPower: 1,
  shelterPower: 1,
  shieldPower: 4,
  shieldFactor: 0.55,
  baseDose: 0.64,
  stormDose: 2.0,
  stormShelterDose: 0.2,
  doseLimit: 8,
  foodNeeded: 3,
  targetTransmissions: 3,
  rescuePower: 2,
  rescueOxygen: 2,
};

/** Power lost while dust is thick in the air. */
export const DUST_STORM_PENALTY = 2;

/** Power recovered when a dust devil cleans the panels. */
export const DUST_DEVIL_BONUS = 2;

/**
 * Above this share of the dose limit, outdoor work is paused: Mission Control
 * stops signing off EVAs. It is a game rule chosen to make dose visible early.
 */
export const DOSE_RESTRICT_AT = 0.75;
