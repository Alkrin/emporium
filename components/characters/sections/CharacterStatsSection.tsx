import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import TooltipSource from "../../TooltipSource";
import styles from "./CharacterStatsSection.module.scss";
import {
  AbilityComponentInstance,
  getStatBonusForValue,
  getBonusString,
  getCharacterStatv2,
  ValueSource,
  getAbilityComponentInstanceSourceName,
  CharacterStatData,
} from "../../../lib/characterUtils";
import { CharacterStat } from "../../../staticData/types/characterClasses";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterStatsSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        {this.renderStatRow(CharacterStat.Strength, "STR")}
        {this.renderStatRow(CharacterStat.Intelligence, "INT")}
        {this.renderStatRow(CharacterStat.Will, "WILL")}
        {this.renderStatRow(CharacterStat.Dexterity, "DEX")}
        {this.renderStatRow(CharacterStat.Constitution, "CON")}
        {this.renderStatRow(CharacterStat.Charisma, "CHA")}
      </div>
    );
  }

  private renderStatRow(stat: CharacterStat, name: string): React.ReactNode {
    const outData: CharacterStatData = { baseValue: 0, baseValueSources: [], bonusValue: 0, bonusValueSources: [] };
    const statValue = getCharacterStatv2(this.props.character, stat, this.props.activeComponents, outData);

    return (
      <TooltipSource
        className={styles.statPanel}
        tooltipParams={{ id: `${name}Tooltip`, content: this.renderTooltip.bind(this, stat, outData) }}
      >
        <div className={styles.statName}>{name}</div>
        <div className={styles.statValue}>{statValue}</div>
        <div className={styles.statBonus}>{getBonusString(getStatBonusForValue(statValue))}</div>
      </TooltipSource>
    );
  }

  private renderTooltip(stat: CharacterStat, data: CharacterStatData): React.ReactNode {
    return (
      <div className={styles.combatTooltipRoot}>
        <div className={styles.row}>
          <div className={styles.tooltipTitle}>{stat}</div>
          <div className={styles.tooltipValue}>{data.baseValue + data.bonusValue}</div>
          <div className={styles.tooltipBonus}>
            {getBonusString(getStatBonusForValue(data.baseValue + data.bonusValue))}
          </div>
        </div>
        <div className={styles.tooltipDivider} />
        {data.baseValueSources.map(({ name, value }) => {
          return (
            <div className={styles.tooltipSourceRow} key={name}>
              <div className={styles.tooltipSource}>{name}</div>
              <div className={styles.tooltipSourceValue}>{value}</div>
            </div>
          );
        })}
        {data.bonusValueSources.length > 0 ? (
          <>
            <div className={styles.tooltipDivider} />
            {data.bonusValueSources.map(({ name, value }) => {
              return (
                <div className={styles.tooltipSourceRow} key={name}>
                  <div className={styles.tooltipSource}>{name}</div>
                  <div className={styles.tooltipSourceValue}>{getBonusString(value)}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;

  return {
    ...props,
    character,
  };
}

export const CharacterStatsSection = connect(mapStateToProps)(ACharacterStatsSection);
