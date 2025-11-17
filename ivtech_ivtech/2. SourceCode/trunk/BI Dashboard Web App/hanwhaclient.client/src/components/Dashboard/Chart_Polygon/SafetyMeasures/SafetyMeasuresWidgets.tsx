import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  ISafetyMeasuresData,
  CommonWidgetProps,
  LayoutItem,
  IWidgetPayload,
} from "../../../../interfaces/IChart";
import {
  SafetyMeasures1_1,
  SafetyMeasures2_1_Option1,
  SafetyMeasures2_1_Option2,
  SafetyMeasures2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchSafetyMeasuresDataService } from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const SafetyMeasuresWidgets: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [safetyMeasuresChartData, setSafetyMeasuresChartData] =
    useState<ISafetyMeasuresData[]>();
  const [safetyMeasuresData, setSafetyMeasuresData] =
    useState<ISafetyMeasuresData>();
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  const requestData = {
    floorIds: floor,
    zoneIds: zones,
    startDate: convertToUTC(selectedStartDate),
    endDate: convertToUTC(selectedEndDate),
  };

  useEffect(() => {
    fetchSafetyMeasuresData();
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  useExportHandler({
    apiEndpoint: `${apiUrls.StoppedVehicleCountbyType}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchSafetyMeasuresData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      let response: any = await fetchSafetyMeasuresDataService(
        requestData as IWidgetPayload
      );

      setSafetyMeasuresChartData(response?.data as ISafetyMeasuresData[]);
      let count = getTotalCounts(response?.data);
      setSafetyMeasuresData(count);
    } catch (error) {
      console.error("Error fetching Safety Measures data:", error);
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
      <Box sx={{ height: height, display: "flex" }}>
        <SafetyMeasures1_1
          safetyMeasuresData={safetyMeasuresData}
          safetyMeasuresChartData={safetyMeasuresChartData}
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        ></SafetyMeasures1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <SafetyMeasures2_1_Option3
              safetyMeasuresChartData={safetyMeasuresChartData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <SafetyMeasures2_1_Option2
              safetyMeasuresChartData={safetyMeasuresChartData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <SafetyMeasures2_1_Option1
              safetyMeasuresData={safetyMeasuresData}
              safetyMeasuresChartData={safetyMeasuresChartData}
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
export { SafetyMeasuresWidgets };
