import React from "react";
import { IForkliftDataProps } from "../../../../interfaces/IChart";
import { Box,Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const CountingForForklift1_1: React.FC<IForkliftDataProps> = ({
  customizedWidth,
  ForkliftData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const totalQueueCount =
    ForkliftData && ForkliftData.length > 0
      ? ForkliftData.reduce((sum, item) => sum + item.queueCount, 0)
      : 0;
    const { theme } = useThemeContext();

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
            <div className="forklift-counting">
              <Box className="forklift-counting-image">
                <Box className="forklift-counting-image-wrapper">
                  <img src={"/images/dashboard/forklift.gif"} alt="Forklift" />
                </Box>
              </Box>

              <Box className="forklift-counting-details">
                <Box className="forklift-counting-count">
                  <Typography variant="h6">
                    {formatNumber(totalQueueCount)}
                  </Typography>
                </Box>
                <Typography>Forklift Count</Typography>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of vehicle queue : </Typography>
            <span> {formatNumber(totalQueueCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnCountingforforklift">
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

export { CountingForForklift1_1 };
