export interface AbilityOrProficiency {
  name: string;
  description: string[]; // One entry per rank, in order.
  /** The character level at which this ability/proficiency becomes active. */
  minLevel: number;
  /** If present, lists approved subtypes.  Each subtype acquired costs one proficiency slot. */
  subTypes?: string[];
  // TODO: toHitEffect?: (characterData) => number; // Function that alters toHit chance based on the character's data.  i.e. elven ranger precision bonus.
  // TODO: damageEffect?: (characterData) => number; // Function that alters damage based on the character's data.  i.e. fighter damage bonus.
  // TODO: armorEffect?: (characterData) => number // Function that alters armor based on the character's data.  i.e. dwarven fury AC bonus.
  // TODO: How to handle effects with charges, like Mystic's Battle Trance?
  // TODO: Should I separate into passive and triggered and charge-based effects instead?
  // TODO: Should I define "functional components" that describe which equations this ability/proficiency alters and how?

  // TODO: There are a lot of abilities and proficiencies that grant a button that lets you do something for a proficiency roll.  Some of those
  //       are usable in combat (Combat Maneuvers?).  Some are largely out of combat (Perform, Craft, etc.).
}

/** If no subType is specified, then ALL subTypes are included. */
export interface AbilityFilter {
  def: AbilityOrProficiency;
  subTypes?: string[];
}
