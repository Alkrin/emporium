import * as React from "react";
import { connect } from "react-redux";
import { RootState } from "../redux/store";
import { UserData } from "../serverAPI";
import styles from "./RoleSelector.module.scss";
import { Dispatch } from "@reduxjs/toolkit";
import TooltipSource from "./TooltipSource";
import { UserRole } from "../redux/userSlice";
import { setActiveRole } from "../redux/hudSlice";

interface ReactProps {}
interface InjectedProps {
  activeRole: UserRole;
  user: UserData;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ARoleSelector extends React.Component<Props> {
  render(): React.ReactNode {
    const showAdmin: boolean = this.props.user.role === "admin";
    const showDM: boolean = showAdmin || this.props.user.role === "dm";
    const showPlayer: boolean = true;
    return (
      <div className={styles.root}>
        {showAdmin && (
          <TooltipSource
            className={this.styleForRole("admin")}
            tooltipParams={{ id: "Admin Role", content: "Admin" }}
            onClick={this.onClickForRole.bind(this, "admin")}
          >
            <img className={styles.roleImage} src={"/images/RoleAdmin.png"} />
          </TooltipSource>
        )}
        {showDM && (
          <TooltipSource
            className={this.styleForRole("dm")}
            tooltipParams={{ id: "DM Role", content: "Dungeon Master" }}
            onClick={this.onClickForRole.bind(this, "dm")}
          >
            <img className={styles.roleImage} src={"/images/RoleDM.png"} />
          </TooltipSource>
        )}
        {showPlayer && (
          <TooltipSource
            className={this.styleForRole("player")}
            tooltipParams={{ id: "Player Role", content: "Player" }}
            onClick={this.onClickForRole.bind(this, "player")}
          >
            <img className={styles.roleImage} src={"/images/RolePlayer.png"} />
          </TooltipSource>
        )}
      </div>
    );
  }

  private styleForRole(role: UserRole): string {
    return `${styles.roleContainer} ${
      this.props.activeRole === role ? styles.selected : ""
    }`;
  }

  private onClickForRole(role: UserRole): void {
    this.props.dispatch?.(setActiveRole(role));
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    user: state.user.currentUser,
    activeRole: state.hud.activeRole,
  };
}

export default connect(mapStateToProps)(ARoleSelector);
