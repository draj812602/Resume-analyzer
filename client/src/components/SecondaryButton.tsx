import React from "react";

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
}) => (
  <button className="secondary-btn" onClick={onClick}>
    {children}
  </button>
);
