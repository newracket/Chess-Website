import { Component } from "react";
import { Board, GameStats, PieceColor, PieceStats, SquareStats, StateFunctions } from "../Types";
import ChessPiece from "./ChessPiece";
import MovableDot from "./MovableDot";

interface Props {
  pieceStats: PieceStats;
  squareStats: SquareStats;
  gameStats: GameStats;
  stateFunctions: StateFunctions;
  makeComputerMove: Function;
}

interface State {
  mouseOver: boolean;
}

export default class ChessSquare extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { mouseOver: false };
  }

  deselectAll(board: Board) {
    board.forEach((row) =>
      row.forEach((item) => {
        item.selected = false;
        item.movable = false;
      })
    );
  }

  render() {
    const numToLetterDict: { [key: number]: string } = {
      0: "a",
      1: "b",
      2: "c",
      3: "d",
      4: "e",
      5: "f",
      6: "g",
      7: "h",
    };
    let classes = this.props.squareStats.squareColor;

    if (this.props.pieceStats.selected) {
      classes += " selected";
    }

    if (this.props.pieceStats.movable) {
      classes += " movable";

      if (this.props.pieceStats.piece) {
        classes += " corners";
      }
    }

    if (this.props.pieceStats.check) {
      if (this.props.gameStats.winner) {
        classes += " checkmate";
      } else {
        classes += " check";
      }
    }

    return (
      <td className={classes as string}>
        {this.props.pieceStats.piece && (
          <ChessPiece
            pieceStats={this.props.pieceStats}
            squareStats={this.props.squareStats}
            gameStats={this.props.gameStats}
            stateFunctions={this.props.stateFunctions}
          />
        )}
        {this.props.pieceStats.movable && (
          <MovableDot
            pieceStats={this.props.pieceStats}
            squareStats={this.props.squareStats}
            gameStats={this.props.gameStats}
            stateFunctions={this.props.stateFunctions}
            makeComputerMove={this.props.makeComputerMove}
          />
        )}
        {this.props.squareStats.row === 7 && (
          <span className="lettering">{numToLetterDict[this.props.squareStats.col]}</span>
        )}
        {this.props.squareStats.col === 7 && <span className="numbering">{8 - this.props.squareStats.row}</span>}
      </td>
    );
  }
}
