import React from "react";

interface ChatWelcomeProps {
  onExampleClick?: (message: string) => void;
}

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onExampleClick }) => {
  // 示例问题
  const examples = ["今天天气怎么样？", "给我讲个笑话", "帮我写一封邮件", "解释一下量子力学"];

  const handleExampleClick = (example: string) => {
    if (onExampleClick) {
      onExampleClick(example);
    }
  };

  return (
    <div className="chat-welcome">
      <div className="chat-welcome-icon">
        <img
          src="https://www.electronjs.org/zh/assets/img/logo.svg"
          alt="AI Assistant Logo"
          style={{ borderRadius: "50%", width: "60px", height: "60px" }}
        />
      </div>
      <h2 className="chat-welcome-title">欢迎使用智能助手</h2>
      <p className="chat-welcome-subtitle">我可以帮你搜索、答疑、写作，请把你的任务交给我吧～</p>

      <div style={{ marginTop: "24px", width: "100%", maxWidth: "500px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
          你可以尝试这些问题：
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {examples.map((example, index) => (
            <div
              key={index}
              onClick={() => handleExampleClick(example)}
              style={{
                padding: "12px 16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = "#eaeaea";
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
            >
              {example}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome;
