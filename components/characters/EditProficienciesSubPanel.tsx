import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchProficiencies } from "../../dataSources/ProficienciesDataSource";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { CharacterData, ProficiencyData } from "../../serverAPI";
import { AllClasses } from "../../staticData/characterClasses/AllClasses";
import { AllProficiencies } from "../../staticData/proficiencies/AllProficiencies";
import { GeneralProficiencies } from "../../staticData/proficiencies/GeneralProficiencies";
import {
  AbilityOrProficiency,
  GeneralProficienciesAt,
  ProficiencySource,
} from "../../staticData/types/abilitiesAndProficiencies";
import Draggable from "../Draggable";
import DraggableHandle from "../DraggableHandle";
import DropTarget from "../DropTarget";
import TooltipSource from "../TooltipSource";
import styles from "./EditProficienciesSubPanel.module.scss";
import { AllClassFeatures } from "../../staticData/classFeatures/AllClassFeatures";

const DropTypeClassProficiency = "ClassProficiency";
const DropTypeGeneralProficiency = "GeneralProficiency";

interface AbilityDisplayData {
  name: string;
  rank: number;
  subtype?: string;
  def: AbilityOrProficiency;
}

interface State {
  isSaving: boolean;
  assignedClassProficiencies: Dictionary<AbilityDisplayData>;
  assignedGeneralProficiencies: Dictionary<AbilityDisplayData>;
  assignedExtraProficiencies: AbilityDisplayData[];
}

interface ReactProps {}

interface InjectedProps {
  character: CharacterData;
  proficiencies: ProficiencyData[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AEditProficienciesSubPanel extends React.Component<Props, State> {
  private originalClassProficiencies: Dictionary<AbilityDisplayData> = {};
  private originalGeneralProficiencies: Dictionary<AbilityDisplayData> = {};
  private originalExtraProficiencies: AbilityDisplayData[] = [];

  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      assignedClassProficiencies: {},
      assignedGeneralProficiencies: {},
      assignedExtraProficiencies: [],
    };
  }

  render(): React.ReactNode {
    const characterClass = AllClasses[this.props.character.class_name];

    return (
      <div className={styles.root}>
        <div className={styles.classFeaturesRoot}>
          <div className={styles.sectionTitle}>Class Features</div>
          <div className={styles.classFeaturesList}>
            {this.getSortedClassFeatures().map(this.renderFeatureRow.bind(this))}
          </div>
        </div>
        <div className={styles.classProficiencySlotsRoot}>
          <div className={styles.sectionTitle}>Class Proficiency Slots</div>
          <div className={styles.classProficiencySlotsList}>
            {characterClass.classProficienciesAt.map(this.renderClassProficiencySlotRow.bind(this))}
          </div>
        </div>
        <div className={styles.generalProficiencySlotsRoot}>
          <div className={styles.sectionTitle}>General Proficiency Slots</div>
          <div className={styles.generalProficiencySlotsList}>
            {GeneralProficienciesAt.map(this.renderGeneralProficiencySlotRow.bind(this))}
          </div>
        </div>
        <div className={styles.extraProficiencySlotsRoot}>
          <div className={styles.sectionTitle}>Extra Proficiency Slots</div>
          <div className={styles.extraProficiencySlotsList}>
            {this.renderExtraProficiencySlotRow(0)}
            {this.renderExtraProficiencySlotRow(1)}
            {this.renderExtraProficiencySlotRow(2)}
            {this.renderExtraProficiencySlotRow(3)}
            {this.renderExtraProficiencySlotRow(4)}
          </div>
        </div>
        <div className={styles.classProficienciesListRoot}>
          <div className={styles.sectionTitle}>Available Class Proficiencies</div>
          <div className={styles.classProficienciesList}>
            {this.getSortedAvailableClassProficiencies().map(this.renderAvailableClassProficiencyRow.bind(this))}
          </div>
        </div>
        <div className={styles.generalProficienciesListRoot}>
          <div className={styles.sectionTitle}>Available General Proficiencies</div>
          <div className={styles.generalProficienciesList}>
            {this.getSortedGeneralProficiencies().map(this.renderAvailableGeneralProficiencyRow.bind(this))}
          </div>
        </div>
        <div className={styles.saveButton} onClick={this.onSaveClicked.bind(this)}>
          Save Changes
        </div>
        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
      </div>
    );
  }

