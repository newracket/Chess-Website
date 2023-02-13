import {
  Board,
  GameType,
  PieceColor,
  PieceStats,
  PieceType,
  SpecialMoves,
} from "./Types";

interface RowCol {
  row: number;
  col: number;
}

export function findMoves(
  board: Board,
  piece: PieceType,
  color: PieceColor,
  row: number,
  col: number,
  moveNum?: number
): RowCol[] {
  // All valid moves for selected piece
  const moves: RowCol[] = [];

  // All tiles with possible moves for knight
  // Separate array for each movement path (diaganol towards top left, straight up, etc)
  // [Row adjustment, Column adjustment]
  const tilesWithPossibleMoves: number[][][] = [];

  if (piece === "pawn") {
    // Pawn normal move
    if (!board[row - 1][col].piece) {
      addPossibility(board, moves, color, { row: row - 1, col });
    }

    // Pawn first move
    if (row === 6 && !board[row - 2][col].piece && !board[row - 1][col].piece) {
      addPossibility(board, moves, color, { row: row - 2, col });
    }

    // Capture diaganol left
    if (row - 1 >= 0 && col - 1 >= 0 && board[row - 1][col - 1].piece) {
      addPossibility(board, moves, color, { row: row - 1, col: col - 1 });
    }

    // Capture diagnol right
    if (row - 1 >= 0 && col + 1 <= 7 && board[row - 1][col + 1].piece) {
      addPossibility(board, moves, color, { row: row - 1, col: col + 1 });
    }

    if (moveNum !== undefined) {
      [-1, 1].forEach((relativePosition) => {
        const enPassantPawn = board[row][col + relativePosition];
        if (
          enPassantPawn !== undefined &&
          enPassantPawn.piece === "pawn" &&
          enPassantPawn.moved === moveNum &&
          enPassantPawn.color !== color
        ) {
          addPossibility(board, moves, color, {
            row: row - 1,
            col: col + relativePosition,
          });
        }
      });
    }
  }

  if (piece === "knight") {
    // Adds all possible knight moves
    tilesWithPossibleMoves.push(
      ...[
        [[-2, -1]],
        [[-2, +1]],
        [[+2, -1]],
        [[+2, +1]],
        [[-1, -2]],
        [[-1, +2]],
        [[+1, -2]],
        [[+1, +2]],
      ]
    );
  }

  if (piece === "bishop" || piece === "queen") {
    // Adds all possible diagnol paths
    tilesWithPossibleMoves.push(
      ...[
        [...Array(8).keys()].map((e) => [e, e]),
        [...Array(8).keys()].map((e) => [-e, e]),
        [...Array(8).keys()].map((e) => [e, -e]),
        [...Array(8).keys()].map((e) => [-e, -e]),
      ]
    );
  }

  if (piece === "rook" || piece === "queen") {
    // Adds all possible straight paths
    tilesWithPossibleMoves.push(
      ...[
        [...Array(8).keys()].map((e) => [0, e]),
        [...Array(8).keys()].map((e) => [0, -e]),
        [...Array(8).keys()].map((e) => [e, 0]),
        [...Array(8).keys()].map((e) => [-e, 0]),
      ]
    );
  }

  if (piece === "king") {
    // Adds all possible king moves
    tilesWithPossibleMoves.push(
      ...[
        [[-1, -1]],
        [[-1, 0]],
        [[-1, +1]],
        [[0, -1]],
        [[0, +1]],
        [[+1, -1]],
        [[+1, 0]],
        [[+1, +1]],
      ]
    );

    if (color === "white" && row === 7 && col === 4 && !board[row][col].moved) {
      if (
        isSquareOpenToCastle(board, "white", row, col + 1) &&
        isSquareOpenToCastle(board, "white", row, col + 2) &&
        board[row][col + 3].piece === "rook" &&
        !board[row][col + 3].moved
      ) {
        tilesWithPossibleMoves.push([[0, +2]]);
      }

      if (
        isSquareOpenToCastle(board, "white", row, col - 1) &&
        isSquareOpenToCastle(board, "white", row, col - 2) &&
        isSquareOpenToCastle(board, "white", row, col - 3) &&
        board[row][col - 4].piece === "rook" &&
        !board[row][col - 4].moved
      ) {
        tilesWithPossibleMoves.push([[0, -2]]);
      }
    } else if (
      color === "black" &&
      row === 7 &&
      col === 3 &&
      !board[row][col].moved
    ) {
      if (
        isSquareOpenToCastle(board, "black", row, col - 1) &&
        isSquareOpenToCastle(board, "black", row, col - 2) &&
        board[row][col - 3].piece === "rook" &&
        !board[row][col - 3].moved
      ) {
        tilesWithPossibleMoves.push([[0, -2]]);
      }

      if (
        isSquareOpenToCastle(board, "black", row, col + 1) &&
        isSquareOpenToCastle(board, "black", row, col + 2) &&
        isSquareOpenToCastle(board, "black", row, col + 3) &&
        board[row][col + 4].piece === "rook" &&
        !board[row][col + 4].moved
      ) {
        tilesWithPossibleMoves.push([[0, +2]]);
      }
    }
  }

  // Loops through each movement path (diaganol towards top left, straight up, etc)
  tilesWithPossibleMoves.forEach((movementPath) => {
    // Loops through each tile in the movement path
    for (const [rowAdjustment, colAdjustment] of movementPath) {
      // Skips tile if current piece
      if (rowAdjustment === 0 && colAdjustment === 0) continue;

      // Exits movement path if tile out of board
      const newRow = row + rowAdjustment;
      const newCol = col + colAdjustment;
      if (newRow < 0 || newRow > 7) return;
      if (newCol < 0 || newCol > 7) return;

      // Adds possible tile and exits movement path if piece on tile
      addPossibility(board, moves, color, {
        row: row + rowAdjustment,
        col: col + colAdjustment,
      });
      if (board[newRow][newCol].piece) return;
    }
  });

  return moves;
}

