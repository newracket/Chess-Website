export type PieceColor = "white" | "black" | null;
export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | null;
export type PieceStats = {
  color: PieceColor;
  piece: PieceType;
  selected: boolean;
  movable: boolean;
  check: boolean;
  moved: number | undefined;
}
export type Board = PieceStats[][];