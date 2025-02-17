import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldDatabaseDef.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { DatabaseEditingDialogFieldDef, ExtraFieldDataDatabaseDef } from "./databaseUtils";
import { GameDefsReduxState } from "../../../redux/gameDefsSlice";
import { SearchableDef } from "../SearchableDefList";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { SelectNamedValuesDialog } from "../../dialogs/SelectNamedValuesDialog";
import TooltipSource from "../../TooltipSource";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number;
  onValueChange(value: number): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  gameDefs: GameDefsReduxState;
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldDatabaseDef extends React.Component<Props> {
  render(): React.ReactNode {
    const { def, gameDefs, value } = this.props;
    if (!def || !def.extra) {
      return null;
    }

    const extra = def.extra as ExtraFieldDataDatabaseDef;
    const matchingDefs: Record<number, any> = gameDefs[extra?.gameDefsName];
    const selectedDef = matchingDefs?.[value] as SearchableDef;

    if (!!selectedDef && (!("id" in selectedDef) || !("name" in selectedDef))) {
      console.error(`Improperly defined DatabaseDef field detected`, def);
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{`${def.labelTexts[0]}:\xa0`}</div>
          <TooltipSource
            className={styles.abilityName}
            tooltipParams={{
              id: `DBDef${extra?.gameDefsName}${value}`,
              content: () => {
                return extra.renderTooltip?.(selectedDef) ?? null;
              },
            }}
          >
            {selectedDef?.name ?? "---"}
          </TooltipSource>
          <EditButton onClick={this.onSelectClicked.bind(this)} />
        </div>
      </div>
    );
  }

  private onSelectClicked(): void {
    const extra = this.props.def.extra as ExtraFieldDataDatabaseDef;

    // Pop a selector dialog.
    this.props.dispatch?.(
      showModal({
        id: "SelectDatabaseDef",
        content: () => {
          return (
            <SelectNamedValuesDialog
              prompt={"Select One"}
              availableValues={this.getSortedDatabaseDefEntries()}
              preselectedValues={[this.props.value]}
              onSelectionConfirmed={(defs: SearchableDef[]) => {
                if (defs[0].id !== this.props.value) {
                  this.props.onValueChange(defs[0].id);
                }
              }}
              renderTooltip={extra.renderTooltip}
            />
          );
        },
      })
    );
  }

  private getSortedDatabaseDefEntries(): [string, SearchableDef][] {
    const extra = this.props.def.extra as ExtraFieldDataDatabaseDef;
    const allDefs = this.props.gameDefs[extra?.gameDefsName] ?? {};
    // Sort db defs alphabetically.
    const sortedAbilities = Object.values(allDefs).sort((a, b) => a.name.localeCompare(b.name));

    return sortedAbilities.map((def) => [def.name, def]);
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    gameDefs: state.gameDefs,
  };
}

export const DatabaseEditingDialogFieldDatabaseDef = connect(mapStateToProps)(ADatabaseEditingDialogFieldDatabaseDef);
