import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  AbilityDefData,
  CharacterAlignment,
  CharacterClassv2,
  CharacterData,
  EquipmentSetData,
  EquipmentSetItemData,
  Gender,
  ItemDefData,
  LocationData,
  ProficiencyData,
  emptyEquipmentData,
} from "../../serverAPI";
import { CharacterStat } from "../../staticData/types/characterClasses";
import styles from "./CreateCharacterDialog.module.scss";
import {
  getActiveAbilityComponentsForCharacter,
  getAllCharacterAssociatedItemIds,
  getCharacterMaxHP,
  getCharacterMaxHPv2,
  randomInt,
  rollDice,
} from "../../lib/characterUtils";
import { deleteCharacter, setActiveCharacterId, unsetAllHenchmenForCharacter } from "../../redux/charactersSlice";
import { deleteItem } from "../../redux/itemsSlice";
import { deleteProficienciesForCharacter } from "../../redux/proficienciesSlice";
import { deleteSpellbook } from "../../redux/spellbooksSlice";
import { deleteRepertoireForCharacter } from "../../redux/repertoiresSlice";
import { refetchProficiencies } from "../../dataSources/ProficienciesDataSource";
import { Dictionary } from "../../lib/dictionary";
import { RequestField_StartingEquipmentData } from "../../serverRequestTypes";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { refetchContracts } from "../../dataSources/ContractsDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { BasicDialog } from "../dialogs/BasicDialog";
import { ModalCloseButton } from "../ModalCloseButton";
import { DatabaseButton } from "../DatabaseButton";
import { DatabaseEquipmentSetsDialog } from "../database/DatabaseEquipmentSetsDialog";

interface State {
  nameText: string;
  gender: Gender;
  alignment: CharacterAlignment;
  level: number;
  xp: number;
  class_id: number;
  subclass_id: string;
  equipmentSetId: number;
  strength: number;
  intelligence: number;
  will: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  hitDice: number[];
  locationId: number;
  /** Feature id, subtype, rank. */
  selectableValues: [string, string, number][];
  isSaving: boolean;
}

interface ReactProps {
  isEditMode?: boolean;
}

