import React, { useEffect, useRef, useState } from "react";
import {
  IWidgetPayload,
  IOnlineOfflineCameraData,
  CommonWidgetProps,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  CameraOnlineOffline1_1,
  CameraOnlineOffline2_1_Option1,
  CameraOnlineOffline2_1_Option2,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { Box } from "@mui/material";
import { fetchCameraOnlineOfflineDataService } from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const CameraOnlineOfflineWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete,
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [onlineOfflineCameraData, setOnlineOfflineCameraData] =
    useState<IOnlineOfflineCameraData>();
   const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
    const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchCameraOnlineOfflineData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.TotalCameraCount}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchCameraOnlineOfflineData = async () => {
     setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchCameraOnlineOfflineDataService(
        data as unknown as IWidgetPayload
      );

      setOnlineOfflineCameraData(response?.data as IOnlineOfflineCameraData);
    } catch (error) {
      console.error("Error fetching Camera online offline data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const handleZoomClick = () => {
    setOpenZoomDialog(true);
  };

  const handleCloseZoom = () => {
    setOpenZoomDialog(false);
  };

  const renderLayout = () => {
    // if (
    //   !onlineOfflineCameraData ||
    //   onlineOfflineCameraData.totalCameraCount === 0
    // ) {
    //   return (
    //     <Box
    //       sx={{
    //         height: height,
    //         width: width,
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       No data found
    //     </Box>
    //   );
    // }
    return (
      <Box sx={{ height: height, display: "flex" }}>
        <CameraOnlineOffline1_1
          OnlineOfflineCameraData={onlineOfflineCameraData}
          customizedWidth={customizedWidth}
          customizedHeight={height}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <CameraOnlineOffline2_1_Option2
              OnlineOfflineCameraData={onlineOfflineCameraData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
            />
          ) : (
            <CameraOnlineOffline2_1_Option1
              OnlineOfflineCameraData={onlineOfflineCameraData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
            />
          ))}
        <Box className="widget-label-bottom">
          <span>{chartName}</span>
          <img
            src="/images/question_circle_icon_widget_bottom_title.svg"
            alt="info Icon"
            className="widget-label-icon-bottom"
          />
        </Box>
      </Box>
    );
  };

  // const hasDispatchedRef = useRef(false);
  // useEffect(() => {
  //   if (!localLoading && !hasDispatchedRef.current) {
  //     hasDispatchedRef.current = true;
  //     onLoadComplete?.();
  //   }
  // }, [localLoading, onLoadComplete]);
  return (
    <>
      {loadingCount > 0  && !IsDisplayLoader ? (
        <LocalLoader width={width} height={height} size={50} color="warning" />
      ) : (
        <>
          {renderLayout()}
          <CommonDialog
            open={openZoomDialog}
            title={"Expanded View"}
            onCancel={handleCloseZoom}
            maxWidth={"lg"}
            customClass={"widget_popup cmn-pop-design-parent"}
            content={renderLayout()}
            isWidget={true}
          />
        </>
      )}
    </>
  );
};

export { CameraOnlineOfflineWidget };
