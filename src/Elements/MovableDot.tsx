import { Component } from "react";
import { checkForCheckmate, deselectAll, flipBoard, isKingInCheck, replacePieceValues } from "../utils";
import { GameStats, GameType, PieceStats, PieceType, PieceTypeValues, SquareStats, StateFunctions } from "../Types";

interface Props {
  pieceStats: PieceStats;
  squareStats: SquareStats;
  gameStats: GameStats;
  stateFunctions: StateFunctions;
  makeComputerMove: Function;
}

export default class ChessPiece extends Component<Props> {
  movePiece() {
    if (this.props.gameStats.winner || this.props.gameStats.stalemate || this.props.gameStats.computerMoving) return;

    const newBoard = this.props.gameStats.board;
    const newSquareItem = this.props.pieceStats;

    // Finds row and column of selected piece
    const boardSelected = newBoard.map((row) => row.map((item) => item.selected));
    const selectedRow = boardSelected.map((row) => row.filter((item) => item)).findIndex((row) => row.length > 0);
    const selectedCol = newBoard.map((row) => row.findIndex((item) => item.selected)).find((item) => item !== -1);
    let promotion = false;

    if (selectedRow === -1 || selectedCol === undefined) return;
    const pieceToMove = newBoard[selectedRow][selectedCol];

    if (pieceToMove.moved === undefined) {
      pieceToMove.moved = this.props.gameStats.moveNum;
    }
    if (pieceToMove.color === "white") {
      this.props.stateFunctions.incrementMoveNum();
    }

    if (pieceToMove.piece === "king") {
      if (this.props.squareStats.col - selectedCol === 2) {
        replacePieceValues(
          newBoard[this.props.squareStats.row][this.props.squareStats.col - 1],
          newBoard[this.props.squareStats.row][7],
          ["piece", "color", "moved"]
        );
        Object.assign(newBoard[this.props.squareStats.row][7], {
          piece: null,
          color: null,
          moved: undefined,
        });
      } else if (this.props.squareStats.col - selectedCol === -2) {
        replacePieceValues(
          newBoard[this.props.squareStats.row][this.props.squareStats.col + 1],
          newBoard[this.props.squareStats.row][0],
          ["piece", "color", "moved"]
        );
        Object.assign(newBoard[this.props.squareStats.row][0], {
          piece: null,
          color: null,
          moved: undefined,
        });
      }
    }

    if (pieceToMove.piece === "pawn") {
      if (newSquareItem.piece === null && selectedCol !== this.props.squareStats.col) {
        Object.assign(newBoard[this.props.squareStats.row + 1][this.props.squareStats.col], {
          piece: null,
          color: null,
          moved: undefined,
        });
      }

      if (this.props.squareStats.row === 0) {
        let pieceToConvertTo = prompt("What piece do you want to promote the pawn to?");
        while (pieceToConvertTo === null || !PieceTypeValues.includes(pieceToConvertTo.toLowerCase() as PieceType)) {
          pieceToConvertTo = prompt(
            "What piece do you want to promote the pawn to? Options are: queen, rook, knight, bishop"
          );
        }

        pieceToMove.piece = pieceToConvertTo.toLowerCase() as PieceType;
        promotion = true;
      }
    }

    // Moves piece
    replacePieceValues(newBoard[this.props.squareStats.row][this.props.squareStats.col], pieceToMove, [
      "piece",
      "color",
      "moved",
    ]);
    Object.assign(pieceToMove, { piece: null, color: null, moved: undefined });

    deselectAll(newBoard);

    // Checks if move puts other king in check
    const kingPosition = isKingInCheck(newBoard);
    if (kingPosition) {
      newBoard[kingPosition.row][kingPosition.col].check = true;
      this.props.stateFunctions.setCheck(newBoard[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else {
      newBoard.map((row) => row.map((item) => (item.check = false)));
      this.props.stateFunctions.setCheck(null);
    }

    this.props.stateFunctions.setBoard(newBoard);

    const result = checkForCheckmate(flipBoard(newBoard), newSquareItem.color === "white" ? "black" : "white");
    if (result !== GameType.Continue) {
      return this.props.stateFunctions.setWinner(newSquareItem.color, result);
    }

    if (this.props.gameStats.pvc) {
      this.props.stateFunctions.setComputerMoving(true);
      setTimeout(
        () =>
          this.props.makeComputerMove(
            [selectedCol, 8 - selectedRow],
            [this.props.squareStats.col, 8 - this.props.squareStats.row],
            this.props.pieceStats.piece,
            promotion
          ),
        1
      );
    } else {
      this.props.stateFunctions.flipBoard();
      this.props.stateFunctions.setTurn(this.props.gameStats.turn === "white" ? "black" : "white");
    }
  }

  render() {
    return (
      <div className="chessSquare" onClick={() => this.movePiece()}>
        {!this.props.pieceStats.piece && <span className="dot"></span>}
      </div>
    );
  }
}
