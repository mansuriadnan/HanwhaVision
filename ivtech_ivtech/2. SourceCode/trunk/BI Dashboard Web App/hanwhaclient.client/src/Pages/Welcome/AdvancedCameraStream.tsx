import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const AdvancedCameraStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = "http://localhost:5000/api/camerastream/stream";

    if (video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      }
    }

    return () => {
      if (video) {
        video.pause();
        video.src = "";
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      style={{ width: "100%", maxWidth: "800px" }}
    />
  );
};

export default AdvancedCameraStream;
