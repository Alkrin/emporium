import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldAbilityFilter.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";
import { Dictionary } from "../../../lib/dictionary";
import { AbilityFilterv2 } from "../../../staticData/types/abilitiesAndProficiencies";
import { AbilityDefData } from "../../../serverAPI";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { SelectNamedValuesDialog } from "../../dialogs/SelectNamedValuesDialog";
import { AbilityTooltip } from "../tooltips/AbilityTooltip";
import { SelectStringsDialog } from "../../dialogs/SelectStringsDialog";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: AbilityFilterv2;
  onValueChange(value: AbilityFilterv2): void;
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
}

class ADatabaseEditingDialogFieldAbilityFilter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      rankString: (props.value?.rank ?? 1).toFixed(0),
    };
  }

  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }

    const abilityDef = this.props.abilityDefs[this.props.value?.abilityDefId];

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{"Ability:\xa0"}</div>
          <div className={styles.abilityName}>{abilityDef?.name ?? "---"}</div>
          <EditButton onClick={this.onSelectAbilityClicked.bind(this)} />
        </div>
        {(abilityDef?.subtypes?.length ?? 0) > 0 ? (
          <div className={styles.row}>
            <div className={styles.label}>{"Subtypes:\xa0"}</div>
            <div className={styles.abilityName}>{this.props.value?.subtypes?.join(", ") ?? "All"}</div>
            <EditButton onClick={this.onSelectSubtypesClicked.bind(this)} />
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
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.value?.rank !== prevProps.value?.rank) {
      this.setState({ rankString: (this.props.value?.rank ?? 1).toFixed(0) });
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
                  this.props.onValueChange({ ...this.props.value, abilityDefId: abilityDefIds[0], subtypes: [] });
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

  private onSelectSubtypesClicked(): void {
    // Pop a selector dialog.
    const abilityDef = this.props.abilityDefs[this.props.value?.abilityDefId];

    this.props.dispatch?.(
      showModal({
        id: "SelectSubtypes",
        content: () => {
          return (
            <SelectStringsDialog
              availableStrings={abilityDef.subtypes.slice().sort()}
              preselectedStrings={this.props.value.subtypes}
              onSelectionConfirmed={this.applyDataChange.bind(this, "subtypes")}
            />
          );
        },
      })
    );
  }

  private applyDataChange(fieldName: string, value: any): void {
    const newData: AbilityFilterv2 = {
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

export const DatabaseEditingDialogFieldAbilityFilter = connect(mapStateToProps)(
  ADatabaseEditingDialogFieldAbilityFilter
);
