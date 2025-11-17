import React, { useEffect, useRef, useState, useCallback } from "react";
import { CameraStreamProps } from "../../interfaces/IFloorAndZone";
import { LoadingManager } from "../../utils/LoadingManager";

interface CameraStreamWithOpenProps extends CameraStreamProps {
  isOpen: boolean;
}

const CameraStream: React.FC<CameraStreamWithOpenProps> = ({
  selectedcamera,
  isOpen,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frameRate] = useState(5);
  // Store all active controllers to cancel them all
  const activeControllersRef = useRef<Set<AbortController>>(new Set());

  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  const cancelAllRequests = useCallback(() => {
    // Cancel all active requests
    activeControllersRef.current.forEach((controller) => {
      try {
        controller.abort();
      } catch (e) {
        // Ignore errors when aborting
      }
    });

    // Clear the set
    activeControllersRef.current.clear();
  }, []);

  const cleanupResources = useCallback(() => {
    // Cancel ALL pending requests
    cancelAllRequests();

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clean up blob URL
    if (imgRef.current && imgRef.current.src.startsWith("blob:")) {
      URL.revokeObjectURL(imgRef.current.src);
      imgRef.current.src = "";
    }

    setIsStreaming(false);
    //setIsLoading(false);
    LoadingManager.hideLoading();
    setError(null);
  }, []);

  const fetchFrame = useCallback(async () => {
    if (!isOpen || !selectedcamera?.ipAddress) return;

    try {
      // Add to active controllers set
      const controller = new AbortController();
      activeControllersRef.current.add(controller);

      const timestamp = new Date().getTime();
      const response = await fetch(
        `${API_BASE_URL}camerastream/snapshot?ipAddress=${
          selectedcamera.ipAddress
        }&channel=${selectedcamera.channel || 0}&_=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorMessageRes = await response.text();
        throw new Error(errorMessageRes);
      }

      const blob = await response.blob();

      // Check if still open after async operation
      if (!isOpen) {
        URL.revokeObjectURL(URL.createObjectURL(blob));
        return;
      }

      const imageUrl = URL.createObjectURL(blob);

      if (imgRef.current) {
        // Clean up previous blob URL
        setIsLoading(false);
        LoadingManager.hideLoading();
        if (imgRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(imgRef.current.src);
        }
        imgRef.current.src = imageUrl;
        setError(null);

        // Hide loader once first frame loads successfully
        if (isLoading) {
          setIsLoading(false);
          LoadingManager.hideLoading();
        }
      }

      // Remove controller from active set when request completes
      activeControllersRef.current.delete(controller);
    } catch (err) {
      const controller = new AbortController();
      // Remove controller from active set on error
      activeControllersRef.current.delete(controller);

      // Ignore abort errors (expected when closing modal)
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      if (!isOpen) return;

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`${errorMessage}`);
      setIsLoading(false); // Hide loader on error
      LoadingManager.hideLoading();
    }
  }, [
    isOpen,
    selectedcamera?.ipAddress,
    selectedcamera?.channel,
    API_BASE_URL,
    isLoading,
  ]);

  // Single useEffect to handle all modal open/close logic
  useEffect(() => {
    // ALWAYS cancel all existing requests first, regardless of isOpen state
    cancelAllRequests();

    if (isOpen && selectedcamera?.ipAddress) {
      // Clean up any existing resources
      cleanupResources();

      // Reset state
      setError(null);
      setIsStreaming(true);
      setIsLoading(true); // Show loader when starting stream
      LoadingManager.showLoading();

      fetchFrame(); // Get first frame immediately

      const intervalMs = 1000 / frameRate;
      intervalRef.current = setInterval(fetchFrame, intervalMs);
    } else {
      cleanupResources();
    }

    // Cleanup function for when dependencies change or component unmounts
    return () => {
      cancelAllRequests();
      if (!isOpen) {
        cleanupResources();
      }
    };
  }, [isOpen, selectedcamera?.ipAddress, selectedcamera?.channel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllRequests();
      cleanupResources();
    };
  }, [cleanupResources, cancelAllRequests]);

  return (
    <div style={{ textAlign: "center" }}>
      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "10px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {!isLoading ? (
          <img
            ref={imgRef}
            alt="Camera Live Feed"
            style={{
              width: "100%",
              minHeight: "300px",
              borderRadius: "6px",
              objectFit: "contain",
              backgroundColor: "#e9ecef",
              border: "1px solid #dee2e6",
            }}
            onError={() => setError("Failed to load image frame")}
          />
        ) : (
          <img
            alt=""
            ref={imgRef}
            style={{
              width: "100%",
              minHeight: "300px",
              borderRadius: "6px",
              objectFit: "contain",
              backgroundColor: "#e9ecef",
            }}
          />
        )}

        {/* Loading Spinner - Shows immediately when modal opens */}

        {/* No camera selected or not streaming message */}
        {!isStreaming && !error && !isLoading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#6c757d",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            {selectedcamera?.ipAddress ? "Connecting..." : "No camera selected"}
          </div>
        )}
      </div>

      {/* CSS Animation for spinner */}
      {/* <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style> */}
    </div>
  );
};

export { CameraStream };
