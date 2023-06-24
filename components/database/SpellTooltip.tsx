import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { SpellDefData } from "../../serverAPI";
import styles from "./SpellTooltip.module.scss";

interface ReactProps {
  spellId: number;
}

interface InjectedProps {
  spellDef?: SpellDefData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASpellTooltip extends React.Component<Props> {
  render(): React.ReactNode {
    const { spellDef } = this.props;
    if (!spellDef) {
      return null;
    }

    return (
      <div className={styles.root}>
        <div className={styles.nameRow}>
          <div className={styles.name}>{spellDef.name}</div>
          <div className={styles.range}>
            <span className={styles.pretext}>Range: </span>
            {spellDef.spell_range}
          </div>
        </div>
        <div className={styles.row}>
          {Object.entries(spellDef.type_levels).map(([type, level]) => {
            return <div className={styles.typeAndLevel} key={type}>{`${type} ${level}`}</div>;
          })}
        </div>
        <div className={styles.duration}>
          <span className={styles.pretext}>Duration: </span>
          {spellDef.duration}
        </div>
        <div className={styles.description}>{spellDef.description}</div>
        {spellDef.table_image?.length > 0 && (
          <img className={styles.table} src={`/images/tables/${spellDef.table_image}`} />
        )}
        <div className={styles.spellId}>#{this.props.spellId}</div>
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const spellDef = state.gameDefs.spells[props.spellId];

  return {
    ...props,
    spellDef,
  };
}

export const SpellTooltip = connect(mapStateToProps)(ASpellTooltip);
