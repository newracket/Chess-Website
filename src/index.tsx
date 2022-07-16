import React from 'react';
import { createRoot } from "react-dom/client";
import ChessBoard from './chessboard/ChessBoard';
import './index.css';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1 className="title">Chess Game</h1>
        <ChessBoard />
      </div>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);