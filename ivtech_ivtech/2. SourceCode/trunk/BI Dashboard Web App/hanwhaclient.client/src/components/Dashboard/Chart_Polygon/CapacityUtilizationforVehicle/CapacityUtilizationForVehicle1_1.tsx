import React, { useEffect } from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import moment from "moment";
import { DateWiseUtilization, ICapacityUtilizationforVehicleProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const CapacityUtilizationForVehicle1_1: React.FC<
  ICapacityUtilizationforVehicleProps
> = ({
  customizedWidth,
  CUForVehicleData,
  DateWiseUtilization,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
    const { theme } = useThemeContext();

    const [overallMin, setOverallMin] = React.useState<DateWiseUtilization | null>(null);
    const [overallMax, setOverallMax] = React.useState<DateWiseUtilization | null>(null);


    useEffect(() => {
      if (!DateWiseUtilization || DateWiseUtilization.length === 0) {
        setOverallMin(null);
        setOverallMax(null);
        return;
      }

      function groupByDate(data: DateWiseUtilization[]) {
        const grouped: Record<string, DateWiseUtilization[]> = {};

        data.forEach((item) => {
          //const date = item.dateTime.split("T")[0]; // Extract YYYY-MM-DD
            const date = moment(item.dateTime).format("YYYY-MM-DD"); // Extract YYYY-MM-DD
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(item);
        });

        return grouped;
      }

      function findMaxByDate(data: DateWiseUtilization[]) {
        const grouped = groupByDate(data);

        const result = Object.entries(grouped).map(([date, values]) => {
          const max = values.reduce((max, item) =>
            item.totalCount > max.totalCount ? item : max
          );
          return { date, max };
        });

        return result;
      }


      const MaxByDate = findMaxByDate(DateWiseUtilization);


      // const overallMinval = MaxByDate.reduce((min, item) =>
      //   item.max.totalCount < min.max.totalCount ? item : min
      // );

      const overallMinval = MaxByDate
        .filter(item => item.max.totalCount > 0) // ignore 0
        .reduce((min, item) =>
          item.max.totalCount < min.max.totalCount ? item : min
          , MaxByDate[0]);

      const overallMaxval = MaxByDate.reduce((max, item) =>
        item.max.totalCount > max.max.totalCount ? item : max
      );

      setOverallMin(overallMinval?.max ?? null);
      setOverallMax(overallMaxval.max);


    }, [DateWiseUtilization])

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
              <Box className="capacity-utilization-image">
                <Box className="capacity-utilization-blue-box">
                  <Avatar className="capacity-utilization-car">
                    <img
                      src="/images/dashboard/Capacity_Utilization_for_Vehicle.gif"
                      alt="car image"
                      height={50}
                      width={50}
                    />
                  </Avatar>
                  <Box className="capacity-utilization-car-details">
                    <Box className="capacity-utilization-car-detail-left">
                      <Typography variant="h6" fontWeight="bold">
                        {formatNumber(
                          Math.round(CUForVehicleData?.utilization as number) ?? 0
                        )}
                      </Typography>
                      <Typography variant="body2">Utilization</Typography>
                    </Box>
                    <Box className="capacity-utilization-car-detail-right">
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(CUForVehicleData?.percentage as number) ?? 0}%
                      </Typography>
                      <Typography variant="body2">Percentage</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="capacity-utilization-day-details">
                  {[
                    {
                      label: "Most Day",
                      value:
                        overallMax?.totalCount ?? 0,
                      date: (
                        overallMax?.dateTime ?? ""
                      ),
                      icon: "/images/up_arrow.svg",
                    },
                    {
                      label: "Least Day",
                      value:
                        overallMin?.totalCount ?? 0,
                      date: (overallMin?.dateTime ?? ""
                      ),
                      icon: "/images/down_arrow.svg",
                    },
                  ].map((item, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      className="capacity-utilization-day-details-main"
                    >
                      <Box className="capacity-utilization-day">
                        <Typography variant="body2" noWrap>
                          {item.label}
                        </Typography>
                        <Box
                          component="img"
                          src={item.icon}
                          alt={`${item.label} Arrow`}
                          sx={{ height: 11, width: 16 }}
                        />
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {formatNumber(Math.round(item.value as number) ?? 0)}
                      </Typography>
                      <Typography variant="caption">
                        {/* {moment(item.date).format("D MMM YYYY") ?? "—"} */}
                        {!item.date || item.date.startsWith("0001-01-01")
                          ? "—"
                          : moment(item.date).format("D MMM YYYY")}

                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </div>
          </Box>

          <Box className="widget-main-footer">
            <Box className="widget-main-footer-value">
              <Typography>Total no of capacity : </Typography>
              <span>{formatNumber(CUForVehicleData?.totalCapacity ?? 0)}</span>
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
              <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnCapacityUtilizationforVehicle">
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

export { CapacityUtilizationForVehicle1_1 };
