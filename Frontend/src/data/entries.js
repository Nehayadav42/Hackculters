import { STEPWELLS } from "./stepwells.js";
import { BHOPAL_COLLECTION, BHOPAL_GROUP, BHOPAL_STATE } from "./bhopal.js";

/** Every archive entry, with a stable numeric `id` and a filter `group`. */
export const ENTRIES = [
  ...STEPWELLS.map((entry) => ({ ...entry, group: entry.state })),
  ...BHOPAL_COLLECTION.map((entry) => ({ ...entry, state: BHOPAL_STATE, group: BHOPAL_GROUP })),
].map((entry, id) => ({ ...entry, id }));

export const BHOPAL_ENTRIES = ENTRIES.filter((entry) => entry.group === BHOPAL_GROUP);
