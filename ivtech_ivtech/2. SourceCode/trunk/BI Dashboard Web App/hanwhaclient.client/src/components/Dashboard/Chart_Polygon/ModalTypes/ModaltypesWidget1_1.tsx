import React from "react";
import { ModalTypesProps } from "../../../../interfaces/IChart";
import { SeriesBadge } from "../../../index";
import { sum } from "d3";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const ModaltypesWidget1_1: React.FC<ModalTypesProps> = ({
  modalTypesData,
  customizedWidth,
  customizedHeight,
  colorMap,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const { theme } = useThemeContext();
  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <div className="widget-main-body">
          <div className="widget-data-wrapper">
            <div className="modal-type-data">
              {modalTypesData?.map((item, index) => (
                <SeriesBadge
                  key={index}
                  label={item.seriesName}
                  value={item.totalCount}
                  gradientColors={
                    (colorMap && colorMap[item.seriesName]) || "#d3d3d3"
                  }
                  Pwidth={customizedWidth}
                  Pheight={customizedHeight}
                />
              ))}
            </div>
          </div>
        </div>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of modal types : </Typography>
            <span>
              {formatNumber(sum(modalTypesData ?? [], (d) => d.totalCount))}
            </span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnModalTypes">
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

export { ModaltypesWidget1_1 };
