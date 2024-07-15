import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import dateFormat from "dateformat";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, {
  CharacterData,
  ItemData,
  ItemDefData,
  LocationData,
  RepertoireEntryData,
  SpellDefData,
  StorageData,
} from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { SavingThrowType, SpellType } from "../../staticData/types/characterClasses";
import TooltipSource from "../TooltipSource";
import { AbilitiesList } from "./AbilitiesList";
import styles from "./CharacterSheet.module.scss";
import { EditEquipmentSubPanel } from "./EditEquipmentSubPanel";
import { EditHPDialog } from "./EditHPDialog";
import { EditProficienciesSubPanel } from "./EditProficienciesSubPanel";
import { EditXPDialog } from "./EditXPDialog";
import { Dictionary } from "../../lib/dictionary";
import { Stones, getTotalEquippedWeight } from "../../lib/itemUtils";
import {
  AttackData,
  EncumbranceLevel,
  addCommasToNumber,
  getArmorBonusForCharacter,
  getBonusForStat,
  getCXPDeductibleRemainingForCharacter,
  getCampaignXPDeductibleCapForLevel,
  getCharacterMaxEncumbrance,
  getCharacterMaxHP,
  getCharacterStat,
  getCombatSpeedsForCharacter,
  getCostOfLivingForCharacterLevel,
  getEncumbranceLevelForCharacter,
  getInitiativeBonusForCharacter,
  getMaintenanceStatusForCharacter,
  getMeleeAttackDataForCharacter,
  getPersonalPile,
  getProficiencyRankForCharacter,
  getRangedAttackDataForCharacter,
  getSavingThrowBonusForCharacter,
} from "../../lib/characterUtils";
import { RepertoireDialog } from "./RepertoireDialog";
import { SpellTooltip } from "../database/SpellTooltip";
import BonusTooltip from "../BonusTooltip";
import { EditMoneyDialog } from "./EditMoneyDialog";
import { FittingView } from "../FittingView";
import { EditInjuriesDialog } from "./EditInjuriesDialog";
import { EditButton } from "../EditButton";
import { SelectLocationDialog } from "../dialogs/SelectLocationDialog";
import { setCharacterLocation, setCharacterXPReserve } from "../../redux/charactersSlice";
import { SheetRoot } from "../SheetRoot";
import { EditCXPDeductibleDialog } from "./EditCXPDeductibleDialog";
import { EditStoragesSubPanel } from "./EditStoragesSubPanel";
import { EditCostOfLivingDialog } from "./EditCostOfLivingDialog";
import { CharacterContractsDialog } from "./CharacterContractsDialog";
import { SharedLoadbearing } from "../../staticData/classFeatures/SharedLoadbearing";
import { InputSingleNumberOfTwoDialog } from "../dialogs/InputSingleNumberOfTwoDialog";

interface ReactProps {
  characterId: number;
  exiting: boolean;
}

interface InjectedProps {
  allItems: Dictionary<ItemData>;
  allItemDefs: Dictionary<ItemDefData>;
  allSpells: Dictionary<SpellDefData>;
  character: CharacterData;
  repertoire: RepertoireEntryData[];
  allLocations: Dictionary<LocationData>;
  storages: StorageData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterSheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    const characterExists = this.props.characterId > 0 && !!this.props.character;

