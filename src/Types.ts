export type PieceColor = "white" | "black" | null;
export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | null;
export type Board = {
  color: PieceColor;
  piece: PieceType;
  selected: boolean;
  movable: boolean;
  check: boolean;
}[][];