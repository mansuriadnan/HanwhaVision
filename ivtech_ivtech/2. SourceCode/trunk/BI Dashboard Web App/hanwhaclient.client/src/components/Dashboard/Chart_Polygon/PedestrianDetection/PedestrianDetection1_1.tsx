import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { IPedestrainProps } from "../../../../interfaces/IChart";
import { convertImageToBase64 } from "../../../../utils/convertImageToBase64";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const PedestrianDetection1_1: React.FC<IPedestrainProps> = ({
  floor,
  zones,
  customizedWidth,
  pDData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
}) => {
  const [bgBase64, setBgBase64] = useState<string | null>(null);
  const { theme } = useThemeContext();

  const totalQueueCount =
    pDData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0;

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);

  useEffect(() => {
    convertImageToBase64(
      "/images/dashboard/Pedestrian_Detection_background.svg",
      (base64: string | null) => {
        if (base64) {
          setBgBase64(base64);
        } else {
          console.error("Failed to convert image to Base64");
        }
      }
    );
  }, [pDData, customizedWidth]);

  useEffect(() => {
    // getLiveData("PedestrianDetection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
      }
    };

    onReceiveMessage("PedestrianDetection", handleSignalRMessage);
  }, [floor, zones]);

  const backgroundStyle = {
    backgroundImage: ` url('/images/back-static-graph.png'), linear-gradient(287.68deg, #fff -0.05%, #fff 57.77%)`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center bottom",
  };
  const backgroundStylPre = {
    backgroundImage: ` url('/images/back-pre.png')`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center bottom",
  };

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body">
          <div className="widget-data-wrapper">
            <div className="pedestrain-detection" style={backgroundStylPre}>
              <img src="/images/pedestrian.png" />
              <Typography variant="h4">{formatNumber(finalCount)}</Typography>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total Pedestrian detection : </Typography>
            <span> {formatNumber(finalCount)}</span>
          </Box>
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onMouseEnter={() => setIsDraggable?.(true)}
              onMouseLeave={() => setIsDraggable?.(false)}
            >
              <img
                src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
          {!openZoomDialog ? (
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnPedestrianDetection">
              <img
                   src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export { PedestrianDetection1_1 };
