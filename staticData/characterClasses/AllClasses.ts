import { CharacterClass } from "../types/characterClasses";
import { ClassAntiPaladin } from "./ClassAntiPaladin";
import { ClassAssassin } from "./ClassAssassin";
import { ClassBarbarianIvoryKingdoms } from "./ClassBarbarianIvoryKingdoms";
import { ClassBarbarianJutland } from "./ClassBarbarianJutland";
import { ClassBarbarianSkysostan } from "./ClassBarbarianSkysostan";
import { ClassBard } from "./ClassBard";
import { ClassBattlegoatGatecrasher } from "./ClassBattlegoatGatecrasher";
import { ClassBladeDancer } from "./ClassBladeDancer";
import { ClassCleric } from "./ClassCleric";
import { ClassDwarvenCraftpriest } from "./ClassDwarvenCraftpriest";
import { ClassDwarvenDelver } from "./ClassDwarvenDelver";
import { ClassDwarvenFury } from "./ClassDwarvenFury";
import { ClassDwarvenMachinist } from "./ClassDwarvenMachinist";
import { ClassDwarvenVaultguard } from "./ClassDwarvenVaultguard";
import { ClassElvenCourtier } from "./ClassElvenCourtier";
import { ClassElvenEnchanter } from "./ClassElvenEnchanter";
import { ClassElvenNightblade } from "./ClassElvenNightblade";
import { ClassElvenRanger } from "./ClassElvenRanger";
import { ClassElvenSpellsword } from "./ClassElvenSpellsword";
import { ClassExplorer } from "./ClassExplorer";
import { ClassFighter } from "./ClassFighter";
import { ClassMage } from "./ClassMage";
import { ClassMystic } from "./ClassMystic";
import { ClassNobiranWonderworker } from "./ClassNobiranWonderworker";
import { ClassPaladin } from "./ClassPaladin";
import { ClassPriestess } from "./ClassPriestess";
import { ClassThief } from "./ClassThief";
import { ClassTrueTurtleGreatSnapper } from "./ClassTrueTurtleGreatSnapper";
import { ClassVenturer } from "./ClassVenturer";
import { ClassWildHarvester } from "./ClassWildHarvester";

export const AllClasses: { [name: string]: CharacterClass } = {
  [ClassAntiPaladin.name]: ClassAntiPaladin,
  [ClassAssassin.name]: ClassAssassin,
  [ClassBarbarianIvoryKingdoms.name]: ClassBarbarianIvoryKingdoms,
  [ClassBarbarianJutland.name]: ClassBarbarianJutland,
  [ClassBarbarianSkysostan.name]: ClassBarbarianSkysostan,
  [ClassBard.name]: ClassBard,
  [ClassBattlegoatGatecrasher.name]: ClassBattlegoatGatecrasher,
  [ClassBladeDancer.name]: ClassBladeDancer,
  [ClassCleric.name]: ClassCleric,
  [ClassDwarvenCraftpriest.name]: ClassDwarvenCraftpriest,
  [ClassDwarvenDelver.name]: ClassDwarvenDelver,
  [ClassDwarvenFury.name]: ClassDwarvenFury,
  [ClassDwarvenMachinist.name]: ClassDwarvenMachinist,
  [ClassDwarvenVaultguard.name]: ClassDwarvenVaultguard,
  [ClassElvenCourtier.name]: ClassElvenCourtier,
  [ClassElvenEnchanter.name]: ClassElvenEnchanter,
  [ClassElvenNightblade.name]: ClassElvenNightblade,
  [ClassElvenRanger.name]: ClassElvenRanger,
  [ClassElvenSpellsword.name]: ClassElvenSpellsword,
  [ClassExplorer.name]: ClassExplorer,
  [ClassFighter.name]: ClassFighter,
  [ClassMage.name]: ClassMage,
  [ClassMystic.name]: ClassMystic,
  [ClassNobiranWonderworker.name]: ClassNobiranWonderworker,
  [ClassPaladin.name]: ClassPaladin,
  [ClassPriestess.name]: ClassPriestess,
  [ClassThief.name]: ClassThief,
  [ClassTrueTurtleGreatSnapper.name]: ClassTrueTurtleGreatSnapper,
  [ClassVenturer.name]: ClassVenturer,
  [ClassWildHarvester.name]: ClassWildHarvester,
};

export const AllClassesArray = Object.values(AllClasses).sort((classA, classB) => {
  return classA.name.localeCompare(classB.name);
});
