import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import styles from "./LandingPage.module.scss";
import Login from "./Login";
import MainPage from "./MainPage";
import { EscapableParams, updateHUDSize } from "../redux/hudSlice";
import { LocalStorageDataSource } from "../dataSources/LocalStorageDataSource";
import { CharactersDataSource } from "../dataSources/CharactersDataSource";
import { UsersDataSource } from "../dataSources/UsersDataSource";
import { ProficienciesDataSource } from "../dataSources/ProficienciesDataSource";
import { GameDefsDataSource } from "../dataSources/GameDefsDataSource";
import { ItemsDataSource } from "../dataSources/ItemsDataSource";
import { StoragesDataSource } from "../dataSources/StoragesDataSource";
import { SpellbooksDataSource } from "../dataSources/SpellbooksDataSource";
import { RepertoiresDataSource } from "../dataSources/RepertoiresDataSource";
import { ActivitiesDataSource } from "../dataSources/ActivitiesDataSource";
import { MapsDataSource } from "../dataSources/MapsDataSource";
import { LocationsDataSource } from "../dataSources/LocationsDataSource";
import { ArmiesDataSource } from "../dataSources/ArmiesDataSource";
import { StructuresDataSource } from "../dataSources/StructuresDataSource";
import { ContractsDataSource } from "../dataSources/ContractsDataSource";
import { DomainsDataSource } from "../dataSources/DomainsDataSource";

interface ReactProps {}
interface InjectedProps {
  currentUserId: number;
  escapables: EscapableParams[];
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ALandingPage extends React.Component<Props> {
  private ref: HTMLDivElement | null = null;

  // A pre-bound function so have something consistent to use with the window.*EventListener functions.
  private reportCurrentSizeHandle = this.reportCurrentSize.bind(this);

  render(): React.ReactNode {
    this.reportCurrentSize();
    return (
      <div
        className={styles.viewport}
        ref={(ref) => {
          this.ref = ref;
          this.reportCurrentSize();
        }}
      >
        <LocalStorageDataSource />
        <GameDefsDataSource />
        <ActivitiesDataSource />
        <CharactersDataSource />
        <DomainsDataSource />
        <ItemsDataSource />
        <RepertoiresDataSource />
        <SpellbooksDataSource />
        <StoragesDataSource />
        <UsersDataSource />
        <ProficienciesDataSource />
        <MapsDataSource />
        <LocationsDataSource />
        <ArmiesDataSource />
        <StructuresDataSource />
        <ContractsDataSource />
        {this.props.currentUserId ? <MainPage /> : <Login />}
      </div>
    );
  }

  componentDidMount(): void {
    // React doesn't inherently detect resizes in a way that triggers all of the updates we need,
    // so we listen at the window level, and anyone who cares can watch the size via Redux.
    window.addEventListener("resize", this.reportCurrentSizeHandle);
    window.addEventListener("keydown", this.onEscapeHandle, false);
  }

  componentWillUnmount(): void {
    window.removeEventListener("resize", this.reportCurrentSizeHandle);
    window.removeEventListener("keydown", this.onEscapeHandle, false);
  }

  private onEscapeHandle = this.onEscape.bind(this);
  private onEscape(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      if (this.props.escapables.length > 0 && this.props.dispatch) {
        this.props.escapables[this.props.escapables.length - 1].onEscape(this.props.dispatch);
        event.preventDefault();
      }
    }
  }

  private reportCurrentSize(): void {
    if (this.ref) {
      const bounds: DOMRect = this.ref.getBoundingClientRect();
      if (bounds.width > 0) {
        this.props.dispatch?.(updateHUDSize([bounds.width, bounds.height]));
      }
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { id: currentUserId } = state.user.currentUser;
  const { escapables } = state.hud;
  return {
    ...props,
    currentUserId,
    escapables,
  };
}

export default connect(mapStateToProps)(ALandingPage);
