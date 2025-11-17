// CameraViewer.tsx
import React, { useState, useEffect, useRef } from "react";
import "./CameraViewer.css";

interface CameraViewerProps {
  apiBaseUrl?: string;
  channel?: number;
}

const CameraViewer: React.FC<CameraViewerProps> = ({
  apiBaseUrl = "https://localhost:7240/api",
  channel = 0,
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [streamType, setStreamType] = useState<"live" | "snapshot">("live");
  const [fps, setFps] = useState(10); // Frames per second for live stream
  const [frameCount, setFrameCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const frameUrl = `${apiBaseUrl}/camerastream/frame?channel=${channel}`;
  const snapshotUrl = `${apiBaseUrl}/camerastream/snapshotcloudy?channel=${channel}`;

  console.log(" frameUrl ", frameUrl);

  // Cleanup function for URLs
  const cleanupImageUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const fetchFrame = async () => {
    if (!isStreaming || streamType !== "live") return;

    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const timestamp = new Date().getTime();
      console.log("frameUrl = ", frameUrl);

      const response = await fetch(`${frameUrl}&t=${timestamp}`, {
        signal: abortControllerRef.current.signal,
        cache: "no-cache",
      });

      if (response.ok && imgRef.current) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Clean up previous image URL
        const previousSrc = imgRef.current.src;
        if (previousSrc && previousSrc.startsWith("blob:")) {
          URL.revokeObjectURL(previousSrc);
        }

        imgRef.current.src = imageUrl;
        setFrameCount((prev) => prev + 1);
        setError(null);
      } else if (!response.ok) {
        setError(
          `Failed to fetch frame: ${response.status} ${response.statusText}`
        );
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(`Network error while fetching frame: ${err.message}`);
      }
    }
  };

  const startLiveStream = () => {
    setError(null);
    setIsStreaming(true);
    setStreamType("live");
    setFrameCount(0);

    // Stop any existing intervals
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    // Start fetching frames at specified FPS
    const intervalMs = 1000 / fps;
    streamIntervalRef.current = setInterval(fetchFrame, intervalMs);

    // Fetch first frame immediately
    fetchFrame();
  };

  const stopLiveStream = () => {
    setIsStreaming(false);

    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear interval
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    // Clean up image
    if (imgRef.current && imgRef.current.src) {
      cleanupImageUrl(imgRef.current.src);
      imgRef.current.src = "";
    }
  };

  const startSnapshotMode = () => {
    stopLiveStream();
    setStreamType("snapshot");
    setError(null);

    const fetchSnapshot = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${snapshotUrl}&t=${timestamp}`, {
          cache: "no-cache",
        });
        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);

          // Clean up previous snapshot
          cleanupImageUrl(lastSnapshot);
          setLastSnapshot(imageUrl);
          setError(null);
        } else {
          setError(
            `Failed to fetch snapshot: ${response.status} ${response.statusText}`
          );
        }
      } catch (err: any) {
        setError(`Network error while fetching snapshot: ${err.message}`);
      }
    };

    fetchSnapshot(); // Initial snapshot
    intervalRef.current = setInterval(fetchSnapshot, 2000); // Update every 2 seconds
  };

  const stopSnapshotMode = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    cleanupImageUrl(lastSnapshot);
    setLastSnapshot(null);
  };

  const takeManualSnapshot = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`${snapshotUrl}&t=${timestamp}`, {
        cache: "no-cache",
      });
      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `camera-snapshot-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update display if in snapshot mode
        if (streamType === "snapshot") {
          cleanupImageUrl(lastSnapshot);
          setLastSnapshot(imageUrl);
        } else {
          // Clean up if not displaying
          setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        }

        setError(null);
      } else {
        setError(
          `Failed to take snapshot: ${response.status} ${response.statusText}`
        );
      }
    } catch (err: any) {
      setError(`Network error while taking snapshot: ${err.message}`);
    }
  };

  const changeFPS = (newFps: number) => {
    setFps(newFps);
    if (isStreaming && streamType === "live") {
      // Restart with new FPS
      stopLiveStream();
      setTimeout(() => startLiveStream(), 100);
    }
  };

  useEffect(() => {
    return () => {
      stopLiveStream();
      stopSnapshotMode();
    };
  }, []);

  return (
    <div className="camera-viewer">
      <div className="camera-header">
        <h2>AI Camera Feed - Channel {channel}</h2>

        {streamType === "live" && (
          <div className="fps-control">
            <label htmlFor="fps-slider">FPS: {fps}</label>
            <input
              id="fps-slider"
              type="range"
              min="1"
              max="30"
              value={fps}
              onChange={(e) => changeFPS(parseInt(e.target.value))}
              className="fps-slider"
            />
            <span className="fps-buttons">
              <button
                onClick={() => changeFPS(5)}
                className={`fps-btn ${fps === 5 ? "active" : ""}`}
              >
                5
              </button>
              <button
                onClick={() => changeFPS(10)}
                className={`fps-btn ${fps === 10 ? "active" : ""}`}
              >
                10
              </button>
              <button
                onClick={() => changeFPS(15)}
                className={`fps-btn ${fps === 15 ? "active" : ""}`}
              >
                15
              </button>
              <button
                onClick={() => changeFPS(25)}
                className={`fps-btn ${fps === 25 ? "active" : ""}`}
              >
                25
              </button>
            </span>
          </div>
        )}

        <div className="camera-controls">
          <button
            onClick={startLiveStream}
            disabled={isStreaming && streamType === "live"}
            className="btn btn-primary"
          >
            {isStreaming && streamType === "live"
              ? "Live Streaming..."
              : "Start Live Stream"}
          </button>

          <button
            onClick={stopLiveStream}
            disabled={!isStreaming || streamType !== "live"}
            className="btn btn-secondary"
          >
            Stop Live Stream
          </button>

          <button
            onClick={startSnapshotMode}
            disabled={streamType === "snapshot" && intervalRef.current !== null}
            className="btn btn-info"
          >
            Auto Snapshot Mode
          </button>

          <button
            onClick={stopSnapshotMode}
            disabled={streamType !== "snapshot" || intervalRef.current === null}
            className="btn btn-secondary"
          >
            Stop Auto Snapshot
          </button>

          <button onClick={takeManualSnapshot} className="btn btn-success">
            Take Snapshot
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="camera-display">
        {streamType === "live" ? (
          <div className="live-stream-container">
            <img
              ref={imgRef}
              alt="Live camera feed"
              className="camera-image"
              style={{ display: isStreaming ? "block" : "none" }}
            />
            {!isStreaming && (
              <div className="placeholder">
                <p>Click "Start Live Stream" to view live feed</p>
              </div>
            )}
            {isStreaming && (
              <div className="stream-overlay">
                <span className="live-indicator">● LIVE</span>
                <span className="frame-counter">Frame: {frameCount}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="snapshot-container">
            {lastSnapshot ? (
              <img
                src={lastSnapshot}
                alt="Camera snapshot"
                className="camera-image"
              />
            ) : (
              <div className="placeholder">
                <p>Loading snapshot...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="camera-info">
        <div className="info-item">
          <strong>Mode:</strong>{" "}
          {streamType === "live" ? "Live Stream" : "Snapshot Mode"}
        </div>
        <div className="info-item">
          <strong>Status:</strong>{" "}
          {streamType === "live"
            ? isStreaming
              ? `Streaming @ ${fps} FPS`
              : "Stopped"
            : intervalRef.current
            ? "Auto Updating"
            : "Manual"}
        </div>
        <div className="info-item">
          <strong>Channel:</strong> {channel}
        </div>
        {streamType === "live" && isStreaming && (
          <div className="info-item">
            <strong>Frames:</strong> {frameCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraViewer;
