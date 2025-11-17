import React, { useEffect, useRef, useState } from "react";
import {
  IWidgetPayload,
  LayoutItem,
  PVInOutData,
  CommonWidgetProps,
  IPInOutData,
  ISelectedDevicesHeatmap,
} from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import {
  vehicleInOutDataCountService,
  VehicleAvgInOutDataService,
  fetchDevicesByFloorZoneDataService,
} from "../../../../services/dashboardService";
import {
  LocalLoader,
  VehicleInOut1_1,
  VehicleInOut2_1_Option1,
  VehicleInOut2_1_Option2,
  VehicleInOut2_1_Option3,
  CommonDialog,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import apiUrls from "../../../../constants/apiUrls";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const VehicleInOutWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete,
}) => {
  const {
    width,
    height,
    size,
    expanded,
    displayName,
    deivceListforPVCount,
    chartName,
  } = item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [vehicleInOutData, setVehicleInOutData] = useState<PVInOutData>();
  const [vInOutData, setVInOutData] = useState<IPInOutData[]>();
  const [selectedCamera, setSelectedCamera] = useState(
    "6812332a6d517f8bfff611bb"
  );
  const [loadingCount, setLoadingCount] = useState(0);
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [filetredDevices, setFilteredDevices] = useState<
    ISelectedDevicesHeatmap[]
  >([]);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  const AllCameraOpt = {
    deviceId: "6812332a6d517f8bfff611bb",
    channelNo: 0,
    cameraName: "All Camera",
    floorId: null,
    zoneId: null,
  };

  useEffect(() => {
    fetchDevicesByFloorZone();
  }, [deivceListforPVCount, floor,zones]);

  useEffect(() => {
    fetchVehicleInOutData();

    if (!(size === "1x1" && expanded === "Option1")) {
      const params = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
        deviceId: selectedCamera,
      };
      fetchDataAndRender(params as unknown as IWidgetPayload);
    }
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  useExportHandler({
    apiEndpoint: `${apiUrls.VehicleInOutCountChart}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate as Date),
    endDate: convertDateToISOLikeString(selectedEndDate as Date),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchDevicesByFloorZone = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const param = {
        floorIds: floor,
        zoneIds: zones,
      };

      let response: any = await fetchDevicesByFloorZoneDataService(
        param as unknown as IWidgetPayload
      );

      const filtered = response?.data?.filter(
        (device: ISelectedDevicesHeatmap) =>
          deivceListforPVCount?.some(
            (sel: { deviceId: string; channelNo: number }) =>
              sel.deviceId === device.deviceId &&
              sel.channelNo === device.channelNo
          )
      );

      setFilteredDevices([AllCameraOpt, ...(filtered || [])]);
    } catch (error) {
      console.error("Error fetching device by floor and zone:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const fetchVehicleInOutData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await vehicleInOutDataCountService(
        data as IWidgetPayload
      );

      if (response?.data != null) {
        setVehicleInOutData(response?.data as PVInOutData);
      }
    } catch (error) {
      console.error("Error fetching Vehicle In out data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1); 
    }
  };

  const fetchDataAndRender = async (params: IWidgetPayload) => {
    setLoadingCount((c) => c + 1);
    try {
      const response: any = await VehicleAvgInOutDataService(params);

      // console.log("response in vehicle->", response);

      if (response?.data && response?.data.length > 0) {
        setVInOutData(response?.data as IPInOutData[]);
      } else {
        setVInOutData([]);
      }
    } catch (error) {
      console.error("Error fetching Vehicle In out data::", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };

  const handleDeviceChange = async (event: any) => {
    const selectedDeviceId = event.target.value;
    setSelectedCamera(selectedDeviceId);
    const params = {
      floorIds: floor,
      zoneIds: zones,
      startDate: convertToUTC(selectedStartDate),
      endDate: convertToUTC(selectedEndDate),
      deviceId: selectedDeviceId,
    };

    fetchDataAndRender(params as unknown as IWidgetPayload);
  };

  const handleZoomClick = () => {
    setOpenZoomDialog(true);
  };

  const handleCloseZoom = () => {
    setOpenZoomDialog(false);
  };

  const renderLayout = () => {
    return (
      <Box sx={{ display: "flex", height: height }}>
        <VehicleInOut1_1
          inOutValue={vehicleInOutData}
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <VehicleInOut2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              vInOutData={vInOutData}
              filetredDevices={filetredDevices}
              OnDeviceChange={handleDeviceChange}
              selectedCamera={selectedCamera}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <VehicleInOut2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              vInOutData={vInOutData}
              filetredDevices={filetredDevices}
              OnDeviceChange={handleDeviceChange}
              selectedCamera={selectedCamera}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <VehicleInOut2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              vInOutData={vInOutData}
              filetredDevices={filetredDevices}
              OnDeviceChange={handleDeviceChange}
              selectedCamera={selectedCamera}
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

export { VehicleInOutWidget };
