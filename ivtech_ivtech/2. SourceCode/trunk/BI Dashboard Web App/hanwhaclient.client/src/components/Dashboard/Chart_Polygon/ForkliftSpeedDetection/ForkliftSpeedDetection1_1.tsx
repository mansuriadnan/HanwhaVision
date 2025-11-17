import React, { useEffect, useState, useMemo } from "react";
import { IForkliftSpeedDetectionProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const ForkliftSpeedDetection1_1: React.FC<IForkliftSpeedDetectionProps> = ({
  floor,
  zones,
  customizedWidth,
  speedDetectionData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate
}) => {
  const totalQueueCount = useMemo(
    () =>
      speedDetectionData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0,
    [speedDetectionData]
  );

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const [speed, setSpeed] = useState<number>(0);
  const [ruleName, setRuleName] = useState<string>();
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("ForkliftSpeedDetection", floor as string[], zones as string[]);

    const handleSignalRMessage= (data:any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
        setSpeed(liveData?.speed);
        setRuleName(liveData?.RuleName);
      }
    };
    onReceiveMessage("ForkliftSpeedDetection", handleSignalRMessage);
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
            <div className="forklift-speed-detection">
              <Box className="forklift-speed-detection-wrapper">
                <Box className="forklift-speed-violation">
                  <Box className="forklift-speed-image">
                    <img
                      src={"/images/dashboard/speed_meeter.gif"}
                      alt="speed_meeter"
                      width={90}
                      height={90}
                    />
                  </Box>
                  <Box className="forklift-speed-violation-data">
                    <Typography variant="h5" color="textSecondary">
                      Speed Violation
                    </Typography>
                    <Typography variant="h3" color="#FF009D" fontWeight="bold">
                      {formatNumber(finalCount)}
                    </Typography>
                  </Box>
                </Box>

                <Box className="forklift-speed-violation forklift-speed-violation-bottom">
                  <Box className="forklift-speed-violation-inner-wrapper">
                    <Typography variant="h4">
                      Forklift Speed  {" "}
                      <span
                        style={{
                          fontSize: "1.75rem", // h3 equivalent
                          color: "#FF009D",
                          fontWeight: "bold",
                        }}>{speed}</span> Km/h{" "}
                    </Typography>
                    <Typography>
                      {ruleName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total Forklift Speed Detection : </Typography>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnForkliftSpeedDetection">
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

export { ForkliftSpeedDetection1_1 };
