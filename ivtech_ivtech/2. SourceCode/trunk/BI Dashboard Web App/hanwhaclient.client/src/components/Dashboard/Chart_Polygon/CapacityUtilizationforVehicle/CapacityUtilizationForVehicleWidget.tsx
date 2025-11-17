import React, { useEffect, useRef, useState } from "react";
import {
  CapacityUtilizationPeopleDataTypes,
  CommonWidgetProps,
  DateWiseUtilization,
  IWidgetPayload,
  LayoutItem,
  ZoneUtilizationData,
} from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import {
  CapacityUtilizationForVehicle1_1,
  CapacityUtilizationForVehicle2_1Option1,
  CapacityUtilizationForVehicle2_1Option2,
  CapacityUtilizationForVehicle2_1Option3,
  CapacityUtilizationForVehicle2_1Option4,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import {
  fetchCapacityUtilizationVehicleDataService,
  fetchZoneWiseCapacityUtilizationVehicleDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const CapacityUtilizationForVehicleWidget: React.FC<CommonWidgetProps> = ({
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
  const [CUForVehicleData, setCUForVehicleData] =
    useState<CapacityUtilizationPeopleDataTypes>();
  const [
    zoneWiseCapacityUtilizationVehicleData,
    setZoneWiseCapacityUtilizationVehicleData,
  ] = useState<DateWiseUtilization[]>([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchCapacityUtilizationVehicleData();
    fetchZoneWiseCapacityUtilizationVehicleData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.VehicleCapacityUtilization}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchCapacityUtilizationVehicleData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchCapacityUtilizationVehicleDataService(
        data as IWidgetPayload
      );
      // if (response?.data) {

      //   setCUForVehicleData(
      //     response?.data as CapacityUtilizationPeopleDataTypes
      //   );
      // }

      if (response?.data) {
        const rawData = response.data as CapacityUtilizationPeopleDataTypes;

        // ✅ Replace negative values with 0
        const processedData: CapacityUtilizationPeopleDataTypes = {
          ...rawData,
          utilization: rawData.utilization < 0 ? 0 : rawData.utilization,
          percentage: rawData.percentage < 0 ? 0 : rawData.percentage,
          totalCapacity: rawData.totalCapacity < 0 ? 0 : rawData.totalCapacity,
          utilizationMostLeastDay: {
            ...rawData.utilizationMostLeastDay,
            mostDayUtilization:
              rawData.utilizationMostLeastDay?.mostDayUtilization < 0
                ? 0
                : rawData.utilizationMostLeastDay?.mostDayUtilization,
            leastDayUtilization:
              rawData.utilizationMostLeastDay?.leastDayUtilization < 0
                ? 0
                : rawData.utilizationMostLeastDay?.leastDayUtilization,
          },
        };

        setCUForVehicleData(processedData);
      } else {
        setCUForVehicleData(undefined);
      }
    } catch (error) {
      console.error(
        "Error fetching Capacity UtilizaionData for Vehicle data:",
        error
      );
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const getDateWiseUtilization = (
    data: ZoneUtilizationData[]
  ): DateWiseUtilization[] => {
    const utilizationMap: Record<string, number> = {};

    data.forEach((zone) => {
      zone.utilizationData.forEach((entry) => {
        const time = formatDateToConfiguredTimezone(entry.dateTime);
        utilizationMap[time] = (utilizationMap[time] || 0) + entry.count;
      });
    });

    return Object.entries(utilizationMap)
      .map(([dateTime, totalCount]) => ({ dateTime, totalCount }))
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
  };

  const fetchZoneWiseCapacityUtilizationVehicleData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any =
        await fetchZoneWiseCapacityUtilizationVehicleDataService(
          data as unknown as IWidgetPayload
        );

      const zoneData: ZoneUtilizationData[] = response?.data || [];

      const transformedData = getDateWiseUtilization(zoneData);
      setZoneWiseCapacityUtilizationVehicleData(transformedData);
    } catch (error) {
      console.error(
        "Error fetching Zone wise Capacity UtilizaionData for Vehicle data:",
        error
      );
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
    // if (!CUForVehicleData || CUForVehicleData?.totalCapacity === 0) {
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
        <CapacityUtilizationForVehicle1_1
          customizedWidth={customizedWidth}
          customizedHeight={height}
          CUForVehicleData={CUForVehicleData}
          DateWiseUtilization={
            zoneWiseCapacityUtilizationVehicleData &&
            zoneWiseCapacityUtilizationVehicleData
          }
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option4" ? (
            <CapacityUtilizationForVehicle2_1Option4
              customizedWidth={customizedWidth}
              customizedHeight={height}
              CUForVehicleData={CUForVehicleData}
            />
          ) : expanded === "Option3" ? (
            <CapacityUtilizationForVehicle2_1Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              DateWiseUtilization={zoneWiseCapacityUtilizationVehicleData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              CUForVehicleData={CUForVehicleData}
            />
          ) : expanded === "Option2" ? (
            <CapacityUtilizationForVehicle2_1Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              DateWiseUtilization={zoneWiseCapacityUtilizationVehicleData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              CUForVehicleData={CUForVehicleData}
            />
          ) : (
            <CapacityUtilizationForVehicle2_1Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              CUForVehicleData={CUForVehicleData}
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

export { CapacityUtilizationForVehicleWidget };
