import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IAnalysisData,
  IWidgetPayload,
  LayoutItem,
} from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import {
  ForkliftSpeedDetection1_1,
  ForkliftSpeedDetection2_1_Option1,
  ForkliftSpeedDetection2_1_Option2,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchForkliftSpeedDetectionDataService } from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";

const ForkliftSpeedDetectionWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setIsDraggable,
  onLoadComplete,
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [speedDetectionData, setSpeedDetectionData] = useState<IAnalysisData[]>(
    []
  );
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  useEffect(() => {
    fetchForkliftSpeedDetectionData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (IsToday) {
      getLiveData(
        "ForkliftSpeedDetection",
        floor as string[],
        zones as string[]
      );
    }
  }, [floor, zones, IsToday]);

  const fetchForkliftSpeedDetectionData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchForkliftSpeedDetectionDataService(
        data as IWidgetPayload
      );

      if (response?.data) {
        setSpeedDetectionData(response?.data as IAnalysisData[]);
      } else {
        setSpeedDetectionData([]);
      }
    } catch (error) {
      console.error("Error fetching Forklift speed detection data:", error);
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
        <ForkliftSpeedDetection1_1
          customizedWidth={customizedWidth}
          customizedHeight={height}
          speedDetectionData={speedDetectionData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <ForkliftSpeedDetection2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              speedDetectionData={speedDetectionData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
            />
          ) : (
            <ForkliftSpeedDetection2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              speedDetectionData={speedDetectionData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
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

export { ForkliftSpeedDetectionWidget };
