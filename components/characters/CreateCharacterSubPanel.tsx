import { Dispatch } from "@reduxjs/toolkit";
import * as React from "react";
import { connect } from "react-redux";
import { refetchCharacters } from "../../dataSources/CharactersDataSource";
import { showModal } from "../../redux/modalsSlice";
import { RootState } from "../../redux/store";
import { hideSubPanel } from "../../redux/subPanelsSlice";
import ServerAPI, { CharacterData, Gender } from "../../serverAPI";
import {
  AllClasses,
  AllClassesArray,
} from "../../staticData/characterClasses/AllClasses";
import { CharacterStat } from "../../staticData/types/characterClasses";
import styles from "./CreateCharacterSubPanel.module.scss";

interface State {
  nameText: string;
  gender: Gender;
  level: number;
  xp: number;
  class: string;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  hitDice: number[];
  isSaving: boolean;
}

interface ReactProps {}

interface InjectedProps {
  currentUserId: number;
  dispatch?: Dispatch;
}

type Props = ReactProps & InjectedProps;

class ACreateCharacterSubPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      nameText: "",
      gender: "m",
      level: 1,
      xp: 0,
      class: "---",
      strength: 9,
      intelligence: 9,
      wisdom: 9,
      dexterity: 9,
      constitution: 9,
      charisma: 9,
      hitDice: [4],
      isSaving: false,
    };
  }

  render(): React.ReactNode {
    const selectedClass = AllClasses[this.state.class];

    const maxLevel = selectedClass?.xpToLevel.length ?? 1;
    if (this.state.level > maxLevel) {
      requestAnimationFrame(() => {
        this.setState({
          level: maxLevel,
          hitDice: this.state.hitDice.slice(0, maxLevel - 1),
        });
      });
    }

    const minXP = selectedClass?.xpToLevel[this.state.level - 1] ?? 0;
    const maxXP = selectedClass?.xpToLevel[this.state.level] ?? "???";

    if (this.state.xp < minXP) {
      requestAnimationFrame(() => {
        this.setState({ xp: minXP });
      });
    }

    const minStrength =
      selectedClass?.statRequirements[CharacterStat.Strength] ?? 3;
    if (this.state.strength < minStrength) {
      requestAnimationFrame(() => {
        this.setState({ strength: minStrength });
      });
    }
    const minIntelligence =
      selectedClass?.statRequirements[CharacterStat.Intelligence] ?? 3;
    if (this.state.intelligence < minIntelligence) {
      requestAnimationFrame(() => {
        this.setState({ intelligence: minIntelligence });
      });
    }
    const minWisdom =
      selectedClass?.statRequirements[CharacterStat.Wisdom] ?? 3;
    if (this.state.wisdom < minWisdom) {
      requestAnimationFrame(() => {
        this.setState({ wisdom: minWisdom });
      });
    }
    const minDexterity =
      selectedClass?.statRequirements[CharacterStat.Dexterity] ?? 3;
    if (this.state.dexterity < minDexterity) {
      requestAnimationFrame(() => {
        this.setState({ dexterity: minDexterity });
      });
    }
    const minConstitution =
      selectedClass?.statRequirements[CharacterStat.Constitution] ?? 3;
    if (this.state.constitution < minConstitution) {
      requestAnimationFrame(() => {
        this.setState({ constitution: minConstitution });
      });
    }
    const minCharisma =
      selectedClass?.statRequirements[CharacterStat.Charisma] ?? 3;
    if (this.state.charisma < minCharisma) {
      requestAnimationFrame(() => {
        this.setState({ charisma: minCharisma });
      });
    }

    const primeRequisites = selectedClass?.primeRequisites ?? [];

    const hitDieSize = selectedClass?.hitDieSize ?? 4;

    return (
      <div className={styles.root}>
        <div className={styles.nameLabel}>Name</div>
        <input
          className={styles.nameTextField}
          type={"text"}
          value={this.state.nameText}
          onChange={(e) => {
            this.setState({ nameText: e.target.value });
          }}
          tabIndex={1}
          spellCheck={false}
          autoFocus={true}
        />

        <div className={styles.genderLabel}>Gender</div>
        <div className={styles.genderRadioGroup}>
          <input
            className={styles.radioButton}
            type="radio"
            value="m"
            name="gender"
            checked={this.state.gender === "m"}
            onChange={(e) => {
              this.setState({ gender: e.target.value as Gender });
            }}
            tabIndex={2}
          />
          <span className={styles.radioLabel}>Male</span>
          <input
            className={styles.radioButton}
            type="radio"
            value="f"
            name="gender"
            checked={this.state.gender === "f"}
            onChange={(e) => {
              this.setState({ gender: e.target.value as Gender });
            }}
          />
          <span className={styles.radioLabel}>Female</span>
          <input
            className={styles.radioButton}
            type="radio"
            value="o"
            name="gender"
            checked={this.state.gender === "o"}
            onChange={(e) => {
              this.setState({ gender: e.target.value as Gender });
            }}
          />
          <span className={styles.radioLabel}>Other</span>
        </div>

        <div className={styles.classLabel}>Class</div>
        <select
          className={styles.classSelector}
          value={this.state.class}
          onChange={(e) => {
            this.setState({ class: e.target.value });
          }}
          tabIndex={3}
        >
          <option value={"---"}>---</option>
          {AllClassesArray.map(({ name }) => {
            return (
              <option value={name} key={`class${name}`}>
                {name}
              </option>
            );
          })}
        </select>

        <div className={styles.levelLabel}>Level</div>
        <input
          className={styles.levelTextField}
          type={"number"}
          value={this.state.level}
          min={1}
          max={maxLevel}
          onChange={(e) => {
            const level = +e.target.value;
            const hitDice: number[] = this.state.hitDice.slice(0, level);
            while (hitDice.length < level) {
              hitDice.push(this.rollDice(1, hitDieSize));
            }
            this.setState({ level, hitDice });
          }}
          tabIndex={4}
        />

        <div className={styles.xpLabel}>XP</div>
        <input
          className={styles.xpTextField}
          type={"number"}
          value={this.state.xp}
          min={minXP}
          onChange={(e) => {
            this.setState({ xp: +e.target.value });
          }}
          tabIndex={5}
          spellCheck={false}
        />
        <div className={styles.xpRangeLabel}>{`${minXP} - ${maxXP}`}</div>

        <div className={styles.strengthLabel}>
          {primeRequisites.includes(CharacterStat.Strength) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          STR
        </div>
        <input
          className={styles.strengthTextField}
          type={"number"}
          value={this.state.strength}
          min={minStrength}
          max={18}
          onChange={(e) => {
            this.setState({ strength: +e.target.value });
          }}
          tabIndex={6}
        />

        <div className={styles.intelligenceLabel}>
          {primeRequisites.includes(CharacterStat.Intelligence) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          INT
        </div>
        <input
          className={styles.intelligenceTextField}
          type={"number"}
          value={this.state.intelligence}
          min={minIntelligence}
          max={18}
          onChange={(e) => {
            this.setState({ intelligence: +e.target.value });
          }}
          tabIndex={7}
        />

        <div className={styles.wisdomLabel}>
          {primeRequisites.includes(CharacterStat.Wisdom) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          WIS
        </div>
        <input
          className={styles.wisdomTextField}
          type={"number"}
          value={this.state.wisdom}
          min={minWisdom}
          max={18}
          onChange={(e) => {
            this.setState({ wisdom: +e.target.value });
          }}
          tabIndex={8}
        />

        <div className={styles.dexterityLabel}>
          {primeRequisites.includes(CharacterStat.Dexterity) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          DEX
        </div>
        <input
          className={styles.dexterityTextField}
          type={"number"}
          value={this.state.dexterity}
          min={minDexterity}
          max={18}
          onChange={(e) => {
            this.setState({ dexterity: +e.target.value });
          }}
          tabIndex={9}
        />

        <div className={styles.constitutionLabel}>
          {primeRequisites.includes(CharacterStat.Constitution) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          CON
        </div>
        <input
          className={styles.constitutionTextField}
          type={"number"}
          value={this.state.constitution}
          min={minConstitution}
          max={18}
          onChange={(e) => {
            this.setState({ constitution: +e.target.value });
          }}
          tabIndex={10}
        />

        <div className={styles.charismaLabel}>
          {primeRequisites.includes(CharacterStat.Charisma) && (
            <span className={styles.primeRequisiteLabel}>*</span>
          )}
          CHA
        </div>
        <input
          className={styles.charismaTextField}
          type={"number"}
          value={this.state.charisma}
          min={minCharisma}
          max={18}
          onChange={(e) => {
            this.setState({ charisma: +e.target.value });
          }}
          tabIndex={11}
        />

        <div className={styles.rerollStatsLabel}>Reroll Stats</div>
        <div
          className={styles.rollStatsButton}
          onClick={this.onRerollClicked.bind(this)}
        ></div>

        <div className={styles.hitDiceLabel}>{`Hit Dice (d${hitDieSize})`}</div>
        <div className={styles.hitDiceWrapper}>
          {this.state.hitDice.map((hp, index) => {
            return (
              <div className={styles.hitDieWrapper} key={`hd${index}`}>
                <span className={styles.hitDieLabel}>{`L${index + 1}`}</span>
                <input
                  key={`hdtf${index}`}
                  className={styles.hitDieTextField}
                  type={"number"}
                  value={hp}
                  min={1}
                  max={hitDieSize}
                  onChange={(e) => {
                    const hitDice = [...this.state.hitDice];
                    hitDice[index] = +e.target.value;
                    this.setState({ hitDice });
                  }}
                  tabIndex={12 + index}
                />
              </div>
            );
          })}
        </div>

        <div className={styles.rerollHitpointsLabel}>Reroll Hitpoints</div>
        <div
          className={styles.rollHitpointsButton}
          onClick={this.onRerollHitpointsClicked.bind(this)}
        ></div>

        <div
          className={styles.saveButton}
          onClick={this.onSaveClicked.bind(this)}
        >
          Save Character
        </div>

        {this.state.isSaving && (
          <div className={styles.savingVeil}>
            <div className={styles.savingLabel}>Saving...</div>
          </div>
        )}
      </div>
    );
  }

  private async onSaveClicked(): Promise<void> {
    if (this.state.isSaving) {
      return;
    }
    this.setState({ isSaving: true });

    // Valid name?
    if (this.state.nameText.trim().length === 0) {
      this.props.dispatch?.(
        showModal({
          id: "NoNameError",
          content: {
            title: "Error!",
            message: "Please enter a Name for this character!",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    // Valid class?
    if (this.state.class === "---") {
      this.props.dispatch?.(
        showModal({
          id: "NoClassError",
          content: {
            title: "Error!",
            message: "Please select a Class for this character!",
            buttonText: "Okay",
          },
        })
      );
      return;
    }

    const character: CharacterData = {
      id: -1,
      user_id: this.props.currentUserId,
      name: this.state.nameText,
      gender: this.state.gender,
      portrait_url: "",
      class_name: this.state.class,
      level: this.state.level,
      strength: this.state.strength,
      intelligence: this.state.intelligence,
      wisdom: this.state.wisdom,
      dexterity: this.state.dexterity,
      constitution: this.state.constitution,
      charisma: this.state.charisma,
      xp: this.state.xp,
      hp: this.state.hitDice.reduce((a, b) => a + b, 0),
      hit_dice: this.state.hitDice,
    };
    // Send it to the server!
    const res = await ServerAPI.createCharacter(character);
    this.setState({ isSaving: false });
    console.log(res);
    // Refetch characters.
    if (this.props.dispatch) {
      await refetchCharacters(this.props.dispatch);
    }
    // Close the subPanel.
    this.props.dispatch?.(hideSubPanel());
  }

  private onRerollClicked(): void {
    const reqs =
      this.state.class === "---"
        ? {}
        : AllClasses[this.state.class].statRequirements;

    this.setState({
      strength: this.rollStat(reqs[CharacterStat.Strength] ?? 0),
      intelligence: this.rollStat(reqs[CharacterStat.Intelligence] ?? 0),
      wisdom: this.rollStat(reqs[CharacterStat.Wisdom] ?? 0),
      dexterity: this.rollStat(reqs[CharacterStat.Dexterity] ?? 0),
      constitution: this.rollStat(reqs[CharacterStat.Constitution] ?? 0),
      charisma: this.rollStat(reqs[CharacterStat.Charisma] ?? 0),
    });
  }

  private onRerollHitpointsClicked(): void {
    const hitDieSize = AllClasses[this.state.class]?.hitDieSize ?? 4;
    const hitDice: number[] = [...this.state.hitDice];
    for (let i = 0; i < hitDice.length; ++i) {
      hitDice[i] = this.rollDice(1, hitDieSize);
    }
    this.setState({ hitDice });
  }

  private rollStat(min: number): number {
    let stat: number = -1;
    while (stat < min) {
      stat = this.rollDice(3, 6);
    }
    return stat;
  }

  private rollDice(num: number, max: number) {
    let result: number = 0;
    for (let i = 0; i < num; ++i) {
      result += this.randomInt(1, max);
    }
    return result;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

function mapStateToProps(state: RootState, props: ReactProps): Props {
  return {
    ...props,
    currentUserId: state.user.currentUser.id,
  };
}

export const CreateCharacterSubPanel = connect(mapStateToProps)(
  ACreateCharacterSubPanel
);
