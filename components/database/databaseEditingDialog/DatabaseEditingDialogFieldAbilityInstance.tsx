import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldAbilityInstance.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";
import { Dictionary } from "../../../lib/dictionary";
import { AbilityInstancev2 } from "../../../staticData/types/abilitiesAndProficiencies";
import { AbilityDefData } from "../../../serverAPI";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { SelectNamedValuesDialog } from "../../dialogs/SelectNamedValuesDialog";
import { AbilityTooltip } from "../tooltips/AbilityTooltip";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: AbilityInstancev2;
  onValueChange(value: AbilityInstancev2): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  abilityDefs: Dictionary<AbilityDefData>;
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

interface State {
  rankString: string;
  minLevelString: string;
}

class ADatabaseEditingDialogFieldAbilityInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      rankString: (props.value?.rank ?? 1).toFixed(0),
      minLevelString: (props.value?.minLevel ?? 1).toFixed(0),
    };
  }

  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    const abilityDef = this.props.abilityDefs[this.props.value?.abilityDefId];

    const subtypeValue = this.props.value?.subtype ?? "";
    let subtypeName: string = "---";
    if (subtypeValue !== "") {
      if (abilityDef.subtypes.includes(subtypeValue)) {
        subtypeName = subtypeValue;
      } else {
        subtypeName = "Custom";
      }
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{"Ability:\xa0"}</div>
          <div className={styles.abilityName}>{abilityDef?.name ?? "---"}</div>
          <EditButton onClick={this.onSelectAbilityClicked.bind(this)} />
        </div>
        {(abilityDef?.subtypes?.length ?? 0) > 0 ? (
          <div className={styles.row}>
            <div className={styles.label}>{"Subtype:\xa0"}</div>
            <div className={styles.abilityName}>{subtypeName}</div>
            <EditButton onClick={this.onSelectSubtypeClicked.bind(this)} />
          </div>
        ) : null}
        {abilityDef?.custom_subtypes ? (
          <div className={styles.row}>
            <div className={styles.label}>{"Custom Subtype:\xa0"}</div>
            <input
              className={styles.longField}
              type={"text"}
              value={subtypeName === "Custom" ? subtypeValue : ""}
              readOnly={this.props.isDisabled}
              onChange={(e) => {
                this.applyDataChange("subtype", e.target.value);
              }}
              tabIndex={this.props.tabIndex.value++}
            />
          </div>
        ) : null}
        <div className={styles.row}>
          <div className={styles.label}>{"Rank:\xa0"}</div>
          <input
            className={styles.field}
            type={"text"}
            value={this.state.rankString}
            readOnly={this.props.isDisabled}
            onChange={(e) => {
              this.setState({ rankString: e.target.value });
            }}
            onBlur={() => {
              this.applyDataChange("rank", +this.state.rankString);
            }}
            tabIndex={this.props.tabIndex.value++}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.label}>{"Gained At Level:\xa0"}</div>
          <input
            className={styles.field}
            type={"text"}
            value={this.state.minLevelString}
            readOnly={this.props.isDisabled}
            onChange={(e) => {
              this.setState({ minLevelString: e.target.value });
            }}
            onBlur={() => {
              this.applyDataChange("minLevel", +this.state.minLevelString);
            }}
            tabIndex={this.props.tabIndex.value++}
          />
        </div>
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.value?.rank !== prevProps.value?.rank) {
      this.setState({ rankString: (this.props.value?.rank ?? 1).toFixed(0) });
    }
    if (this.props.value?.minLevel !== prevProps.value?.minLevel) {
      this.setState({ minLevelString: (this.props.value?.minLevel ?? 1).toFixed(0) });
    }
  }

  private onSelectAbilityClicked(): void {
    // Pop a selector dialog.
    this.props.dispatch?.(
      showModal({
        id: "SelectAbility",
        content: () => {
          return (
            <SelectNamedValuesDialog
              prompt={"Select an Ability"}
              availableValues={this.getSortedAbilityEntries()}
              preselectedValues={[this.props.value.abilityDefId]}
              onSelectionConfirmed={(abilityDefIds: number[]) => {
                if (abilityDefIds[0] !== this.props.value.abilityDefId) {
                  // When the ability changes, clear the subtype, as the new ability probably won't have
                  // the same list of subtypes.
                  this.props.onValueChange({ ...this.props.value, abilityDefId: abilityDefIds[0], subtype: undefined });
                }
              }}
              renderTooltip={(abilityDefId: number) => {
                return <AbilityTooltip defId={abilityDefId} />;
              }}
            />
          );
        },
      })
    );
  }

  private getSortedAbilityEntries(): [string, number][] {
    // Sort abilities alphabetically.
    const sortedAbilities = Object.values(this.props.abilityDefs).sort((a, b) => a.name.localeCompare(b.name));

    // Tuple is [abilityName, abilityId].
    return sortedAbilities.map((def) => [def.name, def.id]);
  }

  private onSelectSubtypeClicked(): void {
    // Pop a selector dialog.
    const abilityDef = this.props.abilityDefs[this.props.value?.abilityDefId];

    this.props.dispatch?.(
      showModal({
        id: "SelectSubtype",
        content: () => {
          return (
            <SelectNamedValuesDialog
              prompt={"Select a Subtype"}
              availableValues={abilityDef.subtypes.map((subtype) => [subtype, subtype])}
              preselectedValues={this.props.value.subtype ? [this.props.value.subtype] : []}
              onSelectionConfirmed={(subtypes: string[]) => {
                const subtype = subtypes[0] ?? "";
                this.props.onValueChange({ ...this.props.value, subtype });
              }}
            />
          );
        },
      })
    );
  }

  private applyDataChange(fieldName: string, value: any): void {
    const newData: AbilityInstancev2 = {
      ...this.props.value,
      [fieldName]: value,
    };
    this.props.onValueChange(newData);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const abilityDefs = state.gameDefs.abilities;
  return {
    ...props,
    abilityDefs,
  };
}

export const DatabaseEditingDialogFieldAbilityInstance = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldAbilityInstance
);
