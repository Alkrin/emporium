import { CharacterClass } from "../types/characterClasses";
import { ClassAntiPaladin } from "./ClassAntiPaladin";
import { ClassAssassin } from "./ClassAssassin";
import { ClassBarbarianIvoryKingdoms } from "./ClassBarbarianIvoryKingdoms";
import { ClassBarbarianJutland } from "./ClassBarbarianJutland";
import { ClassBarbarianSkysostan } from "./ClassBarbarianSkysostan";
import { ClassBard } from "./ClassBard";
import { ClassBladeDancer } from "./ClassBladeDancer";
import { ClassCleric } from "./ClassCleric";
import { ClassDwarvenCraftpriest } from "./ClassDwarvenCraftpriest";
import { ClassDwarvenVaultguard } from "./ClassDwarvenVaultguard";
import { ClassElvenNightblade } from "./ClassElvenNightblade";
import { ClassElvenSpellsword } from "./ClassElvenSpellsword";
import { ClassExplorer } from "./ClassExplorer";
import { ClassFighter } from "./ClassFighter";
import { ClassMage } from "./ClassMage";
import { ClassThief } from "./ClassThief";

export const AllClasses: { [name: string]: CharacterClass } = {
  [ClassAntiPaladin.name]: ClassAntiPaladin,
  [ClassAssassin.name]: ClassAssassin,
  [ClassBarbarianIvoryKingdoms.name]: ClassBarbarianIvoryKingdoms,
  [ClassBarbarianJutland.name]: ClassBarbarianJutland,
  [ClassBarbarianSkysostan.name]: ClassBarbarianSkysostan,
  [ClassBard.name]: ClassBard,
  [ClassBladeDancer.name]: ClassBladeDancer,
  [ClassCleric.name]: ClassCleric,
  [ClassDwarvenCraftpriest.name]: ClassDwarvenCraftpriest,
  [ClassDwarvenVaultguard.name]: ClassDwarvenVaultguard,
  [ClassElvenNightblade.name]: ClassElvenNightblade,
  [ClassElvenSpellsword.name]: ClassElvenSpellsword,
  [ClassExplorer.name]: ClassExplorer,
  [ClassFighter.name]: ClassFighter,
  [ClassMage.name]: ClassMage,
  [ClassThief.name]: ClassThief,
};

export const AllClassesArray = Object.values(AllClasses).sort((classA, classB) => {
  return classA.name.localeCompare(classB.name);
});
