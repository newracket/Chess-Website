import React from "react";
import Base from "./Base";
import ChessBoard from "../Elements/ChessBoard";

// @ts-ignore
import * as jsChessEngine from "js-chess-engine";

export default class PlayerVsComputer extends React.Component {
  render() {
    const game = new jsChessEngine.Game();

    return (
      <Base in={false}>
        <div className="container">
          <ChessBoard pvc={true} game={game} />
        </div>
      </Base>
    );
  }
}