interface InjectedProps {
  currentUserId: number;
  selectedCharacter?: CharacterData;
  selectedCharacterProficiencies?: ProficiencyData[];
  equipmentSetsByClass: Dictionary<EquipmentSetData[]>;
  equipmentSetsByClassv2: Record<number, EquipmentSetData[]>;
  equipmentSetItemsBySet: Dictionary<EquipmentSetItemData[]>;
  allItemDefs: Dictionary<ItemDefData>;
  allLocations: Dictionary<LocationData>;
  allAbilityDefs: Record<number, AbilityDefData>;
  allCharacterClasses: Record<number, CharacterClassv2>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateCharacterDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    if (props.isEditMode) {
      if (props.selectedCharacter) {
        // Load the selected character.
        const selectableValues: [string, string, number][] = [
          ["---", "", 0],
          ["---", "", 0],
          ["---", "", 0],
          ["---", "", 0],
        ];
        this.props.selectedCharacterProficiencies?.forEach((p) => {
          if (p.source.startsWith("Selectable")) {
            const pIndex = +p.source.slice(10) - 1;
            selectableValues[pIndex][0] = p.feature_id;
            selectableValues[pIndex][1] = p.subtype;
            selectableValues[pIndex][2] += 1;
          }
        });

        this.state = {
          nameText: props.selectedCharacter.name,
          gender: props.selectedCharacter.gender,
          alignment: props.selectedCharacter.alignment,
          level: props.selectedCharacter.level,
          xp: props.selectedCharacter.xp,
          class_id: props.selectedCharacter.class_id,
          subclass_id: props.selectedCharacter.subclass_id,
          equipmentSetId: 0,
          strength: props.selectedCharacter.strength,
          intelligence: props.selectedCharacter.intelligence,
          will: props.selectedCharacter.will,
          dexterity: props.selectedCharacter.dexterity,
          constitution: props.selectedCharacter.constitution,
          charisma: props.selectedCharacter.charisma,
          hitDice: props.selectedCharacter.hit_dice,
          locationId: props.selectedCharacter.location_id,
          selectableValues,
          isSaving: false,
        };
      }
    } else {
      // Start with blank character data.
      this.state = {
        nameText: "",
        gender: "m",
        alignment: CharacterAlignment.Lawful,
        level: 1,
        xp: 0,
        class_id: 0,
        subclass_id: "",
        equipmentSetId: 0,
        strength: 9,
        intelligence: 9,
        will: 9,
        dexterity: 9,
        constitution: 9,
        charisma: 9,
        hitDice: [4],
        locationId: 0,
        selectableValues: [
          ["---", "", 0],
          ["---", "", 0],
          ["---", "", 0],
          ["---", "", 0],
        ],
        isSaving: false,
      };
    }
  }

  render(): React.ReactNode {
    const selectedClass = this.props.allCharacterClasses[this.state.class_id];

    const maxLevel = selectedClass?.max_level ?? 1;
    if (this.state.level > maxLevel) {
      requestAnimationFrame(() => {
        this.setState({
          level: maxLevel,
          hitDice: this.state.hitDice.slice(0, Math.min(maxLevel - 1, 8)),
        });
      });
    }

    const minXP = selectedClass?.xp_to_level[this.state.level - 1] ?? 0;
    const maxXP = selectedClass?.xp_to_level[this.state.level] ?? "???";

    if (this.state.xp < minXP) {
      requestAnimationFrame(() => {
        this.setState({ xp: minXP });
      });
    }

    const minStrength = selectedClass?.stat_requirements[CharacterStat.Strength] ?? 3;
    if (this.state.strength < minStrength) {
      requestAnimationFrame(() => {
        this.setState({ strength: minStrength });
      });
    }
    const minIntelligence = selectedClass?.stat_requirements[CharacterStat.Intelligence] ?? 3;
    if (this.state.intelligence < minIntelligence) {
      requestAnimationFrame(() => {
        this.setState({ intelligence: minIntelligence });
      });
    }
    const minWill = selectedClass?.stat_requirements[CharacterStat.Will] ?? 3;
    if (this.state.will < minWill) {
      requestAnimationFrame(() => {
        this.setState({ will: minWill });
      });
    }
    const minDexterity = selectedClass?.stat_requirements[CharacterStat.Dexterity] ?? 3;
    if (this.state.dexterity < minDexterity) {
      requestAnimationFrame(() => {
        this.setState({ dexterity: minDexterity });
      });
    }
    const minConstitution = selectedClass?.stat_requirements[CharacterStat.Constitution] ?? 3;
    if (this.state.constitution < minConstitution) {
      requestAnimationFrame(() => {
        this.setState({ constitution: minConstitution });
      });
    }
    const minCharisma = selectedClass?.stat_requirements[CharacterStat.Charisma] ?? 3;
    if (this.state.charisma < minCharisma) {
      requestAnimationFrame(() => {
        this.setState({ charisma: minCharisma });
      });
    }

    const primeRequisites = selectedClass?.prime_requisites ?? [];

    const hitDieSize = selectedClass?.hit_die_size ?? 4;

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>
          {this.props.isEditMode
            ? `Editing Character v2 #${this.props.selectedCharacter?.id} (${this.props.selectedCharacter?.name})`
            : "Create New Character v2"}
        </div>
        <div className={styles.contentRow}>
          <div className={styles.nameLabel}>{"Name"}</div>
          <input
            className={styles.nameTextField}
            type={"text"}
            value={this.state.nameText}
            onChange={(e) => {
              this.setState({ nameText: e.target.value });
            }}
            spellCheck={false}
            autoFocus={true}
          />
          <div className={styles.rollPersonalsButton} onClick={this.onRerollPersonalsClicked.bind(this)}></div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.genderLabel}>{"Gender"}</div>
          <div className={styles.genderRadioGroup}>
            <input
              className={styles.radioButton}
              type="radio"
              value="m"
              name="gender"
              checked={this.state.gender === "m"}
              onChange={(e) => {
                this.setState({ gender: e.target.value as Gender });
              }}
            />
            <span className={styles.radioLabel}>{"Male"}</span>
            <input
              className={styles.radioButton}
              type="radio"
              value="f"
              name="gender"
              checked={this.state.gender === "f"}
              onChange={(e) => {
                this.setState({ gender: e.target.value as Gender });
              }}
            />
            <span className={styles.radioLabel}>{"Female"}</span>
            <input
              className={styles.radioButton}
              type="radio"
              value="o"
              name="gender"
              checked={this.state.gender === "o"}
              onChange={(e) => {
                this.setState({ gender: e.target.value as Gender });
              }}
            />
            <span className={styles.radioLabel}>{"Other"}</span>
          </div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.genderLabel}>{"Alignment"}</div>
          <div className={styles.genderRadioGroup}>
            <input
              className={styles.radioButton}
              type="radio"
              value={CharacterAlignment.Lawful}
              name="alignment"
              checked={this.state.alignment === CharacterAlignment.Lawful}
              onChange={(e) => {
                this.setState({ alignment: e.target.value as CharacterAlignment });
              }}
            />
            <span className={styles.radioLabel}>{CharacterAlignment.Lawful}</span>
            <input
              className={styles.radioButton}
              type="radio"
              value={CharacterAlignment.Neutral}
              name="alignment"
              checked={this.state.alignment === CharacterAlignment.Neutral}
              onChange={(e) => {
                this.setState({ alignment: e.target.value as CharacterAlignment });
              }}
            />
            <span className={styles.radioLabel}>{CharacterAlignment.Neutral}</span>
            <input
              className={styles.radioButton}
              type="radio"
              value={CharacterAlignment.Chaotic}
              name="alignment"
              checked={this.state.alignment === CharacterAlignment.Chaotic}
              onChange={(e) => {
                this.setState({ alignment: e.target.value as CharacterAlignment });
              }}
            />
            <span className={styles.radioLabel}>{CharacterAlignment.Chaotic}</span>
          </div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.classLabel}>{"Class"}</div>
          <select
            className={styles.classSelector}
            value={this.state.class_id}
            onChange={(e) => {
              this.setState({
                class_id: +e.target.value,
                selectableValues: [
                  ["---", "", 0],
                  ["---", "", 0],
                  ["---", "", 0],
                  ["---", "", 0],
                ],
                equipmentSetId: 0,
              });
            }}
          >
            <option value={0}>{"---"}</option>
            {this.getSortedClasses().map(({ id, name }) => {
              return (
                <option value={id} key={`class${id}`}>
                  {name}
                </option>
              );
            })}
          </select>

          <div className={styles.levelLabel}>{"Level"}</div>
          <input
            className={styles.levelTextField}
            type={"number"}
            value={this.state.level}
            min={1}
            max={maxLevel}
            onChange={(e) => {
              const level = +e.target.value;
              // We only roll hit dice up to L9.  Levels at 10+ grant a flat hp bonus.
              const numHitDice = Math.min(level, 9);
              const hitDice: number[] = this.state.hitDice.slice(0, numHitDice - 1);
              while (hitDice.length < numHitDice) {
                hitDice.push(rollDice(1, hitDieSize));
              }
              this.setState({ level, hitDice });
            }}
          />
        </div>

        {!this.props.isEditMode && (
          <div className={styles.contentRow}>
            <div className={styles.classLabel}>{"Equipment"}</div>
            <select
              className={styles.classSelector}
              value={this.state.equipmentSetId}
              onChange={(e) => {
                this.setState({
                  equipmentSetId: +e.target.value,
                });
              }}
              disabled={this.state.class_id === 0}
            >
              <option value={0}>---</option>
              {this.props.equipmentSetsByClassv2[this.state.class_id]?.map(({ name, id }) => {
                return (
                  <option value={id} key={`equipmentSet${name}`}>
                    {name}
                  </option>
                );
              })}
            </select>
            <DatabaseButton className={styles.databaseButton} onClick={this.onEquipmentSetDatabaseClicked.bind(this)} />
          </div>
        )}

        <div className={styles.contentRow}>
          <div className={styles.xpLabel}>{"XP"}</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.xp}
            min={minXP}
            onChange={(e) => {
              this.setState({ xp: +e.target.value });
            }}
            spellCheck={false}
          />
          <div className={styles.xpRangeLabel}>{`${minXP} - ${maxXP}`}</div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.column}>
            <div className={styles.row}>
              <div className={styles.strengthLabel}>
                {primeRequisites.includes(CharacterStat.Strength) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"STR"}
              </div>
              <input
                className={styles.strengthTextField}
                type={"number"}
                value={this.state.strength}
                min={minStrength}
                max={18}
                onChange={(e) => {
                  this.setState({ strength: +e.target.value });
                }}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.intelligenceLabel}>
                {primeRequisites.includes(CharacterStat.Intelligence) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"INT"}
              </div>
              <input
                className={styles.intelligenceTextField}
                type={"number"}
                value={this.state.intelligence}
                min={minIntelligence}
                max={18}
                onChange={(e) => {
                  this.setState({ intelligence: +e.target.value });
                }}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.willLabel}>
                {primeRequisites.includes(CharacterStat.Will) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"WILL"}
              </div>
              <input
                className={styles.willTextField}
                type={"number"}
                value={this.state.will}
                min={minWill}
                max={18}
                onChange={(e) => {
                  this.setState({ will: +e.target.value });
                }}
              />
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.row}>
              <div className={styles.dexterityLabel}>
                {primeRequisites.includes(CharacterStat.Dexterity) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"DEX"}
              </div>
              <input
                className={styles.dexterityTextField}
                type={"number"}
                value={this.state.dexterity}
                min={minDexterity}
                max={18}
                onChange={(e) => {
                  this.setState({ dexterity: +e.target.value });
                }}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.constitutionLabel}>
                {primeRequisites.includes(CharacterStat.Constitution) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"CON"}
              </div>
              <input
                className={styles.constitutionTextField}
                type={"number"}
                value={this.state.constitution}
                min={minConstitution}
                max={18}
                onChange={(e) => {
                  this.setState({ constitution: +e.target.value });
                }}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.charismaLabel}>
                {primeRequisites.includes(CharacterStat.Charisma) && (
                  <span className={styles.primeRequisiteLabel}>{"*"}</span>
                )}
                {"CHA"}
              </div>
              <input
                className={styles.charismaTextField}
                type={"number"}
                value={this.state.charisma}
                min={minCharisma}
                max={18}
                onChange={(e) => {
                  this.setState({ charisma: +e.target.value });
                }}
              />
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.rollStatsButton} onClick={this.onRerollClicked.bind(this)}></div>
          </div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.hitDiceLabel}>{`Hit Dice (d${hitDieSize})`}</div>
          <div className={styles.hitDiceWrapper}>
            {this.state.hitDice.map((hp, index) => {
              return (
                <div className={styles.hitDieWrapper} key={`hd${index}`}>
                  <span className={styles.hitDieLabel}>{`L${index + 1}`}</span>
                  <input
                    key={`hdtf${index}`}
                    className={styles.hitDieTextField}
                    type={"number"}
                    value={hp}
                    min={1}
                    max={hitDieSize}
                    onChange={(e) => {
                      const hitDice = [...this.state.hitDice];
                      hitDice[index] = +e.target.value;
                      this.setState({ hitDice });
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.column}>
            <div className={styles.rollHitpointsButton} onClick={this.onRerollHitpointsClicked.bind(this)}></div>
          </div>
        </div>

        {selectedClass?.selectable_class_features.length > 0 ? (
          <div className={styles.contentRow}>
            <div className={styles.column}>
              <div className={styles.selectablesTitle}>{"Selectable Features"}</div>
              {selectedClass.selectable_class_features.map((feature, featureIndex) => {
                return (
                  <div className={styles.row} key={`${feature.title}${featureIndex}`}>
                    <div className={styles.selectableName}>{feature.title}</div>
                    <select
                      className={styles.selectableSelector}
                      value={this.state.selectableValues[featureIndex].join(",")}
                      onChange={(e) => {
                        const selectableValues: [string, string, number][] = [...this.state.selectableValues];
                        if (e.target.value === "---") {
                          selectableValues[featureIndex] = ["---", "", 0];
                        } else {
                          const [featureId, subtype, rank] = e.target.value.split(",");
                          selectableValues[featureIndex][0] = featureId;
                          selectableValues[featureIndex][1] = subtype;
                          selectableValues[featureIndex][2] = +rank;
                        }
                        this.setState({ selectableValues });
                      }}
                    >
                      <option value={"---"}>---</option>
                      {feature.selections.map((filter) => {
                        const def = this.props.allAbilityDefs[filter.abilityDefId];
                        let subtype = filter.subtypes?.[0] ?? "";
                        let rank = filter.rank ?? 1;

                        let displayName = def.name;
                        if (subtype.length > 0) {
                          displayName = `${displayName} (${subtype})`;
                        }

                        return (
                          <option value={`${def.id},${subtype},${rank}`} key={`selectable${def.name}${subtype}`}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={styles.centeredContentRow}>
          <div className={styles.label}>{`Location: ${
            this.props.allLocations[this.state.locationId]?.name ?? "---"
          }\xa0\xa0`}</div>
          <EditButton onClick={this.onEditLocationClicked.bind(this)} />
        </div>

        <div className={styles.buttonRow}>
          {this.props.isEditMode && (
            <div className={styles.killOrReviveButton} onClick={this.onKillOrReviveClicked.bind(this)}>
              {this.props.selectedCharacter?.dead ? "Revive" : "Kill"}
            </div>
          )}

          <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
            {this.props.isEditMode ? "Save Changes" : "Save Character"}
          </div>

          {this.props.isEditMode && (
            <div className={styles.deleteButton} onClick={this.onDeleteClicked.bind(this)}>
              Delete
            </div>
          )}
        </div>

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
        <ModalCloseButton />
      </div>
    );
  }

  private async onKillOrReviveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    if (this.props.selectedCharacter?.dead) {
      // They were dead.  Revive them!
      await ServerAPI.reviveCharacter(this.props.selectedCharacter?.id ?? 0);
    } else {
      // They were alive.  Kill them!
      await ServerAPI.killCharacter(this.props.selectedCharacter?.id ?? 0);
    }

    if (this.props.dispatch) {
      await refetchCharacters(this.props.dispatch);
      await refetchContracts(this.props.dispatch);
    }

    this.setState({ isSaving: false });
    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
    // De-select the character (after the subPanel disappears).
    setTimeout(() => {
      this.props.dispatch?.(setActiveCharacterId(0));
    }, 500);
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid name?
    if (this.state.nameText.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please enter a Name for this character!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid class?
    if (this.state.class_id === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoClassError",
          content: () => <BasicDialog title={"Error!"} prompt={"Please select a Class for this character!"} />,
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid selectables?
    let hasValidSelectables: boolean = true;
    const selectedClass = this.props.allCharacterClasses[this.state.class_id];
    selectedClass.selectable_class_features?.forEach((_, featureIndex) => {
      if (this.state.selectableValues[featureIndex][0] === "---") {
        hasValidSelectables = false;
      }
    });
    if (!hasValidSelectables) {
      this.props.dispatch?.(
        showModal({
          id: "NoSelectableError",
          content: () => (
            <BasicDialog title={"Error!"} prompt={"Please choose an option for all Selectable Features!"} />
          ),
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Create a new character.
    const character: CharacterData = {
      id: this.props.selectedCharacter?.id ?? -1,
      user_id: this.props.currentUserId,
      name: this.state.nameText,
      gender: this.state.gender,
      alignment: this.state.alignment,
      portrait_url: "",
      class_name: "",
      class_id: this.state.class_id,
      subclass_id: this.state.subclass_id,
      level: this.state.level,
      strength: this.state.strength,
      intelligence: this.state.intelligence,
      will: this.state.will,
      dexterity: this.state.dexterity,
      constitution: this.state.constitution,
      charisma: this.state.charisma,
      xp: this.state.xp,
      hp: 0, // We'll replace this in a moment.
      hit_dice: this.state.hitDice,
      henchmaster_id: 0,
      // CXP Deductible is handled by the Activity resolution flow.
      remaining_cxp_deductible: 0,
      cxp_deductible_date: "",
      dead: false,
      location_id: this.state.locationId,
      maintenance_paid: 0,
      maintenance_date: getFirstOfThisMonthDateString(),
      xp_reserve: 0,
      proficiencies: [],
      languages: [],

      // EquipmentData values are ignored when editing a character.
      ...emptyEquipmentData,
    };
    // Have to calculate this separately so it can account for class and Constitution bonus.

    // TODO: Note that this does not currently account for components from starter gear.
    // TODO: If we are creating a new character, then we need to add components from any selected equipment set.
    character.hp = getCharacterMaxHPv2(character, getActiveAbilityComponentsForCharacter(character));

    if (this.props.isEditMode) {
      // Edit the character.
      const res = await ServerAPI.editCharacter(character, this.state.selectableValues);
    } else {
      // Send it to the server!
      const res = await ServerAPI.createCharacter(
        character,
        this.state.selectableValues,
        this.generateStartingEquipmentData()
      );
      if ("error" in res) {
        console.log("Failed to create character.");
      } else {
        // First output is the insert query.  Select that character.
        if ("insertId" in res[0]) {
          const iid = res[0].insertId;
          requestAnimationFrame(() => {
            this.props.dispatch?.(setActiveCharacterId(iid));
          });
        }
      }
    }

    // Refetch characters.
    if (this.props.dispatch) {
      // The character itself.
      await refetchCharacters(this.props.dispatch);
      // Their personal pile.
      await refetchStorages(this.props.dispatch);
      // Any selectable class features.
      await refetchProficiencies(this.props.dispatch);
      if (!this.props.isEditMode) {
        // Any starting equipment (only assigned when creating new characters).
        await refetchItems(this.props.dispatch);
      }
    }

    this.setState({ isSaving: false });

    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private generateStartingEquipmentData(): RequestField_StartingEquipmentData[] {
    const items = this.props.equipmentSetItemsBySet[this.state.equipmentSetId] ?? [];

    const data: RequestField_StartingEquipmentData[] = items.map((item) => {
      const def = this.props.allItemDefs[item.def_id];
      const count = def.purchase_quantity;
      const datum: RequestField_StartingEquipmentData = {
        ...item,
        count,
      };
      return datum;
    });

    return data;
  }

  private async onDeleteClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Confirmation dialog.
    this.props.dispatch?.(
      showModal({
        id: "DeleteCharacterConfirmation",
        content: () => {
          return (
            <BasicDialog
              title={"Delete Character"}
              prompt={`Are you sure you wish to delete ${this.props.selectedCharacter?.name}?  This will also destroy associated records like items, storages, etc.  Deletion cannot be undone.`}
              buttons={[
                {
                  text: "Delete",
                  onClick: async () => {
                    // Guaranteed true, but have to check to make intellisense shut up.
                    if (this.props.selectedCharacter) {
                      const res = await ServerAPI.deleteCharacter(this.props.selectedCharacter);

                      // Get rid of the confirmation modal.
                      this.props.dispatch?.(hideModal());
                      if ("error" in res) {
                        // Error modal.
                        this.props.dispatch?.(
                          showModal({
                            id: "DeleteCharacterError",
                            content: () => (
                              <BasicDialog title={"Error!"} prompt={"An Error occurred during character deltion."} />
                            ),
                          })
                        );
                      } else {
                        // Close the subPanel.
                        this.props.dispatch?.(hideSubPanel());
                        // Delay so the subpanel is fully gone before we clear out the local character data.
                        setTimeout(() => {
                          // Guaranteed true, but have to check to make intellisense shut up.
                          if (this.props.selectedCharacter) {
                            // Deselect the character.
                            this.props.dispatch?.(setActiveCharacterId(0));

                            // Update all local data.
                            // Proficiencies.
                            this.props.dispatch?.(deleteProficienciesForCharacter(this.props.selectedCharacter.id));
                            // Items.
                            const itemIds = getAllCharacterAssociatedItemIds(this.props.selectedCharacter.id);
                            itemIds.forEach((itemId) => {
                              // Spellbook data, if any.  No-op if it's not a spellbook.
                              this.props.dispatch?.(deleteSpellbook(itemId));
                              // The item itself.
                              this.props.dispatch?.(deleteItem(itemId));
                            });
                            // Repertoire.
                            this.props.dispatch?.(deleteRepertoireForCharacter(this.props.selectedCharacter.id));
                            // Henchmen.
                            this.props.dispatch?.(unsetAllHenchmenForCharacter(this.props.selectedCharacter.id));
                            // The character itself.
                            this.props.dispatch?.(deleteCharacter(this.props.selectedCharacter.id));
                            if (this.props.dispatch) {
                              refetchContracts(this.props.dispatch);
                            }
                          }
                        }, 300);
                      }
                      this.setState({ isSaving: false });
                    }
                  },
                },
                {
                  text: "Cancel",
                  onClick: async () => {
                    this.props.dispatch?.(hideModal());
                    this.setState({ isSaving: false });
                  },
                },
              ]}
            />
          );
        },
      })
    );
  }

  private onRerollPersonalsClicked(): void {
    // Pick two random letters for the name.
    const firstChar = String.fromCharCode("A".charCodeAt(0) + randomInt(0, 25));
    const secondChar = String.fromCharCode("a".charCodeAt(0) + randomInt(0, 25));
    const nameText = firstChar + secondChar;

    // Pick a random gender.
    const g = randomInt(0, 100);
    const gender = g === 0 ? "o" : g <= 50 ? "m" : "f";
    this.setState({ nameText, gender });
  }

  private onRerollClicked(): void {
    const characterClass = this.props.allCharacterClasses[this.state.class_id];
    const reqs: Record<CharacterStat, number> = characterClass?.stat_requirements ?? {
      [CharacterStat.Strength]: 0,
      [CharacterStat.Intelligence]: 0,
      [CharacterStat.Will]: 0,
      [CharacterStat.Dexterity]: 0,
      [CharacterStat.Constitution]: 0,
      [CharacterStat.Charisma]: 0,
    };

    this.setState({
      strength: this.rollStat(reqs[CharacterStat.Strength]),
      intelligence: this.rollStat(reqs[CharacterStat.Intelligence]),
      will: this.rollStat(reqs[CharacterStat.Will]),
      dexterity: this.rollStat(reqs[CharacterStat.Dexterity]),
      constitution: this.rollStat(reqs[CharacterStat.Constitution]),
      charisma: this.rollStat(reqs[CharacterStat.Charisma]),
    });
  }

  private onRerollHitpointsClicked(): void {
    const characterClass = this.props.allCharacterClasses[this.state.class_id];
    const hitDieSize = characterClass?.hit_die_size ?? 4;
    const hitDice: number[] = [...this.state.hitDice];
    for (let i = 0; i < hitDice.length; ++i) {
      hitDice[i] = rollDice(1, hitDieSize);
    }
    this.setState({ hitDice });
  }

  private rollStat(min: number): number {
    let stat: number = -1;
    while (stat < min) {
      stat = rollDice(3, 6);
    }
    return stat;
  }

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.state.locationId}
              onSelectionConfirmed={async (locationId) => {
                this.setState({ locationId });
              }}
            />
          );
        },
      })
    );
  }

  private getSortedClasses(): CharacterClassv2[] {
    const res: CharacterClassv2[] = Object.values(this.props.allCharacterClasses).sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return res;
  }

  private onEquipmentSetDatabaseClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "DatabaseEquipmentSets",
        content: () => {
          return <DatabaseEquipmentSetsDialog />;
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const selectedCharacter = state.characters.characters[state.characters.activeCharacterId];
  const selectedCharacterProficiencies = state.proficiencies.proficienciesByCharacterId[selectedCharacter?.id];
  const {
    equipmentSetsByClass,
    equipmentSetsByClassv2,
    equipmentSetItemsBySet,
    items: allItemDefs,
    characterClasses: allCharacterClasses,
    abilities: allAbilityDefs,
  } = state.gameDefs;
  const allLocations = state.locations.locations;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    selectedCharacter,
    selectedCharacterProficiencies,
    equipmentSetsByClass,
    equipmentSetsByClassv2,
    equipmentSetItemsBySet,
    allItemDefs,
    allLocations,
    allAbilityDefs,
    allCharacterClasses,
  };
}

export const CreateCharacterDialog = connect(mapStateToProps)(ACreateCharacterDialog);