export function isSquareOpenToCastle(
  board: Board,
  color: PieceColor,
  row: number,
  col: number
): boolean {
  if (board[row][col].piece) return true;

  const newBoard: Board = JSON.parse(JSON.stringify(board));
  newBoard[row][col].piece = "king";
  newBoard[row][col].color = color;

  const kingPosition = isKingInCheck(newBoard);
  return !kingPosition;
}

export function isKingInCheck(board: Board): RowCol | false {
  let kingPosition: RowCol | undefined;

  // Loops through each tile on the board
  board.forEach((row, a) => {
    row.forEach((square, b) => {
      // Exits if tile doesn't contain a piece
      if (!square.piece) return;

      findMoves(board, square.piece, square.color, a, b).forEach(
        (move: RowCol) => {
          // Checks if any possible move captures the king
          if (board[move.row][move.col].piece === "king") {
            kingPosition = move;
          }
        }
      );
    });
  });

  return kingPosition !== undefined ? kingPosition : false;
}

export function checkForCheckmate(board: Board, color: PieceColor): GameType {
  for (const [rowNum, row] of board.entries()) {
    for (const [colNum, square] of row.entries()) {
      if (square.piece && square.color === color) {
        for (const possibleMove of findMoves(
          board,
          square.piece,
          square.color,
          rowNum,
          colNum
        )) {
          const testBoard: Board = JSON.parse(JSON.stringify(board));

          testBoard[possibleMove.row][possibleMove.col].piece = square.piece;
          testBoard[possibleMove.row][possibleMove.col].color = square.color;

          testBoard[rowNum][colNum].piece = null;
          testBoard[rowNum][colNum].color = null;

          if (!isKingInCheck(flipBoard(testBoard))) {
            return GameType.Continue;
          }
        }
      }
    }
  }

  const kingPosition = isKingInCheck(flipBoard(board));
  if (kingPosition === false) {
    return GameType.Stalemate;
  }

  return GameType.Checkmate;
}

export function addPossibility(
  board: Board,
  array: RowCol[],
  color: PieceColor,
  rowCol: RowCol
): void {
  if (
    !board[rowCol.row][rowCol.col].piece ||
    board[rowCol.row][rowCol.col].color !== color
  ) {
    array.push(rowCol);
  }
}

export function replacePieceValues(
  newPiece: PieceStats,
  oldPiece: PieceStats,
  keysToReplace: (keyof PieceStats)[]
) {
  keysToReplace.forEach((k) => ((newPiece[k] as any) = oldPiece[k]));
}

export function flipBoard(board: Board): Board {
  const testBoard: Board = structuredClone(board);
  return testBoard.map((row) => row.reverse()).reverse();
}

export function deselectAll(board: Board) {
  board.forEach((row) =>
    row.forEach((item) => {
      item.selected = false;
      item.movable = false;
    })
  );
}

// Check should have + at end of notation
export function getNotation(
  board: Board,
  startPiece: PieceStats,
  endPiece: PieceStats,
  specialMoves: SpecialMoves
) {
  if (endPiece.piece === null) return "";
  let notation;

  // Determines notation letter for piece (knight is an edge case)
  let pieceLetter = endPiece.piece.charAt(0).toUpperCase();
  if (endPiece.piece === "knight") {
    pieceLetter = "N";
  }

  /* Pawn Notation */
  if (endPiece.piece === "pawn" || specialMoves.promotion) {
    // Pawn moves in same row
    if (startPiece.colLetter === endPiece.colLetter) {
      // Normal pawn move
      notation = `${endPiece.colLetter}${endPiece.rowNum}`;
    } else {
      // Pawn captures diagonally
      notation = `${startPiece.colLetter}x${endPiece.colLetter}${endPiece.rowNum}`;
    }

    // Note: startPiece.piece is the piece to promote to
    if (specialMoves.promotion) {
      notation += `=${pieceLetter}`;
    }
  } else if (specialMoves.capture) {
    // If startPiece is capturing endPiece
    notation = `${pieceLetter}x${endPiece.colLetter}${endPiece.rowNum}`;
  } else {
    // Normal move for any piece except pawns
    notation = `${pieceLetter}${endPiece.colLetter}${endPiece.rowNum}`;
  }

  if (specialMoves.checkmate) {
    notation += "#";
  } else if (specialMoves.check) {
    notation += "+";
  }

  return notation;
}
