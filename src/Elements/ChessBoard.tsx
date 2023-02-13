import { Component } from "react";
import defaultBoard from "../defaultboard";
import {
  Board,
  GameType,
  PieceColor,
  PieceType,
  StateFunctions,
} from "../Types";
import ChessSquare from "./ChessSquare";
import "../ChessBoard.css";
import {
  checkForCheckmate,
  flipBoard,
  isKingInCheck,
  replacePieceValues,
} from "../utils";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Props {
  pvc: boolean;
  game?: any;
}

interface State {
  board: Board;
  turn: PieceColor;
  check: PieceColor;
  winner: PieceColor;
  stalemate: boolean;
  computerMoving: boolean;
  moveNum: number;
  moves: string[][];
}

export default class ChessBoard extends Component<Props, State> {
  stateFunctions: StateFunctions;

  constructor(props: Props) {
    super(props);

    this.state = {
      board: structuredClone(defaultBoard),
      turn: "white",
      check: null,
      winner: null,
      stalemate: false,
      computerMoving: false,
      moveNum: 0,
      moves: [],
    };

    for (let i = 0; i < 100; i++) {
      this.state.moves.push(["e4", "e5"]);
    }

    this.setBoard = this.setBoard.bind(this);
    this.setTurn = this.setTurn.bind(this);
    this.flipBoard = this.flipBoard.bind(this);
    this.setCheck = this.setCheck.bind(this);
    this.setWinner = this.setWinner.bind(this);
    this.makeComputerMove = this.makeComputerMove.bind(this);
    this.setComputerMoving = this.setComputerMoving.bind(this);
    this.incrementMoveNum = this.incrementMoveNum.bind(this);
    this.mouseOverSquare = this.mouseOverSquare.bind(this);

    this.stateFunctions = {
      setBoard: this.setBoard,
      setTurn: this.setTurn,
      setCheck: this.setCheck,
      setWinner: this.setWinner,
      setComputerMoving: this.setComputerMoving,
      incrementMoveNum: this.incrementMoveNum,
      flipBoard: this.flipBoard,
      mouseOverSquare: this.mouseOverSquare,
    };
  }

  setBoard(newBoardTemplate: Board) {
    this.setState({
      board: newBoardTemplate,
    });
  }

  setTurn(newTurn: PieceColor) {
    this.setState({
      turn: newTurn,
    });
  }

  setComputerMoving(val: boolean) {
    this.setState({
      computerMoving: val,
    });
  }

  setCheck(color: PieceColor) {
    this.setState({
      check: color,
    });
  }

  setWinner(winner: PieceColor, gameType: GameType) {
    if (gameType === GameType.Checkmate) {
      this.setState({
        winner: winner,
      });
    } else if (gameType === GameType.Stalemate) {
      this.setState({
        stalemate: true,
      });
    }
  }

  incrementMoveNum() {
    this.setState({
      moveNum: this.state.moveNum + 1,
    });

    this.state.moves.push([]);
  }

  flipBoard() {
    const newBoard = this.state.board.map((row) => row.reverse()).reverse();

    this.setState({
      board: newBoard,
    });

    return newBoard;
  }

  mouseOverSquare(row: number, col: number) {
    const newBoard = structuredClone(this.state.board);
    newBoard.forEach((row) =>
      row.forEach((square) => (square.mouseover = false))
    );
    newBoard[row][col].mouseover = true;

    this.setState({
      board: newBoard,
    });
  }

  makeComputerMove(
    playerMoveFrom: string,
    playerMoveTo: string,
    piece: PieceType,
    promotion: boolean
  ) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    // Makes player move in computer's game
    this.props.game.move(playerMoveFrom, playerMoveTo);

    // Promotes pawn if necessary
    if (promotion && piece !== null) {
      let character = piece?.charAt(0);
      if (piece === "knight") {
        character = "n";
      }

      if (this.state.turn === "white") {
        this.props.game.setPiece(playerMoveTo, character.toUpperCase());
      } else {
        this.props.game.setPiece(playerMoveTo, character);
      }
    }

    const computerMove = this.props.game.aiMove(2);
    const fromPosition = Object.keys(computerMove)[0];
    const toPosition = computerMove[fromPosition];

    const fromPositionIndexes = [
      8 - parseInt(fromPosition[1]),
      letters.indexOf(fromPosition[0]),
    ];
    const toPositionIndexes = [
      8 - parseInt(toPosition[1]),
      letters.indexOf(toPosition[0]),
    ];

