import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  IStoppedVehicleCountByTypeData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import { fetchStoppedVehicleCountByTypeDataService } from "../../../../services/dashboardService";
import {
  StoppedVehicleCountByType1_1,
  StoppedVehicleCountByType2_1_Option1,
  StoppedVehicleCountByType2_1_Option2,
  StoppedVehicleCountByType2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const StoppedVehicleCountByTypeWidget: React.FC<CommonWidgetProps> = ({
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
  const [
    stoppedVehicleCountByTypeChartData,
    setStoppedVehicleCountByTypeChartData,
  ] = useState<IStoppedVehicleCountByTypeData[]>();

  const [stoppedVehicleCountByTypeData, setStoppedVehicleCountByTypeData] =
    useState<IStoppedVehicleCountByTypeData>();
  const [loadingCount, setLoadingCount] = useState(0);
  const requestData = {
    floorIds: floor,
    zoneIds: zones,
    startDate: convertToUTC(selectedStartDate),
    endDate: convertToUTC(selectedEndDate),
  };
  const selectedIntervalNameRef = useRef<string>("");
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.StoppedVehicleCountbyType}/csv`,
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
    fetchStoppedVehicleCountByTypeData();
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  useEffect(() => {
    if (IsToday) {
      getLiveData(
        "StoppedVehicleDetection",
        floor as string[],
        zones as string[]
      );
    }
  }, [floor, zones, IsToday]);

  const fetchStoppedVehicleCountByTypeData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      let response: any = await fetchStoppedVehicleCountByTypeDataService(
        requestData as unknown as IWidgetPayload
      );
      setStoppedVehicleCountByTypeChartData(
        response?.data as IStoppedVehicleCountByTypeData[]
      );
      let count = getTotalCounts(response?.data);
      setStoppedVehicleCountByTypeData(count);
    } catch (error) {
      console.error("Error fetching Stopped Vehicle by type data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const getTotalCounts = (data: any) => {
    return data.reduce((acc: any, entry: any) => {
      Object.keys(entry).forEach((key) => {
        if (key !== "dateTime") {
          acc[key] = (acc[key] || 0) + entry[key];
        }
      });
      return acc;
    }, {});
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
        <StoppedVehicleCountByType1_1
          stoppedVehicleCountByTypeChartData={
            stoppedVehicleCountByTypeChartData
          }
          stoppedVehicleCountByTypeData={stoppedVehicleCountByTypeData}
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
        ></StoppedVehicleCountByType1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <StoppedVehicleCountByType2_1_Option3
              stoppedVehicleCountByTypeChartData={
                stoppedVehicleCountByTypeChartData
              }
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <StoppedVehicleCountByType2_1_Option2
              stoppedVehicleCountByTypeChartData={
                stoppedVehicleCountByTypeChartData
              }
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <StoppedVehicleCountByType2_1_Option1
              stoppedVehicleCountByTypeChartData={
                stoppedVehicleCountByTypeChartData
              }
              stoppedVehicleCountByTypeData={stoppedVehicleCountByTypeData}
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
export { StoppedVehicleCountByTypeWidget };
