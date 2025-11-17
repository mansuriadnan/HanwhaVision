import React, { useRef } from "react";
import { AverageVehicleCountProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import StatCard from "./StatCard";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const AverageVehicleCount1_1: React.FC<AverageVehicleCountProps> = ({
  AVCData,
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

  useExportHandler({
    apiEndpoint: `${apiUrls.AverageVehicleCountChart}/csv`,
    startDate: convertDateToISOLikeString(startDate as Date),
    endDate: convertDateToISOLikeString(endDate as Date),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

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
            <div className="avg-vehicle-count incoming-counting">
              <StatCard
                title="Incoming Average"
                avg={AVCData?.averageInCount ?? 0}
                min={AVCData?.minInCount ?? 0}
                max={AVCData?.maxInCount ?? 0}
                mindate={
                  AVCData?.minInDate
                    ? new Date(
                        formatDateToConfiguredTimezone(
                          AVCData.minInDate as unknown as string
                        )
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                maxdate={
                  AVCData?.maxInDate
                    ? new Date(
                        formatDateToConfiguredTimezone(
                          AVCData.maxInDate as unknown as string
                        )
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                color={{ bg: "#06B6F6", main: "#008ABD" }}
              />

              <StatCard
                title="Outgoing Average"
                avg={AVCData?.averageOutCount ?? 0}
                min={AVCData?.minOutCount ?? 0}
                max={AVCData?.maxOutCount ?? 0}
                mindate={
                  AVCData?.minOutDate
                    ? new Date(
                        formatDateToConfiguredTimezone(
                          AVCData.minOutDate as unknown as string
                        )
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                maxdate={
                  AVCData?.maxOutDate
                    ? new Date(
                        formatDateToConfiguredTimezone(
                          AVCData.maxOutDate as unknown as string
                        )
                      )
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                color={{ bg: "#FFF235", main: "#8C8300" }}
              />
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total No of Vehicle : </Typography>
            <span> {formatNumber(AVCData?.totalInVehicle ?? 0)}</span>
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
              id="zoomwidgetBtnAverageVehicleCounting"
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

export { AverageVehicleCount1_1 };
