import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IWidgetPayload,
  IVQAData,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  ShoppingQueueEvent1_1,
  ShoppingQueueEvent2_1_Option1,
  ShoppingQueueEvent2_1_Option2,
  ShoppingQueueEvent2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchShoppingCartQueueDataService } from "../../../../services/dashboardService";
import { Box } from "@mui/material";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { getLiveData } from "../../../../utils/signalRService";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ShoppingQueueEventWidget: React.FC<CommonWidgetProps> = ({
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
  const [shoppingQueueEventsData, setShoppingQueueEventsData] = useState<
    IVQAData[]
  >([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const [animate, setAnimate] = useState(false);
  const { IsToday, IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  useEffect(() => {
    fetchShoppingCartQueueData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useEffect(() => {
    if (IsToday) {
      getLiveData(
        "ShoppingCartQueueAnalysis",
        floor as string[],
        zones as string[]
      );
    }
  }, [floor, zones, IsToday]);

  useExportHandler({
    apiEndpoint: `${apiUrls.ShoppingCartQueueAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate as Date),
    endDate: convertDateToISOLikeString(selectedEndDate as Date),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchShoppingCartQueueData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchShoppingCartQueueDataService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setShoppingQueueEventsData(response?.data as IVQAData[]);
      } else {
        setShoppingQueueEventsData([]);
      }
    } catch (error) {
      console.error("Error fetching Shoppting queue event data:", error);
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
      <Box
        sx={{ height: height, display: "flex" }}
        className={animate ? "animate-widget" : ""}
      >
        <ShoppingQueueEvent1_1
          customizedWidth={customizedWidth}
          shoppingQueueEventsData={shoppingQueueEventsData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          floor={floor}
          zones={zones}
          setIsDraggable={setIsDraggable}
          animate={animate}
          setAnimate={setAnimate}
        ></ShoppingQueueEvent1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <ShoppingQueueEvent2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              shoppingQueueEventsData={shoppingQueueEventsData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <ShoppingQueueEvent2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              shoppingQueueEventsData={shoppingQueueEventsData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <ShoppingQueueEvent2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              shoppingQueueEventsData={shoppingQueueEventsData}
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

export { ShoppingQueueEventWidget };
