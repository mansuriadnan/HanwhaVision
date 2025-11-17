import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Box, CircularProgress } from "@mui/material";
import { CommonDialog } from "../../components/Reusable/CommonDialog";

interface VideoPlayerProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ eventId, isOpen,
  onClose }) => {
   if (!isOpen) return null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string>("");
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [openErrorDialogs, setOpenErrorDialogs] = useState<boolean>(false);
  const [isPlayable, setIsPlayable] = useState<boolean>(false);
  const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;

  // console.log("onClose:", onClose);

  // useEffect(() => {
  //   if (isOpen) {
  //     setError(null);
  //     setOpenErrorDialog(false);
  //     setIsPlayable(false);
  //     setLoading(false);
  //   }
  // }, [isOpen]);
  // useEffect(() => {
  //   if (isOpen) {
  //     setIsPlayable(false);
  //     setLoading(false);
  //   }
  // }, [onClose]);

  useEffect(() => {

    if (eventId && eventId !== currentEventId) {
      setLoading(true);          // Start loading
      setError(null);            // Clear errors
      setIsPlayable(false);      // Don't show video yet

      const timestamp = new Date().getTime();
      const streamUrl = `${API_BASE_URL}/Video/StreamVideoWithTempFile/${eventId}?t=${timestamp}`;


      setIsPlayable(true);
      setVideoUrl(streamUrl);
      setCurrentEventId(eventId);

      // Force reload
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else if (!eventId) {
      setVideoUrl(null);
      setCurrentEventId("");
      setIsPlayable(false);
    }
  }, [eventId, currentEventId]);

  const handleLoadStart = (): void => {
    setLoading(true);
    setError(null);
    setIsPlayable(true);
  };

  const handleCanPlay = (): void => {
    setLoading(false);
    setError(null);
    setIsPlayable(true);
  };

  const handleError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ): void => {
    console.log("Video error event:", e);
    setLoading(false);
    setError(
      "Video not found. It may have been removed or is currently unavailable."
    );
    setOpenErrorDialog(true);
    if(e.type === "error") {
      setIsPlayable(false);
    }else{
      setIsPlayable(true);
    }
    
  };

  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      
      console.log("Video dimensions:", {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      console.log(`Progress: ${currentTime}/${duration}`);
    }
  };

  const handlePlay = (): void => {
    console.log("Video started playing");
  };

  const handlePause = (): void => {
    console.log("Video paused");
  };

  const handleCloseErroDialog = () => {
    // setOpenErrorDialog(false);
    // setIsPlayable(false);
    setOpenErrorDialog(false);  // Controls <CommonDialog>
    setIsPlayable(false);       // Closes the video dialog if needed
    // onClose();
  };

  
  return (
    <>
      <Dialog
        open={(isPlayable && !!videoUrl && !openErrorDialog)} // open if there's a video
        onClose={() => {
          onClose();
        }}
        fullWidth
        maxWidth="md"
        className="video-player-dialog"
        PaperProps={{
          style: {
            backgroundColor: "#fff",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <DialogTitle sx={{ p: 1, display: "flex", justifyContent: "flex-end" }} className="video-player-dialog-title">
          <IconButton
            onClick={() => {
              onClose();
            }}
            size="small"
          >
            <img src="/images/close-circle-gray.png" alt="Close" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "transparent",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "800px",
            }}
          >
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                {/* Loading video... */}
              </Box>
            )}

            {videoUrl && (
              <video
                ref={videoRef}
                width="100%"
                height="450"
                controls
                preload="metadata"
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onError={handleError}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                style={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
                
              >
                {/* <source src={videoUrl} type="video/x-matroska" /> */}
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {(<CommonDialog
        open={openErrorDialog}
        title={""}
        content={
          error ||
          "Video not found. It may have been removed or is currently unavailable."
        }
        confirmText="Okay"
        onCancel={handleCloseErroDialog}
        onConfirm={handleCloseErroDialog}
        type="contactAdministrator"
        customClass="forgot-pass"
        titleClass={true}
      />)}
      {/* {
      (!openErrorDialogs && isPlayable && videoUrl !="") ? <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={()=>{
          onClose
          setOpenErrorDialogs(true);
        }
        }
      >
        <div
          className={videoUrl ? "video-pop-main" : "display-none-video-pop-main" }
           // Prevent closing when clicking inside modal
        >
          <button onClick={()=>{
          onClose
          setOpenErrorDialogs(true);
        }} title="Close">
            <img src="/images/close-circle-gray.png" />
          </button>

          <div
            className="video-container"
            style={{
              width: "100%",
              position: "relative",
            }}
          >
            {loading && (
              <div
                className="loading-overlay"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                }}
              >
                Loading video...
              </div>
            )}

            { videoUrl && (
              <video
                ref={videoRef}
                width="100%"
                height="450"
                controls
                preload="metadata"
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onError={handleError}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                style={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <source src={videoUrl} type="video/x-matroska" />
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </div> : <CommonDialog
      open={openErrorDialog}
      title={""}
      content={
        error ||
        "Video not found. It may have been removed or is currently unavailable."
      }
      confirmText="Okay"
      onCancel={handleCloseErroDialog}
      onConfirm={handleCloseErroDialog}
      type="contactAdministrator"
      customClass="forgot-pass"
      titleClass={true}
    />
    } */}

      {/* { !openErrorDialog && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={()=>{
          onClose
          setOpenErrorDialogs(true);
        }
        }
      >
        <div
          className={videoUrl ? "video-pop-main" : "display-none-video-pop-main" }
           // Prevent closing when clicking inside modal
        >
          <button onClick={()=>{
          onClose
          setOpenErrorDialogs(true);
        }} title="Close">
            <img src="/images/close-circle-gray.png" />
          </button>

          <div
            className="video-container"
            style={{
              width: "100%",
              position: "relative",
            }}
          >
            {loading && (
              <div
                className="loading-overlay"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "4px",
                }}
              >
                Loading video...
              </div>
            )}

            { videoUrl && (
              <video
                ref={videoRef}
                width="100%"
                height="450"
                controls
                preload="metadata"
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onError={handleError}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                style={{
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <source src={videoUrl} type="video/x-matroska" />
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </div>
    )} 

     {(openErrorDialog) && (<CommonDialog
      open={openErrorDialog}
      title={""}
      content={
        error ||
        "Video not found. It may have been removed or is currently unavailable."
      }
      confirmText="Okay"
      onCancel={handleCloseErroDialog}
      onConfirm={handleCloseErroDialog}
      type="contactAdministrator"
      customClass="forgot-pass"
      titleClass={true}
    />)} */}


      
    </>
  );
};
export { VideoPlayer };