  componentDidMount(): void {
    // Populate assigned proficiencies state.
    const assignedClassProficiencies: Dictionary<AbilityDisplayData> = {};
    const assignedGeneralProficiencies: Dictionary<AbilityDisplayData> = {};
    const assignedExtraProficiencies: AbilityDisplayData[] = [];
    // The fetch returns proficiencies in order sorted by `source`, so Class and General should already be in numeric order.
    this.props.proficiencies.forEach((datum) => {
      const displayData = this.buildDisplayDataFromProficiencyData(datum);
      if (datum.source.startsWith("Class")) {
        assignedClassProficiencies[datum.source] = displayData;
      } else if (datum.source.startsWith("General")) {
        assignedGeneralProficiencies[datum.source] = displayData;
      } else if (datum.source.startsWith("Extra")) {
        assignedExtraProficiencies.push(displayData);
      }
    });

    // Hold onto a copy so we can detect changes.
    this.originalClassProficiencies = assignedClassProficiencies;
    this.originalGeneralProficiencies = assignedGeneralProficiencies;
    this.originalExtraProficiencies = assignedExtraProficiencies;

    this.setState({ assignedClassProficiencies, assignedGeneralProficiencies, assignedExtraProficiencies });
  }

  private renderAvailableClassProficiencyRow(data: AbilityDisplayData): React.ReactNode {
    const draggableId = `DragAvailableClassProficiency:${data.name}`;
    return (
      <Draggable className={styles.availableProficiencyRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.availableProficiencyRowDraggableHandle}
          draggableId={draggableId}
          dropTypes={[DropTypeClassProficiency]}
          draggingRender={() => {
            return this.renderAvailableProficiencyRowContents(data);
          }}
          dropHandler={(dropTargetIds) => {
            this.handleProficiencyDropped(dropTargetIds[0], data);
          }}
        >
          <TooltipSource
            className={styles.availableProficiencyRowDraggableHandle}
            tooltipParams={{
              id: data.def.id,
              content: this.renderAbilityTooltip.bind(
                this,
                data,
                this.getCurrentProficiencyRank(data.def.id, data.subtype) + 1
              ),
            }}
          />
        </DraggableHandle>
        {this.renderAvailableProficiencyRowContents(data)}
      </Draggable>
    );
  }

  private renderAvailableGeneralProficiencyRow(data: AbilityDisplayData): React.ReactNode {
    const draggableId = `DragAvailableGeneralProficiency:${data.name}`;
    return (
      <Draggable className={styles.availableProficiencyRowDraggable} draggableId={draggableId} key={draggableId}>
        <DraggableHandle
          className={styles.availableProficiencyRowDraggableHandle}
          draggableId={draggableId}
          dropTypes={[DropTypeGeneralProficiency]}
          draggingRender={() => {
            return this.renderAvailableProficiencyRowContents(data);
          }}
          dropHandler={(dropTargetIds) => {
            this.handleProficiencyDropped(dropTargetIds[0], data);
          }}
        >
          <TooltipSource
            className={styles.availableProficiencyRowDraggableHandle}
            tooltipParams={{
              id: data.def.id,
              content: this.renderAbilityTooltip.bind(
                this,
                data,
                this.getCurrentProficiencyRank(data.def.id, data.subtype) + 1
              ),
            }}
          />
        </DraggableHandle>
        {this.renderAvailableProficiencyRowContents(data)}
      </Draggable>
    );
  }

  private handleProficiencyDropped(dropTargetId: string | null, data: AbilityDisplayData): void {
    // If the proficiency was dropped into open space, we don't have to do anything.
    if (!dropTargetId || dropTargetId.length === 0) {
      return;
    }

    if (dropTargetId.startsWith("Class")) {
      const assignedClassProficiencies = { ...this.state.assignedClassProficiencies };
      assignedClassProficiencies[dropTargetId] = data;
      this.setState({ assignedClassProficiencies });
    } else if (dropTargetId.startsWith("General")) {
      const assignedGeneralProficiencies = { ...this.state.assignedGeneralProficiencies };
      assignedGeneralProficiencies[dropTargetId] = data;
      this.setState({ assignedGeneralProficiencies });
    } else if (dropTargetId.startsWith("Extra")) {
      const assignedExtraProficiencies = [...this.state.assignedExtraProficiencies];
      const index = +dropTargetId.charAt(5) - 1;
      assignedExtraProficiencies[index] = data;
      this.setState({ assignedExtraProficiencies });
    }
  }

