import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Toast } from "antd-mobile";
import { SendOutline, PictureOutline, AudioOutline } from "antd-mobile-icons";
import ImageEditor from "../ImageEditor";
import "react-image-crop/dist/ReactCrop.css";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (image: File, prompt?: string) => void;
}

// 使用接口定义Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// interface SpeechRecognitionOptions {
//   continuous?: boolean;
//   interimResults?: boolean;
//   lang?: string;
// }

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

// 全局声明窗口属性
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendImage }) => {
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [editedImageFile, setEditedImageFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // 初始化语音识别
  useEffect(() => {
    // 兼容不同浏览器的语音识别API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "zh-CN"; // 设置中文

      // 处理识别结果
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        // 获取最新的识别结果
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        setInput(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error("语音识别错误:", event.error);
        setIsRecording(false);
        Toast.show({
          content: "语音识别失败，请重试",
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = () => {
    if (editedImageFile) {
      if (onSendImage) {
        onSendImage(editedImageFile, input || undefined); // 使用 input 作为 prompt
        setEditedImageFile(null);
        setPreviewImageSrc(null);
        setInput("");
      }
    } else {
      if (!input.trim()) return;
      onSendMessage(input);
      setInput("");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      Toast.show({
        content: "当前浏览器不支持语音识别",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
      Toast.show({
        content: "开始录音，请说话...",
        duration: 1000,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      Toast.show({
        content: "请选择图片文件",
      });
      return;
    }

    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      Toast.show({
        content: "图片大小不能超过10MB",
      });
      return;
    }

    // 设置选中的图片并显示图片编辑器
    setSelectedImage(file);
    setShowImageEditor(true);

    // 清空文件输入，以便可以重新选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理图片编辑取消
  const handleCancelEdit = () => {
    setShowImageEditor(false);
    setSelectedImage(null);
  };

  // Helper function to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 处理图片编辑完成
  const handleConfirmEdit = async (editedImage: File) => {
    setShowImageEditor(false);
    setSelectedImage(null);
    setEditedImageFile(editedImage);
    try {
      const base64Image = await fileToBase64(editedImage);
      setPreviewImageSrc(base64Image);
      // 图片编辑完成后，允许用户在输入框输入针对该图片的文本
      // setInput(""); // 清空或不清空输入框，根据产品需求决定
    } catch (error) {
      console.error("Error converting file to base64:", error);
      Toast.show({
        content: "图片预览失败",
      });
    }
  };

  return (
    <div className="message-input-container">
      {showImageEditor && selectedImage && (
        <ImageEditor
          imageFile={selectedImage}
          onCancel={handleCancelEdit}
          onConfirm={handleConfirmEdit}
        />
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      {previewImageSrc && (
        <div
          style={{
            position: "relative",
            marginRight: "8px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={previewImageSrc}
            alt="Preview"
            style={{ width: "36px", height: "36px", borderRadius: "4px", objectFit: "cover" }}
          />
          <Button
            size="mini"
            color="danger"
            fill="outline"
            onClick={() => {
              setPreviewImageSrc(null);
              setEditedImageFile(null);
              setInput(""); // 清除预览时也清空输入框内容
            }}
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              padding: "0",
              fontSize: "10px",
              lineHeight: "16px",
              minWidth: "18px",
              border: "none",
              background: "rgba(0,0,0,0.5)",
              color: "white",
            }}
          >
            X
          </Button>
        </div>
      )}
      <Button
        onClick={handleImageClick}
        style={{
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          color: "#666",
          marginRight: "8px",
        }}
      >
        <PictureOutline />
      </Button>
      <Button
        onClick={handleVoiceClick}
        style={{
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isRecording ? "#ff4d4f" : "#f0f0f0",
          color: isRecording ? "#fff" : "#666",
          marginRight: "8px",
          transition: "all 0.3s",
        }}
      >
        <AudioOutline />
      </Button>
      <Input
        placeholder="给 AI 发送消息..."
        value={input}
        onChange={(val: string) => setInput(val)}
        onEnterPress={handleSend}
        style={{
          flex: 1,
          borderRadius: "20px",
          backgroundColor: "#f5f5f5",
          padding: "8px 16px",
          height: "40px",
        }}
      />
      <Button
        onClick={handleSend}
        style={{
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#4e6ef2",
          color: "#fff",
          marginLeft: "8px",
        }}
      >
        <SendOutline />
      </Button>
    </div>
  );
};

export default MessageInput;
