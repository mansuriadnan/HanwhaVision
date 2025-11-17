import React, { useEffect, useMemo, useState } from "react";
import { IVehicleInWrongDirectionProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleInWrongDirection1_1: React.FC<IVehicleInWrongDirectionProps> = ({
  floor,
  zones,
  customizedWidth,
  vWrongDirectionData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate,
}) => {
  const totalQueueCount = useMemo(
    () =>
      vWrongDirectionData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0,
    [vWrongDirectionData]
  );

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const [ruleName, setRuleName] = useState<string>("No recent event found");
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("VehicleWrongDirection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data: any) => {
      var liveData = JSON.parse(data);
      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
        setRuleName(liveData?.RuleName);
      }
    };

    onReceiveMessage("VehicleWrongDirection", handleSignalRMessage);
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
            <div className="vehicle-in-wrong">
              <Box className="vehicle-in-wrong-i">
                <img
                  src="/images/dashboard/Vehicle_in_Wrong_Direction.gif"
                  alt="VIW image"
                />
              </Box>
              <Box className="vehicle-in-wrong-value">
                <Typography variant="h4">{formatNumber(finalCount)}</Typography>
                <Typography>Wrong Direction</Typography>
              </Box>
              <Box className="wrong-direction-box-width-cross">
                <Typography>{ruleName}</Typography>
                {/* <a>
                  <img src="/images/close-circle.png" />
                </a> */}
              </Box>
            </div>
          </div>
        </Box>
        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Wrong Direction : </Typography>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnVehicleInWrongDirection">
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

export { VehicleInWrongDirection1_1 };
