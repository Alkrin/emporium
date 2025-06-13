import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterHPSection.module.scss";
import { AbilityComponentInstance, getCharacterMaxHPv2 } from "../../../lib/characterUtils";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { EditHPDialog } from "../dialogs/EditHPDialog";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterHPSection extends React.Component<Props> {
  render(): React.ReactNode {
    const maxHP = getCharacterMaxHPv2(this.props.character, this.props.activeComponents);

    return (
      <div className={styles.root}>
        <div className={styles.centeredRow}>
          <div className={styles.title}>{"HP:"}</div>
          <div className={styles.valueText}>{this.props.character.hp}</div>
          <div className={styles.normalText}>{`\xa0/ ${maxHP}`}</div>
          <EditButton onClick={this.onEditClicked.bind(this)} />
        </div>
      </div>
    );
  }

  private onEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "hpEdit",
        content: () => {
          return <EditHPDialog activeComponents={this.props.activeComponents} />;
        },
      })
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

export const CharacterHPSection = connect(mapStateToProps)(ACharacterHPSection);