  private renderAvailableProficiencyRowContents(data: AbilityDisplayData): React.ReactNode {
    return (
      <div className={styles.availableProficiencyRowContentWrapper}>
        <div className={styles.availableProficiencyName}>{data.name}</div>
      </div>
    );
  }

  private buildDisplayDataFromProficiencyData(pData: ProficiencyData): AbilityDisplayData {
    let def = AllProficiencies[pData.feature_id];
    if (!def) {
      def = AllClassFeatures[pData.feature_id];
    }
    let displayName: string = def.name;
    if (pData.subtype && pData.subtype.length > 0) {
      displayName = `${displayName} (${pData.subtype})`;
    }

    const data: AbilityDisplayData = {
      name: displayName,
      rank: 1,
      subtype: pData.subtype,
      def: AllProficiencies[pData.feature_id],
    };
    return data;
  }

  private getSortedAvailableClassProficiencies(): AbilityDisplayData[] {
    const data: AbilityDisplayData[] = [];

    const characterClass = AllClasses[this.props.character.class_name];
    characterClass.classProficiencies.forEach((filter) => {
      // If the filter lists subtypes, iterate those.
      // If the filter doesn't list subtypes but the def does, iterate those.
      // If the def has no subtypes, just make a single displayData.
      let subtypesToIterate: string[] = [];
      if (filter.subtypes && filter.subtypes.length > 0) {
        subtypesToIterate = filter.subtypes;
      } else if (filter.def.subTypes && filter.def.subTypes.length > 0) {
        subtypesToIterate = filter.def.subTypes;
      }

      // If the proficiency is currently owned at a level less than its maximum rank, add it.
      const maxRank = filter.def.description.length;
      if (subtypesToIterate.length === 0) {
        // Single standard proficiency, no subtypes.
        if (this.getCurrentProficiencyRank(filter.def.id) < maxRank) {
          data.push(this.buildDisplayDataForProficiency(filter.def));
        }
      } else {
        // Has subtype(s).  One entry for each.
        subtypesToIterate.forEach((subtype) => {
          if (this.getCurrentProficiencyRank(filter.def.id, subtype) < maxRank) {
            data.push(this.buildDisplayDataForProficiency(filter.def, subtype));
          }
        });
      }
    });

    // Sort the proficiencies by name.
    data.sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return data;
  }

  private getSortedGeneralProficiencies(): AbilityDisplayData[] {
    const data: AbilityDisplayData[] = [];

    GeneralProficiencies.forEach((def) => {
      // If the filter lists subtypes, iterate those.
      // If the filter doesn't list subtypes but the def does, iterate those.
      // If the def has no subtypes, just make a single displayData.
      let subtypesToIterate: string[] = def.subTypes ?? [];

      // If the proficiency is currently owned at a level less than its maximum rank, add it.
      const maxRank = def.description.length;
      if (subtypesToIterate.length === 0) {
        // Single standard proficiency, no subtypes.
        if (this.getCurrentProficiencyRank(def.id) < maxRank) {
          data.push(this.buildDisplayDataForProficiency(def));
        }
      } else {
        // Has subtype(s).  One entry for each.
        subtypesToIterate.forEach((subtype) => {
          if (this.getCurrentProficiencyRank(def.id, subtype) < maxRank) {
            data.push(this.buildDisplayDataForProficiency(def, subtype));
          }
        });
      }
    });

    // Sort the proficiencies by name.
    data.sort((dataA, dataB) => {
      return dataA.name.localeCompare(dataB.name);
    });

    return data;
  }

  private buildDisplayDataForProficiency(def: AbilityOrProficiency, subtype?: string): AbilityDisplayData {
    let displayName: string = def.name;
    if (subtype && subtype.length > 0) {
      displayName = `${def.name} (${subtype})`;
    }

    const data: AbilityDisplayData = {
      name: displayName,
      def,
      rank: 1,
      subtype,
    };
    return data;
  }

