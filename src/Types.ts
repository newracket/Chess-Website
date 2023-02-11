export type PieceColor = "white" | "black" | null;
export const PieceTypeValues = [
  "pawn",
  "knight",
  "bishop",
  "rook",
  "queen",
  "king",
  null,
] as const;
export type PieceType = typeof PieceTypeValues[number];
export type RowNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type ColLetter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type PieceStats = {
  color: PieceColor;
  piece: PieceType;
  selected: boolean;
  movable: boolean;
  check: boolean;
  moved: number | undefined;
  rowNum: RowNum;
  colLetter: ColLetter;
  mouseover: boolean;
  lastMoved: boolean;
};
export type Board = PieceStats[][];

export enum GameType {
  Checkmate,
  Stalemate,
  Continue,
}

export type StateFunctions = {
  setBoard: Function;
  setTurn: Function;
  setCheck: Function;
  setWinner: Function;
  setComputerMoving: Function;
  incrementMoveNum: Function;
  flipBoard: Function;
  mouseOverSquare: Function;
};
export type SquareStats = {
  row: number;
  col: number;
  squareColor: "white" | "black";
};
export type GameStats = {
  turn: PieceColor;
  pvc: boolean;
  board: Board;
  winner: PieceColor;
  stalemate: boolean;
  moveNum: number;
  moves: string[][];
  computerMoving: boolean;
};
export type SpecialMoves = {
  castle: boolean;
  enPassant: boolean;
  promotion: boolean;
  capture: boolean;
  check: boolean;
  checkmate: boolean;
};
