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
  currentCharacter: CharacterData | null;
  prevCharacter: CharacterData | null;
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
      currentCharacter: null,
      prevCharacter: null,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <CharactersList />
        <CharacterSheet
          key={this.state.currentCharacter?.id ?? "None"}
          character={this.state.currentCharacter}
          exiting={false}
        />
        {this.state.prevCharacter && (
          <CharacterSheet
            key={this.state.prevCharacter?.id ?? "None"}
            character={this.state.prevCharacter}
            exiting={true}
          />
        )}
        <SubPanelPane />
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (this.props.activeCharacterId !== this.state.currentCharacter?.id) {
      this.setState({
        currentCharacter: this.props.characters[this.props.activeCharacterId],
        prevCharacter: this.state.currentCharacter,
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
