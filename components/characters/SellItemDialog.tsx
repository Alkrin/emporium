import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { Dictionary } from "../../lib/dictionary";
import { hideModal, showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { showToaster } from "../../redux/toastersSlice";
import ServerAPI, {
  ActivityAdventurerParticipant,
  ActivityData,
  ActivityOutcomeData,
  ActivityOutcomeData_LootAndXP,
  ActivityOutcomeType,
  CharacterData,
  ItemData,
  ItemDefData,
  LocationCityData,
  LocationData,
  ServerActivityOutcomeData,
  StorageData,
} from "../../serverAPI";
import styles from "./SellItemDialog.module.scss";
import { EditButton } from "../EditButton";
import { SavingVeil } from "../SavingVeil";
import { SelectAdventurersDialog } from "../dialogs/SelectAdventurersDialog";
import { InfoButton } from "../InfoButton";
import { ItemTooltip } from "../database/ItemTooltip";
import { refetchItems } from "../../dataSources/ItemsDataSource";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { refetchStorages } from "../../dataSources/StoragesDataSource";
import { Tag } from "../../lib/tags";
import { refetchSpellbooks } from "../../dataSources/SpellbooksDataSource";
import { getRomanNumerals } from "../../lib/stringUtils";
import { getItemAvailabilityText, getItemNameText } from "../../lib/itemUtils";
import {
  ActivityResolution,
  convertActivityOutcomeForServer,
  createActivityAdventurerParticipant,
  generateActivityResolution,
  generateAnonymousActivity,
} from "../../lib/activityUtils";
import dateFormat from "dateformat";

interface State {
  isSaving: boolean;
  itemCount: number;
  ownerIDs: number[];
  isUnused: boolean;
  numToSellString: string;
  salePriceString: string;
}

interface ReactProps {
  item: ItemData;
  def: ItemDefData;
}

interface InjectedProps {
  allCharacters: Dictionary<CharacterData>;
  allStorages: Dictionary<StorageData>;
  allLocations: Dictionary<LocationData>;
  allCities: Dictionary<LocationCityData>;
  activeStorageId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ASellItemDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isSaving: false,
      itemCount: props.item.count,
      ownerIDs: props.item.owner_ids,
      isUnused: props.item.is_unused,
      numToSellString: props.item.count.toString(),
      salePriceString: (props.def.sale * props.item.count).toFixed(2),
    };
  }

  render(): React.ReactNode {
    return (
      <div className={styles.root}>
        <div className={styles.itemName}>{getItemNameText(this.props.item, this.props.def)}</div>
        <InfoButton
          tooltipParams={{
            id: ``,
            content: () => <ItemTooltip itemId={this.props.item.id} />,
          }}
        />
        <div className={styles.flagRow}>
          <div className={styles.normalText}>{"Is Unused (grants XP when sold)?"}</div>
          <input
            className={styles.trailingCheckbox}
            type={"checkbox"}
            checked={this.state.isUnused}
            onChange={(e) => {
              this.setState({ isUnused: e.target.checked });
            }}
          />
        </div>
        <div className={styles.row}>
          <div className={styles.ownersLabel}>{"Owners"}</div>
          <EditButton className={styles.inlineEditButton} onClick={this.onEditOwnersClicked.bind(this)} />
        </div>
        <div className={styles.listContainer}>{this.getSortedOwners().map(this.renderOwnerRow.bind(this))}</div>

        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Item Count"}</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.itemCount}
            min={1}
            onChange={(e) => {
              this.setState({ itemCount: +e.target.value });
            }}
            disabled={true}
          />
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Num to Sell"}</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.numToSellString}
            onChange={(e) => {
              this.setState({
                numToSellString: e.target.value,
                salePriceString: (this.props.def.sale * +e.target.value).toFixed(2),
              });
            }}
          />
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Default:\xa0"}</div>
          <div className={styles.valueLabel}>{this.getPriceText()}</div>
        </div>
        <div className={styles.countRow}>
          <div className={styles.countLabel}>{"Sale Price"}</div>
          <input
            className={styles.countField}
            type={"number"}
            value={this.state.salePriceString}
            onChange={(e) => {
              this.setState({ salePriceString: e.target.value });
            }}
          />
          <div className={styles.countLabel}>{"\xa0gp"}</div>
        </div>
        <div className={styles.sidePanel}>
          <div className={styles.countRow}>
            <div className={styles.countLabel}>{"Local Market:\xa0"}</div>
          </div>
          <div className={styles.countRow}>
            <div className={styles.valueLabel}>{this.getMarketText()}</div>
          </div>
          {this.renderAvailability()}
        </div>
        <div className={styles.saveButton} onClick={this.onSellClicked.bind(this)}>
          {"Sell"}
        </div>
        <div className={styles.closeButton} onClick={this.onCloseClicked.bind(this)}>
          {"Cancel"}
        </div>
        <SavingVeil show={this.state.isSaving} />
      </div>
    );
  }

  private getMarketText(): string {
    // Check if there is a city with a market at this item's location.
    // Note that the item can only be sold if it is in a Storage, and a Storage is either
    // a Personal Pile (and thus at the character's location) or directly at a location already.
    const storage = this.props.allStorages[this.props.item.storage_id];
    let locationId: number = storage.location_id;
    if (locationId === 0) {
      // The item was in a non-located storage (probably a personal pile), so try to locate its owner.
      locationId = this.props.allCharacters[storage.owner_id].location_id;
    }
    const city = Object.values(this.props.allCities).find((c) => {
      return c.location_id === locationId;
    });
    if (city) {
      return `${this.props.allLocations[locationId].name}, Class ${getRomanNumerals(city.market_class)}`;
    } else {
      return "None";
    }
  }

  private renderAvailability(): React.ReactNode {
    const storage = this.props.allStorages[this.props.item.storage_id];
    let locationId: number = storage.location_id;
    if (locationId === 0) {
      // The item was in a non-located storage (probably a personal pile), so try to locate its owner.
      locationId = this.props.allCharacters[storage.owner_id].location_id;
    }
    const city = Object.values(this.props.allCities).find((c) => {
      return c.location_id === locationId;
    });
    if (city) {
      return (
        <>
          <div className={styles.countRow}>
            <div className={styles.countLabel}>{"Num Sellable Items"}</div>
          </div>
          <div className={styles.availabilityTable}>
            <div className={styles.column}>
              <div className={styles.availabilityHeader}>{"Unit Price"}</div>
              <div className={styles.availabilityPriceEntry}>{"1gp or less"}</div>
              <div className={styles.availabilityPriceEntry}>{"2-10gp"}</div>
              <div className={styles.availabilityPriceEntry}>{"11-100gp"}</div>
              <div className={styles.availabilityPriceEntry}>{"101-1,000gp"}</div>
              <div className={styles.availabilityPriceEntry}>{"1,001-10,000gp"}</div>
              <div className={styles.availabilityPriceEntry}>{"10,001+gp"}</div>
            </div>
            <div className={styles.column}>
              <div className={styles.availabilityHeader}>{"Venturer"}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 0)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 1)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 2)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 3)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 4)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class - 1, 5)}</div>
            </div>
            <div className={styles.column}>
              <div className={styles.availabilityHeader}>{"No Venturer"}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 0)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 1)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 2)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 3)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 4)}</div>
              <div className={styles.availabilityValueEntry}>{getItemAvailabilityText(city.market_class, 5)}</div>
            </div>
          </div>
        </>
      );
    } else {
      // No city, so don't show availability data.
      return null;
    }
  }

  private getPriceText(): string {
    const numToSell = +this.state.numToSellString;
    const { sale } = this.props.def;
    return `${numToSell} x ${sale}gp = ${(numToSell * sale).toFixed(2)}gp`;
  }

  private renderOwnerRow(owner: CharacterData, index: number): React.ReactNode {
    return (
      <div className={styles.listRow} key={`ownerRow${index}`}>
        <div className={styles.listLevel}>{`L${owner.level}`}</div>
        <div className={styles.listClass}>{owner.class_name}</div>
        <div className={styles.listName}>{owner.name}</div>
      </div>
    );
  }

  private getSortedOwners(): CharacterData[] {
    const sorted = [...this.state.ownerIDs].sort((a, b) => {
      const characterA = this.props.allCharacters[a];
      const characterB = this.props.allCharacters[b];

      // Sort by level first.  Highest levels at the top.
      if (characterA.level !== characterB.level) {
        return characterB.level - characterA.level;
      }
      return characterA.name.localeCompare(characterB.name);
    });

    return sorted.map((characterID) => this.props.allCharacters[characterID]);
  }

  private onEditOwnersClicked(): void {
    if (this.state.isSaving) {
      return;
    }

    this.props.dispatch?.(
      showModal({
        id: "Adventurers",
        content: () => {
          return (
            <SelectAdventurersDialog
              preselectedAdventurerIDs={this.state.ownerIDs}
              onSelectionConfirmed={(adventurerIDs: number[]) => {
                this.setState({ ownerIDs: adventurerIDs });
              }}
            />
          );
        },
      })
    );
  }

  private async onSellClicked(): Promise<void> {
    const sellCount = Math.min(Math.max(0, +this.state.numToSellString), this.props.item.count);
    if (sellCount === 0) {
      return;
    }

    this.setState({ isSaving: true });

    let toasterTitle: string = "";
    let toasterMessage: string = `Item sold!`;

    const [activity, resolution, loot] = this.generateSaleData();
    const result = await ServerAPI.sellItem(
      this.props.item,
      sellCount,
      activity,
      loot,
      resolution,
      this.props.activeStorageId,
      +this.state.salePriceString
    );
    if (
      "error" in result ||
      !!result.find((v) => {
        return "error" in v;
      })
    ) {
      toasterTitle = "ERROR!";
      toasterMessage = "Item sale failed!";
    } else {
      // Item was successfully sold on the server, so update locally!
      if (this.props.dispatch) {
        await refetchItems(this.props.dispatch);
        await refetchStorages(this.props.dispatch);
        if (this.state.isUnused) {
          await refetchCharacters(this.props.dispatch);
        }
        if (this.props.def.tags.includes(Tag.Spellbook)) {
          await refetchSpellbooks(this.props.dispatch);
        }
        this.props.dispatch(hideModal());
      }
    }

    this.props.dispatch?.(showToaster({ content: { title: toasterTitle, message: toasterMessage } }));

    this.setState({ isSaving: false });
  }

  private generateSaleData(): [ActivityData, ActivityResolution, ActivityOutcomeData] {
    const owners: ActivityAdventurerParticipant[] = this.props.item.owner_ids
      .filter((oid) => {
        const character = this.props.allCharacters[oid];
        return !character?.dead;
      })
      .map((oid) => createActivityAdventurerParticipant(oid));
    const activity = generateAnonymousActivity(dateFormat(new Date(), "yyyy-mm-dd"), owners, [], 0);
    const loot: ActivityOutcomeData_LootAndXP = {
      id: 0,
      activity_id: activity.id,
      type: ActivityOutcomeType.LootAndXP,
      goldWithXP: this.state.isUnused ? +this.state.salePriceString : 0,
      goldWithoutXP: this.state.isUnused ? 0 : +this.state.salePriceString,
      combatXP: 0,
      campaignXP: 0,
    };

    const results = generateActivityResolution(activity, [loot], activity.end_date);
    return [activity, results, loot];
  }

  private onCloseClicked(): void {
    this.props.dispatch?.(hideModal());
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  const allCharacters = state.characters.characters;
  const { activeStorageId, allStorages } = state.storages;
  const allLocations = state.locations.locations;
  const allCities = state.locations.cities;

  return {
    ...props,
    allCharacters,
    allStorages,
    allLocations,
    allCities,
    activeStorageId,
  };
}

export const SellItemDialog = connect(mapStateToProps)(ASellItemDialog);
