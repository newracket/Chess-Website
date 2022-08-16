import { Component } from 'react';
import defaultBoard from './defaultboard';
import { Board, PieceColor } from './Types';
import ChessSquare from './ChessSquare';
import "./ChessBoard.css";
import { checkForCheckmate, isKingInCheck } from './chessmovepossibilities';

interface Props {
  pvc: boolean;
  game?: any;
}

interface State {
  board: Board;
  turn: PieceColor;
  check: PieceColor;
  winner: PieceColor;
  computerMoving: boolean;
}

export default class ChessBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { board: defaultBoard, turn: "white", check: null, winner: null, computerMoving: false };
    this.setBoard = this.setBoard.bind(this);
    this.setTurn = this.setTurn.bind(this);
    this.flipBoard = this.flipBoard.bind(this);
    this.setCheck = this.setCheck.bind(this);
    this.setWinner = this.setWinner.bind(this);
    this.computerMove = this.computerMove.bind(this);
    this.setComputerMoving = this.setComputerMoving.bind(this);
  }

  setBoard(newBoardTemplate: Board) {
    this.setState({
      board: newBoardTemplate
    });
  }

  setTurn(newTurn: PieceColor) {
    this.setState({
      turn: newTurn
    });
  }

  flipBoard() {
    const newBoard = this.state.board.map(row => row.reverse()).reverse();

    this.setState({
      board: newBoard
    });

    return newBoard;
  }

  setComputerMoving(val: boolean) {
    this.setState({
      computerMoving: val
    });
  }

  computerMove(playerMoveFrom: number[], playerMoveTo: number[]) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    this.props.game.move(`${letters[playerMoveFrom[0]]}${playerMoveFrom[1]}`, `${letters[playerMoveTo[0]]}${playerMoveTo[1]}`);
    const computerMove = this.props.game.aiMove(2);
    const fromPosition = Object.keys(computerMove)[0];
    const toPosition = computerMove[fromPosition];

    const boardFromPosition = this.state.board[8 - parseInt(fromPosition[1])][letters.indexOf(fromPosition[0])];
    const boardToPosition = this.state.board[8 - parseInt(toPosition[1])][letters.indexOf(toPosition[0])];

    boardToPosition.piece = boardFromPosition.piece;
    boardToPosition.color = boardFromPosition.color;
    boardFromPosition.piece = null;
    boardFromPosition.color = null;

    // Checks if move puts other king in check
    const kingPosition = isKingInCheck(this.state.board);
    if (kingPosition) {
      this.state.board[kingPosition.row][kingPosition.col].check = true;
      this.setCheck(this.state.board[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else if (this.state.check) {
      this.state.board.map(row => row.map(item => item.check = false));
      this.setCheck(null);
    }

    if (checkForCheckmate(this.state.board, this.state.turn)) {
      this.setWinner(this.state.turn === "white" ? "black" : "white");
    }

    this.setBoard(this.state.board);

    this.setComputerMoving(false);
  }

  setCheck(color: PieceColor) {
    this.setState({
      check: color
    });
  }

  setWinner(winner: PieceColor) {
    this.setState({
      winner: winner
    });
  }

  constructBoard(boardTemplate: Board) {
    const board: JSX.Element[] = [];

    boardTemplate.forEach((row, a) => {
      const newRow = row.map((item, b) => {
        if (a % 2 === 0) {
          return <ChessSquare key={`${a}${b}`} row={a} col={b} color={b % 2 === 0 ? "white" : "black"} stats={item} check={this.state.check} turn={this.state.turn}
            pvc={this.props.pvc} board={this.state.board} winner={this.state.winner} setComputerMoving={this.setComputerMoving} computerMoving={this.state.computerMoving}
            flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner} computerMove={this.computerMove} />;
        }
        else {
          return <ChessSquare key={`${a}${b}`} row={a} col={b} color={b % 2 === 0 ? "black" : "white"} stats={item} check={this.state.check} turn={this.state.turn}
            pvc={this.props.pvc} board={this.state.board} winner={this.state.winner} setComputerMoving={this.setComputerMoving} computerMoving={this.state.computerMoving}
            flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner} computerMove={this.computerMove} />;
        }
      });

      board.push(<tr key={a} className="chessBoardRow">{newRow}</tr>);
    });

    return board;
  }

  render() {
    return (
      <>
        <div className="titleDiv">
          <h1 className="chessBoardTitle">{
            this.state.winner
              ? `${this.state.winner.charAt(0).toUpperCase() + this.state.winner.slice(1)} wins!`
              : `Player vs. ${this.props.pvc ? "Computer" : "Player"}`
          }</h1>
        </div>

        <div className="chessBoardContainer">
          <table className="chessBoardTable">
            <tbody className="chessBoardBody">
              {this.constructBoard(this.state.board)}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}