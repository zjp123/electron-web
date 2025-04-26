import React from "react";
import { List, SwipeAction } from "antd-mobile";

interface Conversation {
  id: string;
  title: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  return (
    <div className="conversation-list">
      <h2 style={{ padding: "16px 16px 8px", margin: 0, fontSize: "18px" }}>我的对话</h2>

      <List>
        {conversations.map(conversation => (
          <SwipeAction
            key={conversation.id}
            rightActions={[
              {
                key: "delete",
                text: "删除",
                color: "danger",
                onClick: () => onDeleteConversation(conversation.id),
              },
            ]}
          >
            <List.Item
              onClick={() => onSelectConversation(conversation.id)}
              style={{
                backgroundColor: activeId === conversation.id ? "#f0f2ff" : "transparent",
              }}
            >
              {conversation.title}
            </List.Item>
          </SwipeAction>
        ))}
      </List>

      {conversations.length === 0 && (
        <div
          style={{
            padding: "40px 16px",
            textAlign: "center",
            color: "#999",
          }}
        >
          暂无对话记录
        </div>
      )}
    </div>
  );
};

export default ConversationList;
