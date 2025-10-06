import { Box } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IWidgetPayload,
  IZoneWisePeopleData,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  ZoneWisePeopleCounting1_1,
  ZoneWisePeopleCounting2_1Option1,
  ZoneWisePeopleCounting2_1Option2,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import { fetchZoneWisePeopleCountingDataService } from "../../../../services/dashboardService";
import apiUrls from "../../../../constants/apiUrls";
import { csvWidgetService } from "../../../../services/reportServices";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const ZoneWisePeopleCountingWidget: React.FC<CommonWidgetProps> = ({
  item,
  floor,
  zones,
  selectedStartDate,
  selectedEndDate,
  setExportHandler,
  setIsDraggable,
  onLoadComplete
}) => {
  const { width, height, size, expanded, displayName, chartName } =
    item as LayoutItem;
  const customizedWidth =
    size === "3x1" ? width / 3 : size === "2x1" ? width / 2 : width;
  const [openZoomDialog, setOpenZoomDialog] = useState(false);
  const [zoneWisePeopleCountingData, setzoneWisePeopleCountingData] = useState<
    IZoneWisePeopleData[]
  >([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();

  useEffect(() => {
    fetchZoneWisePeopleCountingData();
  }, [floor, zones, selectedStartDate, selectedEndDate]);

  useExportHandler({
    apiEndpoint: `${apiUrls.PeopleCountByZones}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  const fetchZoneWisePeopleCountingData = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchZoneWisePeopleCountingDataService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setzoneWisePeopleCountingData(response?.data);
      } else {
        setzoneWisePeopleCountingData([]);
      }
    } catch (error) {
      console.error("Error fetching Zone wise people count data:", error);
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
    // if (
    //   !zoneWisePeopleCountingData ||
    //   zoneWisePeopleCountingData.length === 0
    // ) {
    //   return (
    //     <Box
    //       sx={{
    //         height: height,
    //         width: width,
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       No data found
    //     </Box>
    //   );
    // }
    return (
      <Box sx={{ height: height, display: "flex" }}>
        <ZoneWisePeopleCounting1_1
          customizedWidth={customizedWidth}
          customizedHeight={height}
          zoneWisePeopleCountingData={zoneWisePeopleCountingData}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
        />

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <ZoneWisePeopleCounting2_1Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              zoneWisePeopleCountingData={zoneWisePeopleCountingData}
            />
          ) : (
            <ZoneWisePeopleCounting2_1Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              zoneWisePeopleCountingData={zoneWisePeopleCountingData}
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

export { ZoneWisePeopleCountingWidget };
