import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.less";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
