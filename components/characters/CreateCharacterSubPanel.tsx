import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  CharacterData,
  EquipmentSetData,
  EquipmentSetItemData,
  Gender,
  ItemDefData,
  LocationData,
  ProficiencyData,
  emptyEquipmentData,
} from "../../serverAPI";
import { AllClasses, AllClassesArray } from "../../staticData/characterClasses/AllClasses";
import { CharacterStat } from "../../staticData/types/characterClasses";
import styles from "./CreateCharacterSubPanel.module.scss";
import { getAllCharacterAssociatedItemIds, getCharacterMaxHP, randomInt } from "../../lib/characterUtils";
import { deleteCharacter, setActiveCharacterId, unsetAllHenchmenForCharacter } from "../../redux/charactersSlice";
import { deleteItem } from "../../redux/itemsSlice";
import { deleteProficienciesForCharacter } from "../../redux/proficienciesSlice";
import { deleteSpellbook } from "../../redux/spellbooksSlice";
import { deleteRepertoireForCharacter } from "../../redux/repertoiresSlice";
import { refetchProficiencies } from "../../dataSources/ProficienciesDataSource";
import { AbilityFilter } from "../../staticData/types/abilitiesAndProficiencies";
import { SubPanelCloseButton } from "../SubPanelCloseButton";
import { Dictionary } from "../../lib/dictionary";
import { RequestField_StartingEquipmentData } from "../../serverRequestTypes";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { getFirstOfThisMonthDateString } from "../../lib/stringUtils";
import { refetchContracts } from "../../dataSources/ContractsDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";

interface State {
  nameText: string;
  gender: Gender;
  level: number;
  xp: number;
  class: string;
  equipmentSetId: number;
  strength: number;
  intelligence: number;
  wisdom: number;
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
  equipmentSetItemsBySet: Dictionary<EquipmentSetItemData[]>;
  allItemDefs: Dictionary<ItemDefData>;
  allLocations: Dictionary<LocationData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateCharacterSubPanel extends React.Component<Props, State> {
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
          level: props.selectedCharacter.level,
          xp: props.selectedCharacter.xp,
          class: props.selectedCharacter.class_name,
          equipmentSetId: 0,
          strength: props.selectedCharacter.strength,
          intelligence: props.selectedCharacter.intelligence,
          wisdom: props.selectedCharacter.wisdom,
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
        level: 1,
        xp: 0,
        class: "---",
        equipmentSetId: 0,
        strength: 9,
        intelligence: 9,
        wisdom: 9,
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
    const selectedClass = AllClasses[this.state.class];

    const maxLevel = selectedClass?.xpToLevel.length ?? 1;
    if (this.state.level > maxLevel) {
      requestAnimationFrame(() => {
        this.setState({
          level: maxLevel,
          hitDice: this.state.hitDice.slice(0, maxLevel - 1),
        });
      });
    }

    const minXP = selectedClass?.xpToLevel[this.state.level - 1] ?? 0;
    const maxXP = selectedClass?.xpToLevel[this.state.level] ?? "???";

    if (this.state.xp < minXP) {
      requestAnimationFrame(() => {
        this.setState({ xp: minXP });
      });
    }

    const minStrength = selectedClass?.statRequirements[CharacterStat.Strength] ?? 3;
    if (this.state.strength < minStrength) {
      requestAnimationFrame(() => {
        this.setState({ strength: minStrength });
      });
    }
    const minIntelligence = selectedClass?.statRequirements[CharacterStat.Intelligence] ?? 3;
    if (this.state.intelligence < minIntelligence) {
      requestAnimationFrame(() => {
        this.setState({ intelligence: minIntelligence });
      });
    }
    const minWisdom = selectedClass?.statRequirements[CharacterStat.Wisdom] ?? 3;
    if (this.state.wisdom < minWisdom) {
      requestAnimationFrame(() => {
        this.setState({ wisdom: minWisdom });
      });
    }
    const minDexterity = selectedClass?.statRequirements[CharacterStat.Dexterity] ?? 3;
    if (this.state.dexterity < minDexterity) {
      requestAnimationFrame(() => {
        this.setState({ dexterity: minDexterity });
      });
    }
    const minConstitution = selectedClass?.statRequirements[CharacterStat.Constitution] ?? 3;
    if (this.state.constitution < minConstitution) {
      requestAnimationFrame(() => {
        this.setState({ constitution: minConstitution });
      });
    }
    const minCharisma = selectedClass?.statRequirements[CharacterStat.Charisma] ?? 3;
    if (this.state.charisma < minCharisma) {
      requestAnimationFrame(() => {
        this.setState({ charisma: minCharisma });
      });
    }

    const primeRequisites = selectedClass?.primeRequisites ?? [];

    const hitDieSize = selectedClass?.hitDieSize ?? 4;

    let nextTabIndex: number = 1;

    return (
      <div className={styles.root}>
        <div className={styles.titleLabel}>
          {this.props.isEditMode
            ? `Editing Character #${this.props.selectedCharacter?.id} (${this.props.selectedCharacter?.name})`
            : "Create New Character"}
        </div>
        <div className={styles.contentRow}>
          <div className={styles.nameLabel}>Name</div>
          <input
            className={styles.nameTextField}
            type={"text"}
            value={this.state.nameText}
            onChange={(e) => {
              this.setState({ nameText: e.target.value });
            }}
            tabIndex={nextTabIndex++}
            spellCheck={false}
            autoFocus={true}
          />
          <div className={styles.rollPersonalsButton} onClick={this.onRerollPersonalsClicked.bind(this)}></div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.genderLabel}>Gender</div>
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
              tabIndex={nextTabIndex++}
            />
            <span className={styles.radioLabel}>Male</span>
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
            <span className={styles.radioLabel}>Female</span>
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
            <span className={styles.radioLabel}>Other</span>
          </div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.classLabel}>Class</div>
          <select
            className={styles.classSelector}
            value={this.state.class}
            onChange={(e) => {
              this.setState({
                class: e.target.value,
                selectableValues: [
                  ["---", "", 0],
                  ["---", "", 0],
                  ["---", "", 0],
                  ["---", "", 0],
                ],
                equipmentSetId: 0,
              });
            }}
            tabIndex={nextTabIndex++}
          >
            <option value={"---"}>---</option>
            {AllClassesArray.map(({ name }) => {
              return (
                <option value={name} key={`class${name}`}>
                  {name}
                </option>
              );
            })}
          </select>

