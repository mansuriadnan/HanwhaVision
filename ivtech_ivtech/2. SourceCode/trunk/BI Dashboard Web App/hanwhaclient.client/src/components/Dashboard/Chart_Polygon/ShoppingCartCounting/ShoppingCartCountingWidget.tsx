import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IAnalysisData,
  IWidgetPayload,
  LayoutItem,
} from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import {
  ShoppingCartCounting1_1,
  ShoppingCartCounting2_1_Option1,
  ShoppingCartCounting2_1_Option2,
  ShoppingCartCounting2_1_Option3,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import {
  fetchPedestrianAnalysisDataService,
  fetchShoppingCartCountingDataService,
} from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ShoppingCartCountingWidget: React.FC<CommonWidgetProps> = ({
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
  const [ShoppingCartData, setShoppingCartData] = useState<IAnalysisData[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchShoppingCartCountingData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.ShoppingCartCountAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchShoppingCartCountingData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchShoppingCartCountingDataService(
        data as unknown as IWidgetPayload
      );

      //temporary call this API above is right
      // const response: any = await fetchPedestrianAnalysisDataService(
      //   data as IWidgetPayload
      // );
      if (response?.data.length > 0) {
        setShoppingCartData(response?.data as IAnalysisData[]);
      } else {
        setShoppingCartData([]);
      }
    } catch (error) {
      console.error("Error fetching in Shopping Cart Counting data:", error);
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
        <ShoppingCartCounting1_1
          customizedWidth={customizedWidth}
          customizedHeight={height}
          ShoppingCartData={ShoppingCartData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? (
            <ShoppingCartCounting2_1_Option3
              customizedWidth={customizedWidth}
              customizedHeight={height}
              ShoppingCartData={ShoppingCartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : expanded === "Option2" ? (
            <ShoppingCartCounting2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              ShoppingCartData={ShoppingCartData}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <ShoppingCartCounting2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              ShoppingCartData={ShoppingCartData}
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

export { ShoppingCartCountingWidget };
