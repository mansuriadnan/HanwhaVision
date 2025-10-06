// src/components/LoadingSpinner.tsx
import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={loaderStyle}>
      <div style={spinnerStyle}></div>
      <p>Loading...</p>
    </div>
  );
};

const loaderStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  zIndex: 9999,
};

const spinnerStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  border: "5px solid rgba(255, 255, 255, 0.3)",
  borderTop: "5px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
