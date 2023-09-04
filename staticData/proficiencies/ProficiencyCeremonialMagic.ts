import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const ProficiencyCeremonialMagic: AbilityOrProficiency = {
  id: "Ceremonial Magic",
  name: "Ceremonial Magic",
  description: [
    "The character has studied the ceremonies of a particular tradition of ceremonial magic. The " +
      "character must choose the tradition at the time he chooses the proficiency. This proficiency " +
      "can be selected multiple times. The effect of this proficiency depends upon the class powers " +
      "of the character selecting it. " +
      "\n" +
      "If the character is neither a spellcaster nor a ceremonialist, then he becomes a 1st level " +
      "ceremonialist with a repertoire of one 1st level ceremony. He can perform ceremonies in the " +
      "tradition and create and use trinkets and talismans in the tradition as a 1st level ceremonialist, " +
      "and can identify trinkets or talismans created by a ceremonialist of the tradition with a proficiency " +
      "throw of 11+ and of other traditions with an 18+." +
      "\n" +
      "If the character is a spellcaster, but is not already a ceremonialist, he becomes a ceremonialist " +
      "of his caster level upon taking this proficiency. He can perform any ceremonies in the tradition " +
      "and create and use trinkets and talismans in the tradition as a ceremonialist of his caster level, " +
      "and can identify trinkets or talismans created by a ceremonialist of the tradition with a proficiency " +
      "throw of 11+ and of other traditions with an 18+. If the character is already a ceremonialist, he " +
      "can either reduce the proficiency throw required to identify trinkets and talismans of a tradition " +
      "he already knows by 4; learn another tradition; or add one ceremony (of any level he can cast) to " +
      "his repertoire.",
  ],
  minLevel: 1,
  subTypes: ["Antiquarian", "Chthonic", "Shamanic", "Sylvan", "Theurgical"],
};
