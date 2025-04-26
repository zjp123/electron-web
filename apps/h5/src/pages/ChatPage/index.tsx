import React, { useState, useRef, useEffect } from "react";
import { NavBar, Dialog, Popup, Image } from "antd-mobile";
import { UnorderedListOutline, AddCircleOutline } from "antd-mobile-icons";
import "../../App.css";

import ChatWelcome from "../../components/ChatWelcome";
import ChatMessage from "../../components/ChatMessage";
import MessageInput from "../../components/MessageInput";
import ConversationList from "../../components/ConversationList";
import chatService, { Message, Conversation } from "../../services/chatService";

// 本地存储键
const STORAGE_KEY = "ai_chat_conversations";

const ChatPage: React.FC = () => {
  // 当前选中的对话ID
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  // 所有对话列表
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 从本地存储加载会话
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY);
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        } else {
          createNewConversation();
        }
      } catch (e) {
        console.error("加载会话失败", e);
        createNewConversation();
      }
    } else {
      createNewConversation();
    }
  }, []);

  // 保存会话到本地存储
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // 创建新对话
  const createNewConversation = () => {
    const newId = generateUniqueId();
    const newConversation: Conversation = {
      id: newId,
      title: "新对话",
      messages: [],
    };

    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newId);
  };

  // 生成唯一ID
  const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // 获取当前对话
  const getCurrentConversation = (): Conversation | undefined => {
    return conversations.find(conv => conv.id === activeConversationId);
  };

  // 更新当前对话的消息
  const updateCurrentConversationMessages = (messages: Message[]) => {
    setConversations(
      conversations.map(conv =>
        conv.id === activeConversationId
          ? { ...conv, messages, title: getConversationTitle(messages) }
          : conv
      )
    );
  };

  // 删除对话
  const handleDeleteConversation = (id: string) => {
    Dialog.confirm({
      content: "确定要删除此对话吗？",
      onConfirm: () => {
        const newConversations = conversations.filter(conv => conv.id !== id);
        setConversations(newConversations);

        // 如果删除的是当前对话，则切换到第一个对话，如果没有对话了，则创建新对话
        if (id === activeConversationId) {
          if (newConversations.length > 0) {
            setActiveConversationId(newConversations[0].id);
          } else {
            createNewConversation();
          }
        }
      },
    });
  };

  // 选择对话
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowConversationList(false);
  };

  // 根据消息生成对话标题
  const getConversationTitle = (messages: Message[]): string => {
    const userMessage = messages.find(msg => !msg.isBot);
    if (userMessage && userMessage.content) {
      // 取用户第一条消息的前10个字符作为标题
      const title = userMessage.content.substring(0, 10);
      return title.length < userMessage.content.length ? `${title}...` : title;
    }
    return "新对话";
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConversationId]);

  const handleSendMessage = async (message: string) => {
    const currentConversation = getCurrentConversation();
    if (!currentConversation) return;

    // 添加用户消息
    const userMessage: Message = {
      content: message,
      isBot: false,
      type: "text",
    };

    const updatedMessages = [...currentConversation.messages, userMessage];
    updateCurrentConversationMessages(updatedMessages);

    // 设置加载状态
    setIsLoading(true);

    try {
      // 调用聊天服务
      const response = await chatService.sendMessage(message);
      const newMessages = [...updatedMessages, response];
      updateCurrentConversationMessages(newMessages);
    } catch (error) {
      console.error("发送消息失败:", error);
      // 添加错误消息
      const errorMessage: Message = {
        content: "抱歉，发生了一些错误，请稍后再试。",
        isBot: true,
        type: "text",
      };
      const errorMessages = [...updatedMessages, errorMessage];
      updateCurrentConversationMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendImage = async (image: File) => {
    const currentConversation = getCurrentConversation();
    if (!currentConversation) return;

    // 创建本地预览URL
    const imageUrl = URL.createObjectURL(image);

    // 添加用户图片消息
    const imageMessage: Message = {
      content: "用户发送了一张图片",
      isBot: false,
      type: "image",
      imageUrl,
    };

    const updatedMessages = [...currentConversation.messages, imageMessage];
    updateCurrentConversationMessages(updatedMessages);

    // 设置加载状态
    setIsLoading(true);

    try {
      // 调用聊天服务发送图片
      const response = await chatService.sendImage(image);
      const newMessages = [...updatedMessages, response];
      updateCurrentConversationMessages(newMessages);
    } catch (error) {
      console.error("处理图片失败:", error);
      // 添加错误消息
      const errorMessage: Message = {
        content: "抱歉，处理图片时发生了错误，请稍后再试。",
        isBot: true,
        type: "text",
      };
      const errorMessages = [...updatedMessages, errorMessage];
      updateCurrentConversationMessages(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConversation = () => {
    // 新对话直接创建，不再弹窗确认
    createNewConversation();
  };

  const currentConversation = getCurrentConversation();
  const messages = currentConversation ? currentConversation.messages : [];

  // 渲染消息内容
  const renderMessageContent = (message: Message) => {
    if (message.type === "image" && message.imageUrl) {
      return (
        <div>
          <p>{message.content}</p>
          <Image
            src={message.imageUrl}
            fit="contain"
            style={{ maxWidth: "250px", maxHeight: "200px", borderRadius: "8px" }}
          />
        </div>
      );
    }
    return message.content;
  };

  return (
    <div className="app">
      <NavBar
        className="app-header"
        left={<UnorderedListOutline onClick={() => setShowConversationList(true)} />}
        right={<AddCircleOutline onClick={handleAddConversation} />}
      >
        {currentConversation?.title || "新对话"}
      </NavBar>

      <div className="app-content">
        {messages.length === 0 ? (
          <ChatWelcome onExampleClick={handleSendMessage} />
        ) : (
          <div className="chat-container">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={renderMessageContent(message)}
                isBot={message.isBot}
              />
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  margin: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "16px",
                    color: "#666",
                  }}
                >
                  正在思考...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} onSendImage={handleSendImage} />

      <Popup
        position="left"
        visible={showConversationList}
        onMaskClick={() => setShowConversationList(false)}
        bodyStyle={{
          width: "80vw",
          height: "100vh",
        }}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </Popup>
    </div>
  );
};

export default ChatPage;
