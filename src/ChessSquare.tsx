import { Component } from "react";
import { checkForCheckmate, findMoves, flipBoard, isKingInCheck, replacePieceValues } from "./chessmovepossibilities";
import { Board, GameType, PieceColor, PieceStats, PieceType, PieceTypeValues } from './Types';
import ChessPiece from "./ChessPiece";

interface Props {
  stats: PieceStats;
  color: PieceColor;
  check: PieceColor;
  turn: PieceColor;
  board: Board;
  winner: PieceColor;
  stalemate: boolean;
  computerMoving: boolean;
  row: number;
  col: number;
  setComputerMoving: Function;
  setBoard: Function;
  setCheck: Function;
  setTurn: Function;
  setWinner: Function;
  flipBoard: Function;
  computerMove: Function;
  incrementMoveNum: Function;
  moveNum: number;
  pvc: boolean;
}

export default class ChessSquare extends Component<Props> {
  handleClick() {
    if (this.props.computerMoving || this.props.winner || this.props.stalemate) return;

    const newSquareItem = this.props.stats;

    // If the king is currently in check
    if (this.props.check && this.props.check === newSquareItem.color && newSquareItem.color === this.props.turn) {
      this.handleCheck();
    }
    // If the clicked square has a piece and it's that colors turn
    else if (newSquareItem.piece && newSquareItem.color === this.props.turn) {
      this.handlePieceSelection();
    }
    // If clicked square has a movable dot
    else if (newSquareItem.movable) {
      this.movePiece();
    }
  }

  handleCheck() {
    const newSquareItem = this.props.stats;
    const newBoard = this.props.board.map(row => row.map(item => { item.selected = false; item.movable = false; return item; }));

    newSquareItem.selected = true;
    const possibleMoves = findMoves(newBoard, newSquareItem.piece, newSquareItem.color, this.props.row, this.props.col);

    // Loops through all possible moves
    possibleMoves.forEach(possibleMove => {
      // Makes the move in a separate test board
      const testBoard: Board = JSON.parse(JSON.stringify(newBoard));

      testBoard[possibleMove.row][possibleMove.col].piece = newSquareItem.piece;
      testBoard[possibleMove.row][possibleMove.col].color = newSquareItem.color;

      testBoard[this.props.row][this.props.col].piece = null;
      testBoard[this.props.row][this.props.col].color = null;

      // Checks if king is in check after move is made
      if (!isKingInCheck(flipBoard(testBoard))) {
        newBoard[possibleMove.row][possibleMove.col].movable = true;
      }
    });

    this.props.setBoard(newBoard);
  }

  handlePieceSelection() {
    const newSquareItem = this.props.stats;
    const newBoard = this.props.board;
    const selected = newSquareItem.selected;

    // Deselects all pieces and removes all movable squares
    this.deselectAll(newBoard);

    if (!selected) {
      newSquareItem.selected = true;

      findMoves(newBoard, newSquareItem.piece, newSquareItem.color, this.props.row, this.props.col, this.props.moveNum).forEach(possibleMove => {
        const testBoard: Board = JSON.parse(JSON.stringify(newBoard));

        testBoard[possibleMove.row][possibleMove.col].piece = newSquareItem.piece;
        testBoard[possibleMove.row][possibleMove.col].color = newSquareItem.color;

        testBoard[this.props.row][this.props.col].piece = null;
        testBoard[this.props.row][this.props.col].color = null;

        const flippedBoard = flipBoard(testBoard);
        const kingPosition = isKingInCheck(flippedBoard);
        if (!kingPosition || flippedBoard[kingPosition.row][kingPosition.col].color !== this.props.stats.color) {
          newBoard[possibleMove.row][possibleMove.col].movable = true;
        }
      });
    }

    this.props.setBoard(newBoard);
  }

