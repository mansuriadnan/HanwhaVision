import React from "react";
import { IZoneWiseCapacityUtilizationProps } from "../../../../interfaces/IChart";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWiseCapacityUtilizationForPeople1_1: React.FC<
  IZoneWiseCapacityUtilizationProps
> = ({
  customizedWidth,
  ZoneWiseCUData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
    const totalPeople =
      ZoneWiseCUData &&
      ZoneWiseCUData.reduce((sum, row) => sum + row.utilization, 0);
    const { theme } = useThemeContext();

    return (
      <Box sx={{ width: customizedWidth }}>
        <Box className="widget-main-wrapper">
          <Box className="widget-main-header">
            <Typography variant="h6" component="h2">
              {displayName}
            </Typography>
          </Box>
          <Box className="widget-main-body widget-two-title widget-table">
            <div className="widget-data-wrapper">
              <div className="zone-wise-people-data">
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Zone name</TableCell>
                        <TableCell>Max Capacity</TableCell>
                        <TableCell>Utilization</TableCell>
                        <TableCell>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ZoneWiseCUData &&
                        ZoneWiseCUData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <span>{row.zoneName}</span>
                            </TableCell>
                            <TableCell>{formatNumber(row.maxCapacity)}</TableCell>
                            <TableCell>{formatNumber(row.utilization)}</TableCell>
                            <TableCell>{row.percentage}%</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </Box>
          <Box className="widget-main-footer">
            <Box className="widget-main-footer-value">
              <Typography>Total no of Utilization: </Typography>
              <span>{totalPeople && formatNumber(totalPeople)}</span>
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
              <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnZoneWiseCapacityUtilizationforPeople">
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

export { ZoneWiseCapacityUtilizationForPeople1_1 };
