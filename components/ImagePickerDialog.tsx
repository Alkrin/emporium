import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import styles from "./ImagePickerDialog.module.scss";
import { hideModal } from "../redux/modalsSlice";
import { RootState } from "../redux/store";
import Escapable from "./Escapable";
import ServerAPI from "../serverAPI";
import TooltipSource from "./TooltipSource";

interface State {
  selectedIconURL: string;
}

interface ReactProps {
  urls: string[];
  onImageSelected?: (url: string) => void;
  previousSelectionURL?: string;
  headerText?: string;
}

interface InjectedProps {
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class AImagePickerDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIconURL: "",
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <Escapable escapeId={"ImagePickerDialog"} onEscape={this.onCloseClicked.bind(this)} />
        <div className={styles.row}>
          <div className={styles.normalText}>{this.props.headerText ?? "Select An Image"}</div>
        </div>
        <div className={styles.imageList}>
          <div className={styles.imageCell} onClick={this.onImageClicked.bind(this, "")}>
            {"None"}
          </div>
          {this.props.urls.map(this.renderImageCell.bind(this))}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          Cancel
        </div>
      </div>
    );
  }

  private renderImageCell(url: string): React.ReactNode {
    const chunks = url.split("\\");
    const name = chunks[chunks.length - 1].split(".")[0];
    return (
      <TooltipSource tooltipParams={{ id: url, content: name }}>
        <img className={styles.imageCell} src={url} onClick={this.onImageClicked.bind(this, url)} />
      </TooltipSource>
    );
  }

  private onImageClicked(url: string): void {
    this.props.onImageSelected?.(url);
    this.onCloseClicked();
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
  };
}

export const ImagePickerDialog = connect(mapStateToProps)(AImagePickerDialog);
