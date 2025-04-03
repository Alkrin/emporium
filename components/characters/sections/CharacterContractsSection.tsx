import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterContractsSection.module.scss";
import { AbilityComponentInstance } from "../../../lib/characterUtils";
import { EditButton } from "../../EditButton";
import { showModal } from "../../../redux/modalsSlice";
import { CharacterContractsDialog } from "../dialogs/CharacterContractsDialog";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterContractsSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Contracts"}</div>
        <EditButton onClick={this.onEditClicked.bind(this)} />
      </div>
    );
  }

  private onEditClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "contractsEdit",
        content: () => {
          return <CharacterContractsDialog />;
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

export const CharacterContractsSection = connect(mapStateToProps)(ACharacterContractsSection);
