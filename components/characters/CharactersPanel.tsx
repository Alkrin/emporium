import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { RootState } from "../../redux/store";
import { CharacterData } from "../../serverAPI";
import { SubPanelPane } from "../SubPanelPane";
import { CharactersList } from "./CharactersList";
import styles from "./CharactersPanel.module.scss";

interface ReactProps {}

interface InjectedProps {
  characters: Dictionary<CharacterData>;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharactersPanel extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <CharactersList />
        <SubPanelPane />
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    characters: state.characters.characters,
  };
}

export const CharactersPanel = connect(mapStateToProps)(ACharactersPanel);
