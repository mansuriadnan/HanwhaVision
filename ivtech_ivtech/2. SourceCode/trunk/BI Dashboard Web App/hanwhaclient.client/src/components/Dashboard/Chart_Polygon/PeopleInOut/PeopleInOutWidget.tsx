import React, { useEffect, useRef, useState } from "react";
import {
  IWidgetPayload,
  LayoutItem,
  PVInOutData,
  CommonWidgetProps,
  IPInOutData,
  ISelectedDevicesHeatmap,
} from "../../../../interfaces/IChart";
import {
  peopleVehicleInOutDataService,
  PeopleAvgInOutDataService,
  fetchDevicesByFloorZoneDataService,
} from "../../../../services/dashboardService";
import { Box } from "@mui/material";
import {
  LocalLoader,
  PeopleInOut1_1,
  PeopleInOut2_1_Option1,
  PeopleInOut2_1_Option2,
  PeopleInOut2_1_Option3,
  CommonDialog,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const PeopleInOutWidget: React.FC<CommonWidgetProps> = ({
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
  const [peopleInOutData, setPeopleInOutData] = useState<PVInOutData>();
  const [pInOutData, setPInOutData] = useState<IPInOutData[] | null>(null);
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

  useExportHandler({
    apiEndpoint: `${apiUrls.PeopleInOutCountChart}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    if (size != "1x1") {
      fetchDevicesByFloorZone();
    }
  }, [deivceListforPVCount, floor, zones]);

  useEffect(() => {
    fetchPeopleInOutData();

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

  const fetchPeopleInOutData = async () => {
   setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await peopleVehicleInOutDataService(
        data as IWidgetPayload
      );

      if (response?.data != null) {
        setPeopleInOutData(response?.data as PVInOutData);
      }
    } catch (error) {
      console.error("Error fetching People In Out data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1); // Stop local loader
    }
  };

  const fetchDataAndRender = async (params: IWidgetPayload) => {
   setLoadingCount((c) => c + 1);
    try {
      const response: any = await PeopleAvgInOutDataService(params);

      if (response?.data && response?.data.length > 0) {
        setPInOutData(response?.data as IPInOutData[]);
      } else {
        setPInOutData([]);
      }
    } catch (error) {
      console.error("Error fetching People In out data:", error);
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
      <Box sx={{ display: "flex", height: height }}>
        <PeopleInOut1_1
          inOutValue={peopleInOutData}
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <PeopleInOut2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              pInOutData={pInOutData}
              filetredDevices={filetredDevices}
              OnDeviceChange={handleDeviceChange}
              selectedCamera={selectedCamera}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <PeopleInOut2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              pInOutData={pInOutData}
              filetredDevices={filetredDevices}
              OnDeviceChange={handleDeviceChange}
              selectedCamera={selectedCamera}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <PeopleInOut2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              selectedStartDate={new Date(selectedStartDate)}
              selectedEndDate={new Date(selectedEndDate)}
              pInOutData={pInOutData}
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

export { PeopleInOutWidget };