  private getCurrentProficiencyRank(feature_id: string, subtype?: string): number {
    let currentRank = 0;

    // Check if it is granted by the class at the current level.
    const characterClass = AllClasses[this.props.character.class_name];
    if (
      characterClass.classFeatures.find((filter) => {
        return (
          filter.def.id === feature_id &&
          (!subtype || filter.subtypes?.[0] === subtype) &&
          filter.def.minLevel <= this.props.character.level
        );
      })
    ) {
      currentRank += 1;
    }

    // Check if it is assigned to any of the proficiency slots.
    // In class proficiencies?
    Object.values(this.state.assignedClassProficiencies).forEach((prof) => {
      if (prof.def.id === feature_id && (!subtype || subtype === prof.subtype)) {
        currentRank += 1;
      }
    });
    // In general proficiencies?
    Object.values(this.state.assignedGeneralProficiencies).forEach((prof) => {
      if (prof.def.id === feature_id && (!subtype || subtype === prof.subtype)) {
        currentRank += 1;
      }
    });
    // In extra proficiencies?
    this.state.assignedExtraProficiencies.forEach((prof) => {
      if (prof.def.id === feature_id && (!subtype || subtype === prof.subtype)) {
        currentRank += 1;
      }
    });

    return currentRank;
  }

  private renderExtraProficiencySlotRow(index: number): React.ReactNode {
    const numExtras = this.state.assignedExtraProficiencies.length;
    if (numExtras < index) {
      return null;
    }

    const data = this.state.assignedExtraProficiencies[index];
    const changedClass =
      data?.def?.id !== this.originalExtraProficiencies[index]?.def?.id ||
      data?.subtype !== this.originalExtraProficiencies[index]?.subtype
        ? styles.changed
        : "";

    return (
      <div className={styles.proficiencySlotRow} key={`extraProfSlotRow${index}`}>
        <div className={styles.listRequiredLevel}></div>
        <DropTarget
          dropTypes={[DropTypeGeneralProficiency, DropTypeClassProficiency]}
          dropId={`Extra${index + 1}`}
          className={`${styles.proficiencySlot} ${changedClass}`}
        >
          {data && (
            <TooltipSource
              tooltipParams={{
                id: data.def.id,
                content: this.renderAbilityTooltip.bind(
                  this,
                  data,
                  this.getCurrentProficiencyRank(data.def.id, data.subtype)
                ),
              }}
            >
              <div className={styles.assignedProficiencyName}>{data.name}</div>
            </TooltipSource>
          )}
        </DropTarget>
        {data && (
          <div
            className={styles.cancelButton}
            onClick={this.onRemoveProficiencyClicked.bind(this, `Extra${index + 1}` as ProficiencySource)}
          />
        )}
      </div>
    );
  }

  private renderClassProficiencySlotRow(atLevel: number, index: number): React.ReactNode {
    const readyClass = atLevel > this.props.character.level ? styles.notReady : "";
    const source = `Class${index + 1}` as ProficiencySource;
    const data = this.state.assignedClassProficiencies[source];
    const changedClass =
      data?.def?.id !== this.originalClassProficiencies[source]?.def?.id ||
      data?.subtype !== this.originalClassProficiencies[source]?.subtype
        ? styles.changed
        : "";
    return (
      <div className={styles.proficiencySlotRow} key={`classProfSlotRow${index}`}>
        <div className={`${styles.listRequiredLevel} ${readyClass}`}>@ L{atLevel}</div>

        <DropTarget
          dropTypes={[DropTypeClassProficiency]}
          dropId={source}
          className={`${styles.proficiencySlot} ${changedClass}`}
        >
          {data && (
            <TooltipSource
              tooltipParams={{
                id: data.def.id,
                content: this.renderAbilityTooltip.bind(
                  this,
                  data,
                  this.getCurrentProficiencyRank(data.def.id, data.subtype)
                ),
              }}
            >
              <div className={styles.assignedProficiencyName}>{data.name}</div>
            </TooltipSource>
          )}
        </DropTarget>
        {data && <div className={styles.cancelButton} onClick={this.onRemoveProficiencyClicked.bind(this, source)} />}
      </div>
    );
  }

