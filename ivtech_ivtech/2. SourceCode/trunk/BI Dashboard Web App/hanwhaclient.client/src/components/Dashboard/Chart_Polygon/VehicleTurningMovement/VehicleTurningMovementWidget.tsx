import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IVTurningMovmentData,
  IWidgetPayload,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  VehicleTurningMovement1_1,
  VehicleTurningMovement2_1_Option1,
  VehicleTurningMovement2_1_Option2,
  VehicleTurningMovement2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchVehicleTurningMovementDataService } from "../../../../services/dashboardService";
import { Box } from "@mui/material";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const VehicleTurningMovementWidget: React.FC<CommonWidgetProps> = ({
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
  const [vTurningMovementData, setVTurningMovementData] = useState<
    IVTurningMovmentData[]
  >([]);

  const [vTMBubbleChartData, setVTMBubbleChartData] =
    useState<IVTurningMovmentData>();
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.VehicleTurningMovementAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    fetchVehicleTurningMovementData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  const fetchVehicleTurningMovementData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchVehicleTurningMovementDataService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setVTurningMovementData(response?.data as IVTurningMovmentData[]);

        // const latestPerDate = {};
        const latestPerDate: { [date: string]: IVTurningMovmentData } = {};

        response?.data.forEach((entry: any) => {
          const date = entry.dateTime.split("T")[0];
          if (
            !latestPerDate[date] ||
            new Date(entry.dateTime) > new Date(latestPerDate[date].dateTime)
          ) {
            latestPerDate[date] = entry;
          }
        });

        // Get the list of latest entries
        const latestEntries = Object.values(latestPerDate);

        const total = latestEntries.reduce(
          (sum, entry: any) => {
            sum.left += entry.left;
            sum.right += entry.right;
            sum.straight += entry.straight;
            return sum;
          },
          { left: 0, right: 0, straight: 0 }
        );

        setVTMBubbleChartData(total as IVTurningMovmentData);
      } else {
        setVTurningMovementData([]);
        setVTMBubbleChartData({
          left: 0,
          right: 0,
          straight: 0,
        } as IVTurningMovmentData);
      }
    } catch (error) {
      console.error("Error fetching Vehicle Turning Movements data:", error);
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
        <VehicleTurningMovement1_1
          customizedWidth={customizedWidth}
          vTMBubbleChartData={vTMBubbleChartData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        ></VehicleTurningMovement1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <VehicleTurningMovement2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vTurningMovementData={vTurningMovementData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <VehicleTurningMovement2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vTurningMovementData={vTurningMovementData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <VehicleTurningMovement2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vTMBubbleChartData={vTMBubbleChartData}
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

export { VehicleTurningMovementWidget };
