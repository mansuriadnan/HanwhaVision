import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { IDetectForkliftsProps } from "../../../../interfaces/IChart";
// import Detect_Forklifts_1_1_Icon from "../../../../../public/images/Detect_Forklifts_1_1.svg";
// import Proximity_Forklifts_1_1_Icon from "../../../../../public/images/Proximity_Forklifts_1_1.svg";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { useThemeContext } from "../../../../context/ThemeContext";

const DetectForklifts1_1: React.FC<IDetectForkliftsProps> = ({
  floor,
  zones,
  forkliftsData,
  proxomityForkliftsData,
  customizedWidth,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  animate,
  setAnimate
}) => {
  const totalQueueCount = useMemo(
    () =>
      proxomityForkliftsData?.reduce((sum, item) => sum + item.queueCount, 0) ??
      0,
    [proxomityForkliftsData]
  );

  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const [detectForklifts, setDetectForklifts] = useState(0);
  // const [proximityDetections, setProximityDetections] = useState(0);
  // const [totalDetections, setTotalDetections] = useState(0);
  const { theme } = useThemeContext();
  useEffect(() => {
    // getLiveData("ForkliftProximityDetection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data:any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
      }
    };
    onReceiveMessage("ForkliftProximityDetection", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    type ForkliftDataItem = {
      dateTime: string;
      queueCount: number;
    };

    const maxPerDate: Record<string, ForkliftDataItem> = {};

    forkliftsData?.forEach((item) => {
      const date = item.dateTime.split("T")[0];
      if (
        !maxPerDate[date] ||
        new Date(item.dateTime) > new Date(maxPerDate[date].dateTime)
      ) {
        maxPerDate[date] = item;
      }
    });

    // Step 2: Sum the queueCounts of those max datetime entries
    const total = Object.values(maxPerDate).reduce(
      (sum, item: any) => sum + item.queueCount,
      0
    );
    // let pTotal = getTotalCounts(proxomityForkliftsData ?? []);
    setDetectForklifts(total);
    // setProximityDetections(pTotal);
    // setTotalDetections(total + pTotal);
  }, [forkliftsData, proxomityForkliftsData]);

  // const getTotalCounts = (data: any[]) => {
  //   if (!data) return 0;

  //   return data.reduce((sum: number, entry: any) => {
  //     let entryTotal = 0;
  //     Object.keys(entry).forEach((key) => {
  //       if (key !== "dateTime") {
  //         entryTotal += entry[key];
  //       }
  //     });
  //     return sum + entryTotal;
  //   }, 0);
  // };

  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body">
          <div className="widget-data-wrapper">
            <div className="detect-forklift new-total-visitors">
              <div className="new-total-visitors-details">
                {/* Detect Forklifts */}
                <div>
                  <img src={"/images/Detect_Forklifts_1_1.svg"} />
                  <Typography>Detect Forklifts</Typography>

                  <h6>{formatNumber(detectForklifts)}</h6>
                </div>

                {/* Proximity Detection */}
                <div>
                  <img src={"/images/Proximity_Forklifts_1_1.svg"} />
                  <Typography>Proximity detection</Typography>
                  <h6>{formatNumber(finalCount)}</h6>
                </div>
              </div>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no fo detect forklifts : </Typography>
            <span> {formatNumber(detectForklifts)}</span>
          </Box>
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onMouseEnter={() => setIsDraggable?.(true)}
              onMouseLeave={() => setIsDraggable?.(false)}
            >
              <img
                src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}

          {!openZoomDialog ? (
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnDetecForklifts">
              <img
                src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export { DetectForklifts1_1 };
