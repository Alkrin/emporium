import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterClassv2, CharacterData, ItemData, ItemDefData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterCombatSection.module.scss";
import {
  AbilityComponentInstance,
  AttackData,
  getAbilityComponentInstanceSourceName,
  getBonusString,
  getCharacterStatv2,
  getStatBonusForValue,
} from "../../../lib/characterUtils";
import { CharacterStat, NaturalWeapon } from "../../../staticData/types/characterClasses";
import {
  AbilityComponentMeleeDamageByLevel,
  AbilityComponentMeleeDamageByLevelData,
} from "../../../staticData/abilityComponents/AbilityComponentMeleeDamageByLevel";
import {
  AbilityComponentRangedDamageByLevel,
  AbilityComponentRangedDamageByLevelData,
} from "../../../staticData/abilityComponents/AbilityComponentRangedDamageByLevel";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  allItems: Record<number, ItemData>;
  allItemDefs: Record<number, ItemDefData>;
  character: CharacterData;
  characterClass: CharacterClassv2;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterCombatSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.combatTitle}>{"Combat"}</div>
        <div className={styles.horizontalLine} />
        {this.renderMeleeCombatSection()}
        {this.renderRangedCombatSection()}
      </div>
    );
  }

  private renderMeleeCombatSection(): React.ReactNode {
    const attacks = this.getMeleeAttackData();

    return (
      <div className={styles.column}>
        {attacks.map((data, index) => {
          return (
            <TooltipSource
              key={index}
              className={styles.combatTypeContainer}
              tooltipParams={{
                id: "MeleeExplanation",
                content: this.renderAttackTooltip.bind(this, data),
              }}
            >
              <div className={styles.combatTypeName}>{data.name}</div>
              <div className={styles.row}>
                <div className={styles.combatDamageRoll}>{`${data.damage.dice}d${data.damage.die}${
                  data.damage.bonus > 0 ? `+${data.damage.bonus}` : ""
                }${data.damage.bonus < 0 ? data.damage.bonus : ""}`}</div>
                <div className={styles.combatHitRoll}>{`${data.toHit >= 0 ? "+" : ""}${data.toHit} to hit`}</div>
              </div>
            </TooltipSource>
          );
        })}
      </div>
    );
  }

  private renderAttackTooltip(data: AttackData): React.ReactNode {
    return (
      <div className={styles.combatTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"Damage"}</div>
          <div className={styles.tooltipValue}>{getBonusString(data.damage.bonus)}</div>
        </div>
        <div className={styles.tooltipDivider} />
        {data.damageBonuses.map(([text, value]) => {
          return (
            <div className={styles.tooltipSourceRow} key={text}>
              <div className={styles.tooltipSource}>{text}</div>
              <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
            </div>
          );
        })}
        {data.conditionalDamageBonuses.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>{"Conditional Damage Bonuses"}</div>
            <div className={styles.tooltipDivider} />
            {data.conditionalDamageBonuses.map(([text, value]) => {
              return (
                <div className={styles.tooltipSourceRow} key={text}>
                  <div className={styles.tooltipSource}>{text}</div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
        <div style={{ height: "1vmin" }} />
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{"To Hit"}</div>
          <div className={styles.tooltipValue}>{getBonusString(data.toHit)}</div>
        </div>
        <div className={styles.tooltipDivider} />
        {data.hitBonuses.map(([text, value]) => {
          return (
            <div className={styles.tooltipSourceRow} key={text}>
              <div className={styles.tooltipSource}>{text}</div>
              <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
            </div>
          );
        })}
        {data.conditionalHitBonuses.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>{"Conditional Hit Bonuses"}</div>
            <div className={styles.tooltipDivider} />
            {data.conditionalHitBonuses.map(([text, value]) => {
              return (
                <div className={styles.tooltipSourceRow} key={text}>
                  <div className={styles.tooltipSource}>{text}</div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }

  private renderRangedCombatSection(): React.ReactNode {
    const attacks = this.getRangedAttackData();

    return (
      <div className={styles.column}>
        {attacks.map((data, index) => {
          return (
            <TooltipSource
              key={index}
              className={styles.combatTypeContainer}
              tooltipParams={{
                id: "RangedExplanation",
                content: this.renderAttackTooltip.bind(this, data),
              }}
            >
              <div className={styles.combatTypeName}>{data.name}</div>
              <div
                className={styles.combatTypeName}
              >{`Range: ${data.ranges.short}' / ${data.ranges.medium}' / ${data.ranges.long}' `}</div>
              <div className={styles.row}>
                <div className={styles.combatDamageRoll}>{`${data.damage.dice}d${data.damage.die}${
                  data.damage.bonus > 0 ? `+${data.damage.bonus}` : ""
                }${data.damage.bonus < 0 ? data.damage.bonus : ""}`}</div>
                <div className={styles.combatHitRoll}>{`${data.toHit >= 0 ? "+" : ""}${data.toHit} to hit`}</div>
              </div>
            </TooltipSource>
          );
        })}
      </div>
    );
  }

  private getMeleeAttackData(): AttackData[] {
    const { character, characterClass, allItems } = this.props;

    // What is equipped?
    const weapon1 = allItems[character.slot_melee1];
    const weapon2 = allItems[character.slot_melee2];

    // A character equipped with weaponry gets a single attack with it per round, though this
    // may be repeated via cleave attacks.
    const attacks: AttackData[] = [];

    // No weapons equipped.
    if (!weapon1 && !weapon2) {
      // If there are no melee natural attacks, we add the generic "unarmed strike".
      if (
        !characterClass.natural_weapons?.find((nw) => {
          return !nw.range || nw.range.long === 0;
        })
      ) {
        attacks.push(this.generateMeleeAttack([]));
      }
    } else if (weapon1 && weapon2) {
      attacks.push(this.generateMeleeAttack([weapon1, weapon2]));
    }
    // If one weapon equipped, show single attack data.
    else if (weapon1 || weapon2) {
      const weapon = weapon1 ?? weapon2;
      attacks.push(this.generateMeleeAttack([weapon]));
    }

    // Add any melee Natural Attacks.
    characterClass.natural_weapons?.forEach((naturalWeapon) => {
      if (!naturalWeapon.range || naturalWeapon.range.long === 0) {
        attacks.push(this.generateMeleeAttack([], naturalWeapon));
      }
    });

    return attacks;
  }

  private getRangedAttackData(): AttackData[] {
    const { character, characterClass, allItems } = this.props;

    const attacks: AttackData[] = [];

    // What is equipped?
    const rangedWeapon = allItems[character.slot_ranged];
    const rangedNaturalAttacks =
      characterClass.natural_weapons?.filter((nw) => {
        return (nw.range?.long ?? 0) > 0;
      }) ?? [];
    if (rangedWeapon) {
      // Weapon attack.
      attacks.push(this.generateRangedAttack(rangedWeapon));
    } else if (rangedNaturalAttacks.length > 0) {
      // Natural attacks.
      rangedNaturalAttacks.forEach((rna) => {
        attacks.push(this.generateRangedAttack(rna));
      });
    } else {
      // Improvised projectiles only.
      attacks.push(this.generateRangedAttack());
    }

    return attacks;
  }

  private generateMeleeAttack(weapons: ItemData[], naturalWeapon?: NaturalWeapon): AttackData {
    const { character, characterClass, allItemDefs, activeComponents } = this.props;

    const weapon1 = weapons.length > 0 ? weapons[0] : null;
    const weapon2 = weapons.length > 1 ? weapons[1] : null;
    const def1 = allItemDefs[weapon1?.def_id ?? 0];
    const def2 = allItemDefs[weapon2?.def_id ?? 0];

    const data: AttackData = {
      name: naturalWeapon?.name ?? "Unarmed Strike",
      damage: {
        dice: 1,
        die: 2,
        bonus: 0,
      },
      toHit: 0,
      ranges: { short: 0, medium: 0, long: 0 },
      damageBonuses: [],
      conditionalDamageBonuses: [],
      hitBonuses: [],
      conditionalHitBonuses: [],
    };

    if (naturalWeapon) {
      // Natural attacks.
      // TODO: ProgressionIndex will have an AbilityComponent for it eventually.
      const progressionIndex = 0;

      data.damage = { ...naturalWeapon.damageProgression[progressionIndex] };
      // If the roll inherently includes a damage bonus, record it.
      if (data.damage.bonus) {
        data.damageBonuses.push(["Base Damage Bonus", data.damage.bonus]);
        // Temporarily zero this.  It will come back when we combine damageBonuses at the end.
        data.damage.bonus = 0;
      }
      // If the attack inherently includes a hit bonus, record it.
      if (naturalWeapon.hitBonus) {
        data.hitBonuses.push(["Base Hit Bonus", naturalWeapon.hitBonus]);
      }
    }

    // Stat bonuses.
    const totalStr = getCharacterStatv2(character, CharacterStat.Strength, activeComponents);
    const strBonus = getStatBonusForValue(totalStr);
    const totalDex = getCharacterStatv2(character, CharacterStat.Dexterity, activeComponents);
    const dexBonus = getStatBonusForValue(totalDex);

    // Str damage bonus always applies to melee attacks.
    if (strBonus) {
      data.damageBonuses.push(["Str Bonus", strBonus]);
    }
    // Str or Dex adds to hit.
    // If the character has Weapon Finesse and is wielding 1h weapon(s), they can use the greater of Dex and Str bonus.
    let isFinesse = false;
    const hasFinesse = false;
    // TODO: Weapon Finesse will have an ability component for it eventually.
    if (hasFinesse) {
      if ((def1 && def2) || def1?.damage_dice || def2?.damage_dice) {
        if (dexBonus > strBonus) {
          isFinesse = true;
          data.hitBonuses.push(["Dex Bonus (Weapon Finesse)", dexBonus]);
        }
      }
    }
    if (!isFinesse) {
      data.hitBonuses.push(["Str Bonus", strBonus]);
    }

    // Level-based hit bonus.
    const lbb = characterClass.to_hit_bonus[character.level - 1];
    if (lbb > 0) {
      data.hitBonuses.push(["Level Bonus", lbb]);
    }

    // Dual-wielding grants +1 to hit.
    if (def1 && def2) {
      data.hitBonuses.push(["Dual Wielding", 1]);

      // Fighting Style (Two Weapons) grants an extra +1 to hit.
      const hasTwoWeaponFightingStyle = false;
      // TODO: Fighting Style (Two Weapons) will have an ability component for it eventually.
      if (hasTwoWeaponFightingStyle) {
        data.hitBonuses.push(["Fighting Style (Two Weapons)", 1]);
      }
    }

    // Fighting Style (Single Weapon) grants +1 to hit.
    const hasSingleWeaponFightingStyle = false;
    // TODO: Fighting Style (Single Weapon) will have an ability component for it eventually.
    if (hasSingleWeaponFightingStyle) {
      if ((def1 && !def2) || (def2 && !def1)) {
        data.hitBonuses.push(["Fighting Style (Single Weapon)", 1]);
      }
    }

    // Ability Component bonuses.
    if ((activeComponents[AbilityComponentMeleeDamageByLevel.id]?.length ?? 0) > 0) {
      activeComponents[AbilityComponentMeleeDamageByLevel.id].forEach((instance) => {
        const instanceData = instance.data as AbilityComponentMeleeDamageByLevelData;
        data.damageBonuses.push([
          getAbilityComponentInstanceSourceName(instance),
          instanceData.damage_by_level[instance.characterLevel] ?? 0,
        ]);
      });
    }

    // If both weapons equipped, show dual wield data.
    if (def1 && def2) {
      const outputOne = def1.damage_dice * def1.damage_die + def1.magic_bonus;
      const outputTwo = def2.damage_dice * def2.damage_die + def2.magic_bonus;
      if (outputTwo > outputOne) {
        // Weapon two is better.
        data.damage.dice = def2.damage_dice;
        data.damage.die = def2.damage_die;
        if (def2.magic_bonus !== 0) {
          data.damageBonuses.push([def2.name, def2.magic_bonus]);
        }
      } else {
        // Weapon one is equal/better.
        data.damage.dice = def1.damage_dice;
        data.damage.die = def1.damage_die;
        if (def1.magic_bonus !== 0) {
          data.damageBonuses.push([def1.name, def1.magic_bonus]);
        }
      }
      data.name = `${def1.name} & ${def2.name}`;
    }
    // If one weapon equipped, show single attack data.
    else if (def1 || def2) {
      const def = def1 ?? def2;
      if (def.damage_dice_2h && character.slot_shield === 0) {
        data.damage.dice = def.damage_dice_2h;
        data.damage.die = def.damage_die_2h;
        // Fighting Style (Two-handed Weapon) gives +1 damage.
        const hasTwoHandedFightingStyle = false;
        // TODO: Fighting Style (Two-handed Weapon) will have an ability component for it eventually.
        if (hasTwoHandedFightingStyle) {
          if ((def1 && !def2) || (def2 && !def1)) {
            data.damageBonuses.push(["Fighting Style (Two-handed Weapon)", 1]);
          }
        }
      } else {
        data.damage.dice = def.damage_dice;
        data.damage.die = def.damage_die;
      }
      if (def.magic_bonus !== 0) {
        data.damageBonuses.push([def.name, def.magic_bonus]);
      }
      data.name = def.name;
    }

    // At the end, reduce the bonuses to a single number for convenience.
    data.damage.bonus = data.damageBonuses.reduce<number>((total, [source, value]) => total + value, data.damage.bonus);
    data.toHit = data.hitBonuses.reduce<number>((total, [source, value]) => total + value, data.toHit);

    return data;
  }

  private generateRangedAttack(weapon?: ItemData | NaturalWeapon): AttackData {
    const { character, characterClass, allItemDefs, activeComponents } = this.props;

    function isItem(weapon: ItemData | NaturalWeapon): weapon is ItemData {
      return "def_id" in weapon;
    }

    const data: AttackData = {
      name: "Improvised Projectile",
      damage: {
        dice: 1,
        die: 2,
        bonus: 0,
      },
      toHit: 0,
      ranges: { short: 10, medium: 20, long: 30 },
      damageBonuses: [],
      conditionalDamageBonuses: [],
      hitBonuses: [],
      conditionalHitBonuses: [],
    };

    if (weapon) {
      if (isItem(weapon)) {
        const def = allItemDefs[weapon?.def_id];
        data.name = def.name;
        data.damage.dice = def.damage_dice;
        data.damage.die = def.damage_die;
        data.ranges = { short: def.range_short, medium: def.range_medium, long: def.range_long };

        // Magic weapon bonus/penalty.
        if (def && def.magic_bonus !== 0) {
          data.damageBonuses.push([def.name, def.magic_bonus]);
          data.hitBonuses.push([def.name, def.magic_bonus]);
        }

        // Fighting Style (Missile Weapon) grants +1 to hit.
        const hasMissileWeaponFightingStyle = false;
        // TODO: Fighting Style (Missile Weapon) will have an ability component for it eventually.
        if (hasMissileWeaponFightingStyle) {
          data.hitBonuses.push(["Fighting Style (Missile Weapon)", 1]);
        }

        // TODO: Once we can detect throwable melee weapons, we need to add Str damage bonus.
      } else {
        data.name = weapon.name;
        // Natural attacks.
        // TODO: ProgressionIndex will have an AbilityComponent for it eventually.
        const progressionIndex = 0;

        data.damage = { ...weapon.damageProgression[progressionIndex] };
        // If the roll inherently includes a damage bonus, record it.
        if (data.damage.bonus) {
          data.damageBonuses.push(["Base Damage Bonus", data.damage.bonus]);
          // Temporarily zero this.  It will come back when we combine damageBonuses at the end.
          data.damage.bonus = 0;
        }
        // If the attack inherently includes a hit bonus, record it.
        if (weapon.hitBonus) {
          data.hitBonuses.push(["Base Hit Bonus", weapon.hitBonus]);
        }

        // TODO: Abilities/proficiencies specific to natural attacks.
      }
    }

    // By default, you get the Dexterity bonus to hit.
    const totalDex = getCharacterStatv2(character, CharacterStat.Dexterity, activeComponents);
    const dexBonus = getStatBonusForValue(totalDex);
    data.hitBonuses.push(["Dex Bonus", dexBonus]);

    // Level-based hit bonus.
    const lbb = characterClass.to_hit_bonus[character.level - 1];
    if (lbb > 0) {
      data.hitBonuses.push(["Level Bonus", lbb]);
    }

    // Ability Component bonuses.
    if ((activeComponents[AbilityComponentRangedDamageByLevel.id]?.length ?? 0) > 0) {
      activeComponents[AbilityComponentRangedDamageByLevel.id].forEach((instance) => {
        const instanceData = instance.data as AbilityComponentRangedDamageByLevelData;
        data.damageBonuses.push([
          getAbilityComponentInstanceSourceName(instance),
          instanceData.damage_by_level[instance.characterLevel] ?? 0,
        ]);
      });
    }

    // At the end, reduce the bonuses to a single number for convenience.
    data.damage.bonus = data.damageBonuses.reduce<number>((total, [source, value]) => total + value, data.damage.bonus);
    data.toHit = data.hitBonuses.reduce<number>((total, [source, value]) => total + value, data.toHit);

    return data;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allItems } = state.items;
  const { items: allItemDefs } = state.gameDefs;
  const character = state.characters.characters[props.characterId ?? 1] ?? null;
  const characterClass = state.gameDefs.characterClasses[character?.class_id] ?? null;
  return {
    ...props,
    allItems,
    allItemDefs,
    character,
    characterClass,
  };
}

export const CharacterCombatSection = connect(mapStateToProps)(ACharacterCombatSection);
