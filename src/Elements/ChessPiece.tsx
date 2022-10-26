import { Component } from "react";
import { Board, GameStats, PieceColor, PieceStats, SquareStats, StateFunctions } from "../Types";
import { deselectAll, findMoves, flipBoard, isKingInCheck } from "../utils";

interface Props {
  pieceStats: PieceStats;
  squareStats: SquareStats;
  gameStats: GameStats;
  stateFunctions: StateFunctions;
}

export default class ChessPiece extends Component<Props> {
  handlePieceSelection() {
    if (this.props.gameStats.winner || this.props.gameStats.stalemate || this.props.gameStats.computerMoving) return;

    const newSquareItem = this.props.pieceStats;
    const newBoard = this.props.gameStats.board;
    const selected = newSquareItem.selected;

    if (newSquareItem.color !== this.props.gameStats.turn) return;

    // Deselects all pieces and removes all movable squares
    deselectAll(newBoard);

    if (!selected) {
      newSquareItem.selected = true;

      findMoves(
        newBoard,
        newSquareItem.piece,
        newSquareItem.color,
        this.props.squareStats.row,
        this.props.squareStats.col,
        this.props.gameStats.moveNum
      ).forEach((possibleMove) => {
        const testBoard: Board = JSON.parse(JSON.stringify(newBoard));

        testBoard[possibleMove.row][possibleMove.col].piece = newSquareItem.piece;
        testBoard[possibleMove.row][possibleMove.col].color = newSquareItem.color;

        testBoard[this.props.squareStats.row][this.props.squareStats.col].piece = null;
        testBoard[this.props.squareStats.row][this.props.squareStats.col].color = null;

        // Checks if move will put player king in check
        const flippedBoard = flipBoard(testBoard);
        const kingPosition = isKingInCheck(flippedBoard);
        if (!kingPosition || flippedBoard[kingPosition.row][kingPosition.col].color !== this.props.pieceStats.color) {
          newBoard[possibleMove.row][possibleMove.col].movable = true;
        }
      });
    }

    this.props.stateFunctions.setBoard(newBoard);
  }

  render() {
    if (this.props.pieceStats.piece) {
      return (
        <div className="chessSquare" onClick={() => this.handlePieceSelection()}>
          <img
            className="chessPiece"
            src={`${this.props.pieceStats.color}${this.props.pieceStats.piece}.png`}
            alt={`${this.props.pieceStats.color} ${this.props.pieceStats.piece}`}
          />
        </div>
      );
    }
    return <span></span>;
  }
}
