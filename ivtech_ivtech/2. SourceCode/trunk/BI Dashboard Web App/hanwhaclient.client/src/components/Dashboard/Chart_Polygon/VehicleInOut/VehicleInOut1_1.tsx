import React from "react";
import { ExtendedPeopleVehicleProps } from "../../../../interfaces/IChart";
import { Box, Typography, Button } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleInOut1_1 = ({
  inOutValue,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}: ExtendedPeopleVehicleProps) => {
  const [status, setStatus] = React.useState<"In" | "Out">("In");
  const { theme } = useThemeContext();

  const handleStatusChange = (newStatus: "In" | "Out") => {
    if (newStatus) {
      setStatus(newStatus);
    }
  };

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>
        <Box className="in-out-header-buttons in-out-header-buttons-orange">
          <Button
            className={status === "In" ? "active" : ""}
            fullWidth={true}
            onClick={() => {
              handleStatusChange("In");
            }}
          >
            In
          </Button>
          <Button
            className={status === "Out" ? "active" : ""}
            fullWidth={true}
            onClick={() => {
              handleStatusChange("Out");
            }}
          >
            Out
          </Button>
        </Box>

        <Box className="widget-main-body people-in-out-main">
          <div className="widget-data-wrapper">
            <div className="people-in-out vehicle-in-out">
              {status === "In" ? (
                <img
                  src={
                    theme === "light"
                      ? "/images/dashboard/vehiclein.gif"
                      : "/images/dark-theme/dashboard/vehiclein.gif"
                  }
                  alt="Vehicle In"
                  style={{ width: "100px", height: "100px" }}
                />
              ) : (
                <img
                  src={
                    theme === "light"
                      ? "/images/dashboard/vehiclein.gif"
                      : "/images/dark-theme/dashboard/vehiclein.gif"
                  }
                  alt="Vehicle Out"
                  style={{
                    transform: "scaleX(-1)",
                    width: "100px",
                    height: "100px",
                  }}
                />
              )}
              <Typography variant="h6">
                {status == "In"
                  ? formatNumber(inOutValue?.totalInCount ?? 0)
                  : formatNumber(inOutValue?.totalOutCount ?? 0)}
              </Typography>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of vehicle : </Typography>
            <span>
              {" "}
              {status == "In"
                ? formatNumber(inOutValue?.totalInCount ?? 0)
                : formatNumber(inOutValue?.totalOutCount ?? 0)}
            </span>
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
              id="zoomwidgetBtnVehicle"
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

export { VehicleInOut1_1 };
