import React from "react";
import { Box, Typography } from "@mui/material";
import { IZWPeopleCount } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWisePeopleCounting1_1: React.FC<IZWPeopleCount> = ({
  customizedWidth,
  zoneWisePeopleCountingData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const { theme } = useThemeContext();
  const totalPeopleIn =
    zoneWisePeopleCountingData &&
    zoneWisePeopleCountingData.reduce(
      (acc, curr) => acc + (curr.peopleInCount || 0),
      0
    );

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body widget-table">
          <div className="widget-data-wrapper">
            <div className="zone-people-data">
              <table className="table">
                <thead>
                  <tr>
                    <th>Zone name</th>
                    <th>People In</th>
                    <th>People Out</th>
                  </tr>
                </thead>

                <tbody>
                  {zoneWisePeopleCountingData &&
                    zoneWisePeopleCountingData.map((zone, index) => (
                      <tr>
                        <td>
                          <span>{zone.zoneName}</span>
                        </td>
                        <td>
                          <span>{formatNumber(zone.peopleInCount)}</span>
                        </td>
                        <td>
                          <span>{formatNumber(zone.peopleOutCount)}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of people : </Typography>
            <span> {formatNumber(totalPeopleIn ?? 0)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnZonewisePeopleCounting">
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

export { ZoneWisePeopleCounting1_1 };
