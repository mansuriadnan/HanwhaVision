import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  ISeriesData,
  IWidgetPayload,
  LayoutItem,
} from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import {
  ModaltypesWidget1_1,
  ModaltypesWidget2_1_Option1,
  ModaltypesWidget2_1_Option2,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchModalTypesDataService } from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ModaltypesWidget: React.FC<CommonWidgetProps> = ({
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
  const [modalTypesData, setModalTypesData] = useState<ISeriesData[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
   const { IsDisplayLoader } = useSignalRContext();

  const colorMap: Record<string, string> = {
    "P Series": "#ea67ff",
    "X Series": "#ffd700",
    "Q Series": "#d6ff99",
    "T Series": "#6aaaff",
    "A-Series": "#c0a9ff",
    "AI Box": "#c0a9ff",
    Others: "#d3d3d3",
  };
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");

  useEffect(() => {
    fetchModalTypesData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.CameraCountByModel}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchModalTypesData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchModalTypesDataService(
        data as unknown as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setModalTypesData(response?.data as ISeriesData[]);
      } else {
        setModalTypesData([]);
      }
    } catch (error) {
      console.error("Error fetching Model type data:", error);
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
    if (!modalTypesData || modalTypesData.length === 0) {
      return (
        <Box
          sx={{
            height: height,
            width: width,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No data found
        </Box>
      );
    }
    return (
      <Box sx={{ height: height, display: "flex" }}>
        <ModaltypesWidget1_1
          modalTypesData={modalTypesData}
          customizedWidth={customizedWidth}
          customizedHeight={height}
          colorMap={colorMap}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <ModaltypesWidget2_1_Option2
              modalTypesData={modalTypesData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              colorMap={colorMap}
            />
          ) : (
            <ModaltypesWidget2_1_Option1
              modalTypesData={modalTypesData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
              colorMap={colorMap}
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

export { ModaltypesWidget };
