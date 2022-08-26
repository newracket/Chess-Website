import { Component } from 'react';
import defaultBoard from './defaultboard';
import { Board, GameType, PieceColor, PieceType } from './Types';
import ChessSquare from './ChessSquare';
import "./ChessBoard.css";
import { checkForCheckmate, flipBoard, isKingInCheck, replacePieceValues } from './chessmovepossibilities';

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
}

export default class ChessBoard extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { board: defaultBoard, turn: "white", check: null, winner: null, stalemate: false, computerMoving: false, moveNum: 0 };
    this.setBoard = this.setBoard.bind(this);
    this.setTurn = this.setTurn.bind(this);
    this.flipBoard = this.flipBoard.bind(this);
    this.setCheck = this.setCheck.bind(this);
    this.setWinner = this.setWinner.bind(this);
    this.computerMove = this.computerMove.bind(this);
    this.setComputerMoving = this.setComputerMoving.bind(this);
    this.incrementMoveNum = this.incrementMoveNum.bind(this);
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

  incrementMoveNum() {
    this.setState({
      moveNum: this.state.moveNum + 1
    });
  }

  computerMove(playerMoveFrom: number[], playerMoveTo: number[], piece: PieceType, promotion: boolean) {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

    this.props.game.move(`${letters[playerMoveFrom[0]]}${playerMoveFrom[1]}`, `${letters[playerMoveTo[0]]}${playerMoveTo[1]}`);

    if (promotion && piece !== null) {
      let character = piece?.charAt(0);
      if (piece === "knight") {
        character = "n";
      }

      if (this.state.turn === "white") {
        this.props.game.setPiece(`${letters[playerMoveTo[0]]}${playerMoveTo[1]}`, character.toUpperCase());
      } else {
        this.props.game.setPiece(`${letters[playerMoveTo[0]]}${playerMoveTo[1]}`, character);
      }
    }

    const computerMove = this.props.game.aiMove(2);
    console.log(computerMove);
    const fromPosition = Object.keys(computerMove)[0];
    const toPosition = computerMove[fromPosition];

    const fromPositionIndexes = [8 - parseInt(fromPosition[1]), letters.indexOf(fromPosition[0])];
    const toPositionIndexes = [8 - parseInt(toPosition[1]), letters.indexOf(toPosition[0])];

    replacePieceValues(this.state.board[toPositionIndexes[0]][toPositionIndexes[1]], this.state.board[fromPositionIndexes[0]][fromPositionIndexes[1]], ["piece", "color", "moved"]);
    Object.assign(this.state.board[fromPositionIndexes[0]][fromPositionIndexes[1]], { piece: null, color: null, moved: undefined });

    if (this.state.board[toPositionIndexes[0]][toPositionIndexes[1]].piece === "king") {
      if (fromPositionIndexes[1] - toPositionIndexes[1] === 2) {
        replacePieceValues(this.state.board[fromPositionIndexes[0]][toPositionIndexes[1] + 1], this.state.board[fromPositionIndexes[0]][0], ["piece", "color", "moved"]);
        Object.assign(this.state.board[fromPositionIndexes[0]][0], { piece: null, color: null, moved: undefined });
      }
      else if (toPositionIndexes[1] - fromPositionIndexes[1] === 2) {
        replacePieceValues(this.state.board[fromPositionIndexes[0]][toPositionIndexes[1] - 1], this.state.board[fromPositionIndexes[0]][7], ["piece", "color", "moved"]);
        Object.assign(this.state.board[fromPositionIndexes[0]][7], { piece: null, color: null, moved: undefined });
      }
    }

    if (toPositionIndexes[0] === 7 && this.state.board[toPositionIndexes[0]][toPositionIndexes[1]].piece === "pawn") {
      this.state.board[toPositionIndexes[0]][toPositionIndexes[1]].piece = "queen";
    }

    // Checks if move puts other king in check
    const flippedBoard = flipBoard(this.state.board);
    const kingPosition = isKingInCheck(flippedBoard);
    console.log(kingPosition);
    if (kingPosition) {
      this.state.board[7 - kingPosition.row][7 - kingPosition.col].check = true;
      this.setCheck(this.state.board[kingPosition.row][kingPosition.col].color);
    }
    // Checks if king is currently in check and move removes king from check
    else if (this.state.check) {
      this.state.board.map(row => row.map(item => item.check = false));
      this.setCheck(null);
    }

    const result = checkForCheckmate(this.state.board, this.state.turn);
    if (result !== GameType.Continue) {
      this.setWinner(this.state.turn === "white" ? "black" : "white", result);
    }

    this.setBoard(this.state.board);

    this.setComputerMoving(false);
  }

  setCheck(color: PieceColor) {
    this.setState({
      check: color
    });
  }

  setWinner(winner: PieceColor, gameType: GameType) {
    if (gameType === GameType.Checkmate) {
      this.setState({
        winner: winner
      });
    } else if (gameType === GameType.Stalemate) {
      this.setState({
        stalemate: true
      });
    }
  }

  constructBoard(boardTemplate: Board) {
    const board: JSX.Element[] = [];

    boardTemplate.forEach((row, a) => {
      const newRow = row.map((item, b) => {
        if (a % 2 === 0) {
          return <ChessSquare key={`${a}${b}`} row={a} col={b} color={b % 2 === 0 ? "white" : "black"} stats={item} check={this.state.check} turn={this.state.turn}
            pvc={this.props.pvc} board={this.state.board} winner={this.state.winner} stalemate={this.state.stalemate} setComputerMoving={this.setComputerMoving}
            computerMoving={this.state.computerMoving} flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner}
            computerMove={this.computerMove} incrementMoveNum={this.incrementMoveNum} moveNum={this.state.moveNum} />;
        }
        else {
          return <ChessSquare key={`${a}${b}`} row={a} col={b} color={b % 2 === 0 ? "black" : "white"} stats={item} check={this.state.check} turn={this.state.turn}
            pvc={this.props.pvc} board={this.state.board} winner={this.state.winner} stalemate={this.state.stalemate} setComputerMoving={this.setComputerMoving}
            computerMoving={this.state.computerMoving} flipBoard={this.flipBoard} setBoard={this.setBoard} setTurn={this.setTurn} setCheck={this.setCheck} setWinner={this.setWinner}
            computerMove={this.computerMove} incrementMoveNum={this.incrementMoveNum} moveNum={this.state.moveNum} />;
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
            this.state.stalemate
              ? `Stalemate! Nobody wins.`
              : this.state.winner
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