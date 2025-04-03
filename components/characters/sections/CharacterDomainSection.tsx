import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterDomainSection.module.scss";
import { AbilityComponentInstance } from "../../../lib/characterUtils";
import { EditButton } from "../../EditButton";
import { setDashboardCharacterId } from "../../../redux/charactersSlice";
import { MainPanel, setActivePanel } from "../../../redux/hudSlice";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterDomainSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Domain"}</div>
        <EditButton onClick={this.onEditClicked.bind(this)} />
      </div>
    );
  }

  private onEditClicked(): void {
    this.props.dispatch?.(setDashboardCharacterId(this.props.characterId));
    this.props.dispatch?.(setActivePanel(MainPanel.Dashboard));
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const character = state.characters.characters[props.characterId ?? 1] ?? null;

  return {
    ...props,
    character,
  };
}

export const CharacterDomainSection = connect(mapStateToProps)(ACharacterDomainSection);
