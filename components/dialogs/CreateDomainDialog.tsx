import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import styles from "./CreateDomainDialog.module.scss";
import { FittingView } from "../FittingView";
import { BasicDialog } from "./BasicDialog";
import ServerAPI, { CharacterAlignment, DomainClassification, DomainData } from "../../serverAPI";
import dateFormat from "dateformat";
import { serverDateFormat } from "../../lib/timeUtils";
import { ModalCloseButton } from "../ModalCloseButton";
import { updateDomain } from "../../redux/domainsSlice";
import { ColorPickerDialog } from "./ColorPickerDialog";

interface State {
  domain: DomainData;
}

interface ReactProps {}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateDomainDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      domain: {
        id: 0,
        name: "",
        ruler_character_id: 0,
        color: "#ff00ffcc",
        hex_ids: [],
        city_ids: [],
        fortification_structure_ids: [],
        garrison_army_ids: [],
        treasury_storage_id: 0,
        alignment: CharacterAlignment.Lawful,
        classification: DomainClassification.Civilized,
        frontier_population: 0,
        current_morale: 0,
        last_updated_date: dateFormat(0, serverDateFormat),
      },
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <FittingView className={styles.titleContainer}>
          <div className={styles.title}>{"Creating New Domain"}</div>
        </FittingView>
        <div className={styles.contentRow}>
          <div className={styles.fieldName}>{"Name"}</div>
          <input
            autoFocus
            className={styles.inputField}
            type={"text"}
            value={this.state.domain.name}
            onChange={(e) => {
              this.setState({ domain: { ...this.state.domain, name: e.target.value } });
            }}
          />
        </div>
        <div className={styles.contentRow}>
          <div className={styles.fieldName}>{"Alignment"}</div>
          <select
            className={styles.selector}
            value={this.state.domain.alignment}
            onChange={(e) => {
              this.setState({
                domain: { ...this.state.domain, alignment: e.target.value as CharacterAlignment },
              });
            }}
          >
            {Object.values(CharacterAlignment).map((name) => (
              <option value={name} key={`alignment${name}`}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.fieldName}>{"Classification"}</div>
          <select
            className={styles.selector}
            value={this.state.domain.classification}
            onChange={(e) => {
              this.setState({
                domain: { ...this.state.domain, classification: e.target.value as DomainClassification },
              });
            }}
          >
            {Object.values(DomainClassification).map((name) => (
              <option value={name} key={`classification${name}`}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.contentRow}>
          <div className={styles.fieldName}>{"Color"}</div>
          <button
            className={styles.colorPreview}
            style={{ backgroundColor: this.state.domain.color }}
            onClick={(e) => {
              this.props.dispatch?.(
                showModal({
                  id: "EditColor",
                  content: () => {
                    return (
                      <ColorPickerDialog
                        initialValue={this.state.domain.color}
                        onValueConfirmed={async (color) => {
                          this.setState({ domain: { ...this.state.domain, color } });
                        }}
                      />
                    );
                  },
                })
              );
            }}
          />
        </div>

        <button className={styles.closeButton} onClick={this.onConfirmClicked.bind(this)}>
          {"Create"}
        </button>
        <ModalCloseButton />
      </div>
    );
  }

  private async onConfirmClicked(): Promise<void> {
    // Name is required.
    const name = this.state.domain.name.trim();
    if (name.length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "BlankValue",
          content: () => {
            return <BasicDialog title={"Error!"} prompt={"A blank name is not permitted."} />;
          },
        })
      );
      return;
    }

    // Attempt to create the new Domain.
    const newDomain: DomainData = {
      ...this.state.domain,
      name,
    };
    const res = await ServerAPI.createDomain(newDomain);
    if ("error" in res) {
      this.props.dispatch?.(
        showModal({
          id: "DomainCreateError",
          content: () => {
            return (
              <BasicDialog title={"Error!"} prompt={"Domain Creation failed!  Check your network and try again."} />
            );
          },
        })
      );
    } else {
      if ("insertId" in res) {
        newDomain.id = res.insertId;
        this.props.dispatch?.(updateDomain(newDomain));
      }
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const CreateDomainDialog = connect(mapStateToProps)(ACreateDomainDialog);
