import React from "react";

interface BotAvatarProps {
  size?: "small" | "medium" | "large";
}

const BotAvatar: React.FC<BotAvatarProps> = ({ size = "medium" }) => {
  // Size mapping
  const sizeMap = {
    small: 36,
    medium: 48,
    large: 80,
  };

  const avatarSize = sizeMap[size];

  return (
    <div
      style={{
        width: avatarSize,
        height: avatarSize,
        borderRadius: "50%",
        backgroundColor: "#4e6ef2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: avatarSize * 0.5,
        overflow: "hidden",
      }}
    >
      <img
        src="https://www.electronjs.org/zh/assets/img/logo.svg"
        alt="Diy Logo"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

export default BotAvatar;
