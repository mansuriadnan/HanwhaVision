import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={loaderOverlayStyle}>
      <div style={loaderWrapperStyle}>
        <img src="/images/loaderspinner.gif" alt="loader icon" height={80} width={80} />
      </div>
    </div>
  );
};

const loaderOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(0.3px)", // <-- This creates the blur effect
  backgroundColor: "rgba(255, 255, 255, 0.3)", // optional, soft light tint
  zIndex: 9999,
};

const loaderWrapperStyle: React.CSSProperties = {
  transform: "translate(-50%, -50%)",
  position: "absolute",
  top: "50%",
  left: "50%",
};
