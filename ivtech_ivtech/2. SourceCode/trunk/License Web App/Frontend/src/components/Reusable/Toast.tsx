// Toast.tsx
import React from "react";
import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "info" | "success" | "warning" | "error" | "default";

const showToast = (
  message: string,
  type: ToastType = "default",
  options?: ToastOptions
) => {
  switch (type) {
    case "info":
      toast.info(message, options);
      break;
    case "success":
      toast.success(message, options);
      break;
    case "warning":
      toast.warn(message, options);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message, options);
      break;
  }
};

const Toast: React.FC = () => {
  return (
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover={true}
      toastClassName="custom-toast"
    />
  );
};

export { showToast, Toast };
