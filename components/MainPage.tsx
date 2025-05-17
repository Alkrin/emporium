import * as React from "react";
import { connect } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { UserRole } from "../redux/userSlice";
import { ActivitiesPanel } from "./activities/ActivitiesPanel";
import AuthControl from "./AuthControl";
import { CharactersPanel } from "./characters/CharactersPanel";
import ContextMenuPane from "./ContextMenuPane";
import { DatabasePanel } from "./database/DatabasePanel";
import DragAndDropPane from "./DragAndDropPane";
import styles from "./MainPage.module.scss";
import ModalPane from "./ModalPane";
import RoleSelector from "./RoleSelector";
import ToasterPane from "./ToasterPane";
import TooltipPane from "./TooltipPane";
import TooltipSource from "./TooltipSource";
import { WorldPanel } from "./world/WorldPanel";
import { setActiveCharacterId } from "../redux/charactersSlice";
import { setActiveActivityId } from "../redux/activitiesSlice";
import {
  refetchActivities,
  refetchActivityOutcomes,
  refetchExpectedOutcomes,
} from "../dataSources/ActivitiesDataSource";
import { refetchCharacters } from "../dataSources/CharactersDataSource";
import {
  refetchAbilityDefs,
  refetchCharacterClasses,
  refetchEquipmentSetItems,
  refetchEquipmentSets,
  refetchHarvestingCategories,
  refetchItemDefs,
  refetchJobCredentials,
  refetchJobs,
  refetchProficiencyRolls,
  refetchResearchCategories,
  refetchResearchSubcategories,
  refetchSpellDefs,
  refetchStructureComponentDefs,
  refetchTroopDefs,
} from "../dataSources/GameDefsDataSource";
import { refetchItems } from "../dataSources/ItemsDataSource";
import { refetchProficiencies } from "../dataSources/ProficienciesDataSource";
import { refetchRepertoires } from "../dataSources/RepertoiresDataSource";
import { refetchSpellbooks } from "../dataSources/SpellbooksDataSource";
import { refetchStorages } from "../dataSources/StoragesDataSource";
import { refetchUsers } from "../dataSources/UsersDataSource";
import { refetchMapHexes, refetchMaps } from "../dataSources/MapsDataSource";
import { refetchLocations } from "../dataSources/LocationsDataSource";
import { ToolsPanel } from "./tools/ToolsPanel";
import { refetchArmies, refetchTroopInjuries, refetchTroops } from "../dataSources/ArmiesDataSource";
import { setActiveArmyId } from "../redux/armiesSlice";
import { ArmiesPanel } from "./armies/ArmiesPanel";
import { refetchStructureComponents, refetchStructures } from "../dataSources/StructuresDataSource";
import { setActiveStructureId } from "../redux/structuresSlice";
import { StructuresPanel } from "./structures/StructuresPanel";
import { refetchContracts } from "../dataSources/ContractsDataSource";
import { DashboardPanel } from "./dashboard/DashboardPanel";
import { refetchDomains } from "../dataSources/DomainsDataSource";
import { MainPanel, setActivePanel } from "../redux/hudSlice";

interface ReactProps {}
interface InjectedProps {
  activeRole: UserRole;
  activePanel: MainPanel;
  dispatch?: AppDispatch;
}

type Props = ReactProps & InjectedProps;

interface State {
  isLoading: boolean;
  nowLoading: string;
}

class AMainPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isLoading: false, nowLoading: "" };
  }

  render(): React.ReactNode {
    const sizeClass = this.props.activePanel === MainPanel.World ? styles.fullSize : "";
    return (
      <div className={styles.root}>
        <div className={`${styles.contentWrapper} ${sizeClass}`}>
          {this.props.activePanel === MainPanel.Dashboard && <DashboardPanel />}
          {this.props.activePanel === MainPanel.Characters && <CharactersPanel />}
          {this.props.activePanel === MainPanel.Armies && <ArmiesPanel />}
          {this.props.activePanel === MainPanel.Structures && <StructuresPanel />}
          {this.props.activePanel === MainPanel.World && <WorldPanel />}
          {this.props.activePanel === MainPanel.Activities && <ActivitiesPanel />}
          {this.props.activePanel === MainPanel.Tools && <ToolsPanel />}
          {this.props.activePanel === MainPanel.Database && <DatabasePanel />}

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

          <div className={styles.panelSelectors}>
            <TooltipSource
              className={`${styles.panelSelector} ${
                this.props.activePanel === MainPanel.Dashboard ? styles.selected : ""
              }`}
              tooltipParams={{ id: "DashboardPanel", content: "Dashboard" }}
              onMouseDown={() => {
                requestAnimationFrame(() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Dashboard));
                });
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Dashboard.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${
                this.props.activePanel === MainPanel.Characters ? styles.selected : ""
              }`}
              tooltipParams={{ id: "CharactersPanel", content: "Characters" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActiveCharacterId(0));
                requestAnimationFrame(() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Characters));
                });
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Characters.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${
                this.props.activePanel === MainPanel.Armies ? styles.selected : ""
              }`}
              tooltipParams={{ id: "ArmiesPanel", content: "Armies" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActiveArmyId(0));
                requestAnimationFrame(() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Armies));
                });
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Armies.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${
                this.props.activePanel === MainPanel.Structures ? styles.selected : ""
              }`}
              tooltipParams={{ id: "StructuresPanel", content: "Structures" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActiveStructureId(0));
                requestAnimationFrame(() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Structures));
                });
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Structures.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${
                this.props.activePanel === MainPanel.Activities ? styles.selected : ""
              }`}
              tooltipParams={{ id: "ActivitiesPanel", content: "Activities" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActiveActivityId(0));
                requestAnimationFrame(() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Activities));
                });
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Activities.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${this.props.activePanel === MainPanel.World ? styles.selected : ""}`}
              tooltipParams={{ id: "WorldPanel", content: "World" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActivePanel(MainPanel.World));
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/World.png"} />
            </TooltipSource>
            <TooltipSource
              className={`${styles.panelSelector} ${this.props.activePanel === MainPanel.Tools ? styles.selected : ""}`}
              tooltipParams={{ id: "ToolsPanel", content: "Tools" }}
              onMouseDown={() => {
                this.props.dispatch?.(setActivePanel(MainPanel.Tools));
              }}
            >
              <img className={styles.panelSelectorImage} src={"/images/Tools.png"} />
            </TooltipSource>
            {this.props.activeRole !== "player" && (
              <TooltipSource
                className={`${styles.panelSelector} ${
                  this.props.activePanel === MainPanel.Database ? styles.selected : ""
                }`}
                tooltipParams={{ id: "DatabasePanel", content: "Database" }}
                onMouseDown={() => {
                  this.props.dispatch?.(setActivePanel(MainPanel.Database));
                }}
              >
                <img className={styles.panelSelectorImage} src={"/images/Database.png"} />
              </TooltipSource>
            )}
          </div>

          <AuthControl />
          <RoleSelector />
          <TooltipSource
            className={styles.reloadButton}
            tooltipParams={{ id: "ReloadButton", content: "Reload" }}
            onMouseDown={async () => {
              if (this.props.dispatch) {
                this.setState({ isLoading: true, nowLoading: "Ability Defs" });
                await refetchAbilityDefs(this.props.dispatch);
                this.setState({ isLoading: true, nowLoading: "Activities" });
                await refetchActivities(this.props.dispatch);
                this.setState({ nowLoading: "Activity Outcomes" });
                await refetchActivityOutcomes(this.props.dispatch);
                this.setState({ nowLoading: "Armies" });
                await refetchArmies(this.props.dispatch);
                this.setState({ nowLoading: "Character Classes" });
                await refetchCharacterClasses(this.props.dispatch);
                this.setState({ nowLoading: "Characters" });
                await refetchCharacters(this.props.dispatch);
                this.setState({ nowLoading: "Contracts" });
                await refetchContracts(this.props.dispatch);
                this.setState({ nowLoading: "Domains" });
                await refetchDomains(this.props.dispatch);
                this.setState({ nowLoading: "Equipment Set Items" });
                await refetchEquipmentSetItems(this.props.dispatch);
                this.setState({ nowLoading: "Equipment Sets" });
                await refetchEquipmentSets(this.props.dispatch);
                this.setState({ nowLoading: "Expected Outcomes" });
                await refetchExpectedOutcomes(this.props.dispatch);
                this.setState({ nowLoading: "Harvesting Categories" });
                await refetchHarvestingCategories(this.props.dispatch);
                this.setState({ nowLoading: "Item Defs" });
                await refetchItemDefs(this.props.dispatch);
                this.setState({ nowLoading: "Items" });
                await refetchItems(this.props.dispatch);
                this.setState({ nowLoading: "Job Credentials" });
                await refetchJobCredentials(this.props.dispatch);
                this.setState({ nowLoading: "Jobs" });
                await refetchJobs(this.props.dispatch);
                this.setState({ nowLoading: "Locations" });
                await refetchLocations(this.props.dispatch);
                this.setState({ nowLoading: "Maps" });
                await refetchMaps(this.props.dispatch);
                this.setState({ nowLoading: "Map Hexes" });
                await refetchMapHexes(this.props.dispatch);
                this.setState({ nowLoading: "Proficiencies" });
                await refetchProficiencies(this.props.dispatch);
                this.setState({ nowLoading: "Proficiency Rolls" });
                await refetchProficiencyRolls(this.props.dispatch);
                this.setState({ nowLoading: "Repertoires" });
                await refetchRepertoires(this.props.dispatch);
                this.setState({ nowLoading: "Research Categories" });
                await refetchResearchCategories(this.props.dispatch);
                this.setState({ nowLoading: "Research Subcategories" });
                await refetchResearchSubcategories(this.props.dispatch);
                this.setState({ nowLoading: "Spell Defs" });
                await refetchSpellDefs(this.props.dispatch);
                this.setState({ nowLoading: "Spellbooks" });
                await refetchSpellbooks(this.props.dispatch);
                this.setState({ nowLoading: "Storages" });
                await refetchStorages(this.props.dispatch);
                this.setState({ nowLoading: "Structure Component Defs" });
                await refetchStructureComponentDefs(this.props.dispatch);
                this.setState({ nowLoading: "Structure Components" });
                await refetchStructureComponents(this.props.dispatch);
                this.setState({ nowLoading: "Structures" });
                await refetchStructures(this.props.dispatch);
                this.setState({ nowLoading: "Troop Defs" });
                await refetchTroopDefs(this.props.dispatch);
                this.setState({ nowLoading: "Troops" });
                await refetchTroops(this.props.dispatch);
                this.setState({ nowLoading: "Troop Injuries" });
                await refetchTroopInjuries(this.props.dispatch);
                this.setState({ nowLoading: "Users" });
                await refetchUsers(this.props.dispatch);
                this.setState({ isLoading: false });
              }
            }}
          />
        </div>

        <ModalPane />
        <ContextMenuPane />
        <DragAndDropPane />
        <ToasterPane />
        <TooltipPane />

        {this.state.isLoading && (
          <div className={styles.loadingVeil}>
            <div className={styles.loadingTitle}>{"LOADING"}</div>
            <div className={styles.loadingMessage}>{this.state.nowLoading}...</div>
          </div>
        )}
      </div>
    );
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    // Make sure to get off of the restricted panel if the user doesn't have permissions.
    if (this.props.activePanel === MainPanel.Database && this.props.activeRole === "player") {
      this.props.dispatch?.(setActivePanel(MainPanel.Dashboard));
    }
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    activeRole: state.hud.activeRole,
    activePanel: state.hud.activePanel,
  };
}

export default connect(mapStateToProps)(AMainPage);
