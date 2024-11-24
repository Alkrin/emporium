import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { deleteCharacterClass, updateCharacterClass } from "../../redux/gameDefsSlice";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import ServerAPI, { AbilityDefData, CharacterClassv2 } from "../../serverAPI";
import { SearchableDef } from "./SearchableDefList";
import { BasicDialog } from "../dialogs/BasicDialog";
import { DatabaseEditingDialog } from "./databaseEditingDialog/DatabaseEditingDialog";
import { DatabaseEditingDialogField, DatabaseEditingDialogFieldDef } from "./databaseEditingDialog/databaseUtils";
import { CharacterStat, SavingThrowType, WeaponStyle } from "../../staticData/types/characterClasses";
import { WeaponCategory, WeaponType } from "../../staticData/types/items";
import { AbilityFilterv2 } from "../../staticData/types/abilitiesAndProficiencies";

interface ReactProps {}

interface InjectedProps {
  allCharacterClasses: Dictionary<CharacterClassv2>;
  allAbilities: Dictionary<AbilityDefData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseCharacterClassesDialog extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <DatabaseEditingDialog
        title={"Character Class Database"}
        allDefs={this.props.allCharacterClasses}
        fieldDefs={this.getFieldDefs.bind(this)}
        onSaveClicked={this.onSaveClicked.bind(this)}
        onDeleteConfirmed={this.onDeleteConfirmed.bind(this)}
      />
    );
  }

  private getFieldDefs(data: Partial<CharacterClassv2>): DatabaseEditingDialogFieldDef[] {
    // ID and Name are handled automatically, so we don't have to include them here.

    const maxLevel: number = data.max_level ?? 1;
    const emptyLevels: string[] = Array(maxLevel).fill("");
    const levelLabels: string[] = emptyLevels.map((_, index) => `\xa0L${index + 1}`);

    return [
      { type: DatabaseEditingDialogField.LongString, labelTexts: ["Description"], fieldNames: ["description"] },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Max Level"],
        fieldNames: ["max_level"],
        fieldSizes: ["5vmin"],
        defaults: [1],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Hit Die Size", "\xa0(4,6,8,10,12)"],
        fieldNames: ["hit_die_size"],
        fieldSizes: ["5vmin"],
        defaults: [4],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["HP Per Level at L10+"],
        fieldNames: ["hp_step"],
        fieldSizes: ["5vmin"],
        defaults: [1],
      },
      {
        type: DatabaseEditingDialogField.NamedValues,
        labelTexts: ["Prime Requisite(s)"],
        fieldNames: ["prime_requisites"],
        extra: {
          prompt: "Select Prime Requisites",
          availableValues: Object.values(CharacterStat).map((cs) => [cs, cs]),
        },
      },
      {
        type: DatabaseEditingDialogField.Dictionary,
        labelTexts: ["Stat Requirements"],
        fieldNames: ["stat_requirements"],
        extra: {
          fields: [
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Strength],
              fieldNames: [CharacterStat.Strength],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Intelligence],
              fieldNames: [CharacterStat.Intelligence],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Will],
              fieldNames: [CharacterStat.Will],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Dexterity],
              fieldNames: [CharacterStat.Dexterity],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Constitution],
              fieldNames: [CharacterStat.Constitution],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
            {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [CharacterStat.Charisma],
              fieldNames: [CharacterStat.Charisma],
              fieldSizes: ["5vmin"],
              defaults: [0],
            },
          ],
        },
      },
      {
        type: DatabaseEditingDialogField.Dictionary,
        labelTexts: ["XP To Level"],
        fieldNames: ["xp_to_level"],
        extra: {
          fields: emptyLevels.map((_, index) => {
            return {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [levelLabels[index]],
              fieldNames: [index.toString()],
              fieldSizes: ["6vmin"],
              defaults: [0],
            };
          }),
        },
      },
      {
        type: DatabaseEditingDialogField.Dictionary,
        labelTexts: ["To Hit Bonus"],
        fieldNames: ["to_hit_bonus"],
        extra: {
          fields: emptyLevels.map((_, index) => {
            return {
              type: DatabaseEditingDialogField.Number,
              labelTexts: [levelLabels[index]],
              fieldNames: [index.toString()],
              fieldSizes: ["6vmin"],
              defaults: [0],
            };
          }),
        },
      },
      {
        type: DatabaseEditingDialogField.NamedValues,
        labelTexts: ["Weapon Styles"],
        fieldNames: ["weapon_styles"],
        extra: {
          prompt: "Select which types of weaponry this class can equip.",
          availableValues: Object.values(WeaponStyle)
            .sort()
            .map((ws) => [ws, ws]),
        },
      },
      {
        type: DatabaseEditingDialogField.NamedValues,
        labelTexts: ["Weapon Categories (if limited)"],
        fieldNames: ["weapon_category_permissions"],
        extra: {
          prompt:
            "If any Weapon Categories are selected, then this class may only equip weapons of the selected categories.  Otherwise, all categories are permitted.",
          availableValues: Object.values(WeaponCategory)
            .sort()
            .map((wc) => [wc, wc]),
        },
      },
      {
        type: DatabaseEditingDialogField.NamedValues,
        labelTexts: ["Weapon Types (if limited)"],
        fieldNames: ["weapon_type_permissions"],
        extra: {
          prompt:
            "If any Weapon Types are selected, then this class may only equip weapons of the selected types.  Otherwise, all types are permitted.",
          availableValues: Object.values(WeaponType)
            .sort()
            .map((wt) => [wt, wt]),
        },
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Natural Weapons"],
        fieldNames: ["natural_weapons"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.Dictionary,
            labelTexts: [""],
            fieldNames: [""],
            extra: {
              fields: [
                {
                  type: DatabaseEditingDialogField.LongString,
                  labelTexts: ["Name"],
                  fieldNames: ["name"],
                  fieldSizes: ["1.7vmin"],
                },
                {
                  type: DatabaseEditingDialogField.Number,
                  labelTexts: ["Count"],
                  fieldNames: ["count"],
                  fieldSizes: ["5vmin"],
                  defaults: [1],
                },
                {
                  type: DatabaseEditingDialogField.Number,
                  labelTexts: ["Hit Bonus"],
                  fieldNames: ["hitBonus"],
                  fieldSizes: ["5vmin"],
                  defaults: [0],
                },
                {
                  type: DatabaseEditingDialogField.ResizableArray,
                  labelTexts: ["Damage Progression"],
                  fieldNames: ["damageProgression"],
                  extra: {
                    entryDef: {
                      type: DatabaseEditingDialogField.Dictionary,
                      labelTexts: [""],
                      fieldNames: [""],
                      extra: {
                        fields: [
                          {
                            type: DatabaseEditingDialogField.Numbers,
                            labelTexts: ["", "\xa0d", "\xa0+"],
                            fieldNames: ["dice", "die", "bonus"],
                            fieldSizes: ["2vmin", "2vmin", "2vmin"],
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Max Base AC"],
        fieldNames: ["max_base_armor"],
        fieldSizes: ["5vmin"],
        defaults: [0],
      },
      {
        type: DatabaseEditingDialogField.Number,
        labelTexts: ["Cleave Multiplier", "\xa0(0, 0.5, 1)"],
        fieldNames: ["cleave_multiplier"],
        fieldSizes: ["5vmin"],
        defaults: [1],
      },
      {
        type: DatabaseEditingDialogField.Dictionary,
        labelTexts: ["Saving Throws"],
        fieldNames: ["saving_throws"],
        extra: {
          fields: [
            {
              type: DatabaseEditingDialogField.NumberArray,
              labelTexts: levelLabels,
              fieldNames: [SavingThrowType.Paralysis],
              fieldSizes: ["2vmin"],
              extra: {
                headerText: SavingThrowType.Paralysis,
                decimalDigits: 0,
                arraySize: maxLevel,
              },
            },
            {
              type: DatabaseEditingDialogField.NumberArray,
              labelTexts: levelLabels,
              fieldNames: [SavingThrowType.Death],
              fieldSizes: ["2vmin"],
              extra: {
                headerText: SavingThrowType.Death,
                decimalDigits: 0,
                arraySize: maxLevel,
              },
            },
            {
              type: DatabaseEditingDialogField.NumberArray,
              labelTexts: levelLabels,
              fieldNames: [SavingThrowType.Blast],
              fieldSizes: ["2vmin"],
              extra: {
                headerText: SavingThrowType.Blast,
                decimalDigits: 0,
                arraySize: maxLevel,
              },
            },
            {
              type: DatabaseEditingDialogField.NumberArray,
              labelTexts: levelLabels,
              fieldNames: [SavingThrowType.Implements],
              fieldSizes: ["2vmin"],
              extra: {
                headerText: SavingThrowType.Implements,
                decimalDigits: 0,
                arraySize: maxLevel,
              },
            },
            {
              type: DatabaseEditingDialogField.NumberArray,
              labelTexts: levelLabels,
              fieldNames: [SavingThrowType.Spells],
              fieldSizes: ["2vmin"],
              extra: {
                headerText: SavingThrowType.Spells,
                decimalDigits: 0,
                arraySize: maxLevel,
              },
            },
          ],
        },
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Class Features"],
        fieldNames: ["class_features"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.AbilityInstance,
            labelTexts: [""],
            fieldNames: [""],
          },
        },
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Selectable Class Features"],
        fieldNames: ["selectable_class_features"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.Dictionary,
            labelTexts: [""],
            fieldNames: [""],
            extra: {
              fields: [
                {
                  type: DatabaseEditingDialogField.LongString,
                  labelTexts: ["Title"],
                  fieldNames: ["title"],
                  fieldSizes: ["1.7vmin"],
                },
                {
                  type: DatabaseEditingDialogField.ResizableArray,
                  labelTexts: ["Available Class Features"],
                  fieldNames: ["selections"],
                  extra: {
                    entryDef: {
                      type: DatabaseEditingDialogField.AbilityFilter,
                      labelTexts: [""],
                      fieldNames: [""],
                    },
                  },
                },
              ],
            },
          },
        },
      },
      {
        type: DatabaseEditingDialogField.NamedValue,
        labelTexts: ["Class Proficiencies at"],
        fieldNames: ["class_proficiencies_at"],
        extra: {
          prompt: "At what levels does this class gain new Class Proficiencies?",
          availableValues: [
            ["1, 3, 6, 9, 12", [1, 3, 6, 9, 12]],
            ["1, 4, 8, 12", [1, 4, 8, 12]],
            ["1, 6, 12", [1, 6, 12]],
          ],
        },
      },
      {
        type: DatabaseEditingDialogField.NamedValues,
        labelTexts: ["Class Proficiencies"],
        fieldNames: ["class_proficiencies"],
        extra: {
          prompt: "What proficiencies count as Class Proficiencies for this class?",
          availableValues: this.getProficiencyEntries(),
        },
      },
      {
        type: DatabaseEditingDialogField.ResizableArray,
        labelTexts: ["Subclasses"],
        fieldNames: ["subclasses"],
        extra: {
          entryDef: {
            type: DatabaseEditingDialogField.Dictionary,
            labelTexts: [""],
            fieldNames: [""],
            extra: {
              fields: [
                {
                  type: DatabaseEditingDialogField.LongString,
                  labelTexts: ["Name"],
                  fieldNames: ["name"],
                  fieldSizes: ["1.7vmin"],
                },
                {
                  type: DatabaseEditingDialogField.LongString,
                  labelTexts: ["Description"],
                  fieldNames: ["description"],
                },
                {
                  type: DatabaseEditingDialogField.NamedValues,
                  labelTexts: ["Weapon Styles (added to base)"],
                  fieldNames: ["weapon_styles"],
                  extra: {
                    prompt: "Select which types of weaponry this class can equip.",
                    availableValues: Object.values(WeaponStyle)
                      .sort()
                      .map((ws) => [ws, ws]),
                  },
                },
                {
                  type: DatabaseEditingDialogField.NamedValues,
                  labelTexts: ["Weapon Categories (if limited) (added to base)"],
                  fieldNames: ["weapon_category_permissions"],
                  extra: {
                    prompt:
                      "If any Weapon Categories are selected, then this class may only equip weapons of the selected categories.  Otherwise, all categories are permitted.",
                    availableValues: Object.values(WeaponCategory)
                      .sort()
                      .map((wc) => [wc, wc]),
                  },
                },
                {
                  type: DatabaseEditingDialogField.NamedValues,
                  labelTexts: ["Weapon Types (if limited) (added to base)"],
                  fieldNames: ["weapon_type_permissions"],
                  extra: {
                    prompt:
                      "If any Weapon Types are selected, then this class may only equip weapons of the selected types.  Otherwise, all types are permitted.",
                    availableValues: Object.values(WeaponType)
                      .sort()
                      .map((wt) => [wt, wt]),
                  },
                },
                {
                  type: DatabaseEditingDialogField.Number,
                  labelTexts: ["Max Base AC (replaces base)"],
                  fieldNames: ["max_base_armor"],
                  fieldSizes: ["5vmin"],
                  defaults: [0],
                },
                {
                  type: DatabaseEditingDialogField.ResizableArray,
                  labelTexts: ["Class Features (added to base)"],
                  fieldNames: ["class_features"],
                  extra: {
                    entryDef: {
                      type: DatabaseEditingDialogField.AbilityInstance,
                      labelTexts: [""],
                      fieldNames: [""],
                    },
                  },
                },
                {
                  type: DatabaseEditingDialogField.ResizableArray,
                  labelTexts: ["Selectable Class Features (added to base)"],
                  fieldNames: ["selectable_class_features"],
                  extra: {
                    entryDef: {
                      type: DatabaseEditingDialogField.Dictionary,
                      labelTexts: [""],
                      fieldNames: [""],
                      extra: {
                        fields: [
                          {
                            type: DatabaseEditingDialogField.LongString,
                            labelTexts: ["Title"],
                            fieldNames: ["title"],
                            fieldSizes: ["1.7vmin"],
                          },
                          {
                            type: DatabaseEditingDialogField.ResizableArray,
                            labelTexts: ["Available Class Features"],
                            fieldNames: ["selections"],
                            extra: {
                              entryDef: {
                                type: DatabaseEditingDialogField.AbilityFilter,
                                labelTexts: [""],
                                fieldNames: [""],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
                {
                  type: DatabaseEditingDialogField.NamedValues,
                  labelTexts: ["Class Proficiencies (added to base)"],
                  fieldNames: ["class_proficiencies"],
                  extra: {
                    prompt: "What proficiencies count as Class Proficiencies for this class?",
                    availableValues: this.getProficiencyEntries(),
                  },
                },
              ],
            },
          },
        },
      },
    ];
  }

  private getProficiencyEntries(): [string, AbilityFilterv2][] {
    const entries: [string, AbilityFilterv2][] = [];

    Object.values(this.props.allAbilities).forEach((abilityDef) => {
      if ((abilityDef.subtypes?.length ?? 0) > 0) {
        // One entry for all subtypes.
        entries.push([`${abilityDef.name} (All)`, { abilityDefId: abilityDef.id, rank: 1, subtypes: [] }]);
        // One entry for each individual subtype.
        [...abilityDef.subtypes].sort().forEach((subtype) => {
          entries.push([
            `${abilityDef.name} (${subtype})`,
            { abilityDefId: abilityDef.id, rank: 1, subtypes: [subtype] },
          ]);
        });
      } else {
        entries.push([abilityDef.name, { abilityDefId: abilityDef.id, rank: 1, subtypes: [] }]);
      }
    });

    return entries;
  }

  private async onSaveClicked(untypedData: SearchableDef): Promise<number> {
    const data = untypedData as CharacterClassv2;

    if (data.id === 0) {
      // Brand new def.
      const res = await ServerAPI.createCharacterClass(data);

      if ("insertId" in res) {
        // Put the real id into our data.
        data.id = res.insertId;

        // Push the data into Redux.
        this.props.dispatch?.(updateCharacterClass(data));

        return res.insertId;
      } else {
        return 0;
      }
    } else {
      // Editing old def.
      const res = await ServerAPI.editCharacterClass(data);

      if ("error" in res) {
        this.props.dispatch?.(
          showModal({
            id: "EditDefFailure",
            content: () => <BasicDialog title={"Error!"} prompt={"Changes were not saved.  Please try again."} />,
          })
        );
        return data.id;
      } else {
        // Push the modified data into Redux.
        this.props.dispatch?.(updateCharacterClass(data));
        return data.id;
      }
    }
  }

  private async onDeleteConfirmed(defId: number): Promise<boolean> {
    const res = await ServerAPI.deleteCharacterClass(defId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteCharacterClass(defId));
      return true;
    } else {
      return false;
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacterClasses = state.gameDefs.characterClasses;
  const allAbilities = state.gameDefs.abilities;
  return {
    ...props,
    allCharacterClasses,
    allAbilities,
  };
}

export const DatabaseCharacterClassesDialog = connect(mapStateToProps)(ADatabaseCharacterClassesDialog);
