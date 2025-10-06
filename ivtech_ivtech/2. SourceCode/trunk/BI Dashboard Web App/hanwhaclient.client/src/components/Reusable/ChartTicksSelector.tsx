import React, { useEffect, useState } from "react";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import * as d3 from "d3";
import {
  ParsedDataFormat,
  IParsedDataWithCategory,
  IntervalData,
  IChartTicksSelectorPros,
} from "../../interfaces/IChart";
import { useThemeContext } from "../../context/ThemeContext";

export const ChartTicksSelector: React.FC<IChartTicksSelectorPros> = ({
  startDate,
  endDate,
  parsedDataWithCategory,
  operation,
  onChartDataChange,
  chartTicksChange,
}) => {
  const [intervalData, setIntervalData] = useState<IntervalData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<IntervalData | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const [hover, setHover] = useState(false);
   const { theme } = useThemeContext();

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    getDifferenceInMinutes();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedInterval) {
      const xTicks = generateXTicks(
        startDate,
        endDate,
        selectedInterval.tickInterval
      );

      const chartData = ChartTickDataGenerator(
        xTicks,
        parsedDataWithCategory,
        operation,
        selectedInterval.intervalName
      );
      onChartDataChange(chartData);
    }
  }, [selectedInterval]);

  const getDifferenceInMinutes = () => {
    const diffInMs = Math.abs(endDate.getTime() - startDate.getTime());
    const totalMinutes = Math.floor(diffInMs / (1000 * 60));
    const intervals: IntervalData[] = [];

    if (totalMinutes > 1324800) {
      intervals.push({
        intervalName: "Month",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Month"),
      });
    } else if (totalMinutes > 44640) {
      intervals.push({
        intervalName: "Week",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Week"),
      });
      intervals.push({
        intervalName: "Month",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Month"),
      });
    } else if (totalMinutes > 10080) {
      intervals.push({
        intervalName: "Day",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Day"),
      });
      intervals.push({
        intervalName: "Week",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Week"),
      });
    } else if (totalMinutes > 1440) {
      intervals.push({
        intervalName: "Day",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Day"),
      });
      intervals.push({
        intervalName: "12 Hours",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "12 Hours"),
      });
      intervals.push({
        intervalName: "6 Hours",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "6 Hours"),
      });
    } else if (totalMinutes > 720) {
      intervals.push({
        intervalName: "Hour",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Hour"),
      });
    } else if (totalMinutes > 360) {
      intervals.push({
        intervalName: "Hour",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "Hour"),
      });
    } else if (totalMinutes > 180) {
      intervals.push({
        intervalName: "15 Minutes",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "15 Minutes"),
      });
      intervals.push({
        intervalName: "30 Minutes",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "30 Minutes"),
      });
    } else {
      intervals.push({
        intervalName: "15 Minutes",
        tickInterval: dateRangeToTicksCount([startDate, endDate], "15 Minutes"),
      });
    }

    setIntervalData(intervals);
    // setSelectedInterval(intervals[0]);
    // chartTicksChange?.(intervals[0]);
    const matchingPrevious = intervals.find(
      (i) => i.intervalName === selectedInterval?.intervalName
    );

    if (matchingPrevious) {
      setSelectedInterval(matchingPrevious);
      chartTicksChange?.(matchingPrevious);
    } else {
      setSelectedInterval(intervals[0]);
      chartTicksChange?.(intervals[0]);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectChange = (value: IntervalData) => {
    setSelectedInterval(value);
    chartTicksChange?.(value);
    handleMenuClose();
  };

  const generateXTicks = (
    start: Date,
    end: Date,
    tickCount: number
  ): Date[] => {
    const scale = d3.scaleTime().domain([start, end]);
    var xTick = scale.ticks(tickCount);
    if (xTick.length === 1) {
      return [xTick[0], end];
    }
    return xTick;
  };

  const ChartTickDataGenerator = (
    xTicks: Date[],
    parsedDataWithCategory: IParsedDataWithCategory,
    operation: "sum" | "max" | "avg",
    selectedIntervalType: string
  ) => {
    var results: IParsedDataWithCategory = {};

    Object.keys(parsedDataWithCategory).forEach((key) => {
      var parsedData: ParsedDataFormat[] = [];
      parsedData = parsedDataWithCategory[key];

      var newData: Date[] = [];
      if (xTicks.length === 0 || !parsedData) return newData;
      if (xTicks.length === 1) {
        let filteredDataTemp: ParsedDataFormat[] = [];
        var filteredDataByTick = parsedData.filter((x) => x.date <= xTicks[0]); //.map((d) => ({ date: d.date, value: d.value }));

        let tickData: number = 0;
        if (operation === "max") {
          tickData = Math.max(...filteredDataByTick.map((x) => x.value));
        } else if (operation === "sum") {
          tickData = filteredDataByTick.reduce((sum, x) => sum + x.value, 0);
        }

        filteredDataTemp.push({ date: xTicks[0], value: tickData });

        results[key] = filteredDataTemp;
        return results;
        // return parsedData.map((d) => ({ date: d.date, value: d.value }));
      }

      var dataPoints = 1;

      if (xTicks.length >= 2) {
        dataPoints = dateRangeToTicksCount(xTicks, selectedIntervalType);
      }

      const startDateExists = xTicks.some(
        (d) => d.getTime() === startDate.getTime()
      );
      if (!startDateExists) {
        xTicks = [startDate, ...xTicks];
      }

      const endDateExists = xTicks.some(
        (d) => d.getTime() === endDate.getTime()
      );
      if (!endDateExists) {
        xTicks.push(endDate);
      }

      for (let i = 0; i < xTicks.length - 1; i++) {
        var difference = xTicks[i + 1].getTime() - xTicks[i].getTime();
        dataPoints = dateRangeToTicksCount(
          [xTicks[i + 1], xTicks[i]],
          selectedIntervalType
        );
        var differenceStep = difference / dataPoints;
        var lastValue = xTicks[i].getTime();
        newData.push(xTicks[i]);
        for (let j = 0; j < dataPoints - 1; j++) {
          lastValue += differenceStep;
          newData.push(new Date(lastValue));
        }
      }

      newData.push(xTicks[xTicks.length - 1]);
      let minDate = new Date(
        Math.min(...parsedData.map((x) => x.date.getTime()))
      );

      let filteredData: ParsedDataFormat[] = [];

      for (let i = 0; i < newData.length - 1; i++) {
        const start = newData[i];
        const end = newData[i + 1];
        const intervalData = parsedData.filter(
          (x) => x.date >= start && x.date < end
        );
        if (intervalData.length > 0) {
          // var tickData: number;
          let tickData: number = 0;
          if (operation === "max") {
            tickData = Math.max(...intervalData.map((x) => x.value));
          } else if (operation === "sum") {
            tickData = intervalData.reduce((sum, x) => sum + x.value, 0);
          } else if (operation === "avg") {
            tickData =
              intervalData.length > 0
                ? intervalData.reduce((sum, x) => sum + x.value, 0) /
                  intervalData.length
                : 0;
          }
          filteredData.push({ date: start, value: tickData });
        } else {
          filteredData.push({ date: start, value: 0 });
        }
      }
      // newData.forEach((d) => {
      //   const ticksIntervalData = parsedData.filter(
      //     (x) => x.date >= minDate && x.date < d
      //   );
      //   if (ticksIntervalData.length > 0) {
      //     // var tickData: number;
      //     let tickData: number = 0;
      //     if (operation === "max") {
      //       tickData = Math.max(...ticksIntervalData.map((x) => x.value));
      //     } else if (operation === "sum") {
      //       tickData = ticksIntervalData.reduce((sum, x) => sum + x.value, 0);
      //     } else if (operation === "avg") {
      //       tickData = ticksIntervalData.length > 0
      //         ? ticksIntervalData.reduce((sum, x) => sum + x.value, 0) / ticksIntervalData.length
      //         : 0;
      //     }

      //     minDate = d;
      //     filteredData.push({ date: d, value: tickData });
      //   } else {
      //     filteredData.push({ date: d, value: 0 });
      //   }
      //   minDate = d;
      // });

      results[key] = filteredData;
    });

    return results;
  };

  const dateRangeToTicksCount = (
    xTicks: Date[],
    selectedIntervalType: string
  ) => {
    let unit = 1; // default: days

    if (selectedIntervalType === "Day") {
      unit = 1; // days
    } else if (selectedIntervalType === "12 Hours") {
      unit = 1 / 2; // 12 Hours in a day
    } else if (selectedIntervalType === "6 Hours") {
      unit = 1 / 4; // 6 Hours in a day
    }else if (selectedIntervalType === "Week") {
      unit = 7; // days in a week
    } else if (selectedIntervalType === "Month") {
      unit = 30; // approx days in a month
    } else if (selectedIntervalType === "Hour") {
      unit = 1 / 24; // 1 hour = 1/24 day
    } else if (selectedIntervalType === "30 Minutes") {
      unit = 1 / 48; // 30 min = 1/48 day
    } else if (selectedIntervalType === "15 Minutes") {
      unit = 1 / 96; // 15 min = 1/96 day
    }

    if (xTicks.length < 2) return 0;

    const diffInMs = Math.abs(xTicks[1].getTime() - xTicks[0].getTime());
    let diffInUnits = diffInMs / (1000 * 60 * 60 * 24 * unit);

    // Optional: limit max units
    if (diffInUnits > 7) {
      if (selectedIntervalType === "Day") {
        diffInUnits = 7;
      } else if (selectedIntervalType === "12 hours") {
        diffInUnits = 12;
      } else if (selectedIntervalType === "Week") {
        diffInUnits = 5;
      } else if (selectedIntervalType === "Month") {
        diffInUnits = 6;
      } else if (selectedIntervalType === "Hour") {
        diffInUnits = 6;
      } else if (selectedIntervalType === "30 Minutes") {
        diffInUnits = 10;
      } else if (selectedIntervalType === "15 Minutes") {
        diffInUnits = 5;
      }
      // diffInUnits = 8;
    }

    return Math.ceil(diffInUnits)
  };

  return (
    <Box
    // onMouseEnter={() => setHover(true)}
    // onMouseLeave={() => setHover(false)}
    >
      <Box className="cmn-widge-clock">
        <IconButton
          onClick={handleMenuClick}
          sx={{
            p: 0,
          }}
        >
          <img src={ theme === 'light'? "/images/clock.svg" : "/images/dark-theme/clock.svg"} alt="Clock" width={20} height={20} />
        </IconButton>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          {intervalData.map((item) => (
            <MenuItem
              key={item.intervalName}
              selected={selectedInterval?.intervalName === item.intervalName}
              sx={{
                color:
                  selectedInterval?.intervalName === item.intervalName
                    ? "orange"
                    : undefined,
              }}
              onClick={() => handleSelectChange(item)}
            >
              {item.intervalName}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};
