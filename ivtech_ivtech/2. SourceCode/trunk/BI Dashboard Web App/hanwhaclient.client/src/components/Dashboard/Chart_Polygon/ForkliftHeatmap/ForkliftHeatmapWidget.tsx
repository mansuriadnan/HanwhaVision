import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  IHeatmapData,
  IHeatmapPayload,
  ISelectedDevicesHeatmap,
  IWidgetPayload,
  LayoutItem,
  IWidgetRequestProps,
} from "../../../../interfaces/IChart";
import {
  fetchDevicesByFloorZoneDataService,
  fetchHeatmapDatabyDeviceService,
} from "../../../../services/dashboardService";
import { ForkliftHeatmap1_1, LocalLoader, CommonDialog } from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useSignalRContext } from "../../../../context/SignalRContext";

const ForkliftHeatmapWidget: React.FC<IWidgetRequestProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setIsDraggable
}) => {
  const { width, height, size, displayName, deivceListforHeatMap, chartName } =
    item as LayoutItem;
  const customizedWidth = width;
  const [heatmapDatas, setHeatmapDatas] = useState<IHeatmapData>();
  const [filetredDevices, setFilteredDevices] = useState<
    ISelectedDevicesHeatmap[]
  >([]);
  const [selectedDeviceDD, setSelectedDeviceDD] = useState<string>("");
  const requestDeviceData = {
    floorIds: floor,
    zoneIds: zones,
  };
  const [loadingCount, setLoadingCount] = useState(0);
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchDevicesByFloorZone();
  }, [floor, zones, size, deivceListforHeatMap]);

  useEffect(() => {
    if (selectedDeviceDD) {
      fetchHeatmapData(selectedDeviceDD);
    }
  }, [selectedStartDate, selectedEndDate, floor, zones]);

  useEffect(() => {
    if (filetredDevices.length > 0) {
      const first = `${filetredDevices[0].deviceId}-${filetredDevices[0].channelNo}`;
      setSelectedDeviceDD(first);
      fetchHeatmapData(first);
    } else {
      setSelectedDeviceDD("");
      setHeatmapDatas(undefined);
    }
  }, [filetredDevices]);
  const fetchHeatmapData = async (deviceValue: string) => {
    if (!deviceValue) return; // nothing selected

    let parts = deviceValue.split("-");
    setLoadingCount((c) => c + 1);
    try {
      let requestHeatmapData = {
        deviceId: parts[0],
        channelNo: parts[1],
        heatmapType: "ForkliftHeatMap",
        startDate: convertToUTC(selectedStartDate ?? ""),
        endDate: convertToUTC(selectedEndDate ?? ""),
      };

      let response: any = await fetchHeatmapDatabyDeviceService(
        requestHeatmapData as unknown as IHeatmapPayload
      );

      setHeatmapDatas(response.data as IHeatmapData);
    } catch (error) {
      console.error("Error fetching Heatmap data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);
    }
  };
  const handleDropdownChange = (event: any) => {
    const value = event.target.value;
    setSelectedDeviceDD(value);
    fetchHeatmapData(value);
  };
  const fetchDevicesByFloorZone = async () => {
    setLoadingCount((c) => c + 1);
    try {
      let response: any = await fetchDevicesByFloorZoneDataService(
        requestDeviceData as unknown as IWidgetPayload
      );
      //  Filter devices immediately after fetching

      const filtered = response.data?.filter(
        (device: ISelectedDevicesHeatmap) =>
          // selectedDevicesHeatmap?.some(
          //   (sel) =>
          //     sel.deviceId === device.deviceId &&
          //     sel.channelNo === device.channelNo
          // )
          deivceListforHeatMap?.some(
            (sel: { deviceId: string; channelNo: number }) =>
              sel.deviceId === device.deviceId &&
              sel.channelNo === device.channelNo
          )
      );

       if (filtered.length > 0) {
        setFilteredDevices(filtered); // Store the filtered list
      }
      else {
        setFilteredDevices([]);
      }
    } catch (error) {
      console.error("Error fetching forkliftHeatmap data:", error);
      throw error;
    } finally {
       setLoadingCount((c) => c - 1);
    }
  };
  // const handleDropdownChange = async (event: any) => {
  //   setSelectedDeviceDD(event.target.value);
  //   let parts = event.target.value.split("-");
  //   setLocalLoading(true);
  //   try {
  //     let requestHeatmapData = {
  //       deviceId: parts[0],
  //       channelNo: parts[1],
  //       heatmapType: "ForkliftHeatMap",
  //       startDate: convertToUTC(selectedStartDate ?? ""),
  //       endDate: convertToUTC(selectedEndDate ?? ""),
  //     };
  //     let response: any = await fetchHeatmapDatabyDeviceService(
  //       requestHeatmapData as unknown as IHeatmapPayload
  //     );

  //     setHeatmapDatas(response.data as IHeatmapData);
  //   } catch (error) {
  //     console.error("Error fetching forkliftHeatmap data:", error);
  //     throw error;
  //   } finally {
  //     setLocalLoading(false); // Stop local loader
  //   }
  // };
  const handleZoomClick = () => {
    setOpenZoomDialog(true);
  };

  const handleCloseZoom = () => {
    setOpenZoomDialog(false);
  };
  const renderLayout = () => {
    return (
      filetredDevices.length > 0 ?
        <Box sx={{ height: height, display: "flex" }}>
          <ForkliftHeatmap1_1
            key={selectedDeviceDD}
            heatmapData={heatmapDatas}
            customizedWidth={customizedWidth}
            customizedHeight={height}
            displayName={displayName}
            onZoomClick={handleZoomClick}
            openZoomDialog={openZoomDialog}
            onSelectChange={handleDropdownChange}
            filetredDevices={filetredDevices}
            selectedDeviceDD={selectedDeviceDD}
            setIsDraggable={setIsDraggable}
          ></ForkliftHeatmap1_1>
          <Box className="widget-label-bottom" >
            <span>{chartName}</span>
            <img src="/images/question_circle_icon_widget_bottom_title.svg" alt="info Icon" className="widget-label-icon-bottom" />
          </Box>
        </Box>
        :
        <Box
          sx={{
            height: height,
            width: width,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color:"#888"
          }}
        >
          No data found
        </Box>
    );
  };

  return (
    <>
      {loadingCount > 0  && !IsDisplayLoader ? (
        <LocalLoader width={width} height={height} size={50} color="warning" />
      ) : (
        <>
          {renderLayout()}
          <CommonDialog
            open={openZoomDialog}
            title={"Expanded View"}
            onCancel={handleCloseZoom}
            maxWidth={"lg"}
            customClass={"widget_popup cmn-pop-design-parent heatmap-zoom-pop"}
            content={renderLayout()}
            isWidget={true}
          />
        </>
      )}
    </>
  );
};
export { ForkliftHeatmapWidget };
