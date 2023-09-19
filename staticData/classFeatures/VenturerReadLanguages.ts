import { AbilityOrProficiency } from "../types/abilitiesAndProficiencies";

export const VenturerReadLanguages: AbilityOrProficiency = {
  id: "Read Languages.Venturer",
  name: "Read Languages",
  description: [
    "Venturers can read languages, including ciphers, treasure maps, and dead " +
      "languages, but not magical writings. A proficiency throw of 5+ " +
      "on 1d20 is required. If the roll does not succeed, the venturer may " +
      "not try to read that particular piece of writing until he reaches a " +
      "higher level of experience.",
  ],
  minLevel: 1,
};