          <div className={styles.levelLabel}>Level</div>
          <input
            className={styles.levelTextField}
            type={"number"}
            value={this.state.level}
            min={1}
            max={maxLevel}
            onChange={(e) => {
              const level = +e.target.value;
              const hitDice: number[] = this.state.hitDice.slice(0, level);
              while (hitDice.length < level) {
                hitDice.push(this.rollDice(1, hitDieSize));
              }
              this.setState({ level, hitDice });
            }}
            tabIndex={nextTabIndex++}
          />
        </div>

        {!this.props.isEditMode && (
          <div className={styles.contentRow}>
            <div className={styles.classLabel}>Equipment</div>
            <select
              className={styles.classSelector}
              value={this.state.equipmentSetId}
              onChange={(e) => {
                this.setState({
                  equipmentSetId: +e.target.value,
                });
              }}
              disabled={this.state.class === "---"}
              tabIndex={nextTabIndex++}
            >
              <option value={0}>---</option>
              {this.props.equipmentSetsByClass[this.state.class]?.map(({ name, id }) => {
                return (
                  <option value={id} key={`equipmentSet${name}`}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className={styles.contentRow}>
          <div className={styles.xpLabel}>XP</div>
          <input
            className={styles.xpTextField}
            type={"number"}
            value={this.state.xp}
            min={minXP}
            onChange={(e) => {
              this.setState({ xp: +e.target.value });
            }}
            tabIndex={nextTabIndex++}
            spellCheck={false}
          />
          <div className={styles.xpRangeLabel}>{`${minXP} - ${maxXP}`}</div>
        </div>

        <div className={styles.contentRow}>
          <div className={styles.column}>
            <div className={styles.row}>
              <div className={styles.strengthLabel}>
                {primeRequisites.includes(CharacterStat.Strength) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                STR
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
                tabIndex={nextTabIndex++}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.intelligenceLabel}>
                {primeRequisites.includes(CharacterStat.Intelligence) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                INT
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
                tabIndex={nextTabIndex++}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.wisdomLabel}>
                {primeRequisites.includes(CharacterStat.Wisdom) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                WIS
              </div>
              <input
                className={styles.wisdomTextField}
                type={"number"}
                value={this.state.wisdom}
                min={minWisdom}
                max={18}
                onChange={(e) => {
                  this.setState({ wisdom: +e.target.value });
                }}
                tabIndex={nextTabIndex++}
              />
            </div>
          </div>

          <div className={styles.column}>
            <div className={styles.row}>
              <div className={styles.dexterityLabel}>
                {primeRequisites.includes(CharacterStat.Dexterity) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                DEX
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
                tabIndex={nextTabIndex++}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.constitutionLabel}>
                {primeRequisites.includes(CharacterStat.Constitution) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                CON
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
                tabIndex={nextTabIndex++}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.charismaLabel}>
                {primeRequisites.includes(CharacterStat.Charisma) && (
                  <span className={styles.primeRequisiteLabel}>*</span>
                )}
                CHA
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
                tabIndex={nextTabIndex++}
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
                    tabIndex={nextTabIndex++}
                  />
                </div>
              );
            })}
          </div>

          <div className={styles.column}>
            <div className={styles.rollHitpointsButton} onClick={this.onRerollHitpointsClicked.bind(this)}></div>
          </div>
        </div>

        {selectedClass?.selectableClassFeatures.length > 0 ? (
          <div className={styles.contentRow}>
            <div className={styles.column}>
              <div className={styles.selectablesTitle}>{"Selectable Features"}</div>
              {selectedClass.selectableClassFeatures.map((feature, featureIndex) => {
                let featureOptions: AbilityFilter[] = [];
                if (Array.isArray(feature.selections)) {
                  featureOptions = feature.selections;
                } else {
                  const filter = feature.selections;
                  if (filter.subtypes) {
                    filter.subtypes?.forEach((subtype) => {
                      // Turn each option into its own full entry.
                      featureOptions.push({ ...filter, subtypes: [subtype] });
                    });
                  } else {
                    filter.def.subTypes?.forEach((subtype) => {
                      // Turn each option into its own full entry.
                      featureOptions.push({ ...filter, subtypes: [subtype] });
                    });
                  }
                }

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
                      tabIndex={nextTabIndex++}
                    >
                      <option value={"---"}>---</option>
                      {featureOptions.map((filter) => {
                        let id = filter.def.id;
                        let name = filter.def.name;
                        let subtype = filter.subtypes?.[0] ?? "";
                        let rank = filter.rank ?? 1;

                        let displayName = name;
                        if (subtype.length > 0) {
                          displayName = `${displayName} (${subtype})`;
                        }

                        return (
                          <option value={`${id},${subtype},${rank}`} key={`selectable${name}${subtype}`}>
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
        <SubPanelCloseButton />
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
          content: {
            title: "Error!",
            message: "Please enter a Name for this character!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid class?
    if (this.state.class === "---") {
      this.props.dispatch?.(
        showModal({
          id: "NoClassError",
          content: {
            title: "Error!",
            message: "Please select a Class for this character!",
            buttonText: "Okay",
          },
        })
      );
      this.setState({ isSaving: false });
      return;
    }

    // Valid selectables?
    let hasValidSelectables: boolean = true;
    const selectedClass = AllClasses[this.state.class];
    selectedClass.selectableClassFeatures?.forEach((_, featureIndex) => {
      if (this.state.selectableValues[featureIndex][0] === "---") {
        hasValidSelectables = false;
      }
    });
    if (!hasValidSelectables) {
      this.props.dispatch?.(
        showModal({
          id: "NoSelectableError",
          content: {
            title: "Error!",
            message: "Please choose an option for all Selectable Features!",
            buttonText: "Okay",
          },
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
      portrait_url: "",
      class_name: this.state.class,
      level: this.state.level,
      strength: this.state.strength,
      intelligence: this.state.intelligence,
      wisdom: this.state.wisdom,
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
      // EquipmentData values are ignored when editing a character.
      ...emptyEquipmentData,
    };
    // Have to calculate this separately so it can account for class and Constitution bonus.
    character.hp = getCharacterMaxHP(character);

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
        content: {
          title: "Delete Character",
          message: `Are you sure you wish to delete ${this.props.selectedCharacter?.name}?  This will also destroy associated records like items, storages, etc.  Deletion cannot be undone.`,
          buttonText: "Delete",
          onButtonClick: async () => {
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
                    content: { title: "Error", message: "An Error occurred during character deletion." },
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
          extraButtons: [
            {
              text: "Cancel",
              onClick: () => {
                this.props.dispatch?.(hideModal());
                this.setState({ isSaving: false });
              },
            },
          ],
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
    const reqs = this.state.class === "---" ? {} : AllClasses[this.state.class].statRequirements;

    this.setState({
      strength: this.rollStat(reqs[CharacterStat.Strength] ?? 0),
      intelligence: this.rollStat(reqs[CharacterStat.Intelligence] ?? 0),
      wisdom: this.rollStat(reqs[CharacterStat.Wisdom] ?? 0),
      dexterity: this.rollStat(reqs[CharacterStat.Dexterity] ?? 0),
      constitution: this.rollStat(reqs[CharacterStat.Constitution] ?? 0),
      charisma: this.rollStat(reqs[CharacterStat.Charisma] ?? 0),
    });
  }

  private onRerollHitpointsClicked(): void {
    const hitDieSize = AllClasses[this.state.class]?.hitDieSize ?? 4;
    const hitDice: number[] = [...this.state.hitDice];
    for (let i = 0; i < hitDice.length; ++i) {
      hitDice[i] = this.rollDice(1, hitDieSize);
    }
    this.setState({ hitDice });
  }

  private rollStat(min: number): number {
    let stat: number = -1;
    while (stat < min) {
      stat = this.rollDice(3, 6);
    }
    return stat;
  }

  private rollDice(num: number, max: number) {
    let result: number = 0;
    for (let i = 0; i < num; ++i) {
      result += randomInt(1, max);
    }
    return result;
  }

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        widthVmin: 61,
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
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const selectedCharacter = state.characters.characters[state.characters.activeCharacterId];
  const selectedCharacterProficiencies = state.proficiencies.proficienciesByCharacterId[selectedCharacter?.id];
  const { equipmentSetsByClass, equipmentSetItemsBySet, items: allItemDefs } = state.gameDefs;
  const allLocations = state.locations.locations;
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
    selectedCharacter,
    selectedCharacterProficiencies,
    equipmentSetsByClass,
    equipmentSetItemsBySet,
    allItemDefs,
    allLocations,
  };
}

export const CreateCharacterSubPanel = connect(mapStateToProps)(ACreateCharacterSubPanel);
