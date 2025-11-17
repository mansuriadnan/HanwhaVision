import React, { useEffect, useRef, useState } from "react";
import {
  CapacityUtilizationPeopleDataTypes,
  CommonWidgetProps,
  DateWiseUtilization,
  IWidgetPayload,
  LayoutItem,
  ZoneUtilizationData,
} from "../../../../interfaces/IChart";
import {
  CapacityUtilizationForPeople1_1,
  CapacityUtilizationForPeople2_1_Option1,
  CapacityUtilizationForPeople2_1_Option2,
  CapacityUtilizationForPeople2_1_Option3,
  CapacityUtilizationForPeople2_1_Option4,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { Box } from "@mui/material";
import {
  fetchCapacityUtilizationpPeopleDataService,
  fetchZoneWiseCapacityUtilizationpPeopleDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const CapacityUtilizationForPeopleWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;

  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [capacityUtilizationpPeopleData, setCapacityUtilizationpPeopleData] =
    useState<CapacityUtilizationPeopleDataTypes>();
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.PeopleCapacityUtilization}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const [
    zoneWiseCapacityUtilizationpPeopleData,
    setZoneWiseCapacityUtilizationpPeopleData,
  ] = useState<DateWiseUtilization[]>();
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    fetchCapacityUtilizationpPeopleData();
    fetchZoneWiseCapacityUtilizationpPeopleData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  const getDateWiseUtilization = (
    data: ZoneUtilizationData[]
  ): DateWiseUtilization[] => {
    const utilizationMap: Record<string, number> = {};

    data.forEach((zone) => {
      zone.utilizationData.forEach((entry) => {
        const time = formatDateToConfiguredTimezone(entry.dateTime);
        const count = entry.count < 0 ? 0 : entry.count;
        utilizationMap[time] = (utilizationMap[time] || 0) + count;
      });
    });
    return Object.entries(utilizationMap)
      .map(([dateTime, totalCount]) => ({ dateTime, totalCount }))
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
  };

  const fetchZoneWiseCapacityUtilizationpPeopleData = async () => {
   setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any =
        await fetchZoneWiseCapacityUtilizationpPeopleDataService(
          data as unknown as IWidgetPayload
        );

      const zoneData: ZoneUtilizationData[] = response?.data || [];

      const transformedData = getDateWiseUtilization(zoneData);

      setZoneWiseCapacityUtilizationpPeopleData(transformedData);

    } catch (error) {
      console.error(
        "Error fetching in Capacity Utilization People data:",
        error
      );
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const fetchCapacityUtilizationpPeopleData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchCapacityUtilizationpPeopleDataService(
        data as unknown as IWidgetPayload
      );
      // setCapacityUtilizationpPeopleData(
      //   response?.data as CapacityUtilizationPeopleDataTypes
      // );
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

        setCapacityUtilizationpPeopleData(processedData);
      } else {
        setCapacityUtilizationpPeopleData(undefined);
      }
    } catch (error) {
      console.error(
        "Error fetching in Capacity Utilization People data:",
        error
      );
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);// Stop local loader
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
    //   !capacityUtilizationpPeopleData ||
    //   capacityUtilizationpPeopleData?.totalCapacity === 0
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
        <CapacityUtilizationForPeople1_1
          customizedWidth={customizedWidth}
          customizedHeight={height}
          displayName={displayName}
          capacityUtilizationpPeopleData={capacityUtilizationpPeopleData}
          DateWiseUtilization={
            zoneWiseCapacityUtilizationpPeopleData &&
            zoneWiseCapacityUtilizationpPeopleData
          }
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        ></CapacityUtilizationForPeople1_1>

        {size === "2x1" &&
          (expanded === "Option4" ? (
            <CapacityUtilizationForPeople2_1_Option4
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              capacityUtilizationpPeopleData={capacityUtilizationpPeopleData}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option3" ? (
            <CapacityUtilizationForPeople2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              DateWiseUtilization={
                zoneWiseCapacityUtilizationpPeopleData &&
                zoneWiseCapacityUtilizationpPeopleData
              }
              capacityUtilizationpPeopleData={capacityUtilizationpPeopleData}
            />
          ) : expanded === "Option2" ? (
            <CapacityUtilizationForPeople2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              DateWiseUtilization={
                zoneWiseCapacityUtilizationpPeopleData &&
                zoneWiseCapacityUtilizationpPeopleData
              }
              capacityUtilizationpPeopleData={capacityUtilizationpPeopleData}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <CapacityUtilizationForPeople2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              capacityUtilizationpPeopleData={capacityUtilizationpPeopleData}
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
      { loadingCount > 0 && !IsDisplayLoader ? (
        <LocalLoader width={width} height={height} size={50} color="warning" />
      ) : (
        <>
          {renderLayout()}
          <CommonDialog
            open={openZoomDialog}
            title={"Expanded View"}
            onCancel={handleCloseZoom}
            maxWidth={"lg"}
            customClass={"widget_popup"}
            content={renderLayout()}
            isWidget={true}
          />
        </>
      )}
    </>
  );
};

export { CapacityUtilizationForPeopleWidget };
