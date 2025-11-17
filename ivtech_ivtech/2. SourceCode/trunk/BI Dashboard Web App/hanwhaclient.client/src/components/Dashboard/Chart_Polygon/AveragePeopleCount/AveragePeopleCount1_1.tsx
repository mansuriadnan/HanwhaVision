import React, { useRef } from "react";
import { AveragePeopleCountProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import StatCard from "./StatCard";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const AveragePeopleCount1_1: React.FC<AveragePeopleCountProps> = ({
  APCData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  floor,
  zones,
  startDate,
  endDate,
  setExportHandler,
}) => {
  const { theme } = useThemeContext();
  const selectedIntervalNameRef = useRef<string>("");
  // Only call useExportHandler if setExportHandler is provided
  if (setExportHandler) {
    
    useExportHandler({
      apiEndpoint: `${apiUrls.AveragePeopleCountChart}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });
  }
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
            <div className="average-people-counting">
              <StatCard
                title="Incoming Average"
                avg={APCData?.averageInCount ?? 0}
                min={APCData?.minInCount ?? 0}
                max={APCData?.maxInCount ?? 0}
                mindate={
                  APCData?.minInDate
                    ? new Date(APCData.minInDate).toISOString().split("T")[0]
                    : ""
                }
                maxdate={
                  APCData?.maxInDate
                    ? new Date(APCData.maxInDate).toISOString().split("T")[0]
                    : ""
                }
                color={{
                  bg: "#DCEEFF",
                  main: "#1168D0",
                  mainAvgFont: "#2F8DFC",
                }}
              />

              <StatCard
                title="Outgoing Average"
                avg={APCData?.averageOutCount ?? 0}
                min={APCData?.minOutCount ?? 0}
                max={APCData?.maxOutCount ?? 0}
                mindate={
                  APCData?.minOutDate
                    ? new Date(APCData.minOutDate).toISOString().split("T")[0]
                    : ""
                }
                maxdate={
                  APCData?.maxOutDate
                    ? new Date(APCData.maxOutDate).toISOString().split("T")[0]
                    : ""
                }
                color={{
                  bg: theme === "light" ? "#FFE3E1" : "#9F9F9F",
                  main: "#D32F2F",
                  mainAvgFont: "#FF5245",
                }}
              />
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total No of People : </Typography>
            <span>{formatNumber(APCData?.totalInPeople ?? 0)}</span>
          </Box>
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onMouseEnter={() => setIsDraggable?.(true)}
              onMouseLeave={() => setIsDraggable?.(false)}
            >
              <img
                src={
                  theme === "light"
                    ? "/images/dashboard/drag.svg"
                    : "/images/dark-theme/dashboard/drag.svg"
                }
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onClick={onZoomClick}
              id="zoomwidgetBtnAveragePeopleCounting"
            >
              <img
                src={
                  theme === "light"
                    ? "/images/dashboard/ZoomWidget.svg"
                    : "/images/dark-theme/dashboard/ZoomWidget.svg"
                }
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

export { AveragePeopleCount1_1 };
