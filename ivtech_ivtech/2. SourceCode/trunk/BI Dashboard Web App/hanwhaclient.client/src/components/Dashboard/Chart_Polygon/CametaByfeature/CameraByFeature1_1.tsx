import React from "react";
import { CameraByFeatureProps } from "../../../../interfaces/IChart";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const CameraByFeature1_1: React.FC<CameraByFeatureProps> = ({
  CameraByFeatureData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const { theme } = useThemeContext();
  const totalCount =
    (CameraByFeatureData &&
      CameraByFeatureData?.reduce((acc, curr) => acc + curr.totalCount, 0)) ||
    0;
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
            <div className="camera-feature-data widget-table">
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Features</TableCell>
                    <TableCell>Counts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {CameraByFeatureData &&
                    CameraByFeatureData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <span>{(index + 1).toString().padStart(2, "0")}</span>
                        </TableCell>
                        <TableCell>{row.featuresName}</TableCell>
                        <TableCell>{formatNumber(row.totalCount)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of Feature types : </Typography>
            <span>{formatNumber(totalCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnFeatureTypes">
              <img
               src={ theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
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

export { CameraByFeature1_1 };
