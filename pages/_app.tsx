import React from "react";

import "../emporium-styles.css";

interface State {
  likes: number;
}

interface InjectedProps {}
interface ReactProps {}

type Props = ReactProps & InjectedProps;

export default class HomePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      likes: 0,
    };
  }

  render(): React.ReactNode {
    const names = ["Ada Lovelace", "Grace Hopper", "Margaret Hamilton"];

    return (
      <div>
        <h1>Develop. Preview. Ship. 🚀</h1>
        <ul>
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <img src={"/images/Initials.png"} />

        <button onClick={this.handleClick.bind(this)}>
          Like ({this.state.likes})
        </button>
      </div>
    );
  }

  private handleClick(): void {
    this.setState({ likes: this.state.likes + 1 });
  }
}
