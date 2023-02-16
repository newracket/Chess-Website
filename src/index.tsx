import React from "react";
import { createRoot } from "react-dom/client";
import StartScreen from "./Pages/StartScreen";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import PlayerVsPlayer from "./Pages/PlayerVsPlayer";
import PlayerVsComputer from "./Pages/PlayerVsComputer";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/pvp" element={<PlayerVsPlayer />} />
        <Route path="/pvc" element={<PlayerVsComputer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
