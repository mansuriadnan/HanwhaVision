import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  IAverageVehicleCountChartData,
  IAverageVehicleCountData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import {
  fetchAverageVehicleChartDataService,
  fetchAverageVehicleCountDataService,
} from "../../../../services/dashboardService";
import {
  AverageVehicleCount1_1,
  AverageVehicleCount2_1_Option1,
  AverageVehicleCount2_1_Option2,
  AverageVehicleCount2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";

const AverageVehicleCountWidget: React.FC<CommonWidgetProps> = ({
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
  const [averageVehicleCountData, setAverageVehicleCountData] =
    useState<IAverageVehicleCountData>();
  const [averageVehicleCountChartData, setAverageVehicleCountChartData] =
    useState<IAverageVehicleCountChartData[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  let data = {
    floorIds: floor || [],
    zoneIds: zones || [],
    startDate: convertToUTC(selectedStartDate),
    endDate: convertToUTC(selectedEndDate),
  };

  useEffect(() => {
    fetchAveragePeopleCountData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  const fetchAveragePeopleCountData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const response: any = await fetchAverageVehicleCountDataService(
        data as unknown as IWidgetPayload
      );

      setAverageVehicleCountData(response?.data as IAverageVehicleCountData);

      let responseChart: any = await fetchAverageVehicleChartDataService(
        data as unknown as IWidgetPayload
      );

      setAverageVehicleCountChartData(
        responseChart?.data as IAverageVehicleCountChartData[]
      );
    } catch (error) {
      console.error("Error fetching Average vehicle count data:", error);
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
      <Box sx={{ height: height, display: "flex" }}>
        <AverageVehicleCount1_1
          AVCData={averageVehicleCountData}
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
          startDate={new Date(selectedStartDate)}
          endDate={new Date(selectedEndDate)}
          floor={floor}
          zones={zones}
          setExportHandler={(handler) => setExportHandler(handler)}
        ></AverageVehicleCount1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <AverageVehicleCount2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              averageVehicleCountChartData={averageVehicleCountChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={(handler) => setExportHandler(handler)}
            />
          ) : expanded === "Option2" ? (
            <AverageVehicleCount2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              AVCData={averageVehicleCountData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={(handler) => setExportHandler(handler)}
            />
          ) : (
            <AverageVehicleCount2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              AVCData={averageVehicleCountData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={(handler) => setExportHandler(handler)}
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

export { AverageVehicleCountWidget };
