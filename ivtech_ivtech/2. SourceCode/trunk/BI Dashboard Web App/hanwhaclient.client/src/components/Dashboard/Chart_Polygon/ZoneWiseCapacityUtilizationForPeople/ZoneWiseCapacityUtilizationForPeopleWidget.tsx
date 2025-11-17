import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IWidgetPayload,
  IZoneWiseCUData,
  LayoutItem,
  ZoneUtilizationData,
} from "../../../../interfaces/IChart";
import {
  ZoneWiseCapacityUtilizationForPeople1_1,
  ZoneWiseCapacityUtilizationForPeople2_1_Option2,
  ZoneWiseCapacityUtilizationForPeople2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { Box } from "@mui/material";
import {
  fetchZoneWiseCapacityUtilizationpPeopleDataService,
  fetchZoneWiseCUPDataSevice,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ZoneWiseCapacityUtilizationForPeopleWidget: React.FC<
  CommonWidgetProps
> = ({
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
    const [ZoneWiseCUData, setZoneWiseCUData] = useState<IZoneWiseCUData[]>([]);
    const [ZoneWiseCUDataWithoutNagativeValue, setZoneWiseCUDataWithoutNagativeValue] = useState<IZoneWiseCUData[]>([]);    
    const [
      zoneWiseCapacityUtilizationpPeopleData,
      setZoneWiseCapacityUtilizationpPeopleData,
    ] = useState<ZoneUtilizationData[]>();

    const [loadingCount, setLoadingCount] = useState(0);
    const selectedIntervalNameRef = useRef<string>("");
    const { IsDisplayLoader } = useSignalRContext();

    useEffect(() => {
      fetchZoneWiseCapacityUtilizationForPeopleData();
      fetchZoneWiseCUPAnalysisData();
    }, [floor, zones, selectedStartDate, selectedEndDate]);

    // console.log(
    //   "ZoneWiseCapacity selectedIntervalNameRef.current = ",
    //   selectedIntervalNameRef.current
    // );

    useExportHandler({
      apiEndpoint: `${apiUrls.PeopleCameraCapacityUtilizationAnalysisByZones}/csv`,
      startDate: convertDateToISOLikeString(selectedStartDate),
      endDate: convertDateToISOLikeString(selectedEndDate),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });

    const fetchZoneWiseCapacityUtilizationForPeopleData = async () => {
      setLoadingCount((c) => c + 1);
      try {
        const data = {
          floorIds: floor,
          zoneIds: zones,
          startDate: convertToUTC(selectedStartDate),
          endDate: convertToUTC(selectedEndDate),
        };

        const response: any = await fetchZoneWiseCUPDataSevice(
          data as IWidgetPayload
        );

        if (response?.data.length > 0) {
          setZoneWiseCUData(response?.data as IZoneWiseCUData[]);
          
          const processedData = (response.data as IZoneWiseCUData[]).map((item) => ({
            ...item,
            utilization: item.utilization < 0 ? 0 : item.utilization,
          }));
          setZoneWiseCUDataWithoutNagativeValue(processedData)
        } else {
          setZoneWiseCUData([]);
          setZoneWiseCUDataWithoutNagativeValue([])
        }
      } catch (error) {
        console.error(
          "Error fetching in Zone Wise Capacity Utilization For People data:",
          error
        );
        throw error;
      } finally {
        setLoadingCount((c) => c - 1);
      }
    };

    const fetchZoneWiseCUPAnalysisData = async () => {
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

        // Assuming this is the structure of response.data
        const zoneData: ZoneUtilizationData[] = response?.data || [];

        const processedData = zoneData.map((zone) => ({
          ...zone,
          utilizationData: zone.utilizationData.map((entry) => ({
            // ...entry,
            dateTime: formatDateToConfiguredTimezone(entry.dateTime),
            count: entry.count < 0 ? 0 : entry.count,
          })),
        }));

        setZoneWiseCapacityUtilizationpPeopleData(processedData)

      } catch (error) {
        console.error(
          "Error fetching in Zone Wise Capacity Utilization For People data:",
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
      // if (!ZoneWiseCUData || ZoneWiseCUData.length === 0) {
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
          {(size === "1x1" || size === "2x1") && (
            <ZoneWiseCapacityUtilizationForPeople1_1
              customizedWidth={
                size === "2x1" && expanded === "Option1"
                  ? customizedWidth * 2 // large width for 2x1 option 1
                  : customizedWidth // small width for only 1x1
              }
              customizedHeight={height}
              ZoneWiseCUData={ZoneWiseCUData}
              displayName={displayName}
              onZoomClick={handleZoomClick}
              openZoomDialog={openZoomDialog}
              setIsDraggable={setIsDraggable}
            />
          )}

          {size === "2x1" && expanded === "Option2" && (
            <ZoneWiseCapacityUtilizationForPeople2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              ZoneWiseCUAnalysisData={zoneWiseCapacityUtilizationpPeopleData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          )}

          {size === "2x1" && expanded === "Option3" && (
            <ZoneWiseCapacityUtilizationForPeople2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              ZoneWiseCUData={ZoneWiseCUDataWithoutNagativeValue}
            />
          )}
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

export { ZoneWiseCapacityUtilizationForPeopleWidget };