    return (
      <SheetRoot className={`${styles.root} ${animationClass}`}>
        {characterExists ? (
          <>
            <div className={styles.topPanel}>
              <FittingView className={styles.nameContainer}>
                <div
                  className={styles.nameLabel}
                >{`${this.props.character.name}, L${this.props.character.level} ${this.props.character.class_name}`}</div>
              </FittingView>
              <div className={styles.topPanelGrid}>
                <div className={styles.column}>
                  <div className={styles.row}>
                    {this.renderStatsPanel()}
                    <div className={styles.horizontalSpacer} />
                    {this.renderSavingThrowsPanel()}
                  </div>
                  <div className={styles.verticalSpacer} />
                  {this.renderXPPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderDeductiblePanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderXPReservePanel()}
                </div>
                <div className={styles.horizontalSpacer} />
                <div className={styles.column}>
                  {this.renderCostOfLivingPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderSpeedPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderInitiativePanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderCombatPanel()}
                </div>
                <div className={styles.horizontalSpacer} />
                <div className={styles.column}>
                  {this.renderMoneyPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderHPPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderEquipmentPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderStoragePanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderLocationPanel()}
                  <div className={styles.verticalSpacer} />
                  {this.renderContractsPanel()}
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.leftPanel}>
                {this.renderAbilitiesPanel()}
                {this.renderLevelBasedSkillsPanel()}
                {this.renderInjuriesPanel()}
              </div>
              <div className={styles.rightPanel}>
                {this.renderSpellSlotsPanel()}
                {this.renderSpellRepertoirePanel()}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.placeholder} />
        )}
      </SheetRoot>
    );
  }

  private renderSpellRepertoirePanel(): React.ReactNode {
    // Return null if no spellcasting ability.
    const characterClass = AllClasses[this.props.character.class_name];
    if (characterClass.spellcasting.length === 0) {
      return null;
    }

    return (
      <div className={styles.spellRepertoirePanel}>
        <div className={styles.normalText}>{"Spell Repertoire"}</div>
        <div className={styles.horizontalLine} />
        <div className={styles.repertoireScroller}>
          {characterClass.spellcasting.map((spellCapability, scIndex) => {
            const repertoireBonus = spellCapability.repertoireStat
              ? Math.max(getBonusForStat(getCharacterStat(this.props.character, spellCapability.repertoireStat)), 0)
              : 0;
            const slots = spellCapability.spellSlots[this.props.character.level - 1];
            return (
              <div className={styles.repertoireSection} key={`SpellCapability${scIndex}`}>
                <div className={styles.repertoireSectionHeader}>{spellCapability.spellTypes[0]}</div>
                {slots.map((numSpells, index) => {
                  let maxSpellsPrepared: number = 0;
                  let spellsPrepared: SpellDefData[] = [];
                  if (spellCapability.requiresSpellbook) {
                    // Repertoire spells are assigned by the player, and must come from a carried spellbook.
                    const repertoireEntries = this.props.repertoire.filter((entry) => {
                      return entry.spell_type === spellCapability.spellTypes[0] && entry.spell_level === index + 1;
                    });
                    spellsPrepared = repertoireEntries.map((entry) => {
                      return this.props.allSpells[entry.spell_id];
                    });
                    maxSpellsPrepared = numSpells > 0 ? numSpells + repertoireBonus : 0;
                  } else {
                    // Repertoire includes ALL spells for this capability.
                    spellsPrepared = Object.values(this.props.allSpells).filter((sdd) => {
                      return !!spellCapability.spellTypes.find((st) => {
                        return sdd.type_levels[st] === index + 1;
                      });
                    });
                  }
                  const noneClass = maxSpellsPrepared === 0 ? styles.none : "";
                  return (
                    <div key={`RepertoireL${index + 1}`}>
                      <div className={styles.repertoireLevelHeader}>
                        <div className={`${styles.repertoireLevelName} ${noneClass}`}>{`L${index + 1}`}</div>
                        <div className={`${styles.repertoireLevelPreparedCount} ${noneClass}`}>
                          {maxSpellsPrepared > 0 ? `${spellsPrepared.length} / ${maxSpellsPrepared}` : ""}
                        </div>
                        {maxSpellsPrepared > 0 && spellCapability.requiresSpellbook ? (
                          <div
                            className={styles.repertoireEditButton}
                            onClick={this.onEditRepertoireClicked.bind(
                              this,
                              spellCapability.spellTypes,
                              index + 1,
                              maxSpellsPrepared
                            )}
                          />
                        ) : null}
                      </div>
                      {spellsPrepared.map((sdd) => {
                        return (
                          <TooltipSource
                            className={styles.repertoireSpellRow}
                            tooltipParams={{
                              id: `Spell${sdd.id}`,
                              content: () => {
                                return <SpellTooltip spellId={sdd.id} />;
                              },
                            }}
                            key={`Spell${sdd.id}`}
                          >
                            {sdd.name}
                          </TooltipSource>
                        );
                      })}
                    </div>
                  );
                })}
                {spellCapability.ritualLevels.map((ritualLevel) => {
                  let spellsPrepared: SpellDefData[] = [];
                  if (spellCapability.requiresSpellbook) {
                    // Repertoire spells are assigned by the player, and must come from a carried spellbook.
                    const repertoireEntries = this.props.repertoire.filter((entry) => {
                      return entry.spell_type === spellCapability.spellTypes[0] && entry.spell_level === ritualLevel;
                    });
                    spellsPrepared = repertoireEntries.map((entry) => {
                      return this.props.allSpells[entry.spell_id];
                    });
                  } else {
                    // Repertoire includes ALL spells for this capability.
                    spellsPrepared = Object.values(this.props.allSpells).filter((sdd) => {
                      return !!spellCapability.spellTypes.find((st) => {
                        return sdd.type_levels[st] === ritualLevel;
                      });
                    });
                  }
                  const canCastRituals = this.props.character.level >= spellCapability.minRitualLevel;
                  const noneClass = !canCastRituals || repertoireBonus === 0 ? styles.none : "";
                  let maxSpellsPrepared = canCastRituals ? repertoireBonus : 0;
                  return (
                    <div key={`RepertoireL${ritualLevel}`}>
                      <div className={styles.repertoireLevelHeader}>
                        <div className={`${styles.repertoireLevelName} ${noneClass}`}>{`L${ritualLevel} Rituals`}</div>
                        <div className={`${styles.repertoireLevelPreparedCount} ${noneClass}`}>
                          {maxSpellsPrepared > 0 ? `${spellsPrepared.length} / ${maxSpellsPrepared}` : ""}
                        </div>
                        {repertoireBonus > 0 && canCastRituals && spellCapability.requiresSpellbook ? (
                          <div
                            className={styles.repertoireEditButton}
                            onClick={this.onEditRepertoireClicked.bind(
                              this,
                              spellCapability.spellTypes,
                              ritualLevel,
                              repertoireBonus
                            )}
                          />
                        ) : null}
                      </div>
                      {spellsPrepared.map((sdd) => {
                        return (
                          <TooltipSource
                            className={styles.repertoireSpellRow}
                            tooltipParams={{
                              id: `Spell${sdd.id}`,
                              content: () => {
                                return <SpellTooltip spellId={sdd.id} />;
                              },
                            }}
                            key={`Spell${sdd.id}`}
                          >
                            {sdd.name}
                          </TooltipSource>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  private onEditRepertoireClicked(spellTypes: SpellType[], spellLevel: number, maxSpellsPrepared: number): void {
    this.props.dispatch?.(
      showModal({
        id: "repertoireEdit",
        content: () => {
          return (
            <RepertoireDialog
              character={this.props.character}
              spellTypes={spellTypes}
              spellLevel={spellLevel}
              maxSpellsPrepared={maxSpellsPrepared}
            />
          );
        },
        escapable: true,
        widthVmin: 45,
      })
    );
  }

  private renderSpellSlotsPanel(): React.ReactNode {
    // Return null if no spellcasting ability.
    const characterClass = AllClasses[this.props.character.class_name];
    if (characterClass.spellcasting.length === 0) {
      return null;
    }

    return (
      <div className={styles.spellSlotsPanel}>
        <div className={styles.spellSlotsTitle}>{"Spell Slots"}</div>
        <div className={styles.horizontalLine} />
        {characterClass.spellcasting.map((spellType, stIndex) => {
          const slots = spellType.spellSlots[this.props.character.level - 1];
          return (
            <div key={`SpellTypeColumn${stIndex}`}>
              <div className={styles.row}>
                <div className={styles.column}>
                  <div className={styles.spellSlotsCell} />
                  <div className={styles.normalText}>{spellType.spellTypes[0]}</div>
                </div>
                {slots.map((numSpells, index) => {
                  return (
                    <div className={styles.column} key={`Slots${index + 1}`}>
                      <div className={styles.spellSlotsHeader}>{`L${index + 1}`}</div>
                      <div className={numSpells === 0 ? styles.spellSlotsNone : styles.spellSlotsValue}>
                        {numSpells}
                      </div>
                    </div>
                  );
                })}
              </div>
              {stIndex < characterClass.spellcasting.length - 1 ? <div className={styles.spellTypeDivider} /> : null}
            </div>
          );
        })}
      </div>
    );
  }

  private renderAbilitiesPanel(): React.ReactNode {
    return (
      <div className={styles.abilitiesPanel}>
        <div className={styles.centeredRow}>
          <div className={styles.abilitiesTitle}>{"Abilities and Proficiencies"}</div>
          <div className={styles.abilitiesEditButton} onClick={this.onEditAbilitiesClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <AbilitiesList characterId={this.props.character?.id ?? 0} />
      </div>
    );
  }

  private onEditAbilitiesClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "EditProficiencies",
        content: () => {
          return <EditProficienciesSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private renderXPPanel(): React.ReactNode {
    if (this.props.character) {
      const characterClass = AllClasses[this.props.character.class_name];
      const xpCap = characterClass.xpToLevel[this.props.character.level] ?? "∞";
      const needsLevelUp = this.props.character.xp >= xpCap;
      const levelUpStyle = needsLevelUp ? styles.levelUp : "";
      return (
        <div className={styles.xpPanel}>
          <div className={`${styles.xpContainer} ${levelUpStyle}`}>
            <div className={styles.centeredRow}>
              <div className={styles.xpTitle}>XP:</div>
              <div className={styles.xpNumbers}>
                <div className={`${styles.xpValue} ${levelUpStyle}`}>{this.props.character.xp}</div>
                <div className={styles.xpCap}>{`/ ${xpCap}`}</div>
              </div>
              <div className={styles.xpEditButton} onClick={this.onXPEditClicked.bind(this)} />
            </div>
            {needsLevelUp && (
              <div className={styles.levelUpButton} onClick={this.onLevelUpClicked.bind(this)}>
                Level Up!
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderXPReservePanel(): React.ReactNode {
    if (this.props.character) {
      return (
        <div className={styles.xpPanel}>
          <div className={styles.xpContainer}>
            <div className={styles.centeredRow}>
              <div className={styles.xpTitle}>XP Reserve:</div>
              <div className={styles.xpNumbers}>
                <div className={styles.xpValue}>{this.props.character.xp_reserve}</div>
              </div>
              <div className={styles.xpEditButton} onClick={this.onXPReserveEditClicked.bind(this)} />
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderHPPanel(): React.ReactNode {
    if (this.props.character) {
      const maxHP = getCharacterMaxHP(this.props.character);
      const isDying = this.props.character.hp <= 0;
      const healthStyle = isDying ? styles.dying : "";
      return (
        <div className={styles.hpPanel}>
          <div className={`${styles.hpContainer} ${healthStyle}`}>
            <div className={styles.centeredRow}>
              <div className={styles.hpTitle}>HP:</div>
              <div className={styles.hpNumbers}>
                <div className={`${styles.hpValue} ${healthStyle}`}>{this.props.character.hp}</div>
                <div className={styles.hpCap}>{`/ ${maxHP}`}</div>
              </div>
              <div className={styles.hpEditButton} onClick={this.onHPEditClicked.bind(this)} />
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderMoneyPanel(): React.ReactNode {
    if (this.props.character) {
      const money = this.props.storages.reduce<number>((m, s) => {
        return m + s.money;
      }, 0);
      return (
        <div>
          <TooltipSource
            className={styles.moneyContainer}
            tooltipParams={{ id: "Money", content: this.renderMoneyTooltip.bind(this) }}
          >
            <div className={styles.centeredRow}>
              <div className={styles.moneyTitle}>GP:</div>
              <div className={styles.moneyEditButton} onClick={this.onMoneyEditClicked.bind(this)} />
            </div>
            <div className={styles.moneyValue}>{addCommasToNumber(money, 2)}</div>
          </TooltipSource>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderCostOfLivingPanel(): React.ReactNode {
    if (this.props.character) {
      const maintenanceStatus = getMaintenanceStatusForCharacter(this.props.characterId);
      return (
        <div>
          <div className={styles.panelContainer}>
            <div className={styles.centeredRow}>
              <div className={styles.panelTitle}>Cost of Living</div>
              <EditButton className={styles.panelEditButton} onClick={this.onCostOfLivingEditClicked.bind(this)} />
            </div>
            <div className={styles.costOfLivingValue}>
              {addCommasToNumber(getCostOfLivingForCharacterLevel(this.props.character.level), 2)}
            </div>
            <div className={`${styles.maintenanceStatus} ${styles[maintenanceStatus]}`}>{maintenanceStatus}</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderStoragePanel(): React.ReactNode {
    if (this.props.character) {
      return (
        <div className={styles.storageContainer}>
          <div className={styles.centeredRow}>
            <div className={styles.storageTitle}>Storage</div>
            <EditButton className={styles.storageEditButton} onClick={this.onEditStorageClicked.bind(this)} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderContractsPanel(): React.ReactNode {
    if (this.props.character) {
      return (
        <div className={styles.panelContainer}>
          <div className={styles.centeredRow}>
            <div className={styles.storageTitle}>{"Contracts"}</div>
            <EditButton className={styles.storageEditButton} onClick={this.onEditContractsClicked.bind(this)} />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderDeductiblePanel(): React.ReactNode {
    if (this.props.character) {
      const remainingDeductible = getCXPDeductibleRemainingForCharacter(this.props.characterId);
      const maxDeductible = getCampaignXPDeductibleCapForLevel(this.props.character.level);
      const paidDeductible = maxDeductible - remainingDeductible;
      return (
        <div className={styles.deductiblePanel}>
          <TooltipSource
            className={styles.deductibleContainer}
            tooltipParams={{
              id: "Deductible",
              content: this.renderDeductibleTooltip.bind(this, maxDeductible, paidDeductible),
            }}
          >
            <div className={styles.centeredRow}>
              <div className={styles.deductibleTitle}>CXP Deductible:</div>
              <EditButton className={styles.deductibleEditButton} onClick={this.onDeductibleEditClicked.bind(this)} />
            </div>
            <div className={styles.deductibleValue}>
              {`${addCommasToNumber(paidDeductible, 0)} / ${addCommasToNumber(maxDeductible, 0)}`}
            </div>
          </TooltipSource>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderDeductibleTooltip(maxDeductible: number, paidDeductible: number): React.ReactNode {
    return (
      <div className={styles.deductibleTooltipRoot}>
        <div className={styles.moneyTooltipTitle}>{`${dateFormat(new Date(), "mmmm")} Campaign XP Deductible`}</div>
        <div className={styles.moneyTooltipDivider} />

        <div className={styles.moneyTooltipSourceRow}>
          <div className={styles.moneyTooltipSource}>{`L${this.props.character.level} Monthly Deductible`}</div>
          <div className={styles.moneyTooltipSourceValue}>{addCommasToNumber(maxDeductible)}</div>
        </div>
        <div className={styles.moneyTooltipSourceRow}>
          <div className={styles.moneyTooltipSource}>{`Amount Paid`}</div>
          <div className={styles.moneyTooltipSourceValue}>{addCommasToNumber(paidDeductible, 0)}</div>
        </div>
        <div className={styles.moneyTooltipSourceRow}>
          <div className={styles.moneyTooltipSource}>{`Amount Remaining`}</div>
          <div className={styles.moneyTooltipSourceValue}>{addCommasToNumber(maxDeductible - paidDeductible, 0)}</div>
        </div>
        <div className={styles.moneyTooltipDivider} />
        <div className={styles.deductibleExplanation}>
          {
            "Campaign XP is XP gained from actions other than adventuring, e.g. research.  The first bit of campaign XP earned each month is deducted."
          }
        </div>
      </div>
    );
  }

  private onEditStorageClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "EditStorages",
        content: () => {
          return <EditStoragesSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private onEditContractsClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "contractsEdit",
        content: () => {
          return <CharacterContractsDialog />;
        },
        escapable: true,
      })
    );
  }

  private onDeductibleEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "deductibleEdit",
        content: () => {
          return <EditCXPDeductibleDialog />;
        },
        escapable: true,
      })
    );
  }

  private renderLevelBasedSkillsPanel(): React.ReactNode {
    if (this.props.character) {
      const characterClass = AllClasses[this.props.character.class_name];
      if (characterClass.levelBasedSkills.length > 0) {
        return (
          <div className={styles.levelBasedSkillsPanel}>
            <div className={styles.abilitiesTitle}>{"Special Skills"}</div>
            <div className={styles.horizontalLine} />
            <div className={styles.specialSkillsContainer}>
              {characterClass.levelBasedSkills.map((lbs) => {
                return (
                  <TooltipSource
                    className={styles.specialSkillRow}
                    tooltipParams={{
                      id: lbs.name,
                      content: lbs.tooltip
                        ? () => {
                            return <div className={styles.specialSkillsTooltip}>{lbs.tooltip}</div>;
                          }
                        : null,
                    }}
                    key={lbs.name}
                  >
                    <div className={styles.row}>
                      <div className={styles.specialSkillName}>{lbs.name}</div>
                      {lbs.tooltip ? <div className={styles.infoAsterisk}>*</div> : null}
                    </div>
                    <div className={styles.specialSkillRoll}>{lbs.rolls[this.props.character.level - 1]}</div>
                  </TooltipSource>
                );
              })}
            </div>
          </div>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private onLevelUpClicked(): void {
    // TODO: Level Up dialog?
  }

  private onHPEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "hpEdit",
        content: () => {
          return <EditHPDialog />;
        },
        escapable: true,
      })
    );
  }

  private onMoneyEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "moneyEdit",
        content: () => {
          return <EditMoneyDialog storageId={getPersonalPile(this.props.characterId).id} />;
        },
        escapable: true,
      })
    );
  }

  private onCostOfLivingEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "costOfLivingEdit",
        content: () => {
          return <EditCostOfLivingDialog />;
        },
        escapable: true,
      })
    );
  }

  private onXPEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "xpEdit",
        content: () => {
          return <EditXPDialog />;
        },
        escapable: true,
      })
    );
  }

  private onXPReserveEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "xpReserveEdit",
        content: () => {
          return (
            <InputSingleNumberOfTwoDialog
              initialFirstValue={this.props.character.xp_reserve}
              firstNumberPrompt={"Set Exact Reserve XP Value"}
              secondNumberPrompt={"Add To Reserve XP"}
              applyFirstNumber={async (value: number) => {
                const result = await ServerAPI.setXPReserve(this.props.character.id, value);

                if ("error" in result) {
                  this.props.dispatch?.(
                    showModal({
                      id: "setXPReserve Error",
                      content: {
                        title: "Error!",
                        message: "Failed to update XP Reserve.  Please check your network connection and try again.",
                      },
                      escapable: true,
                    })
                  );
                  return false;
                } else {
                  this.props.dispatch?.(setCharacterXPReserve({ characterId: this.props.character.id, xp: value }));
                  return true;
                }
              }}
              applySecondNumber={async (value: number) => {
                const result = await ServerAPI.setXPReserve(
                  this.props.character.id,
                  this.props.character.xp_reserve + value
                );

                if ("error" in result) {
                  this.props.dispatch?.(
                    showModal({
                      id: "setXPReserve Error",
                      content: {
                        title: "Error!",
                        message: "Failed to update XP Reserve.  Please check your network connection and try again.",
                      },
                      escapable: true,
                    })
                  );
                  return false;
                } else {
                  this.props.dispatch?.(
                    setCharacterXPReserve({
                      characterId: this.props.character.id,
                      xp: this.props.character.xp_reserve + value,
                    })
                  );
                  return true;
                }
              }}
            />
          );
        },
        escapable: true,
      })
    );
  }

  private renderInitiativePanel(): React.ReactNode {
    if (this.props.character) {
      let calc = getInitiativeBonusForCharacter(this.props.characterId);
      const hasConditionalBonuses = calc.conditionalSources.length > 0;
      return (
        <div className={styles.initiativePanel}>
          <TooltipSource
            tooltipParams={{
              id: "InitiativeExplanation",
              content: () => {
                return <BonusTooltip header={"Initiative"} calc={calc} />;
              },
            }}
            className={styles.initiativeContainer}
          >
            <div className={styles.row}>
              <div className={styles.initiativeTitle}>Initiative Bonus</div>
              <div className={styles.valueText}>
                {`${calc.totalBonus > 0 ? "+" : ""} ${calc.totalBonus}`}
                {hasConditionalBonuses ? <span className={styles.infoAsterisk}>*</span> : null}
              </div>
            </div>
          </TooltipSource>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderSpeedPanel(): React.ReactNode {
    if (this.props.character) {
      // Calculate encumbrance based on equipment slots.
      const [fullStoneEncumbrance, partialStoneEncumbrance] = getTotalEquippedWeight(
        this.props.character,
        this.props.allItems,
        this.props.allItemDefs
      );
      const speeds = getCombatSpeedsForCharacter(this.props.characterId);
      const speedIndex = getEncumbranceLevelForCharacter(this.props.characterId);
      const speed = speeds[speedIndex];

      return (
        <div className={styles.speedPanel}>
          <TooltipSource
            tooltipParams={{
              id: "SpeedExplanation",
              content: this.renderSpeedTooltip.bind(this),
            }}
            className={styles.speedContainer}
          >
            <div className={styles.centeredRow}>
              <div className={styles.speedTitle}>Speed</div>
              <div className={styles.speedValue}>{`${speed}' / ${speed * 3}'`}</div>
            </div>
            <div className={styles.centeredRow}>
              <div className={styles.speedTitle}>Encumbrance</div>
              <div className={styles.speedValue}>{`${fullStoneEncumbrance}${
                partialStoneEncumbrance > 0 ? `  ${partialStoneEncumbrance}/6` : ""
              }`}</div>
              <div className={styles.speedStone}>stone</div>
            </div>
          </TooltipSource>
        </div>
      );
    } else {
      return null;
    }
  }

  private renderEquipmentPanel(): React.ReactNode {
    let calc = getArmorBonusForCharacter(this.props.characterId);

    return (
      <div className={styles.equipmentPanel}>
        <div className={styles.equipmentContainer}>
          <div className={styles.centeredRow}>
            <div className={styles.equipmentTitle}>{"Equipment"}</div>
            <div className={styles.equipmentEditButton} onClick={this.onEditEquipmentClicked.bind(this)} />
          </div>
          <div className={styles.horizontalLine} />
          <TooltipSource
            tooltipParams={{
              id: "ACExplanation",
              content: () => {
                return <BonusTooltip header={"AC"} calc={calc} isFlatValue={true} />;
              },
            }}
            className={styles.centeredRow}
          >
            <div className={styles.acTitle}>AC:</div>
            <div className={styles.valueText}>
              {calc.totalBonus}
              {calc.conditionalSources.length > 0 ? <span className={styles.infoAsterisk}>*</span> : null}
            </div>
          </TooltipSource>
        </div>
      </div>
    );
  }

  private renderCombatPanel(): React.ReactNode {
    return (
      <div className={styles.combatPanel}>
        <div className={styles.combatContainer}>
          <div className={styles.combatTitle}>{"Combat"}</div>
          <div className={styles.horizontalLine} />
          {this.renderMeleeCombatSection()}
          {this.renderRangedCombatSection()}
        </div>
      </div>
    );
  }

  private renderMeleeCombatSection(): React.ReactNode {
    const attacks = getMeleeAttackDataForCharacter(this.props.characterId);

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
          <div className={styles.acTooltipTitle}>Damage</div>
          <div className={styles.acTooltipValue}>{`${data.damage.bonus > 0 ? "+" : ""}${data.damage.bonus}`}</div>
        </div>
        <div className={styles.acTooltipDivider} />
        {data.damageBonuses.map(([text, value]) => {
          return (
            <div className={styles.acTooltipSourceRow} key={text}>
              <div className={styles.acTooltipSource}>{text}</div>
              <div className={styles.acTooltipSourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
            </div>
          );
        })}
        {data.conditionalDamageBonuses.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>Conditional Damage Bonuses</div>
            <div className={styles.acTooltipDivider} />
            {data.conditionalDamageBonuses.map(([text, value]) => {
              return (
                <div className={styles.acTooltipSourceRow} key={text}>
                  <div className={styles.acTooltipSource}>{text}</div>
                  <div className={styles.acTooltipSourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
                </div>
              );
            })}
          </>
        ) : null}
        <div style={{ height: "1vmin" }} />
        <div className={styles.row}>
          <div className={styles.acTooltipTitle}>To Hit</div>
          <div className={styles.acTooltipValue}>{`${data.toHit > 0 ? "+" : ""}${data.toHit}`}</div>
        </div>
        <div className={styles.acTooltipDivider} />
        {data.hitBonuses.map(([text, value]) => {
          return (
            <div className={styles.acTooltipSourceRow} key={text}>
              <div className={styles.acTooltipSource}>{text}</div>
              <div className={styles.acTooltipSourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
            </div>
          );
        })}
        {data.conditionalHitBonuses.length > 0 ? (
          <>
            <div className={styles.tooltipConditionalHeader}>Conditional Hit Bonuses</div>
            <div className={styles.acTooltipDivider} />
            {data.conditionalHitBonuses.map(([text, value]) => {
              return (
                <div className={styles.acTooltipSourceRow} key={text}>
                  <div className={styles.acTooltipSource}>{text}</div>
                  <div className={styles.acTooltipSourceValue}>{`${value > 0 ? "+" : ""}${value}`}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }

  private renderRangedCombatSection(): React.ReactNode {
    const attacks = getRangedAttackDataForCharacter(this.props.characterId);

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

  private renderSpeedTooltip(): React.ReactNode {
    const maxEncumbrance: Stones = getCharacterMaxEncumbrance(this.props.character);
    const speeds = getCombatSpeedsForCharacter(this.props.characterId);
    const speedIndex = getEncumbranceLevelForCharacter(this.props.characterId);

    const noEncumbranceStyle =
      speedIndex === EncumbranceLevel.None ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const lightEncumbranceStyle =
      speedIndex === EncumbranceLevel.Light ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const mediumEncumbranceStyle =
      speedIndex === EncumbranceLevel.Medium ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const heavyEncumbranceStyle =
      speedIndex === EncumbranceLevel.Heavy ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;
    const overloadedStyle =
      speedIndex === EncumbranceLevel.Overloaded ? styles.speedTooltipActiveEntry : styles.speedTooltipInactiveEntry;

    // LoadBearing alters the weight for each encumbrance level.
    const encumbranceReduction = 2 * getProficiencyRankForCharacter(this.props.characterId, SharedLoadbearing.id);

    return (
      <div className={styles.speedTooltipRoot}>
        <div className={styles.speedTooltipEncumbranceColumn}>
          <div className={styles.speedTooltipTitle}>{"Encumbrance"}</div>
          <div className={noEncumbranceStyle}>{`${5 + encumbranceReduction} stone or less`}</div>
          <div className={lightEncumbranceStyle}>{`${7 + encumbranceReduction} stone or less`}</div>
          <div className={mediumEncumbranceStyle}>{`${10 + encumbranceReduction} stone or less`}</div>
          <div className={heavyEncumbranceStyle}>{`${maxEncumbrance[0]} stone or less`}</div>
          <div className={overloadedStyle}>{`More than ${maxEncumbrance[0]} stone`}</div>
        </div>
        <div className={styles.speedTooltipSpeedColumn}>
          <div className={styles.speedTooltipTitle}>{"Speed"}</div>
          <div className={noEncumbranceStyle}>{`${speeds[0]}' / ${speeds[0] * 3}'`}</div>
          <div className={lightEncumbranceStyle}>{`${speeds[1]}' / ${speeds[1] * 3}'`}</div>
          <div className={mediumEncumbranceStyle}>{`${speeds[2]}' / ${speeds[2] * 3}'`}</div>
          <div className={heavyEncumbranceStyle}>{`${speeds[3]}' / ${speeds[3] * 3}'`}</div>
          <div className={overloadedStyle}>{`${speeds[4]}' / ${speeds[4] * 3}'`}</div>
        </div>
      </div>
    );
  }

  private renderMoneyTooltip(): React.ReactNode {
    const money = this.props.storages.reduce<number>((m, s) => {
      return m + s.money;
    }, 0);
    return (
      <div className={styles.moneyTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.moneyTooltipTitle}>{"Total GP"}</div>
          <div className={styles.moneyTooltipValue}>{addCommasToNumber(money, 2)}</div>
        </div>
        <div className={styles.moneyTooltipDivider} />
        {this.props.storages.map((s) => {
          const storageName = s.name.includes("Personal Pile") ? "Personal Pile" : s.name;
          return (
            <div className={styles.moneyTooltipSourceRow} key={s.id}>
              <div className={styles.moneyTooltipSource}>{storageName}</div>
              <div className={styles.moneyTooltipSourceValue}>{addCommasToNumber(s.money, 2)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  private onEditEquipmentClicked(): void {
    this.props.dispatch?.(
      showSubPanel({
        id: "EditEquipment",
        content: () => {
          return <EditEquipmentSubPanel />;
        },
        escapable: true,
      })
    );
  }

  private renderSavingThrowsPanel(): React.ReactNode {
    return (
      <div className={styles.savingThrowsPanel}>
        <div className={styles.savingThrowsContainer}>
          <div className={styles.savingThrowsText}>Saves</div>
          <div className={styles.horizontalLine} />
          {this.renderSavingThrowsRow("Pet & Par", SavingThrowType.PetrificationAndParalysis)}
          {this.renderSavingThrowsRow("Psn & Dth", SavingThrowType.PoisonAndDeath)}
          {this.renderSavingThrowsRow("Blst & Br", SavingThrowType.BlastAndBreath)}
          {this.renderSavingThrowsRow("Stf & Wnd", SavingThrowType.StaffsAndWands)}
          {this.renderSavingThrowsRow("Spells", SavingThrowType.Spells)}
        </div>
      </div>
    );
  }

  private renderSavingThrowsRow(name: string, type: SavingThrowType): React.ReactNode {
    if (this.props.character) {
      const characterClass = AllClasses[this.props.character.class_name];
      const baseValue = characterClass.savingThrows[type][this.props.character.level - 1];
      const calc = getSavingThrowBonusForCharacter(this.props.characterId);

      const finalValue = baseValue;
      return (
        <TooltipSource
          className={styles.row}
          tooltipParams={{
            id: `stRow${name}`,
            content: () => {
              return <BonusTooltip header={"Saving Throws"} calc={calc} hideZeroBonus={true} />;
            },
          }}
        >
          <div className={styles.savingThrowsName}>{name}</div>
          <div className={styles.savingThrowsValue}>
            {finalValue}
            {calc.conditionalSources.length > 0 || calc.sources.length > 0 ? (
              <span className={styles.infoAsterisk}>*</span>
            ) : null}
          </div>
        </TooltipSource>
      );
    } else {
      return null;
    }
  }

  private renderStatsPanel(): React.ReactNode {
    return (
      this.props.character && (
        <div className={styles.statsPanel}>
          <div className={styles.statsContainer}>
            {this.renderStatPane("STR", this.props.character.strength, this.renderStrengthTooltip.bind(this))}
            {this.renderStatPane("INT", this.props.character.intelligence, this.renderIntelligenceTooltip.bind(this))}
            {this.renderStatPane("WIS", this.props.character.wisdom, this.renderWisdomTooltip.bind(this))}
            {this.renderStatPane("DEX", this.props.character.dexterity, this.renderDexterityTooltip.bind(this))}
            {this.renderStatPane("CON", this.props.character.constitution, this.renderConstitutionTooltip.bind(this))}
            {this.renderStatPane("CHA", this.props.character.charisma, this.renderCharismaTooltip.bind(this))}
          </div>
        </div>
      )
    );
  }

  private renderStatPane(name: string, value: number, renderTooltip: () => React.ReactNode): React.ReactNode {
    const bonus = getBonusForStat(value);
    const bonusText = `${bonus > 0 ? "+" : ""}${bonus}`;

    return (
      <TooltipSource className={styles.statPanel} tooltipParams={{ id: `${name}Tooltip`, content: renderTooltip }}>
        <div className={styles.statName}>{name}</div>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statBonus}>{bonusText}</div>
      </TooltipSource>
    );
  }

  private renderStrengthTooltip(): React.ReactNode {
    return "Strength";
  }

  private renderIntelligenceTooltip(): React.ReactNode {
    return "Intelligence";
  }

  private renderWisdomTooltip(): React.ReactNode {
    return "Wisdom";
  }

  private renderDexterityTooltip(): React.ReactNode {
    return "Dexterity";
  }

  private renderConstitutionTooltip(): React.ReactNode {
    return "Constitution";
  }

  private renderCharismaTooltip(): React.ReactNode {
    return "Charisma";
  }

  private renderInjuriesPanel(): React.ReactNode {
    return (
      <div className={styles.injuriesPanel}>
        <div className={styles.row}>
          <div className={styles.injuriesTitle}>{"Injuries"}</div>
          <div className={styles.injuriesEditButton} onClick={this.onEditInjuriesClicked.bind(this)} />
        </div>
        <div className={styles.horizontalLine} />
        <AbilitiesList characterId={this.props.character?.id ?? 0} injuries={true} />
      </div>
    );
  }

  private onEditInjuriesClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "injuriesEdit",
        content: () => {
          return <EditInjuriesDialog character={this.props.character} />;
        },
        escapable: true,
        widthVmin: 45,
      })
    );
  }

  private renderLocationPanel(): React.ReactNode {
    return (
      <div className={styles.locationPanel}>
        <div className={styles.locationContainer}>
          <div className={styles.row}>
            <div className={styles.equipmentTitle}>{"Location"}</div>
            <EditButton className={styles.equipmentEditButton} onClick={this.onEditLocationClicked.bind(this)} />
          </div>
          <div className={styles.horizontalLine} />
          <div className={styles.row}>
            <div className={styles.valueText}>
              {this.props.allLocations[this.props.character?.location_id]?.name ?? "---"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  private onEditLocationClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "SelectLocation",
        widthVmin: 61,
        content: () => {
          return (
            <SelectLocationDialog
              preselectedLocationId={this.props.character.location_id}
              onSelectionConfirmed={async (locationId: number) => {
                const result = await ServerAPI.setCharacterLocation(this.props.character.id, locationId);

                if ("error" in result) {
                  this.props.dispatch?.(
                    showModal({
                      id: "setLocation Error",
                      content: {
                        title: "Error!",
                        message: "Failed to update Location.  Please check your network connection and try again.",
                      },
                      escapable: true,
                    })
                  );
                } else {
                  this.props.dispatch?.(setCharacterLocation({ characterId: this.props.character.id, locationId }));
                  this.props.dispatch?.(hideModal());
                }
              }}
            />
          );
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { allItems } = state.items;
  const { spells: allSpells, items: allItemDefs } = state.gameDefs;
  const repertoire = state.repertoires.repertoiresByCharacter[props.characterId] ?? [];
  const storages = state.storages.storagesByCharacterId[props.characterId] ?? [];
  const allLocations = state.locations.locations;
  return {
    ...props,
    allItems,
    allItemDefs,
    allSpells,
    character: state.characters.characters[props.characterId ?? 1] ?? null,
    repertoire,
    allLocations,
    storages,
  };
}

export const CharacterSheet = connect(mapStateToProps)(ACharacterSheet);
