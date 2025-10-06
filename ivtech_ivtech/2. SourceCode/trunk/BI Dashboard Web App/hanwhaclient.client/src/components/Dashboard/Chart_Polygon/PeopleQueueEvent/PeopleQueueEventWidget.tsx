import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { fetchPeopleQueueEventsDataService } from "../../../../services/dashboardService";
import {
  IPeopleQueueEventsData,
  IWidgetPayload,
  LayoutItem,
  CommonWidgetProps,
} from "../../../../interfaces/IChart";
import {
  PeopleQueueEvent1_1,
  PeopleQueueEvent2_1_Option1,
  PeopleQueueEvent2_1_Option2,
  PeopleQueueEvent2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const PeopleQueueEventWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setIsDraggable,
  setExportHandler,
  onLoadComplete,
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const pHeight = height;
  const [peopleQueueEventsData, setPeopleQueueEventsData] =
    useState<IPeopleQueueEventsData[]>();
  // const [peopleQueueEventsCount, setPeopleQueueEventsCount] = useState(0);
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  const requestData = {
    floorIds: floor,
    zoneIds: zones,
    startDate: convertToUTC(selectedStartDate),
    endDate: convertToUTC(selectedEndDate),
  };

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  useEffect(() => {
    fetchPeopleQueueEventsData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (IsToday) {
      getLiveData("PeopleQueueAnalysis", floor as string[], zones as string[]);
    }
  }, [floor, zones, IsToday]);

  useExportHandler({
    apiEndpoint: `${apiUrls.PeopleQueueAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchPeopleQueueEventsData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      let response: any = await fetchPeopleQueueEventsDataService(
        requestData as unknown as IWidgetPayload
      );

      setPeopleQueueEventsData(response?.data as IPeopleQueueEventsData[]);
      // let count = getTotalCounts(response?.data);

      // setPeopleQueueEventsCount(count.queueCount);
    } catch (error) {
      console.error("Error fetching People Queue events data:", error);
      throw error;
    } finally {
     setLoadingCount((c) => c - 1);
    }
  };

  // const getTotalCounts = (data: any) => {
  //   return data.reduce((acc: any, entry: any) => {
  //     Object.keys(entry).forEach((key) => {
  //       if (key !== "dateTime") {
  //         acc[key] = (acc[key] || 0) + entry[key];
  //       }
  //     });
  //     return acc;
  //   }, {});
  // };

  const handleZoomClick = () => {
    setOpenZoomDialog(true);
  };

  const handleCloseZoom = () => {
    setOpenZoomDialog(false);
  };

  const renderLayout = () => {
    return (
      <Box
        sx={{ height: pHeight, display: "flex" }}
        className={animate ? "animate-widget" : ""}
      >
        <PeopleQueueEvent1_1
          // peopleQueueEventsCount={peopleQueueEventsCount}
          customizedWidth={customizedWidth}
          customizedHeight={pHeight}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
        ></PeopleQueueEvent1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <PeopleQueueEvent2_1_Option3
              peopleQueueEventsData={peopleQueueEventsData}
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <PeopleQueueEvent2_1_Option2
              peopleQueueEventsData={peopleQueueEventsData}
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <PeopleQueueEvent2_1_Option1
              peopleQueueEventsData={peopleQueueEventsData}
              customizedWidth={customizedWidth}
              customizedHeight={pHeight}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
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
export { PeopleQueueEventWidget };
