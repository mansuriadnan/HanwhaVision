import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IWidgetPayload,
  IVQAData,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  ForkliftQueueEvent1_1,
  ForkliftQueueEvent2_1_Option1,
  ForkliftQueueEvent2_1_Option2,
  ForkliftQueueEvent2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchForkliftQueueDataService } from "../../../../services/dashboardService";
import { Box } from "@mui/material";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ForkliftQueueEventWidget: React.FC<CommonWidgetProps> = ({
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
  const [forkliftQueueEventsData, setForkliftQueueEventsData] = useState<
    IVQAData[]
  >([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.ForkliftQueueAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  useEffect(() => {
    fetchForkliftQueueData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (IsToday) {
      getLiveData(
        "ForkliftQueueAnalysis",
        floor as string[],
        zones as string[]
      );
    }
  }, [floor, zones, IsToday]);

  const fetchForkliftQueueData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchForkliftQueueDataService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setForkliftQueueEventsData(response?.data as IVQAData[]);
      } else {
        setForkliftQueueEventsData([]);
      }
    } catch (error) {
      console.error("Error fetching forklift queue event data:", error);
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
        sx={{ height: height, display: "flex" }}
        className={animate ? "animate-widget" : ""}
      >
        <ForkliftQueueEvent1_1
          customizedWidth={customizedWidth}
          forkliftQueueEventsData={forkliftQueueEventsData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
        ></ForkliftQueueEvent1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <ForkliftQueueEvent2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              forkliftQueueEventsData={forkliftQueueEventsData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <ForkliftQueueEvent2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              forkliftQueueEventsData={forkliftQueueEventsData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <ForkliftQueueEvent2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              forkliftQueueEventsData={forkliftQueueEventsData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
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

export { ForkliftQueueEventWidget };
