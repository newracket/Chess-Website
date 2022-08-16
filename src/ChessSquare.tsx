import { Component } from "react";
import { checkForCheckmate, findMoves, isKingInCheck } from "./chessmovepossibilities";
import { Board, PieceColor, PieceType } from './Types';
import ChessPiece from "./ChessPiece";

interface Props {
  stats: {
    selected: boolean;
    movable: boolean;
    piece: PieceType;
    check: boolean;
    color: PieceColor;
  };
  color: PieceColor;
  check: PieceColor;
  turn: PieceColor;
  board: Board;
  winner: PieceColor;
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
  pvc: boolean;
}

export default class ChessSquare extends Component<Props> {
  handleClick() {
    if (this.props.computerMoving || this.props.winner) return;

    const currentItem = this.props.stats;

    // If the king is currently in check
    if (this.props.check && this.props.check === currentItem.color && currentItem.color === this.props.turn) {
      this.handleCheck();
    }
    // If the clicked square has a piece and it's that colors turn
    else if (currentItem.piece && currentItem.color === this.props.turn) {
      this.handlePieceSelection();
    }
    // If clicked square has a movable dot
    else if (currentItem.movable) {
      this.movePiece();
    }
  }

  handleCheck() {
    const currentItem = this.props.stats;
    const newBoard = this.props.board.map(row => row.map(item => { item.selected = false; item.movable = false; return item; }));

    currentItem.selected = true;
    const possibleMoves = findMoves(newBoard, currentItem.piece, currentItem.color, this.props.row, this.props.col);

    // Loops through all possible moves
    possibleMoves.forEach(possibleMove => {
      // Makes the move in a separate test board
      const testBoard: Board = JSON.parse(JSON.stringify(newBoard));

      testBoard[possibleMove.row][possibleMove.col].piece = currentItem.piece;
      testBoard[possibleMove.row][possibleMove.col].color = currentItem.color;

      testBoard[this.props.row][this.props.col].piece = null;
      testBoard[this.props.row][this.props.col].color = null;

      const flippedBoard = testBoard.map(row => row.reverse()).reverse();
      // Checks if king is in check after move is made
      if (!isKingInCheck(flippedBoard)) {
        newBoard[possibleMove.row][possibleMove.col].movable = true;
      }
    });

    this.props.setBoard(newBoard);
  }

  handlePieceSelection() {
    const currentItem = this.props.stats;
    const newBoard = this.props.board;
    const selected = currentItem.selected;

    // Deselects all pieces and removes all movable squares
    this.deselectAll(newBoard);

    if (!selected) {
      currentItem.selected = true;

      findMoves(newBoard, currentItem.piece, currentItem.color, this.props.row, this.props.col).forEach(possibleMove => {
        const testBoard: Board = JSON.parse(JSON.stringify(newBoard));

        testBoard[possibleMove.row][possibleMove.col].piece = currentItem.piece;
        testBoard[possibleMove.row][possibleMove.col].color = currentItem.color;

        testBoard[this.props.row][this.props.col].piece = null;
        testBoard[this.props.row][this.props.col].color = null;

        const flippedBoard = testBoard.map(row => row.reverse()).reverse();
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
    const currentItem = this.props.stats;

    // Finds row and column of selected piece
    const boardSelected = newBoard.map(row => row.map(item => item.selected));
    const selectedRow = boardSelected.map(row => row.filter(item => item)).findIndex(row => row.length > 0);
    const selectedCol = newBoard.map(row => row.findIndex(item => item.selected)).find(item => item !== -1);

    if (selectedRow === -1 || selectedCol === undefined) return;

    // Moves piece
    newBoard[this.props.row][this.props.col].piece = newBoard[selectedRow][selectedCol].piece;
    newBoard[this.props.row][this.props.col].color = newBoard[selectedRow][selectedCol].color;
    newBoard[selectedRow][selectedCol].piece = null;
    newBoard[selectedRow][selectedCol].color = null;

    this.deselectAll(newBoard);

    // Checks if move puts other king in check
    const kingPosition = isKingInCheck(newBoard);
    if (kingPosition) {
      newBoard[kingPosition.row][kingPosition.col].check = true;
      this.props.setCheck(newBoard[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else if (this.props.check) {
      newBoard.map(row => row.map(item => item.check = false));
      this.props.setCheck(null);
    }

    this.props.setBoard(newBoard);

    const testBoard: Board = JSON.parse(JSON.stringify(newBoard));
    const flippedBoard = testBoard.map(row => row.reverse()).reverse();
    if (checkForCheckmate(flippedBoard, currentItem.color === "white" ? "black" : "white")) {
      return this.props.setWinner(currentItem.color);
    }

    if (this.props.pvc) {
      this.props.setComputerMoving(true);
      setTimeout(() => this.props.computerMove([selectedCol, 8 - selectedRow], [this.props.col, 8 - this.props.row]), 1);
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