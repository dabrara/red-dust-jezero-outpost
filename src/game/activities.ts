import type { ActivityId, BuildingId } from "./types";

export interface ActivityDef {
  id: ActivityId;
  building: BuildingId;
  /** Screen-reader friendly action name. */
  action: string;
  /** Short label for chips and buttons. */
  short: string;
  kidLine: string;
  fullLine: string;
  teaches: string;
  crew: number;
  outdoor: boolean;
  blockedWhenSheltered: boolean;
}

/**
 * Activities are toggles: a job is either in this day's plan or it is not.
 * Costs live in the balancing numbers so the tokens and the simulation can
 * never disagree.
 */
export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  oxygen: {
    id: "oxygen",
    building: "oxygen-plant",
    action: "Run the oxygen plant",
    short: "Oxygen plant",
    kidLine: "Put power here to make more air.",
    fullLine:
      "The oxygen plant splits carbon dioxide from the thin Mars air, like NASA's MOXIE experiment did. It needs electricity and it never uses a crew task.",
    teaches:
      "Life support runs on electricity. Making air is a power decision, every day.",
    crew: 0,
    outdoor: false,
    blockedWhenSheltered: false,
  },
  lab: {
    id: "lab",
    building: "lab",
    action: "Study a sample in the lab",
    short: "Science lab",
    kidLine: "A crew member studies a sample inside. It makes a new discovery.",
    fullLine:
      "A crew member studies a sample at the indoor bench. It costs electricity and one crew task, and it adds a discovery to your collection.",
    teaches:
      "Power and crew time are both limited, so one job always means fewer of the others.",
    crew: 1,
    outdoor: false,
    blockedWhenSheltered: false,
  },
  rover: {
    id: "rover",
    building: "garage",
    action: "Drive the rover outside",
    short: "Rover garage",
    kidLine: "The rover goes exploring. It costs the most power, some air and a little dose.",
    fullLine:
      "The rover drives a route outside the base. It costs more electricity than an indoor study, uses extra air and adds radiation dose, because spacesuits and rovers only shield a little.",
    teaches:
      "Going outside costs more than staying in: power, air and radiation dose.",
    crew: 1,
    outdoor: true,
    blockedWhenSheltered: true,
  },
  greenhouse: {
    id: "greenhouse",
    building: "greenhouse",
    action: "Tend the greenhouse",
    short: "Greenhouse",
    kidLine: "Water and check the plants. Grow food for the crew.",
    fullLine:
      "A crew member checks the plants, tops up the water and adjusts the lamps. Lamps cost power. Each harvest feeds the crew, and some results arrive a day later.",
    teaches: "Food is a power decision too: lamps are not free.",
    crew: 1,
    outdoor: false,
    blockedWhenSheltered: false,
  },
  comms: {
    id: "comms",
    building: "dish",
    action: "Send discoveries to Earth",
    short: "Comms dish",
    kidLine: "Send your discoveries to Earth. The reply takes minutes to arrive.",
    fullLine:
      "The dish turns to Earth and sends every discovery that has not been sent yet. The signal takes 3 to 22 minutes one way, so nobody on Earth can steer this mission. It costs power and one crew task.",
    teaches:
      "Finishing work means sending it home — and Earth cannot answer quickly.",
    crew: 1,
    outdoor: false,
    blockedWhenSheltered: true,
  },
  shelter: {
    id: "shelter",
    building: "shelter",
    action: "Move the crew into the storm shelter",
    short: "Storm shelter",
    kidLine: "The crew waits inside the buried shelter. They get much less dose.",
    fullLine:
      "The crew moves into the shelter under a layer of Mars soil. Their radiation dose drops a lot, but heating it costs power, it uses a crew task, and outdoor and antenna work pause.",
    teaches:
      "Protection is a real choice with a real cost. Sheltering is not free and it is not magic.",
    crew: 1,
    outdoor: false,
    blockedWhenSheltered: false,
  },
  shield: {
    id: "shield",
    building: "berm",
    action: "Build the soil berm",
    short: "Soil berm",
    kidLine:
      "Fill bags with Mars soil and pile them around the habitat. Less dose, every day after.",
    fullLine:
      "The crew fills bags with Mars soil and piles them around the habitat. It costs a lot of power and a whole crew task this day, and it lowers the background dose for the rest of the mission. You can only build it once.",
    teaches:
      "Spending today's power on protection pays back later. Real missions face exactly this trade.",
    crew: 1,
    outdoor: true,
    blockedWhenSheltered: true,
  },
};

export const ACTIVITY_ORDER: ActivityId[] = [
  "oxygen",
  "lab",
  "rover",
  "greenhouse",
  "comms",
  "shelter",
  "shield",
];

export interface BuildingDef {
  id: BuildingId;
  name: string;
  activity: ActivityId;
  kidLine: string;
}

export const BUILDINGS: Record<BuildingId, BuildingDef> = {
  "oxygen-plant": {
    id: "oxygen-plant",
    name: "Oxygen plant",
    activity: "oxygen",
    kidLine: "Makes breathing air from Mars air.",
  },
  lab: {
    id: "lab",
    name: "Science lab",
    activity: "lab",
    kidLine: "Study a sample inside.",
  },
  greenhouse: {
    id: "greenhouse",
    name: "Greenhouse",
    activity: "greenhouse",
    kidLine: "Grow food for the crew.",
  },
  garage: {
    id: "garage",
    name: "Rover garage",
    activity: "rover",
    kidLine: "Send the rover outside.",
  },
  dish: {
    id: "dish",
    name: "Comms dish",
    activity: "comms",
    kidLine: "Send discoveries to Earth.",
  },
  shelter: {
    id: "shelter",
    name: "Storm shelter",
    activity: "shelter",
    kidLine: "Wait out a solar storm.",
  },
  berm: {
    id: "berm",
    name: "Soil berm",
    activity: "shield",
    kidLine: "Pile soil for shielding.",
  },
};
