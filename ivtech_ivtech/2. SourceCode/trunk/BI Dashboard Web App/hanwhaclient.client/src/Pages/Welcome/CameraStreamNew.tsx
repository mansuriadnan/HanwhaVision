import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const CameraStream = () => {
  const imgRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const [streamMethod, setStreamMethod] = useState("img"); // 'img', 'iframe', 'fetch'
  const [streamConfig, setStreamConfig] = useState({
    profile: 1,
    channel: 0,
  });

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    initializeStream();
  }, [streamMethod, streamConfig]);

  const initializeStream = () => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams({
      profile: streamConfig.profile.toString(),
      channel: streamConfig.channel.toString(),
    });

    switch (streamMethod) {
      case "img":
        setupImageStream(queryParams);
        break;
      case "iframe":
        setupIframeStream(queryParams);
        break;
      case "fetch":
        setupFetchStream(queryParams);
        break;
    }
  };

  const setupImageStream = (queryParams: any) => {
    if (imgRef.current) {
      const streamUrl = `${API_BASE_URL}/camerastream/mjpeg-stream?${queryParams}`;
      console.log("Streaming URL:", streamUrl);

      imgRef.current.src = streamUrl;
      imgRef.current.onload = () => {
        setIsLoading(false);
        setError(null);
        console.log("Stream loaded successfully");
      };

      imgRef.current.onerror = (e) => {
        setIsLoading(false);
        setError(
          `Failed to load MJPEG stream. Error: ${e.message || "Unknown error"}`
        );
        console.error("Image load error:", e);
      };
    }
  };

  const setupIframeStream = (queryParams) => {
    // This will be handled in the render method
    setIsLoading(false);
  };

  const setupFetchStream = async (queryParams) => {
    try {
      const streamUrl = `${API_BASE_URL}/camerastream/stream-proxy?${queryParams}`;
      console.log("Fetch streaming URL:", streamUrl);

      const response = await fetch(streamUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      if (imgRef.current) {
        imgRef.current.src = imageUrl;
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      setIsLoading(false);
      setError(`Fetch error: ${err.message}`);
      console.error("Fetch error:", err);
    }
  };

  const takeSnapshot = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/camerastream/snapshot`,
        {
          params: {
            channel: streamConfig.channel,
            profile: streamConfig.profile,
          },
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setSnapshotUrl(imageUrl);

      // Download the snapshot
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `snapshot-${new Date().getTime()}.jpg`;
      link.click();
    } catch (error) {
      console.error("Error taking snapshot:", error);
      setError("Failed to take snapshot. Please check camera connection.");
    }
  };

  const testCameraConnection = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/camerastream/snapshot`,
        {
          params: {
            channel: streamConfig.channel,
            profile: streamConfig.profile,
          },
          responseType: "blob",
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        setError(null);
        alert("Camera connection successful! Try switching streaming methods.");
      }
    } catch (error) {
      setError(`Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStream = () => {
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = "";
      setTimeout(() => {
        imgRef.current.src = currentSrc + "&_=" + new Date().getTime();
      }, 100);
    }
  };

  const renderStream = () => {
    const queryParams = new URLSearchParams({
      profile: streamConfig.profile.toString(),
      channel: streamConfig.channel.toString(),
    });

    switch (streamMethod) {
      case "img":
        return (
          <img
            ref={imgRef}
            alt="Camera MJPEG Stream"
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "auto",
              border: "2px solid #ccc",
              borderRadius: "8px",
              display: "block",
              backgroundColor: "#f5f5f5",
            }}
          />
        );

      case "iframe":
        return (
          <iframe
            src={`${API_BASE_URL}/camerastream/mjpeg-stream?${queryParams}`}
            width="800"
            height="600"
            style={{
              border: "2px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#f5f5f5",
            }}
            title="Camera Stream"
          />
        );

      default:
        return (
          <img
            ref={imgRef}
            alt="Camera Stream"
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "auto",
              border: "2px solid #ccc",
              borderRadius: "8px",
              display: "block",
              backgroundColor: "#f5f5f5",
            }}
          />
        );
    }
  };

  return (
    <div className="camera-stream-container" style={{ padding: "20px" }}>
      <h2>Camera MJPEG Stream - Troubleshooting</h2>

      {/* Stream Method Selection */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Streaming Method</h3>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ marginRight: "15px" }}>
            <input
              type="radio"
              value="img"
              checked={streamMethod === "img"}
              onChange={(e) => setStreamMethod(e.target.value)}
            />
            Image Element (Recommended)
          </label>
          <label style={{ marginRight: "15px" }}>
            <input
              type="radio"
              value="iframe"
              checked={streamMethod === "iframe"}
              onChange={(e) => setStreamMethod(e.target.value)}
            />
            IFrame
          </label>
          <label>
            <input
              type="radio"
              value="fetch"
              checked={streamMethod === "fetch"}
              onChange={(e) => setStreamMethod(e.target.value)}
            />
            Fetch API
          </label>
        </div>
      </div>

      {/* Configuration */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Stream Configuration</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
          }}
        >
          <div>
            <label>Profile: </label>
            <select
              value={streamConfig.profile}
              onChange={(e) =>
                setStreamConfig((prev) => ({
                  ...prev,
                  profile: parseInt(e.target.value),
                }))
              }
            >
              <option value={1}>Profile 1</option>
              <option value={2}>Profile 2</option>
              <option value={3}>Profile 3</option>
            </select>
          </div>

          <div>
            <label>Channel: </label>
            <select
              value={streamConfig.channel}
              onChange={(e) =>
                setStreamConfig((prev) => ({
                  ...prev,
                  channel: parseInt(e.target.value),
                }))
              }
            >
              <option value={0}>Channel 0</option>
              <option value={1}>Channel 1</option>
              <option value={2}>Channel 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={testCameraConnection}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Test Connection
        </button>

        <button
          onClick={refreshStream}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Refresh Stream
        </button>

        <button
          onClick={takeSnapshot}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Take Snapshot
        </button>
      </div>

      {/* Status */}
      <div style={{ marginBottom: "20px" }}>
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              background: "#e3f2fd",
              border: "1px solid #2196f3",
              borderRadius: "4px",
              color: "#1976d2",
            }}
          >
            Loading stream using {streamMethod} method...
          </div>
        )}

        {error && (
          <div
            style={{
              color: "red",
              textAlign: "center",
              padding: "15px",
              background: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "4px",
              marginBottom: "10px",
            }}
          >
            <strong>Error:</strong> {error}
            <br />
            <small>
              Try different streaming methods or check your camera
              configuration.
            </small>
          </div>
        )}
      </div>

      {/* Stream Display */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {renderStream()}
      </div>

      {/* Debug Info */}
      <div
        style={{
          padding: "15px",
          background: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      >
        <h4>Debug Information:</h4>
        <p>
          <strong>Stream URL:</strong> {API_BASE_URL}
          /camerastream/mjpeg-stream?profile={streamConfig.profile}&channel=
          {streamConfig.channel}
        </p>
        <p>
          <strong>Method:</strong> {streamMethod}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {isLoading ? "Loading..." : error ? "Error" : "Ready"}
        </p>
      </div>

      {/* Snapshot Display */}
      {snapshotUrl && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Latest Snapshot:</h3>
          <img
            src={snapshotUrl}
            alt="Camera snapshot"
            style={{
              maxWidth: "400px",
              height: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraStream;
