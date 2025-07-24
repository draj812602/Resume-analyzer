import React from "react";

interface SocialButtonProps {
  provider: "google" | "linkedin";
  label: string;
  variant: "primary" | "secondary";
  type: "signin" | "signup";
  onClick?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  label,
  variant,
  type,
  onClick,
}) => {
  const handleClick = async () => {
    if (provider === "google" && type === "signup") {
      window.open("http://localhost:5173/auth?from=extension", "_blank");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`social-btn ${provider} ${variant}`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};
