import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { CharacterData } from "../../serverAPI";
import { SubPanelPane } from "../SubPanelPane";
import { CharacterSheet } from "./CharacterSheet";
import { CharactersList } from "./CharactersList";
import styles from "./CharactersPanel.module.scss";

interface State {
  currentCharacterId: number;
  prevCharacterId: number;
}

interface ReactProps {}

interface InjectedProps {
  characters: Dictionary<CharacterData>;
  activeCharacterId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharactersPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentCharacterId: props.activeCharacterId || 0,
      prevCharacterId: 0,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <CharactersList />
        <CharacterSheet
          key={this.state.currentCharacterId || "None"}
          characterId={this.state.currentCharacterId}
          exiting={false}
        />
        {this.state.prevCharacterId ? (
          <CharacterSheet
            key={this.state.prevCharacterId || "None"}
            characterId={this.state.prevCharacterId}
            exiting={true}
          />
        ) : null}
        <SubPanelPane />
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // If the active character has changed, animate the old one out and the new one in.
    if (this.props.activeCharacterId !== this.state.currentCharacterId) {
      this.setState({
        currentCharacterId: this.props.activeCharacterId,
        prevCharacterId: this.state.currentCharacterId,
      });
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeCharacterId } = state.characters;

  return {
    ...props,
    characters: state.characters.characters,
    activeCharacterId,
  };
}

export const CharactersPanel = connect(mapStateToProps)(ACharactersPanel);
