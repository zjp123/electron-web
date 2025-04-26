import React from "react";
import { AddCircleOutline } from "antd-mobile-icons";

interface ToolBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ToolBar: React.FC<ToolBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="toolbar">
      <div
        className={`toolbar-item ${activeTab === "thinking" ? "active" : ""}`}
        onClick={() => onTabChange("thinking")}
      >
        <div className="toolbar-icon">🧠</div>
        <span>深度思考 (R1)</span>
      </div>
      <div
        className={`toolbar-item ${activeTab === "search" ? "active" : ""}`}
        onClick={() => onTabChange("search")}
      >
        <div className="toolbar-icon">🌐</div>
        <span>联网搜索</span>
      </div>
      <div className="toolbar-item">
        <AddCircleOutline style={{ fontSize: "24px" }} />
      </div>
    </div>
  );
};

export default ToolBar;
