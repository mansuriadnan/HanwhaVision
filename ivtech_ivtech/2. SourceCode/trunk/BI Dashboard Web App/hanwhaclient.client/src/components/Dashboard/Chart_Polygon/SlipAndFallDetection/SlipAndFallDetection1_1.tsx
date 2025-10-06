import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ISlipAndFallProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const SlipAndFallDetection1_1: React.FC<ISlipAndFallProps> = ({
  floor,
  zones,
  customizedWidth,
  slipAndFallData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
}) => {
  const totalSlipAndFallCount = useMemo(
    () => slipAndFallData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0,
    [slipAndFallData]
  );
  const { theme } = useThemeContext();

  const [finalCount, setFinalCount] = useState<number>(totalSlipAndFallCount);

  useEffect(() => {
    // getLiveData("SlipAndFallDetection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
      }
    };

    onReceiveMessage("SlipAndFallDetection", handleSignalRMessage);
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
            <div className="slip-fall-data">
              <Box sx={{ height: 100, width: 100, justifySelf: "center" }}>
                <img
                  src="/images/dashboard/Slip___Fall_Detection.gif"
                  alt="SAF image"
                />
              </Box>

              <Box sx={{ backgroundColor: "white", borderRadius: 7 }}>
                <Typography
                  sx={{
                    color: "#2081FF",
                    fontWeight: 600,
                    fontSize: 33,
                    justifySelf: "center",
                  }}
                >
                  {formatNumber(finalCount)}
                </Typography>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of slip & fall : </Typography>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnSlipAndFall">
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

export { SlipAndFallDetection1_1 };
