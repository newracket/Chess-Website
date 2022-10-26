export type PieceColor = "white" | "black" | null;
export const PieceTypeValues = ["pawn", "knight", "bishop", "rook", "queen", "king", null] as const;
export type PieceType = typeof PieceTypeValues[number];
export type PieceStats = {
  color: PieceColor;
  piece: PieceType;
  selected: boolean;
  movable: boolean;
  check: boolean;
  moved: number | undefined;
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
  computerMoving: boolean;
};
