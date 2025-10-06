import React, { useEffect, useRef, useState } from "react";
import {
  CommonWidgetProps,
  IGenderData,
  IWidgetPayload,
  IGenderDataWithTime,
  LayoutItem,
} from "../../../../interfaces/IChart";
import {
  Gender1_1,
  Gender2_1_Option1,
  Gender2_1_Option2,
  Gender3_1_Option1,
  CommonDialog,
  LocalLoader,
} from "../../../index";
import {
  fetchGenderWisePeopleCountDataService,
  fetchGenderWisePeopleCountDataWithTimeService,
} from "../../../../services/dashboardService";
import { Box } from "@mui/material";
import { convertToUTC } from "../../../../utils/convertToUTC";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { useSignalRContext } from "../../../../context/SignalRContext";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import moment from "moment";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const GenderWidget: React.FC<CommonWidgetProps> = ({
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
  const [genderData, setGenderData] = useState<IGenderData[] | null>([]);
  const [genderDataWithTime, setGenderDataWithTime] = useState<
    IGenderDataWithTime[] | null
  >([]);
  const [loadingCount, setLoadingCount] = useState(0);
  const selectedIntervalNameRef = useRef<string>("");
  const { IsDisplayLoader } = useSignalRContext();
  const [groupbyDateData, setGroupbyDateData] = useState<IGenderDataWithTime[] | null>([]);

  useExportHandler({
    apiEndpoint: `${apiUrls.GenderWisePeopleCountAnalysis}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    // if (size === "2x1" && expanded === "Option2") {
      fetchGenderWisePeopleCountDataWithTime();
    // }

    // fetchGenderWisePeopleCountData();
  }, [floor, zones, selectedStartDate, selectedEndDate, size, expanded]);

  // const fetchGenderWisePeopleCountData = async () => {
  //   setLocalLoading(true);
  //   try {
  //     const data = {
  //       floorIds: floor,
  //       zoneIds: zones,
  //       startDate: convertToUTC(selectedStartDate),
  //       endDate: convertToUTC(selectedEndDate),
  //     };

  //     const response: any = await fetchGenderWisePeopleCountDataService(
  //       data as IWidgetPayload
  //     );

  //     if (response?.data.length > 0) {
  //       setGenderData(response?.data as IGenderData[]);
  //     }else{
  //       setGenderData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching Gender data:", error);
  //     throw error;
  //   } finally {
  //     setLocalLoading(false); // Stop local loader
  //   }
  // };

  const fetchGenderWisePeopleCountDataWithTime = async () => {
    setLoadingCount((c) => c + 1);
    try {
      const data = {
        floorIds: floor,
        zoneIds: zones,
        startDate: convertToUTC(selectedStartDate),
        endDate: convertToUTC(selectedEndDate),
      };

      const response: any = await fetchGenderWisePeopleCountDataWithTimeService(
        data as IWidgetPayload
      );

      if (response?.data.length > 0) {
        setGenderDataWithTime(response?.data as IGenderDataWithTime[]);
            const formattedData = response?.data.map((d) => ({
              ...d,
              // convert ISO string to Date (or keep formatted string if you want)
              date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
            }));
        
            // Group by "yyyy-MM-dd" (ignoring time part)
            const groupedData = formattedData.reduce((acc: any, curr) => {
              const key = moment(curr.date).format("YYYY-MM-DD"); // "2025-08-29"
        
              if (!acc[key]) {
                acc[key] = {
                  date: key,
                  maleCount: curr.maleCount,
                  femaleCount: curr.femaleCount,
                  undefinedCount: curr.undefinedCount,
                };
              } else {
                acc[key].maleCount = Math.max(acc[key].maleCount, curr.maleCount);
                acc[key].femaleCount = Math.max(acc[key].femaleCount, curr.femaleCount);
                acc[key].undefinedCount = Math.max(acc[key].undefinedCount, curr.undefinedCount);
              }
        
              return acc;
            }, {});
        
            // Convert back to array
            const groupedArray = Object.values(groupedData);
            setGroupbyDateData(groupedArray);
        
      }else{
        setGenderDataWithTime([])
        setGroupbyDateData([])
      }
    } catch (error) {
      console.error("Error fetching Gender data:", error);
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
        <Gender1_1
          customizedWidth={customizedWidth}
          displayName={displayName}
          onZoomClick={handleZoomClick}
          openZoomDialog={openZoomDialog}
          setIsDraggable={setIsDraggable}
          genderDataWithTime ={genderDataWithTime}
          groupbyDateData = {groupbyDateData}
        ></Gender1_1>

        {size === "2x1" &&
          (expanded === "Option3" ? null : expanded === "Option2" ? (
            <Gender2_1_Option2
              customizedWidth={customizedWidth}
              customizedHeight={height}
              genderDataWithTime={genderDataWithTime}
              startDate={new Date(selectedStartDate)}
              endDate={new Date(selectedEndDate)}
              floor={floor}
              zones={zones}
              setExportHandler={setExportHandler}
            />
          ) : (
            <Gender2_1_Option1
              customizedWidth={customizedWidth}
              customizedHeight={height}
              genderData={genderData}
              groupbyDateData= {groupbyDateData}
            />
          ))}

        {size === "3x1" &&
          (expanded === "Option1" ? (
            <Gender3_1_Option1
              customizedWidth={773}
              customizedHeight={height}
              genderData={genderData}
            />
          ) : null)}
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

export { GenderWidget };
