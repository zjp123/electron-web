import React, { useState, useRef, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import { Button, Slider, Toast, Grid } from "antd-mobile";
import "react-image-crop/dist/ReactCrop.css";
import "./styles.css";

interface ImageEditorProps {
  imageFile: File;
  onCancel: () => void;
  onConfirm: (editedImage: File) => void;
}

// 定义滤镜类型
type FilterType = "none" | "grayscale" | "sepia" | "invert" | "blur" | "brightness" | "contrast";

// 滤镜选项
const filterOptions: { type: FilterType; label: string }[] = [
  { type: "none", label: "原图" },
  { type: "grayscale", label: "灰度" },
  { type: "sepia", label: "复古" },
  { type: "invert", label: "反色" },
  { type: "blur", label: "模糊" },
  { type: "brightness", label: "明亮" },
  { type: "contrast", label: "对比度" },
];

// 获取滤镜CSS样式
const getFilterStyle = (filter: FilterType): string => {
  switch (filter) {
    case "grayscale":
      return "grayscale(100%)";
    case "sepia":
      return "sepia(100%)";
    case "invert":
      return "invert(100%)";
    case "blur":
      return "blur(4px)";
    case "brightness":
      return "brightness(130%)";
    case "contrast":
      return "contrast(150%)";
    default:
      return "none";
  }
};

const ImageEditor: React.FC<ImageEditorProps> = ({ imageFile, onCancel, onConfirm }) => {
  const [crop, setCrop] = useState<Crop>();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("none");
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 加载图片
  useEffect(() => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(imageFile);

    return () => {
      // 清理URL对象
      if (imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageFile]);

  // 图片加载完成后设置初始裁剪区域
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    // 默认裁剪区域为居中的正方形
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1, // 1:1 宽高比
        width,
        height
      ),
      width,
      height
    );

    setCrop(crop);
  };

  // 应用滤镜效果
  const applyFilter = (ctx: CanvasRenderingContext2D, filter: FilterType) => {
    if (filter === "none") return;

    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filter) {
      case "grayscale": {
        // 灰度滤镜
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg; // 红
          data[i + 1] = avg; // 绿
          data[i + 2] = avg; // 蓝
        }
        break;
      }
      case "sepia": {
        // 复古滤镜
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      }
      case "invert": {
        // 反色滤镜
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]; // 红
          data[i + 1] = 255 - data[i + 1]; // 绿
          data[i + 2] = 255 - data[i + 2]; // 蓝
        }
        break;
      }
      case "blur": {
        // 简单模糊效果（这里使用CSS滤镜更高效）
        ctx.filter = "blur(4px)";
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
        return; // 直接返回，不需要putImageData
      }
      case "brightness": {
        // 增加亮度
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        break;
      }
      case "contrast": {
        // 增加对比度
        const factor = (259 * (100 + 50)) / (255 * (259 - 50));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
        }
        break;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // 应用旋转、缩放和滤镜到画布
  const applyTransformToCanvas = () => {
    if (!imgRef.current || !canvasRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸为裁剪区域大小
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    // 应用设备像素比以获得更清晰的输出
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    // 保存当前状态
    ctx.save();

    // 移动到画布中心
    ctx.translate(canvas.width / (2 * pixelRatio), canvas.height / (2 * pixelRatio));

    // 应用旋转
    ctx.rotate((rotation * Math.PI) / 180);

    // 应用缩放
    ctx.scale(scale, scale);

    // 绘制裁剪区域的图像
    ctx.translate(-canvas.width / (2 * pixelRatio), -canvas.height / (2 * pixelRatio));
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // 应用滤镜
    applyFilter(ctx, filter);

    // 恢复状态
    ctx.restore();
  };

  // 确认编辑
  const handleConfirm = () => {
    if (!canvasRef.current || !completedCrop) {
      Toast.show({
        content: "请先裁剪图片",
      });
      return;
    }

    // 应用变换到画布
    applyTransformToCanvas();

    // 将画布转换为Blob
    canvasRef.current.toBlob(blob => {
      if (!blob) {
        Toast.show({
          content: "图片处理失败，请重试",
        });
        return;
      }

      // 创建新的File对象
      const editedFile = new File([blob], imageFile.name, {
        type: imageFile.type,
        lastModified: Date.now(),
      });

      // 调用回调函数
      onConfirm(editedFile);
    }, imageFile.type);
  };

  return (
    <div className="image-editor-container">
      <div className="image-editor-header">
        <h3>编辑图片</h3>
      </div>
      <div className="image-editor-content">
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
            aspect={1}
            className="react-crop-container"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="编辑图片"
              style={{
                transform: `rotate(${rotation}deg) scale(${scale})`,
                maxHeight: "300px",
                maxWidth: "100%",
                filter: getFilterStyle(filter),
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div className="image-editor-controls">
        <div className="control-group">
          <div className="control-label">旋转</div>
          <Slider min={0} max={360} step={1} value={rotation} onChange={setRotation} />
        </div>

        <div className="control-group">
          <div className="control-label">缩放</div>
          <Slider min={0.5} max={2} step={0.1} value={scale} onChange={setScale} />
        </div>

        <div className="control-group">
          <div className="control-label">滤镜</div>
          <div className="filter-options">
            <Grid columns={4} gap={8}>
              {filterOptions.map(option => (
                <Grid.Item key={option.type}>
                  <div
                    className={`filter-option ${filter === option.type ? "filter-option-active" : ""}`}
                    onClick={() => setFilter(option.type)}
                  >
                    {option.label}
                  </div>
                </Grid.Item>
              ))}
            </Grid>
          </div>
        </div>
      </div>

      <div className="image-editor-footer">
        <Button onClick={onCancel}>取消</Button>
        <Button color="primary" onClick={handleConfirm}>
          确认
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;