  private onRemoveProficiencyClicked(source: ProficiencySource): void {
    if (source.startsWith("Class")) {
      const assignedClassProficiencies = { ...this.state.assignedClassProficiencies };
      delete assignedClassProficiencies[source];
      this.setState({ assignedClassProficiencies });
    } else if (source.startsWith("General")) {
      const assignedGeneralProficiencies = { ...this.state.assignedGeneralProficiencies };
      delete assignedGeneralProficiencies[source];
      this.setState({ assignedGeneralProficiencies });
    } else if (source.startsWith("Extra")) {
      const index = +source.charAt(5);
      const assignedExtraProficiencies = [...this.state.assignedExtraProficiencies].splice(index, 1);
      this.setState({ assignedExtraProficiencies });
    }
  }

  private renderGeneralProficiencySlotRow(atLevel: number, index: number): React.ReactNode {
    const characterClass = AllClasses[this.props.character.class_name];
    // If this class can't reach the `atLevel`, they don't get this general proficiency slot.
    if (characterClass.xpToLevel.length < atLevel) {
      return null;
    }

    const source = `General${index + 1}` as ProficiencySource;
    const data = this.state.assignedGeneralProficiencies[source];
    const changedClass =
      data?.def?.id !== this.originalGeneralProficiencies[source]?.def?.id ||
      data?.subtype !== this.originalGeneralProficiencies[source]?.subtype
        ? styles.changed
        : "";

    const readyClass = atLevel > this.props.character.level ? styles.notReady : "";
    return (
      <div className={styles.proficiencySlotRow} key={`generalProfSlotRow${index}`}>
        <div className={`${styles.listRequiredLevel} ${readyClass}`}>@ L{atLevel}</div>
        <DropTarget
          dropTypes={[DropTypeGeneralProficiency]}
          dropId={`General${index + 1}`}
          className={`${styles.proficiencySlot} ${changedClass}`}
        >
          {data && (
            <TooltipSource
              tooltipParams={{
                id: data.def.id,
                content: this.renderAbilityTooltip.bind(
                  this,
                  data,
                  this.getCurrentProficiencyRank(data.def.id, data.subtype)
                ),
              }}
            >
              <div className={styles.assignedProficiencyName}>{data.name}</div>
            </TooltipSource>
          )}
        </DropTarget>
        {data && <div className={styles.cancelButton} onClick={this.onRemoveProficiencyClicked.bind(this, source)} />}
      </div>
    );
  }

  private getSortedClassFeatures(): AbilityDisplayData[] {
    const characterClass = AllClasses[this.props.character.class_name];

    const features: AbilityDisplayData[] = [];

    // Static features.
    characterClass.classFeatures.forEach((feature) => {
      features.push({
        name: feature.def.name,
        rank: feature.rank ?? 1,
        subtype: feature.subtypes?.[0] ?? "",
        def: feature.def,
      });
    });

    // Selectable features.
    characterClass.selectableClassFeatures.forEach((selectableFeature, index) => {
      const selection = this.props.proficiencies.filter((pdata) => {
        return pdata.source === (`Selectable${index + 1}` as ProficiencySource);
      });
      let def = AllProficiencies[selection[0].feature_id];
      if (!def) {
        def = AllClassFeatures[selection[0].feature_id];
      }

      features.push({
        name: def.name,
        rank: selection.length,
        subtype: selection[0].subtype ?? "",
        def,
      });
    });

    features.sort((dataA, dataB) => {
      // Sort in order the features are granted.
      if (dataA.def.minLevel !== dataB.def.minLevel) {
        return dataA.def.minLevel - dataB.def.minLevel;
      }

      // Then sort by name.
      return dataA.name.localeCompare(dataB.name);
    });

    return features;
  }

  private renderAbilityTooltip(ability: AbilityDisplayData, rank: number): React.ReactNode {
    return (
      <div className={styles.tooltipRoot}>
        <div className={styles.tooltipTitle}>{ability.name}</div>
        <div className={styles.tooltipText}>{ability.def.description[rank - 1]}</div>
      </div>
    );
  }