  movePiece() {
    const newBoard = this.props.board;
    const newSquareItem = this.props.stats;

    // Finds row and column of selected piece
    const boardSelected = newBoard.map(row => row.map(item => item.selected));
    const selectedRow = boardSelected.map(row => row.filter(item => item)).findIndex(row => row.length > 0);
    const selectedCol = newBoard.map(row => row.findIndex(item => item.selected)).find(item => item !== -1);
    let promotion = false;

    if (selectedRow === -1 || selectedCol === undefined) return;
    const pieceToMove = newBoard[selectedRow][selectedCol];

    if (pieceToMove.moved === undefined) {
      pieceToMove.moved = this.props.moveNum;
    }
    if (pieceToMove.color === "white") {
      this.props.incrementMoveNum();
    }

    if (pieceToMove.piece === "king") {
      if (this.props.col - selectedCol === 2) {
        replacePieceValues(newBoard[this.props.row][this.props.col - 1], newBoard[this.props.row][7], ["piece", "color", "moved"]);
        Object.assign(newBoard[this.props.row][7], { piece: null, color: null, moved: undefined });
      } else if (this.props.col - selectedCol === -2) {
        replacePieceValues(newBoard[this.props.row][this.props.col + 1], newBoard[this.props.row][0], ["piece", "color", "moved"]);
        Object.assign(newBoard[this.props.row][0], { piece: null, color: null, moved: undefined });
      }
    }

    if (pieceToMove.piece === "pawn") {
      if (newSquareItem.piece === null && selectedCol !== this.props.col) {
        Object.assign(newBoard[this.props.row + 1][this.props.col], { piece: null, color: null, moved: undefined });
      }

      if (this.props.row === 0) {
        let pieceToConvertTo = prompt("What piece do you want to promote the pawn to?");
        while (pieceToConvertTo === null || !PieceTypeValues.includes(pieceToConvertTo.toLowerCase() as PieceType)) {
          pieceToConvertTo = prompt("What piece do you want to promote the pawn to? Options are: queen, rook, knight, bishop");
        }

        pieceToMove.piece = pieceToConvertTo.toLowerCase() as PieceType;
        promotion = true;
      }
    }

    // Moves piece
    replacePieceValues(newBoard[this.props.row][this.props.col], pieceToMove, ["piece", "color", "moved"]);
    Object.assign(pieceToMove, { piece: null, color: null, moved: undefined });

    this.deselectAll(newBoard);

    // Checks if move puts other king in check
    const kingPosition = isKingInCheck(newBoard);
    if (kingPosition) {
      newBoard[kingPosition.row][kingPosition.col].check = true;
      this.props.setCheck(newBoard[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else {
      newBoard.map(row => row.map(item => item.check = false));
      this.props.setCheck(null);
    }

    this.props.setBoard(newBoard);

    const result = checkForCheckmate(flipBoard(newBoard), newSquareItem.color === "white" ? "black" : "white");
    if (result !== GameType.Continue) {
      return this.props.setWinner(newSquareItem.color, result);
    }

    if (this.props.pvc) {
      this.props.setComputerMoving(true);
      setTimeout(() => this.props.computerMove([selectedCol, 8 - selectedRow], [this.props.col, 8 - this.props.row], this.props.stats.piece, promotion), 1);
    } else {
      this.props.flipBoard();
      this.props.setTurn(this.props.turn === "white" ? "black" : "white");
    }
  }

  deselectAll(board: Board) {
    board.forEach(row => row.forEach(item => { item.selected = false; item.movable = false; }));
  }

  render() {
    let classes = this.props.color;

    if (this.props.stats.selected) {
      classes += " selected";
    }

    if (this.props.stats.movable) {
      classes += " movable";

      if (this.props.stats.piece) {
        classes += " corners";
      }
    }

    if (this.props.stats.check) {
      if (this.props.winner) {
        classes += " checkmate";
      } else {
        classes += " check";
      }
    }

    return (
      <td className={classes as string} onClick={() => this.handleClick()}>
        {this.props.stats.piece
          ? <ChessPiece pieceColor={this.props.stats.color} pieceType={this.props.stats.piece} />
          : this.props.stats.movable && <span className="dot"></span>}
      </td>
    );
  }
}