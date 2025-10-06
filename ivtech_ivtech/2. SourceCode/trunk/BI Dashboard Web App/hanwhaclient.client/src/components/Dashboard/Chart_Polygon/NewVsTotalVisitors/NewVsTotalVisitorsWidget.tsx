import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  NewVsTotalVisitors1_1,
  NewVsTotalVisitors2_1_Option1,
  NewVsTotalVisitors2_1_Option2,
  NewVsTotalVisitors2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import {
  INewVsTotalVisitorCountData,
  INewVsTotalVisitorsChartData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import {
  fetchNewVsTotalVisitorDataService,
  fetchNewVsTotalVisitorsChartDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const NewVsTotalVisitorsWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
}) => {
  const [newVsTotalVisitorCountData, setNewVsTotalVisitorCountData] =
    useState<INewVsTotalVisitorCountData>();
  const [newVsTotalVisitorChartData, setNewVsTotalVisitorChartData] =
    useState<INewVsTotalVisitorsChartData[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const pHeight = height;
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchNewVsTotalVisitorData();
    if (size === "2x1") {
      fetchNewVsTotalVisitorchartData();
    }
  }, [floor, zones, selectedStartDate, selectedEndDate, size]);

  useExportHandler({
    apiEndpoint: `${apiUrls.NewVsTotalVisitorsChart}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchNewVsTotalVisitorData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const requestData = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchNewVsTotalVisitorDataService(
        requestData as unknown as IWidgetPayload
      );
      setNewVsTotalVisitorCountData(
        response?.data as INewVsTotalVisitorCountData
      );
    } catch (error) {
      console.error("Error fetching New vs Total data:", error);
      throw error;
    } finally {
      setLoadingCount((c) => c - 1);;
    }
  };

  const fetchNewVsTotalVisitorchartData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const requestData = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const responseChart: any = await fetchNewVsTotalVisitorsChartDataService(
        requestData as unknown as IWidgetPayload
      );

      setNewVsTotalVisitorChartData(
        responseChart?.data as INewVsTotalVisitorsChartData[]
      );
    } catch (error) {
      console.error("Error fetching New vs Total chart data:", error);
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
      <Box sx={{ height: pHeight, display: "flex" }}>
        <NewVsTotalVisitors1_1
          newVsTotalVisitorCountData={newVsTotalVisitorCountData}
          customizedWidth={customizedWidth}
          customizedHeight={pHeight}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        ></NewVsTotalVisitors1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <NewVsTotalVisitors2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              newVsTotalVisitorsChartData={newVsTotalVisitorChartData}
              newVsTotalVisitorCountData={newVsTotalVisitorCountData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <NewVsTotalVisitors2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              newVsTotalVisitorsChartData={newVsTotalVisitorChartData}
              newVsTotalVisitorCountData={newVsTotalVisitorCountData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <NewVsTotalVisitors2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              newVsTotalVisitorCountData={newVsTotalVisitorCountData}
            />
          ))}
        <Box className="widget-label-bottom">
          {chartName}
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
export { NewVsTotalVisitorsWidget };
