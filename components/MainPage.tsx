import * as React from "react";
import { connect } from "react-redux";
import { ReduxDispatch, RootState } from "../redux/store";
import { UserRole } from "../redux/userSlice";
import { ActivitiesPanel } from "./activities/ActivitiesPanel";
import AuthControl from "./AuthControl";
import { CharactersPanel } from "./characters/CharactersPanel";
import ContextMenuPane from "./ContextMenuPane";
import DragAndDropPane from "./DragAndDropPane";
import styles from "./MainPage.module.scss";
import ModalPane from "./ModalPane";
import RoleSelector from "./RoleSelector";
import ToasterPane from "./ToasterPane";
import TooltipPane from "./TooltipPane";
import TooltipSource from "./TooltipSource";
import { WorldPanel } from "./world/WorldPanel";

interface ReactProps {}
interface InjectedProps {
  activeRole: UserRole;
  dispatch?: ReduxDispatch;
}

type Props = ReactProps & InjectedProps;

type MainPanelId = "Characters" | "World" | "Activities";

interface State {
  activePanel: MainPanelId;
}

class AMainPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { activePanel: "Characters" };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        {this.state.activePanel === "Characters" && <CharactersPanel />}
        {this.state.activePanel === "World" && <WorldPanel />}
        {this.state.activePanel === "Activities" && <ActivitiesPanel />}

        <div className={styles.consoleRoot}>
          <div className={styles.consoleTopLeft} />
          <div className={styles.consoleTopRight} />
          <div className={styles.consoleBottomLeft} />
          <div className={styles.consoleBottomRight} />
          <div className={styles.consoleLeft} />
          <div className={styles.consoleRight} />
          <div className={styles.consoleTop} />
          <div className={styles.consoleBottom} />
          <div className={styles.consoleLeftInner} />
          <div className={styles.consoleRightInner} />
        </div>

        <TooltipSource
          className={`${styles.panelSelectorCharacters} ${
            this.state.activePanel === "Characters" ? styles.selected : ""
          }`}
          tooltipParams={{ id: "CharactersPanel", content: "Characters" }}
          onMouseDown={() => {
            this.setState({ activePanel: "Characters" });
          }}
        >
          <img
            className={styles.panelSelectorImage}
            src={"/images/Characters.png"}
          />
        </TooltipSource>
        <TooltipSource
          className={`${styles.panelSelectorActivities} ${
            this.state.activePanel === "Activities" ? styles.selected : ""
          }`}
          tooltipParams={{ id: "ActivitiesPanel", content: "Activities" }}
          onMouseDown={() => {
            this.setState({ activePanel: "Activities" });
          }}
        >
          <img
            className={styles.panelSelectorImage}
            src={"/images/Activities.png"}
          />
        </TooltipSource>
        <TooltipSource
          className={`${styles.panelSelectorWorld} ${
            this.state.activePanel === "World" ? styles.selected : ""
          }`}
          tooltipParams={{ id: "WorldPanel", content: "World" }}
          onMouseDown={() => {
            this.setState({ activePanel: "World" });
          }}
        >
          <img
            className={styles.panelSelectorImage}
            src={"/images/World.png"}
          />
        </TooltipSource>

        <AuthControl />
        <RoleSelector />

        <ModalPane />
        <ContextMenuPane />
        <DragAndDropPane />
        <ToasterPane />
        <TooltipPane />
      </div>
    );
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    activeRole: state.hud.activeRole,
  };
}

export default connect(mapStateToProps)(AMainPage);
