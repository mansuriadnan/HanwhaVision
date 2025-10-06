import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import {
  ITrafficJamByDayProps,
  IParsedDataWithCategory,
  ParsedDataFormat,
} from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import {
  getLiveData,
  onReceiveMessage,
} from "../../../../utils/signalRService";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { useThemeContext } from "../../../../context/ThemeContext";
interface minmaxItem {
  date: string;
  totalQueueCount: number;
}

const TrafficJambyDay1_1: React.FC<ITrafficJamByDayProps> = ({
  floor,
  zones,
  customizedWidth,
  TrafficJamData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
  startDate,
  endDate,
  animate,
  setAnimate
}) => {
  const totalQueueCount = useMemo(
    () => TrafficJamData?.reduce((sum, item) => sum + item.queueCount, 0) ?? 0,
    [TrafficJamData]
  );
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [finalData, setFinalData] = useState<ParsedDataFormat[]>([]);
  const [finalCount, setFinalCount] = useState<number>(totalQueueCount);
  const [ruleName, setRuleName] = useState<string>();
  const [maxItem, setMaxItem] = useState<minmaxItem>();
  const [minItem, setMinItem] = useState<minmaxItem>();
  const { theme } = useThemeContext();

  useEffect(() => {
    // getLiveData("TrafficJamDetection", floor as string[], zones as string[]);

    const handleSignalRMessage = (data:any) => {
      var liveData = JSON.parse(data);

      if (liveData && liveData?.state === true) {
        setAnimate?.(true);
        setFinalCount((prevCount) => prevCount + 1);
        setRuleName(liveData?.RuleName);
      }
    };
    onReceiveMessage("TrafficJamDetection", handleSignalRMessage);
  }, [floor, zones]);

  useEffect(() => {
    if (!TrafficJamData) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["TJData"] = TrafficJamData.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime)),
      value: d.queueCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [TrafficJamData]);

  useEffect(() => {
    processQueueData(finalData as ParsedDataFormat[]);
  }, [finalData]);

  const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

  const processQueueData = (data: ParsedDataFormat[]) => {
    const groupedMap: Record<string, number> = {};

    data?.forEach(({ date, value }) => {
      const tempdate = formatDate(new Date(date));
      if (!groupedMap[tempdate]) {
        groupedMap[tempdate] = 0;
      }
      groupedMap[tempdate] += value;
    });

    const groupedArray = Object.entries(groupedMap).map(
      ([date, totalQueueCount]) => ({
        date,
        totalQueueCount,
      })
    );

    let max: minmaxItem | undefined = undefined;

    if (groupedArray.length > 0) {
      max = groupedArray.reduce((prev, curr) =>
        curr.totalQueueCount > prev.totalQueueCount ? curr : prev
      );
    }

    setMaxItem(max as minmaxItem);

    let min: minmaxItem | undefined = undefined;

    const nonZeroItems = groupedArray.filter(
      (item) => item.totalQueueCount > 0
    );

    if (nonZeroItems.length > 0) {
      min = nonZeroItems.reduce((prev, curr) =>
        curr.totalQueueCount < prev.totalQueueCount ? curr : prev
      );
    }

    setMinItem(min as minmaxItem);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
            <div className="taffic-jam-by-day">
              <Box className="taffic-jam-by-day-mian-counter">
                <Typography variant="h4" fontWeight="bold" color="orange">
                  {formatNumber(finalCount)}
                </Typography>
              </Box>

              <Box className="taffic-jam-by-day-counter">
                <Grid>
                  <Grid item>
                    <Typography variant="h4">
                      Min:{" "}
                      {minItem && formatNumber(minItem?.totalQueueCount ?? 0)}
                    </Typography>
                    <Typography variant="h6">
                      {minItem && minItem.date}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h4">
                      Max:{" "}
                      {maxItem && formatNumber(maxItem?.totalQueueCount ?? 0)}
                    </Typography>
                    <Typography variant="h6">
                      {maxItem && maxItem.date}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box className="taffic-jam-by-day-transparent">
                <Box className="taffic-jam-by-day-i">
                  <img
                    src="/images/dashboard/stop-sign.gif"
                    alt="Traffic Jam"
                  />
                  <Typography>Traffic Jam</Typography>
                </Box>
                <Box className="taffic-jam-by-day-details">
                  <Typography variant="h6">
                    {ruleName ? ruleName : "No recent trafic jam"}
                  </Typography>
                  <Typography>{ruleName ? getCurrentTime() : ""}</Typography>
                </Box>
                {/* <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    padding: 0,
                  }}
                >
                  <img
                    src="/images/dashboard/close-circle.svg"
                    alt="Close"
                    style={{ width: 20, height: 20 }}
                  />
                </IconButton> */}
              </Box>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total no of vehicle queue : </Typography>
            <span> {formatNumber(finalCount)}</span>
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
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnTrafficJambyDay">
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
      <Box sx={{ display: "none" }}>
        {parsedDataWithCategory && (
          <ChartTicksSelector
            startDate={startDate as Date}
            endDate={endDate as Date}
            parsedDataWithCategory={parsedDataWithCategory}
            operation="sum"
            chartTicksChange={(data) => {
              // console.log("data")
            }}
            onChartDataChange={(result) => {
              setFinalData(result?.["TJData"] as ParsedDataFormat[]);
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export { TrafficJambyDay1_1 };
