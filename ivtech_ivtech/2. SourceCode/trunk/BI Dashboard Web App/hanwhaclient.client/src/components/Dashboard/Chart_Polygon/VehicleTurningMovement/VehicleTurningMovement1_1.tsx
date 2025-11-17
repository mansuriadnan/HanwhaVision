import React from "react";
import { IVTurningMovmentProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleTurningMovement1_1: React.FC<IVTurningMovmentProps> = ({
  vTMBubbleChartData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const totalVehicleTurning = Object.values(vTMBubbleChartData ?? {}).reduce(
    (sum, value) => sum + (typeof value === "number" ? value : 0),
    0
  );
  const { theme } = useThemeContext();

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body widget-two-title">
          <div className="widget-data-wrapper">
            <div className="vehicle-turning-movement">
              <Box className="vehicle-turning-movement-wrapper">
                <img
                  src="images/dashboard/Vehicle_Turning_Movement_counts_background.png"
                  alt=""
                  title=""
                />
                <Box className="vahicle-turn-top-right">
                  <Typography variant="h6">
                    {formatNumber(vTMBubbleChartData?.straight ?? 0)}
                  </Typography>
                  <Typography>Straight</Typography>
                </Box>
                <Box className="vahicle-turn-button">
                  <Box className="vahicle-turn-bottom-left">
                    <Typography variant="h6">
                      {formatNumber(vTMBubbleChartData?.left ?? 0)}
                    </Typography>
                    <Typography>Left</Typography>
                  </Box>

                  <Box className="vahicle-turn-bottom-right">
                    <Typography variant="h6">
                      {formatNumber(vTMBubbleChartData?.right ?? 0)}
                    </Typography>
                    <Typography>Right</Typography>
                  </Box>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography> Vehicle Turning Movment Counts : </Typography>
            <span> {formatNumber(totalVehicleTurning ?? 0)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnVehicleTurningMovementCounts">
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

export { VehicleTurningMovement1_1 };
