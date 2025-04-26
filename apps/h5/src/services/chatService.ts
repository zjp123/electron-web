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

// Mock responses for different types of questions
const mockResponses = [
  "我是AI智能助手，很高兴能帮助您！请问有什么我可以协助您的？",
  "根据您的问题，我建议您可以尝试以下几种方法解决...",
  "这个问题比较复杂，我需要思考一下。从专业角度来看，有以下几点需要考虑...",
  "您好！我可以帮您查询相关信息。根据最新数据显示...",
  "非常感谢您的提问。这是一个很好的问题，让我为您详细解答...",
];

// 图片分析的模拟回复
const imageAnalysisResponses = [
  "我看到了这张图片，这是一张很有意思的照片。",
  "根据图片内容，我可以看到这是一张关于...的图片。",
  "这是一张精美的图片，包含了丰富的视觉元素。",
  "从这张图片中，我观察到了以下几个重要细节：...",
];

// Markdown示例回复
const markdownResponses = [
  `# Markdown 示例
这是一个**加粗文本**和*斜体文本*的例子。

## 代码示例
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
  return true;
}
\`\`\`

## 表格示例
| 姓名 | 年龄 | 城市 |
| ---- | ---- | ---- |
| 张三 | 25 | 北京 |
| 李四 | 30 | 上海 |
| 王五 | 28 | 广州 |

更多信息请查看[Markdown文档](https://www.markdown.com)`,

  `## 数据分析报告
根据您提供的信息，我做了如下分析：

### 主要发现
1. 数据显示**正向趋势**
2. 用户增长率达到*15%*

\`\`\`python
import pandas as pd

def analyze_data(data):
    return data.describe()
\`\`\`

### 详细数据
| 季度 | 收入(万) | 增长率 |
| ---- | ------- | ----- |
| Q1   | 120     | 5%    |
| Q2   | 150     | 25%   |
| Q3   | 180     | 20%   |
| Q4   | 210     | 16.7% |
`,
];

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

  // 发送消息
  async sendMessage(message: string): Promise<Message> {
    // 模拟网络延迟 - 随机1-3秒，让体验更真实
    return new Promise(resolve => {
      setTimeout(
        () => {
          // 随机选择是否返回Markdown格式的回复
          const useMarkdown = Math.random() > 0.5;

          if (useMarkdown) {
            // 使用Markdown回复
            const randomIndex = Math.floor(Math.random() * markdownResponses.length);
            const response = markdownResponses[randomIndex];

            resolve({
              content: response,
              isBot: true,
              type: "text",
            });
          } else {
            // 使用普通回复
            const randomIndex = Math.floor(Math.random() * mockResponses.length);
            const baseResponse = mockResponses[randomIndex];

            resolve({
              content: `${baseResponse} 您提到的"${message}"是一个很有趣的话题，我们可以进一步探讨。`,
              isBot: true,
              type: "text",
            });
          }
        },
        1000 + Math.random() * 2000
      );
    });
  }

  // 发送图片
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendImage(imageFile: File): Promise<Message> {
    // 这里应该是上传图片的逻辑，返回图片URL
    // 这里只是模拟
    return new Promise(resolve => {
      setTimeout(
        () => {
          // 从图片分析回复中随机获取一个
          const randomIndex = Math.floor(Math.random() * imageAnalysisResponses.length);
          const response = imageAnalysisResponses[randomIndex];

          resolve({
            content: response,
            isBot: true,
            type: "text",
          });
        },
        2000 + Math.random() * 1000
      );
    });
  }
}

export default new ChatService();
