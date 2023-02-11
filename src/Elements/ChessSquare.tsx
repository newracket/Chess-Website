import { Component } from "react";
import {
  Board,
  GameStats,
  PieceStats,
  SquareStats,
  StateFunctions,
} from "../Types";
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

  setMouseOver() {
    this.props.stateFunctions.mouseOverSquare(
      this.props.squareStats.row,
      this.props.squareStats.col
    );
  }

  render() {
    let classes = this.props.squareStats.squareColor;

    if (this.props.pieceStats.selected) {
      classes += " selected";
    }

    if (this.props.pieceStats.lastMoved) {
      classes += " lastMoved";
    }

    if (this.props.pieceStats.movable) {
      classes += " movable";

      if (this.props.pieceStats.piece) {
        classes += " capturable";
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
      <td className={classes as string} onDragEnter={() => this.setMouseOver()}>
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
          <span className="lettering">{this.props.pieceStats.colLetter}</span>
        )}
        {this.props.squareStats.col === 7 && (
          <span className="numbering">{this.props.pieceStats.rowNum}</span>
        )}
      </td>
    );
  }
}
