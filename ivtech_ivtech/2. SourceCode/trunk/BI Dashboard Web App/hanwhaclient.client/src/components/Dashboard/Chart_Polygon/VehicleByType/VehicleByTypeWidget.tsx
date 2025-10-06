import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  IVehicleByTypeCountData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import {
  fetchVehicleByTypeCountDataService,
  fetchVehicleByTypeLineChartDataService,
} from "../../../../services/dashboardService";
import {
  VehicleByType1_1,
  VehicleByType2_1_Option1,
  VehicleByType2_1_Option2,
  VehicleByType2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const VehicleByTypeWidget: React.FC<CommonWidgetProps> = ({
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
  const [vehicleByTypeCount, setVehicleByTypeCountData] =
    useState<IVehicleByTypeCountData>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [vehicleDataWithTime, setVehicleDataWithTime] =
    useState<IVehicleByTypeCountData[]>();
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();
  
  useEffect(() => {
    fetchVehicleByTypeData();
    if (size === "2x1" && expanded === "Option2") {
      fetchVehicleByTypeDataWithTime();
    }
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  useExportHandler({
    apiEndpoint: `${apiUrls.VehicleByTypeLineChartData}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler
  });

  const fetchVehicleByTypeData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const requestData = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchVehicleByTypeCountDataService(
        requestData as unknown as IWidgetPayload
      );
      setVehicleByTypeCountData(response?.data as IVehicleByTypeCountData);
    } catch (error) {
      console.error("Error fetching Vehicle by type data:", error);
      throw error;
    } finally {
     setLoadingCount((c) => c - 1);
    }
  };

  const fetchVehicleByTypeDataWithTime = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchVehicleByTypeLineChartDataService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setVehicleDataWithTime(response?.data as IVehicleByTypeCountData[]);
      }else{
        setVehicleDataWithTime([])
      }
    } catch (error) {
      console.error("Error fetching Gender data:", error);
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
        <VehicleByType1_1
          vehicleByTypeCountData={vehicleByTypeCount}
          customizedWidth={customizedWidth}
          customizedHeight={height}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        ></VehicleByType1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <VehicleByType2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vehicleByTypeCountData={vehicleByTypeCount}
            />
          ) : expanded === "Option2" ? (
            <VehicleByType2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vehicleDataWithTime={vehicleDataWithTime}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              vehicleByTypeCountData={vehicleByTypeCount}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <VehicleByType2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              vehicleByTypeCountData={vehicleByTypeCount}
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
  const hasDispatchedRef = useRef(false);

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
export { VehicleByTypeWidget };
