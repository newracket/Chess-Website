import { Component } from "react";
import { PieceColor, PieceType } from "../Types";

interface Props {
  pieceType: PieceType;
  pieceColor: PieceColor;
}

export default class ChessPiece extends Component<Props> {
  render() {
    if (this.props.pieceType) {
      return <img className="chessPiece" src={`${this.props.pieceColor}${this.props.pieceType}.png`} alt={`${this.props.pieceColor} ${this.props.pieceType}`} />;
    }
    return <span></span>
  }
}