  private renderFeatureRow(ability: AbilityDisplayData, index: number): React.ReactNode {
    const readyClass = ability.def.minLevel > this.props.character.level ? styles.notReady : "";
    let featureName = ability.name;
    if (ability.subtype) {
      featureName += ` (${ability.subtype})`;
    }
    if (ability.rank > 1) {
      featureName += ` ${this.getRomanNumerals(ability.rank)}`;
    }
    return (
      <TooltipSource
        className={`${styles.classFeaturesListRow} ${readyClass}`}
        key={`featureRow${index}`}
        tooltipParams={{
          id: ability.name,
          content: this.renderAbilityTooltip.bind(this, ability, ability.rank),
        }}
      >
        <div className={`${styles.listRequiredLevel} ${readyClass}`}>@ L{ability.def.minLevel} </div>
        <div className={styles.listName}>{featureName}</div>
      </TooltipSource>
    );
  }

  private getRomanNumerals(num: number): string {
    const numerals = ["0", "I", "II", "III", "IV", "V"];
    return numerals[num] ?? "";
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }

    // Check for changes.  Display names include subtype, so we can just compare names.
    const oldClassKeys = Object.keys(this.originalClassProficiencies);
    const oldGeneralKeys = Object.keys(this.originalGeneralProficiencies);
    const classKeys = Object.keys(this.state.assignedClassProficiencies);
    const generalKeys = Object.keys(this.state.assignedGeneralProficiencies);
    // Changes in number of entries are the cheapest thing to check.
    let hasChanges: boolean =
      this.originalExtraProficiencies.length !== this.state.assignedExtraProficiencies.length ||
      oldClassKeys.length !== classKeys.length ||
      oldGeneralKeys.length !== generalKeys.length;

    if (!hasChanges) {
      // Check Class assignments.
      oldClassKeys.forEach((key) => {
        hasChanges =
          hasChanges ||
          this.originalClassProficiencies[key].def.id !== this.state.assignedClassProficiencies[key].def.id;
      });
    }
    if (!hasChanges) {
      // Check General assignments.
      oldGeneralKeys.forEach((key) => {
        hasChanges =
          hasChanges ||
          this.originalGeneralProficiencies[key].def.id !== this.state.assignedGeneralProficiencies[key].def.id;
      });
    }

    // Check Extra assignments.
    for (let i = 0; !hasChanges && i < this.originalExtraProficiencies.length; ++i) {
      hasChanges = this.originalExtraProficiencies[i].def.id !== this.state.assignedExtraProficiencies[i].def.id;
    }

    // If nothing changed, do nothing.
    if (!hasChanges) {
      return;
    }

    this.setState({ isSaving: true });

    // Send it to the server!
    const pData: ProficiencyData[] = [];
    classKeys.forEach((source) => {
      pData.push(
        this.buildProficiencyDataFromDisplayData(
          this.state.assignedClassProficiencies[source],
          source as ProficiencySource
        )
      );
    });
    generalKeys.forEach((source) => {
      pData.push(
        this.buildProficiencyDataFromDisplayData(
          this.state.assignedGeneralProficiencies[source],
          source as ProficiencySource
        )
      );
    });
    this.state.assignedExtraProficiencies.forEach((datum) => {
      pData.push(this.buildProficiencyDataFromDisplayData(datum, ProficiencySource.Extra));
    });

    const res = await ServerAPI.updateProficiencies(this.props.character.id, pData);
    console.log(res);

    this.setState({ isSaving: false });
    // // Refetch proficiencies.
    if (this.props.dispatch) {
      await refetchProficiencies(this.props.dispatch);
    }
    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private buildProficiencyDataFromDisplayData(
    displayData: AbilityDisplayData,
    source: ProficiencySource
  ): ProficiencyData {
    return {
      character_id: this.props.character.id,
      feature_id: displayData.def.id,
      subtype: displayData.def.subTypes?.[0] ?? "",
      source,
    };
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[state.characters.activeCharacterId];
  const proficiencies = state.proficiencies.proficienciesByCharacterId[state.characters.activeCharacterId] ?? [];
  return {
    ...props,
    character,
    proficiencies,
  };
}

export const EditProficienciesSubPanel = connect(mapStateToProps)(AEditProficienciesSubPanel);
