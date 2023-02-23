import * as React from "react";
import { connect } from "react-redux";
import { hideContextMenu } from "../redux/contextMenuSlice";
import { ReduxDispatch, RootState } from "../redux/store";
import { showToaster } from "../redux/toastersSlice";
import { UserRole } from "../redux/userSlice";
import AuthControl from "./AuthControl";
import ContextMenuPane from "./ContextMenuPane";
import ContextMenuSource from "./ContextMenuSource";
import DragAndDropPane from "./DragAndDropPane";
import Draggable from "./Draggable";
import DraggableHandle from "./DraggableHandle";
import DropTarget from "./DropTarget";
import styles from "./MainPage.module.scss";
import ModalPane from "./ModalPane";
import RolePaneDebug from "./RolePaneDebug";
import RoleSelector from "./RoleSelector";
import ToasterPane from "./ToasterPane";
import TooltipPane from "./TooltipPane";

interface ReactProps {}
interface InjectedProps {
  activeRole: UserRole;
  dispatch?: ReduxDispatch;
}

type Props = ReactProps & InjectedProps;

interface State {
  draggablePosition: string;
}

class AMainPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { draggablePosition: "A" };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.rolePane}>
          {this.props.activeRole === "debug" && <RolePaneDebug />}
        </div>

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
