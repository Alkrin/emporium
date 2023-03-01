import { CharacterClass } from "../types/characterClasses";
import { ClassFighter } from "./ClassFighter";
import { ClassMage } from "./ClassMage";

export const AllClasses: { [name: string]: CharacterClass } = {
  [ClassFighter.name]: ClassFighter,
  [ClassMage.name]: ClassMage,
};
