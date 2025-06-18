import OpenAI from "openai";

// Define message types
export interface Message {
  content: string;
  isBot: boolean;
  type?: "text" | "image";
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_QIANWEN_ACCESS_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dangerouslyAllowBrowser: true,
});

// In a real app, this would connect to a backend service
class ChatService {
  // 会话存储
  private conversations: Record<string, Conversation> = {};

  // 获取所有会话
  async getConversations(): Promise<Conversation[]> {
    // 在实际应用中，这里会从服务器或本地存储中获取
    return Object.values(this.conversations);
  }

  // 创建新会话
  async createConversation(id: string, title: string = "新对话"): Promise<Conversation> {
    const newConversation = {
      id,
      title,
      messages: [],
    };

    this.conversations[id] = newConversation;
    return newConversation;
  }

  // 删除会话
  async deleteConversation(id: string): Promise<boolean> {
    if (this.conversations[id]) {
      delete this.conversations[id];
      return true;
    }
    return false;
  }

  // 发送消息（流式输出）
  async sendMessage(message: string, onChunk?: (chunk: string) => void): Promise<Message> {
    try {
      const stream = await openai.chat.completions.create({
        model: "qwen-vl-max",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: true,
      });

      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          // 调用回调函数实现打字机效果
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return {
        content: fullContent || "抱歉，我无法理解您的问题，请重新描述。",
        isBot: true,
        type: "text",
      };
    } catch (error) {
      console.error("OpenAI API调用失败:", error);
      return {
        content: "抱歉，服务暂时不可用，请稍后再试。",
        isBot: true,
        type: "text",
      };
    }
  }

  // 发送图片
  async sendImage(
    imageFile: File,
    prompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<Message> {
    try {
      // 将图片转换为base64
      const base64Image = await this.fileToBase64(imageFile);

      // 如果没有提供prompt，使用默认的分析要求
      const analysisPrompt = prompt || "请分析这张图片的内容";

      const stream = await openai.chat.completions.create({
        model: "qwen-vl-max", // 确保模型支持图片输入
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return {
        content: fullContent || "抱歉，我无法分析这张图片。",
        isBot: true,
        type: "text",
      };
    } catch (error) {
      console.error("图片分析失败:", error);
      return {
        content: "抱歉，图片分析服务暂时不可用，请稍后再试。",
        isBot: true,
        type: "text",
      };
    }
  }

  // 将文件转换为base64格式
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default new ChatService();