    const fromSquare =
      this.state.board[fromPositionIndexes[0]][fromPositionIndexes[1]];
    const toSquare =
      this.state.board[toPositionIndexes[0]][toPositionIndexes[1]];
    const defaultPieceStats = {
      piece: null,
      color: null,
      moved: undefined,
      lastMoved: true,
    };

    // Clears all lastMoved properties
    this.state.board.forEach((row) =>
      row.forEach((item) => (item.lastMoved = false))
    );

    // Makes computer move
    replacePieceValues(toSquare, fromSquare, ["piece", "color", "moved"]);
    Object.assign(fromSquare, defaultPieceStats);
    toSquare.lastMoved = true;

    // Moves rook when castling
    if (toSquare.piece === "king") {
      let colNum = 7;
      let offset = -1;
      if (fromPositionIndexes[1] - toPositionIndexes[1] === 2) {
        colNum = 0;
        offset = 1;
      }

      replacePieceValues(
        this.state.board[fromPositionIndexes[0]][toPositionIndexes[1] + offset],
        this.state.board[fromPositionIndexes[0]][colNum],
        ["piece", "color", "moved"]
      );
      Object.assign(
        this.state.board[fromPositionIndexes[0]][colNum],
        defaultPieceStats
      );
    }

    // Promoting pawn
    if (toPositionIndexes[0] === 7 && toSquare.piece === "pawn") {
      toSquare.piece = "queen";
    }

    // Checks if move puts other king in check
    const flippedBoard = flipBoard(this.state.board);
    const kingPosition = isKingInCheck(flippedBoard);
    if (kingPosition) {
      this.state.board[7 - kingPosition.row][7 - kingPosition.col].check = true;
      this.setCheck(this.state.board[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else if (this.state.check) {
      this.state.board.map((row) => row.map((item) => (item.check = false)));
      this.setCheck(null);
    }

    const result = checkForCheckmate(this.state.board, this.state.turn);
    if (result !== GameType.Continue) {
      this.setWinner(this.state.turn === "white" ? "black" : "white", result);
    }

    this.setBoard(this.state.board);

    this.setComputerMoving(false);
  }

  constructBoard(boardTemplate: Board) {
    const board: JSX.Element[] = [];

    boardTemplate.forEach((row, a) => {
      board.push(
        <tr key={a} className="chessBoardRow">
          {row.map((item, b) => {
            return (
              <ChessSquare
                key={`${a}${b}`}
                squareStats={{
                  row: a,
                  col: b,
                  squareColor: a % 2 === b % 2 ? "white" : "black",
                }}
                pieceStats={item}
                gameStats={{
                  turn: this.state.turn,
                  pvc: this.props.pvc,
                  board: this.state.board,
                  winner: this.state.winner,
                  stalemate: this.state.stalemate,
                  moveNum: this.state.moveNum,
                  moves: this.state.moves,
                  computerMoving: this.state.computerMoving,
                }}
                stateFunctions={this.stateFunctions}
                makeComputerMove={this.makeComputerMove}
              />
            );
          })}
        </tr>
      );
    });

    return board;
  }

  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="titleDiv">
          <Link to="/" className="back">
            <FaArrowLeft/>
            <span className="backText">Back</span>
          </Link>

          <h1 className="chessBoardTitle">
            {this.state.stalemate
              ? `Stalemate! Nobody wins.`
              : this.state.winner
                ? `${
                  this.state.winner.charAt(0).toUpperCase() +
                  this.state.winner.slice(1)
                } wins!`
                : `Player vs. ${this.props.pvc ? "Computer" : "Player"}`}
          </h1>
        </div>

        <div className="chessBoardMoveHistoryContainer">
          <div className="chessBoardContainer">
            <table className="chessBoardTable">
              <tbody className="chessBoardBody">
              {this.constructBoard(this.state.board)}
              </tbody>
            </table>
          </div>

          <div className="moveHistory">
            <h1 className="moveHistoryTitle">Move History</h1>
            {this.state.moves.map((move, i) => {
              return (
                <div className="moveRow">
                  <div className="moveNum">{i + 1}.</div>
                  <div className="moves">
                    <div className="move">{move[0]}</div>
                    <div className="move">{move[1]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DndProvider>
    );
  }
}
