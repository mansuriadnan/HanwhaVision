import React, { useEffect, useState, useMemo } from "react";
import { Typography, Box } from "@mui/material";
import { ISpeedViolationByVehicleProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const SpeedViolationbyVehicle1_1: React.FC<ISpeedViolationByVehicleProps> = ({
  floor,
  zones,
  customizedWidth,
  SVbyVehicleData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
}) => {
  const totalQueueCount = useMemo(
    () => SVbyVehicleData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0,
    [SVbyVehicleData]
  );

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const [speed, setSpeed] = useState<number>();
  const [ruleName, setRuleName] = useState<string>();
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("VehicleSpeedViolation", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
        setSpeed(liveData?.speed);
        setRuleName(liveData?.RuleName);
      }
    };
    onReceiveMessage("VehicleSpeedViolation", handleSignalRMessage);
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
            <div className="speed-violation">
              <Box className="speed-violation-wrapper">
                <Box className="speed-violation-top">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Speed Violation
                    </Typography>
                    <Typography variant="h4">
                      {formatNumber(finalCount)}
                    </Typography>
                  </Box>
                  <Box>
                    <img
                      src={"/images/dashboard/speed_meeter.gif"}
                      alt="speed_meeter"
                      width={90}
                      height={90}
                    />
                  </Box>
                </Box>

                <Box className="speed-violation-bottom">
                  <Typography variant="h4">
                    Vehicle Speed <span>{speed}</span> Km/h
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {ruleName}
                  </Typography>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no fo speed detection : </Typography>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnSpeedViolationbyVehicle">
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

export { SpeedViolationbyVehicle1_1 };
