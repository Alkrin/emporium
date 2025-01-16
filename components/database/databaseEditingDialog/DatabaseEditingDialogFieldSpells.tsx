import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import styles from "./DatabaseEditingDialogFieldSpells.module.scss";
import { PassableTabIndex } from "./DatabaseEditingDialog";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { SelectSpellsDialog } from "../../dialogs/SelectSpellsDialog";
import { SpellDefData } from "../../../serverAPI";
import { Dictionary } from "../../../lib/dictionary";
import { DatabaseEditingDialogFieldDef } from "./databaseUtils";

interface ReactProps {
  def: DatabaseEditingDialogFieldDef;
  value: number[];
  onValueChange(value: number[]): void;
  tabIndex: PassableTabIndex;
  isDisabled?: boolean;
}

interface InjectedProps {
  allSpellDefs: Dictionary<SpellDefData>;
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

class ADatabaseEditingDialogFieldSpells extends React.Component<Props> {
  render(): React.ReactNode {
    const { def } = this.props;
    if (!def) {
      return null;
    }
    let value = this.props.value ?? [];

    return (
      <div className={styles.root}>
        <div className={styles.row}>
          <div className={styles.label}>{def.labelTexts[0]}</div>
          <EditButton
            className={styles.button}
            onClick={this.onClick.bind(this)}
            tabIndex={this.props.tabIndex.value++}
          />
        </div>
        {value.length > 0 && (
          <div className={styles.associatedSpells}>
            {value
              .map((sid) => {
                const def = this.props.allSpellDefs[sid];
                const level = Object.values(def.type_levels).reduce<number>(
                  (lowestLevel: number, currLevel: number) => Math.min(lowestLevel, currLevel),
                  Number.MAX_SAFE_INTEGER
                );
                return `L${level} ${def.name}`;
              })
              .join(", ")}
          </div>
        )}
      </div>
    );
  }

  private onClick(): void {
    this.props.dispatch?.(
      showModal({
        id: "EditSpells",
        content: () => {
          return (
            <SelectSpellsDialog
              preselectedSpellIds={this.props.value ?? []}
              onSelectionConfirmed={(spell_ids) => {
                this.props.onValueChange(spell_ids);
              }}
            />
          );
        },
      })
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allSpellDefs = state.gameDefs.spells;
  return {
    ...props,
    allSpellDefs,
  };
}

export const DatabaseEditingDialogFieldSpells = connect(mapStateToProps)(ADatabaseEditingDialogFieldSpells);
