import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { CharacterData } from "../../../serverAPI";
import styles from "./CharacterStorageSection.module.scss";
import { AbilityComponentInstance, getPersonalPile } from "../../../lib/characterUtils";
import { EditButton } from "../../EditButton";
import { setActiveStorageId } from "../../../redux/storageSlice";
import { showSubPanel } from "../../../redux/subPanelsSlice";
import { EditStoragesSubPanel } from "../dialogs/EditStoragesSubPanel";

interface ReactProps {
  characterId: number;
  activeComponents: Record<string, AbilityComponentInstance[]>;
}

interface InjectedProps {
  character: CharacterData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACharacterStorageSection extends React.Component<Props> {
  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Storage"}</div>
        <EditButton onClick={this.onEditClicked.bind(this)} />
      </div>
    );
  }

  private onEditClicked(): void {
    this.props.dispatch?.(setActiveStorageId(getPersonalPile(this.props.character.id).id));
    this.props.dispatch?.(
      showSubPanel({
        id: "EditStorages",
        content: () => {
          return <EditStoragesSubPanel />;
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

export const CharacterStorageSection = connect(mapStateToProps)(ACharacterStorageSection);
