import { CharacterClass } from "../types/characterClasses";
import { ClassFighter } from "./ClassFighter";
import { ClassMage } from "./ClassMage";

export const AllClasses: { [name: string]: CharacterClass } = {
  [ClassFighter.name]: ClassFighter,
  [ClassMage.name]: ClassMage,
};

export const AllClassesArray = Object.values(AllClasses).sort(
  (classA, classB) => {
    return classA.name.localeCompare(classB.name);
  }
);
