import React from "react";
import Base from "./Base";
import ChessBoard from "./ChessBoard";

export default class PlayerVsPlayer extends React.Component {
  render() {
    return (
      <Base in={true}>
        <div className="container">
          <ChessBoard pvc={false}/>
        </div>
      </Base>
    );
  }
}