import { Component } from 'react';
import defaultBoard from '../defaultboard';
import { Board, PieceColor } from '../Types';
import ChessSquare from './ChessSquare';

interface State {
  board: Board;
  turn: PieceColor;
  check: PieceColor;
  winner: PieceColor;
}

export default class ChessBoard extends Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = { board: defaultBoard, turn: "white", check: null, winner: null };
    this.setBoard = this.setBoard.bind(this);
    this.setTurn = this.setTurn.bind(this);
    this.flipBoard = this.flipBoard.bind(this);
    this.setCheck = this.setCheck.bind(this);
    this.setWinner = this.setWinner.bind(this);
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
            board={this.state.board} flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner} />;
        }
        else {
          return <ChessSquare key={`${a}${b}`} row={a} col={b} color={b % 2 === 0 ? "black" : "white"} stats={item} check={this.state.check} turn={this.state.turn}
            board={this.state.board} flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner} />;
        }
      });

      board.push(<tr key={a} className="chessBoardRow">{newRow}</tr>);
    });

    return board;
  }

  render() {
    return (
      <table className="chessBoardTable">
        <tbody className="chessBoardBody">
          {this.state.winner &&
            <div className="winnerDisplay">
              <div className="checkmate">
                Checkmate!
              </div>

              <div className="winner">
                The winner is {this.state.winner}
              </div>
            </div>}
          {this.constructBoard(this.state.board)}
        </tbody>
      </table>
    );
  }
}