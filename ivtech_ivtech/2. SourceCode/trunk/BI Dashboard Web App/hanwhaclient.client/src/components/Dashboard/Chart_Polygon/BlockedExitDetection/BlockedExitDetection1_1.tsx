import React, { useMemo, useState, useEffect } from "react";
import { IBlockedExitDetectionChartProp } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
// import BlockedExitImage from "../../../../../public/images/dashboard/BlockedExitDetection1_1.gif";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const BlockedExitDetection1_1: React.FC<IBlockedExitDetectionChartProp> = ({
  floor,
  zones,
  blockedExitDetectionChartData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
  chartName
}) => {
  const totalQueueCount = useMemo(
    () =>
      blockedExitDetectionChartData?.reduce(
        (sum, item) => sum + item.queueCount,
        0
      ) ?? 0,
    [blockedExitDetectionChartData]
  );

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("BlockedExitDetection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
      }
    };
    onReceiveMessage("BlockedExitDetection", handleSignalRMessage);
  }, [floor, zones]);

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
            <div className="block-exit-detection">
              <img src={"/images/dashboard/BlockedExitDetection1_1.gif"} alt="Blocked Exit" />

              <Box className="block-exit-detection-count">
                <Typography>Blocked exit detection</Typography>
                <Typography variant="h6">{formatNumber(finalCount)}</Typography>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Blocked exit detection : </Typography>
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
            <Box className="widget-main-footer-zoom-i"
              onClick={onZoomClick}
              id={chartName && chartName === "Blocked exit detection" ? "zoomwidgetBtnBlockedexitdetection" : "zoomwidgetBtnFactoryBlockedexitdetection"}>
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

export { BlockedExitDetection1_1 };
