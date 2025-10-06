import { Box } from "@mui/material";
import {
  CommonWidgetProps,
  IFeatureTypeData,
  IWidgetPayload,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  CameraByFeature1_1,
  CameraByFeature2_1_Option1,
  CameraByFeature2_1_Option2,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { useEffect, useRef, useState } from "react";
import { fetchFeatureTypeDataService } from "../../../../services/dashboardService";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const CameraByFeatureWidget: React.FC<CommonWidgetProps> = ({
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
  const [CameraByFeatureData, setCameraByFeatureData] =
    useState<IFeatureTypeData[]>();
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchCameraByFeatureData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.CameraCountByFeatures}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchCameraByFeatureData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchFeatureTypeDataService(
        data as unknown as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setCameraByFeatureData(response?.data as IFeatureTypeData[]);
      } else {
        setCameraByFeatureData([]);
      }
    } catch (error) {
      console.error("Error fetching camera by feature type data:", error);
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
        <CameraByFeature1_1
          CameraByFeatureData={CameraByFeatureData}
          customizedWidth={customizedWidth}
          customizedHeight={height}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />
        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <CameraByFeature2_1_Option2
              CameraByFeatureData={CameraByFeatureData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
            />
          ) : (
            <CameraByFeature2_1_Option1
              CameraByFeatureData={CameraByFeatureData}
              customizedWidth={customizedWidth}
              customizedHeight={height}
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

export { CameraByFeatureWidget };
