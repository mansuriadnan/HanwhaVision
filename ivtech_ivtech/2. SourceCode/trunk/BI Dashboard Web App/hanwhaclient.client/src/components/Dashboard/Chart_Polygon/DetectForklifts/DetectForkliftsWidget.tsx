import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  IDetectForklifts,
  IDetectForkliftsCharts,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import {
  DetectForklifts1_1,
  DetectForklifts2_1_Option1,
  DetectForklifts2_1_Option2,
  DetectForklifts2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import {
  fetchForkliftDataService,
  fetchProximityForkliftsDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const DetectForkliftsWidget: React.FC<CommonWidgetProps> = ({
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

  const [forkliftsData, setForkliftsData] = useState<IDetectForklifts[]>();
  const [proximityForkliftsData, setProximityForkliftsData] =
    useState<IDetectForklifts[]>();
  const [detectForkliftsData, setDetectForkliftsData] =
    useState<IDetectForkliftsCharts[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.ProxomityDetectionAnalysis}/csv`,
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
    fetchForkliftsData();
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  useEffect(() => {
    if (IsToday) {
      getLiveData(
        "ForkliftProximityDetection",
        floor as string[],
        zones as string[]
      );
    }
  }, [floor, zones, IsToday]);

  const fetchForkliftsData = async () => {
    setLoadingCount((c) => c + 1);
    const requestData = {
      floorIds: floor,
      zoneIds: zones,
      startDate: convertToUTC(selectedStartDate),
      endDate: convertToUTC(selectedEndDate),
    };
    try {
      let forkliftsResponse: any = await fetchForkliftDataService(
        requestData as unknown as IWidgetPayload
      );
      setForkliftsData(forkliftsResponse?.data as IDetectForklifts[]);
      let proximityResponse: any = await fetchProximityForkliftsDataService(
        requestData as unknown as IWidgetPayload
      );
      setProximityForkliftsData(proximityResponse?.data as IDetectForklifts[]);

      const mergedMap = new Map();

      // Add forklifts data
      forkliftsResponse.data.forEach((item: any) => {
        mergedMap.set(item.dateTime, {
          dateTime: item.dateTime,
          forkliftsCount: item.queueCount,
          proximityForkliftsCount: 0,
        });
      });

      // Add or update proximity data
      proximityResponse.data.forEach((item: any) => {
        if (mergedMap.has(item.dateTime)) {
          mergedMap.get(item.dateTime).proximityForkliftsCount =
            item.queueCount;
        } else {
          mergedMap.set(item.dateTime, {
            dateTime: item.dateTime,
            forkliftsCount: 0,
            proximityForkliftsCount: item.queueCount,
          });
        }
      });

      const mergedArray = Array.from(mergedMap.values());
      setDetectForkliftsData(mergedArray);
    } catch (error) {
      console.error("Error fetching forklift detection data:", error);
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
        <DetectForklifts1_1
          forkliftsData={forkliftsData}
          proxomityForkliftsData={proximityForkliftsData}
          customizedWidth={customizedWidth}
          customizedHeight={height}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
        ></DetectForklifts1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <DetectForklifts2_1_Option3
              detectForkliftsCharts={detectForkliftsData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <DetectForklifts2_1_Option2
              detectForkliftsCharts={detectForkliftsData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <DetectForklifts2_1_Option1
              forkliftsData={forkliftsData}
              proxomityForkliftsData={proximityForkliftsData}
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
export { DetectForkliftsWidget };
