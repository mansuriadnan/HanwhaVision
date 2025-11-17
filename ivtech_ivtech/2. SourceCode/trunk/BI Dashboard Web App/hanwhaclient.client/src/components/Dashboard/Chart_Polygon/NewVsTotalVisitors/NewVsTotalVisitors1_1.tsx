import { Box, Typography } from "@mui/material";
import { NewVsTotalVisitorProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const NewVsTotalVisitors1_1: React.FC<NewVsTotalVisitorProps> = ({
  newVsTotalVisitorCountData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  // const formatNumbers = (num: any) => {
  //   if (num >= 1000000) {
  //     const value = (num / 1000000).toFixed(1);
  //     return (value.endsWith(".0") ? parseInt(value) : value) + "M";
  //   }
  //   if (num >= 1000) {
  //     const value = (num / 1000).toFixed(1);
  //     return (value.endsWith(".0") ? parseInt(value) : value) + "K";
  //   }
  //   return num.toString();
  // };
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
            <div className="new-total-visitors">
              <Box className="new-total-visitors-icon">
                {/* <img src={nodeIcon} alt="icon" style={{ width: 50, height: 50 }} /> */}
                <img
                  src="/images/dashboard/New_vs_Total_Visitors.gif"
                  alt="NVT image"
                  style={{ width: "70px", height: "70px" }}
                />
              </Box>
              <Box className="new-total-visitors-details">
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    New Visitors
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(
                      newVsTotalVisitorCountData?.newVisitorsCount ?? 0
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total Visitors
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(
                      newVsTotalVisitorCountData?.totalVisitorsCount ?? 0
                    )}
                  </Typography>
                </Box>
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total visitors : </Typography>
            <span>
              {formatNumber(
                newVsTotalVisitorCountData?.totalVisitorsCount ?? 0
              )}
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnNewVsTotalVisitors">
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
export { NewVsTotalVisitors1_1 };
