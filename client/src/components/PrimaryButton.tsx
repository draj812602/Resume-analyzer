import React from "react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
}) => (
  <button className="primary-btn" onClick={onClick}>
    {children}
  </button>
);
