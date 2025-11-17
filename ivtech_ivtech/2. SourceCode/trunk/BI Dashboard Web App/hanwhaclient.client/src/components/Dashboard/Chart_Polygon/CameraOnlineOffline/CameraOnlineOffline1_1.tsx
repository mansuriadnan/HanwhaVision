import React, { useEffect } from "react";
import {
  ProgressBar,
  RadialProgressBar,
} from "../../../index";
import { CameraOnlineOfflineProps } from "../../../../interfaces/IChart";
import { Box, Grid, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const CameraOnlineOffline1_1: React.FC<CameraOnlineOfflineProps> = ({
  OnlineOfflineCameraData,
  customizedWidth,
  customizedHeight,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
  const totalCameras = OnlineOfflineCameraData?.totalCameraCount ?? 0;
  const onlineCameras = OnlineOfflineCameraData?.onlineCameraCount ?? 0;
  const offlineCameras = OnlineOfflineCameraData?.oflineCameraCount ?? 0;
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
            <div className="camera-online-offline-data">
              <Grid item className="camera-online-offline-graph">
                <Grid item>
                  <RadialProgressBar
                    value={onlineCameras}
                    color={theme === 'light' ?"#B3FF10":"#87AC00"}
                    name={"Online Cameras"}
                    // type={item.type}
                    maxCapacity={totalCameras}
                    // width={customizedWidth / 4}
                    // height={customizedHeight / 4}
                  />
                </Grid>
                <Grid item>
                  <RadialProgressBar
                    value={offlineCameras}
                    color={theme === 'light' ? "#FFA600" : "#FFBF00"}
                    name={"Offline Cameras"}
                    // type={item.type}
                    maxCapacity={totalCameras}
                    // width={customizedWidth / 4}
                    // height={customizedHeight / 4}
                  />
                </Grid>
              </Grid>

              <Grid item className="camera-online-offline-bottom-graph">
                <Grid item>
                  <ProgressBar
                    label="Online ratio"
                    percentage={Number(
                      formatNumber((onlineCameras / totalCameras) * 100)
                    )}
                    count={onlineCameras}
                    total={totalCameras}
                    color={theme === 'light' ?"#B3FF10":"#87AC00"}
                    Pwidth={customizedWidth / 4}
                    Pheight={customizedHeight / 10}
                  />
                </Grid>
                <Grid item>
                  <ProgressBar
                    label="Offline ratio"
                    percentage={Number(
                      formatNumber((offlineCameras / totalCameras) * 100)
                    )}
                    count={offlineCameras}
                    total={totalCameras}
                    color="#FFA600"
                    Pwidth={customizedWidth / 4}
                    Pheight={customizedHeight / 10}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total No of cameras : </Typography>
            <span>{formatNumber(totalCameras)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnOnlineoffline">
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

export { CameraOnlineOffline1_1 };
