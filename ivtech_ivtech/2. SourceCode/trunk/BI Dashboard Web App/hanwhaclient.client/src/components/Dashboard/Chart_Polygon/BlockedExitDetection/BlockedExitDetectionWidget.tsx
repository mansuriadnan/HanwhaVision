import {
  IBlockedExitDetectionChartData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { fetchBlockedExitDetectionChartDataService } from "../../../../services/dashboardService";
import {
  BlockedExitDetection1_1,
  BlockedExitDetection2_1_Option1,
  BlockedExitDetection2_1_Option2,
  BlockedExitDetection2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const BlockedExitDetectionWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete,
}) => {
  const [blockedExitDetectionChartData, setBlockedExitDetectionChartData] =
    useState<IBlockedExitDetectionChartData[]>();
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const pHeight = height;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  let data = {
    floorIds: floor || [],
    zoneIds: zones || [],
    startDate: convertToUTC(selectedStartDate),
    endDate: convertToUTC(selectedEndDate),
  };

  useExportHandler({
    apiEndpoint: `${apiUrls.BlockedExitDetecion}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  useEffect(() => {
    fetchBlockedExitDetectionData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (IsToday) {
      getLiveData("BlockedExitDetection", floor as string[], zones as string[]);
    }
  }, [floor, zones, IsToday]);

  const fetchBlockedExitDetectionData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      let responseChart: any = await fetchBlockedExitDetectionChartDataService(
        data as IWidgetPayload
      );

      setBlockedExitDetectionChartData(
        responseChart?.data as IBlockedExitDetectionChartData[]
      );
    } catch (error) {
      console.error("Error fetching blocked exit detection data:", error);
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
    return (
      <Box
        sx={{ height: pHeight, display: "flex" }}
        className={animate ? "animate-widget" : ""}
      >
        <BlockedExitDetection1_1
          blockedExitDetectionChartData={blockedExitDetectionChartData}
          customizedWidth={customizedWidth}
          customizedHeight={pHeight}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
          chartName={chartName}
        ></BlockedExitDetection1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <BlockedExitDetection2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              blockedExitDetectionChartData={blockedExitDetectionChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <BlockedExitDetection2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              blockedExitDetectionChartData={blockedExitDetectionChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <BlockedExitDetection2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              blockedExitDetectionChartData={blockedExitDetectionChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ))}
        {/* {size === "3x1" && (
        <BlockedExitDetection2_1_Option2
          APCData={averagePeopleCountData}
          pWidth={
            size === "3x1"
              ? `${(parseInt(pWidth as string) / 3) * 2}px`
              : pWidth
          }
          pHeight={pHeight}
        />
      )} */}
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
      {loadingCount > 0 && !IsDisplayLoader ? (
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

export { BlockedExitDetectionWidget };
