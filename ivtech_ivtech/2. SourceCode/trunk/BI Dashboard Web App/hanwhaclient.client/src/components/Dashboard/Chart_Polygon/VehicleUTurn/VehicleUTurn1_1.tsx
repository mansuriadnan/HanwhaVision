import React from "react";
import { IVehicleUTurnProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleUTurn1_1: React.FC<IVehicleUTurnProps> = ({
  customizedWidth,
  vUTurnData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const totalQueueCount = vUTurnData?.reduce(
    (sum, item) => sum + item.queueCount,
    0
  );
  const { theme } = useThemeContext();

  const backgroundStyle = {
    backgroundImage: ` url('/images/u-turn.png'), linear-gradient(287.68deg, #6C5BFF -0.05%, #6C5BFF 57.77%)`,
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
            <div className="vehicle-u-turn">
              <Box className="vehicle-u-turn-main" style={backgroundStyle}>
                <Typography variant="h3">
                  {formatNumber(totalQueueCount ?? 0)}
                </Typography>
                <Box className="vehicle-u-turn-i">
                  <img
                    src="/images/dashboard/Vehicle_U_Turn_detection.gif"
                    alt="SAF image"
                  />
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of U turn detection : </Typography>
            <span> {formatNumber(totalQueueCount ?? 0)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnVehicleUTurnDetection">
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

export { VehicleUTurn1_1 };
