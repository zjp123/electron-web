import React, { ReactNode } from "react";
import BotAvatar from "../BotAvatar";
import MarkdownRenderer from "../MarkdownRenderer";

interface ChatMessageProps {
  content: ReactNode | string;
  isBot: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isBot }) => {
  // 渲染内容，如果是机器人消息且内容是字符串，则用Markdown渲染
  const renderContent = () => {
    // 如果已经是React元素或不是机器人消息，直接渲染
    if (typeof content !== "string" || !isBot) {
      return content;
    }

    // 如果是机器人消息且内容是字符串，使用Markdown渲染
    return <MarkdownRenderer content={content} />;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isBot ? "row" : "row-reverse",
        alignItems: "flex-start",
        marginBottom: "16px",
        gap: "8px",
      }}
    >
      {isBot && (
        <div style={{ marginTop: "4px" }}>
          <BotAvatar size="small" />
        </div>
      )}
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: isBot ? "0 16px 16px 16px" : "16px 0 16px 16px",
          backgroundColor: isBot ? "#f5f5f5" : "#4e6ef2",
          color: isBot ? "#333" : "#fff",
          wordBreak: "break-word",
        }}
      >
        {renderContent()}
      </div>
      {!isBot && (
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#6bda94",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
            marginTop: "4px",
          }}
        >
          我
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
