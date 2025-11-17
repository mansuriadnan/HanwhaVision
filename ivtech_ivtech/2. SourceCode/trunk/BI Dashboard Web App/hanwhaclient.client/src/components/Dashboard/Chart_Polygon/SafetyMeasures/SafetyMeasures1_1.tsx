import { Box, Grid, Typography } from "@mui/material";
import { ISafetyMeasuresDataProps } from "../../../../interfaces/IChart";
// import SafetyMeasures_WithMask_Icon from "../../../../../public/images/SafetyMeasures_WithMask_Icon.svg";
// import SafetyMeasures_WithoutMask_Icon from "../../../../../public/images/SafetyMeasures_WithoutMask_Icon.svg";
// import SafetyMeasures_WithHelmet_Icon from "../../../../../public/images/SafetyMeasures_WithHelmet_Icon.svg";
// import SafetyMeasures_WithoutHelment_Icon from "../../../../../public/images/SafetyMeasures_WithoutHelment_Icon.svg";
// import SafetyMeasures_WithSafetyJacket_Icon from "../../../../../public/images/SafetyMeasures_WithSafetyJacket_Icon.svg";
// import SafetyMeasures_WithoutSafetyJacket_Icon from "../../../../../public/images/SafetyMeasures_WithoutSafetyJacket_Icon.svg";
import { useEffect, useState } from "react";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const SafetyMeasures1_1: React.FC<ISafetyMeasuresDataProps> = ({
  safetyMeasuresData,
  safetyMeasuresChartData,
  customizedWidth,
  customizedHeight,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const { theme } = useThemeContext();
  const data = [
    {
      label: "Mask",
      with: {
        count: safetyMeasuresData?.withMask || 0,
        icon: "/images/SafetyMeasures_WithMask_Icon.svg",
        bg: "#FAFFDB",
      },
      without: {
        count: safetyMeasuresData?.withoutMask || 0,
        icon: "/images/SafetyMeasures_WithoutMask_Icon.svg",
        bg: "#EDEDED",
      },
    },
    {
      label: "Helmet",
      with: {
        count: safetyMeasuresData?.withHelmet || 0,
        icon: "/images/SafetyMeasures_WithHelmet_Icon.svg",
        bg: "#DBFDFF",
      },
      without: {
        count: safetyMeasuresData?.withoutHelmet || 0,
        icon: "/images/SafetyMeasures_WithoutHelment_Icon.svg",
        bg: "#EDEDED",
      },
    },
    {
      label: "Safety Jacket",
      with: {
        count: safetyMeasuresData?.withSafetyJacket || 0,
        icon: "/images/SafetyMeasures_WithSafetyJacket_Icon.svg",
        bg: "#E1E4FF",
      },
      without: {
        count: safetyMeasuresData?.withoutSafetyJacket || 0,
        icon: "/images/SafetyMeasures_WithoutSafetyJacket_Icon.svg",
        bg: "#EDEDED",
      },
    },
  ];

  const [totalCounts, setTotalCounts] = useState(0);

  useEffect(() => {
    const totalCount = data.reduce((sum, item) => {
      return sum + item.with.count + item.without.count;
    }, 0);
    setTotalCounts(totalCount);
  }, [
    customizedWidth,
    customizedHeight,
    safetyMeasuresData,
    safetyMeasuresChartData,
  ]);

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
            <div className="safety-measures-image">
              {data.map((item, index) => (
                <Box className="safety-measures-wrapper">
                  <Grid key={index} className="safety-measures-main">
                    <Grid item className="safety-measures-repeat">
                      <Box className="safety-measures-box">
                        <img src={item.with.icon} alt={item.label} />
                        <Box>
                          <Typography>With {item.label}</Typography>
                          <Typography variant="h6">
                            {item.with.count}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item className="safety-measures-repeat">
                      <Box className="safety-measures-box">
                        {/* {item.without.icon} */}
                        <img src={item.without.icon} alt={item.label} />
                        <Box>
                          <Typography>Without {item.label}</Typography>
                          <Typography variant="h6">
                            {item.without.count}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total No of People : </Typography>
            <span> {formatNumber(totalCounts)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnSafetyMeasures">
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
export { SafetyMeasures1_1 };
