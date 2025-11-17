import React, { useEffect, useRef, useState } from "react";
import {
  IAveragePeopleCountChartData2,
  IAveragePeopleCountData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import {
  fetchAveragePeopleCountChartDataService,
  fetchAveragePeopleCountDataService,
} from "../../../../services/dashboardService";
import {
  AveragePeopleCount1_1,
  AveragePeopleCount2_1_Option1,
  AveragePeopleCount2_1_Option2,
  AveragePeopleCount3_1_Option1,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useSignalRContext } from "../../../../context/SignalRContext";

const AveragePeopleCountWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete,
}) => {
  const [averagePeopleCountData, setAveragePeopleCountData] =
    useState<IAveragePeopleCountData>();
  const [averagePeopleCountChartData, setAveragePeopleCountChartData] =
    useState<IAveragePeopleCountChartData2[] | null>(null);
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const pHeight = height;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchAveragePeopleCountData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  const fetchAveragePeopleCountData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor || [],
        zoneIds: zones || [],
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };
      const response: any = await fetchAveragePeopleCountDataService(
        data as unknown as IWidgetPayload
      );

      setAveragePeopleCountData(response?.data as IAveragePeopleCountData);
      const responseChart: any = await fetchAveragePeopleCountChartDataService(
        data as unknown as IWidgetPayload
      );

      setAveragePeopleCountChartData(
        responseChart?.data as IAveragePeopleCountChartData2[]
      );
    } catch (error) {
      console.error("Error fetching Average People Count data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);; // Stop local loader
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
      <Box sx={{ height: pHeight, display: "flex" }}>
        <AveragePeopleCount1_1
          APCData={averagePeopleCountData}
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
          floor={floor}
          zones={zones}
          startDate={new Date(selectedStartDate)}
          endDate={new Date(selectedEndDate)}
          setExportHandler={setExportHandler}
        ></AveragePeopleCount1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <AveragePeopleCount2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              averagePeopleCountChartData={averagePeopleCountChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <AveragePeopleCount2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              averagePeopleCountChartData={averagePeopleCountChartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ))}
        {size === "3x1" && (
          <AveragePeopleCount3_1_Option1
            APCData={averagePeopleCountData}
            customizedWidth={size === "3x1" ? `${(width / 3) * 2}px` : width}
            customizedHeight={pHeight}
            startDate={new Date(selectedStartDate)}
            endDate={new Date(selectedEndDate)}
            floor={floor}
            zones={zones}
            setExportHandler={setExportHandler}
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

export { AveragePeopleCountWidget };
