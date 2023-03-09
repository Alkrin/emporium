import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../redux/store";
import { CharacterData } from "../../serverAPI";
import TooltipSource from "../TooltipSource";
import styles from "./CharacterSheet.module.scss";

interface ReactProps {
  character: CharacterData | null;
  exiting: boolean;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterSheet extends React.Component<Props> {
  render(): React.ReactNode {
    const animationClass = this.props.exiting ? styles.exit : styles.enter;

    return (
      <div className={`${styles.root} ${animationClass}`}>
        {this.props.character ? (
          <>
            <div
              className={styles.nameLabel}
            >{`${this.props.character.name}, L${this.props.character.level} ${this.props.character.class_name}`}</div>
            {this.renderStatsPane()}
          </>
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
    );
  }

  private renderStatsPane(): React.ReactNode {
    return (
      this.props.character && (
        <div className={styles.statsPanel}>
          {this.renderStatPane("STR", this.props.character.strength, this.renderStrengthTooltip.bind(this))}
          {this.renderStatPane("INT", this.props.character.intelligence, this.renderIntelligenceTooltip.bind(this))}
          {this.renderStatPane("WIS", this.props.character.wisdom, this.renderWisdomTooltip.bind(this))}
          {this.renderStatPane("DEX", this.props.character.dexterity, this.renderDexterityTooltip.bind(this))}
          {this.renderStatPane("CON", this.props.character.constitution, this.renderConstitutionTooltip.bind(this))}
          {this.renderStatPane("CHA", this.props.character.charisma, this.renderCharismaTooltip.bind(this))}
        </div>
      )
    );
  }

  private renderStatPane(name: string, value: number, renderTooltip: () => React.ReactNode): React.ReactNode {
    const bonus = this.bonusForStat(value);
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

  private bonusForStat(value: number) {
    if (value <= 3) return -3;
    if (value <= 5) return -2;
    if (value <= 8) return -1;
    if (value <= 12) return 0;
    if (value <= 15) return 1;
    if (value <= 17) return 2;
    if (value <= 18) return 3;

    return 0;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character =
    state.characters.activeCharacterId === -1 ? null : state.characters.characters[state.characters.activeCharacterId];
  return {
    ...props,
    character,
  };
}

export const CharacterSheet = connect(mapStateToProps)(ACharacterSheet);
