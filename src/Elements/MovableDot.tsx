import { Component } from "react";
import {
  checkForCheckmate,
  deselectAll,
  flipBoard,
  getNotation,
  isKingInCheck,
  replacePieceValues,
} from "../utils";
import {
  GameStats,
  GameType,
  PieceStats,
  PieceType,
  PieceTypeValues,
  SpecialMoves,
  SquareStats,
  StateFunctions,
} from "../Types";

interface Props {
  pieceStats: PieceStats;
  squareStats: SquareStats;
  gameStats: GameStats;
  stateFunctions: StateFunctions;
  makeComputerMove: Function;
}

interface State {
  mouseover: boolean;
}

export default class ChessPiece extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { mouseover: false };
  }

  movePiece() {
    if (
      this.props.gameStats.winner ||
      this.props.gameStats.stalemate ||
      this.props.gameStats.computerMoving
    )
      return;

    const newBoard = this.props.gameStats.board;
    const newSquareItem = this.props.pieceStats;

    // Finds row and column of selected piece
    const boardSelected = newBoard.map((row) =>
      row.map((item) => item.selected)
    );
    const selectedRow = boardSelected
      .map((row) => row.filter((item) => item))
      .findIndex((row) => row.length > 0);
    const selectedCol = newBoard
      .map((row) => row.findIndex((item) => item.selected))
      .find((item) => item !== -1);
    const specialMoves: SpecialMoves = {
      castle: false,
      enPassant: false,
      promotion: false,
      capture: false,
      check: false,
      checkmate: false,
    };
    const defaultPieceStats = {
      piece: null,
      color: null,
      moved: undefined,
      lastMoved: true,
    };

    if (selectedRow === -1 || selectedCol === undefined) return;
    const pieceToMove = newBoard[selectedRow][selectedCol];

    if (pieceToMove.moved === undefined) {
      pieceToMove.moved = this.props.gameStats.moveNum;
    }
    if (pieceToMove.color === "white") {
      this.props.stateFunctions.incrementMoveNum();
    }

    // Moves rook when castling
    if (
      pieceToMove.piece === "king" &&
      Math.abs(this.props.squareStats.col - selectedCol) === 2
    ) {
      let colNum = 7;
      let offset = -1;
      if (this.props.squareStats.col - selectedCol === -2) {
        offset = +1;
        colNum = 0;
      }

      replacePieceValues(
        newBoard[this.props.squareStats.row][
          this.props.squareStats.col + offset
        ],
        newBoard[this.props.squareStats.row][colNum],
        ["piece", "color", "moved"]
      );
      Object.assign(
        newBoard[this.props.squareStats.row][colNum],
        defaultPieceStats
      );

      specialMoves.castle = true;
    }

    if (pieceToMove.piece === "pawn") {
      // Removes opponent pawn in en passant
      if (
        newSquareItem.piece === null &&
        selectedCol !== this.props.squareStats.col
      ) {
        Object.assign(
          newBoard[this.props.squareStats.row + 1][this.props.squareStats.col],
          defaultPieceStats
        );

        specialMoves.enPassant = true;
      }

      // Promoting pawn
      if (this.props.squareStats.row === 0) {
        let pieceToConvertTo = prompt(
          "What piece do you want to promote the pawn to?"
        );
        while (
          pieceToConvertTo === null ||
          pieceToConvertTo.toLowerCase() === "king" ||
          !PieceTypeValues.includes(pieceToConvertTo.toLowerCase() as PieceType)
        ) {
          pieceToConvertTo = prompt(
            "What piece do you want to promote the pawn to? Options are: queen, rook, knight, bishop"
          );
        }

        pieceToMove.piece = pieceToConvertTo.toLowerCase() as PieceType;
        specialMoves.promotion = true;
      }
    }

    const pieceAfterMove =
      newBoard[this.props.squareStats.row][this.props.squareStats.col];
    if (pieceAfterMove.piece !== null) {
      specialMoves.capture = true;
    }

    // Clears all lastMoved properties
    newBoard.forEach((row) => row.forEach((item) => (item.lastMoved = false)));

    // Moves piece
    replacePieceValues(pieceAfterMove, pieceToMove, [
      "piece",
      "color",
      "moved",
    ]);
    Object.assign(pieceToMove, defaultPieceStats);
    pieceAfterMove.lastMoved = true;

    deselectAll(newBoard);

    // Checks if move puts other king in check
    const kingPosition = isKingInCheck(newBoard);
    if (kingPosition) {
      newBoard[kingPosition.row][kingPosition.col].check = true;
      this.props.stateFunctions.setCheck(
        newBoard[kingPosition.row][kingPosition.col].color
      );
      specialMoves.check = true;
    }
    // Checks if king is currently in check and move removes king from check
    else {
      newBoard.map((row) => row.map((item) => (item.check = false)));
      this.props.stateFunctions.setCheck(null);
    }

    this.props.stateFunctions.setBoard(newBoard);

    const result = checkForCheckmate(
      flipBoard(newBoard),
      newSquareItem.color === "white" ? "black" : "white"
    );
    if (result === GameType.Checkmate) {
      specialMoves.checkmate = true;
    }

    this.props.gameStats.moves[this.props.gameStats.moves.length - 1].push(
      getNotation(newBoard, pieceToMove, pieceAfterMove, specialMoves)
    );
    if (result !== GameType.Continue) {
      return this.props.stateFunctions.setWinner(newSquareItem.color, result);
    }

    if (this.props.gameStats.pvc) {
      this.props.stateFunctions.setComputerMoving(true);
      setTimeout(
        () =>
          this.props.makeComputerMove(
            `${pieceToMove.colLetter}${pieceToMove.rowNum}`,
            `${pieceAfterMove.colLetter}${pieceAfterMove.rowNum}`,
            this.props.pieceStats.piece,
            specialMoves.promotion
          ),
        1
      );
    } else {
      this.props.stateFunctions.flipBoard();
      this.props.stateFunctions.setTurn(
        this.props.gameStats.turn === "white" ? "black" : "white"
      );
    }
  }

  render() {
    return (
      <div
        className="chessSquare"
        onClick={() => this.movePiece()}
        onDrop={() => this.movePiece()}
        onDragOver={(e) => e.preventDefault()}
      >
        {!this.props.pieceStats.piece && (
          <span
            className={`dot${
              this.props.pieceStats.mouseover ? " mouseover" : ""
            }`}
          ></span>
        )}
      </div>
    );
  }
}
