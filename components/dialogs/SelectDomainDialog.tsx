import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./SelectDomainDialog.module.scss";
import ServerAPI, { CharacterAlignment, DomainClassification, DomainData } from "../../serverAPI";
import { UserRole } from "../../redux/userSlice";
import { ModalCloseButton } from "../ModalCloseButton";
import { deleteDomain, updateDomain } from "../../redux/domainsSlice";
import { BasicDialog } from "./BasicDialog";
import { SavingVeil } from "../SavingVeil";
import { InputSingleStringDialog } from "./InputSingleStringDialog";
import dateFormat from "dateformat";
import { serverDateFormat } from "../../lib/timeUtils";
import { CreateDomainDialog } from "./CreateDomainDialog";

interface State {
  selectedDomainId: number;
  isSaving: boolean;
}

interface ReactProps {
  preselectedDomainId: number;
  onSelectionConfirmed: (domainId: number) => Promise<void>;
}

interface InjectedProps {
  activeRole: UserRole;
  allDomains: Record<number, DomainData>;
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASelectDomainDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedDomainId: props.preselectedDomainId,
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.title}>{"Select A Domain"}</div>

        <div className={styles.contentRow}>
          <div className={styles.locationsContainer}>
            <div className={styles.locationsListContainer}>
              {this.renderDomainRow(null, -1)}
              {this.getSortedDomains().map(this.renderDomainRow.bind(this))}
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.actionButton} onClick={this.onCreateNewClicked.bind(this)}>
            {"Create New"}
          </div>
          <div className={styles.actionButton} onClick={this.onConfirmClicked.bind(this)}>
            {"Confirm Selection"}
          </div>
          <div className={styles.actionButton} onClick={this.onDeleteClicked.bind(this)}>
            {"Delete"}
          </div>
        </div>
        <SavingVeil show={this.state.isSaving} />
        <ModalCloseButton />
      </div>
    );
  }

  private renderDomainRow(domain: DomainData | null, index: number): React.ReactNode {
    if (domain) {
      const selectedClass = domain.id === this.state.selectedDomainId ? styles.selected : "";
      return (
        <div
          className={`${styles.listRow} ${selectedClass}`}
          key={`domainRow${index}`}
          onClick={() => {
            this.setState({ selectedDomainId: domain.id });
          }}
        >
          <div className={styles.listName}>{domain.name}</div>
          <div className={styles.listHexCount}>{`${domain.hex_ids.length} hexes`}</div>
        </div>
      );
    } else {
      const selectedClass = this.state.selectedDomainId === 0 ? styles.selected : "";
      return (
        <div
          className={`${styles.listRow} ${selectedClass}`}
          key={`adventurerRow${index}`}
          onClick={() => {
            this.setState({ selectedDomainId: 0 });
          }}
        >
          <div className={styles.listName}>{"---"}</div>
        </div>
      );
    }
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }

  private onConfirmClicked(): void {
    this.props.onSelectionConfirmed(this.state.selectedDomainId);
    this.onCloseClicked();
  }

  private getSortedDomains(): DomainData[] {
    return Object.values(this.props.allDomains).sort((domainA, domainB) => {
      return domainA.name.localeCompare(domainB.name);
    });
  }

  private onCreateNewClicked(): void {
    this.props.dispatch?.(
      showModal({
        id: "createDomain",
        content: () => {
          return <CreateDomainDialog />;
        },
      })
    );
  }

  private async onDeleteClicked(): Promise<void> {
    // No selection, no deletion.
    if (this.state.selectedDomainId === 0) {
      return;
    }

    this.setState({ isSaving: true });
    const res = await ServerAPI.deleteDomain(this.state.selectedDomainId);

    if ("affectedRows" in res) {
      // Delete successful, so deselect and delete locally.
      this.props.dispatch?.(deleteDomain(this.state.selectedDomainId));
      this.setState({ selectedDomainId: 0 });
    } else {
      this.props.dispatch?.(
        showModal({
          id: "DeleteError",
          content: () => <BasicDialog title={"Error!"} prompt={"Delete failed!  Check your network and try again."} />,
        })
      );
    }
    this.setState({ isSaving: false });
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const { activeRole } = state.hud;
  const currentUserId = state.user.currentUser.id;
  const allDomains = state.domains.allDomains;

  return {
    ...props,
    activeRole,
    currentUserId,
    allDomains,
  };
}

export const SelectDomainDialog = connect(mapStateToProps)(ASelectDomainDialog);
