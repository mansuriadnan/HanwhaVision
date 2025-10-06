import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  AveragePeopleCountProps,
  IntervalData,
  IParsedDataWithCategory,
} from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import apiUrls from "../../../../constants/apiUrls";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";

const AveragePeopleCount2_1_Option2: React.FC<AveragePeopleCountProps> = ({
  averagePeopleCountChartData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
  //console.log("selectedInterval avg= ", selectedInterval);
  const [finalData, setFinalData] = useState<IParsedDataWithCategory>({});
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const selectedIntervalNameRef = useRef<string>("");

  type vehicleKey = "inCount" | "outCount";
  const categories: { key: vehicleKey; label: string; color: string }[] = [
    { key: "inCount", label: "Incoming Average", color: "#338BFF" },
    { key: "outCount", label: "Outgoing Average", color: "#FF8980" },
  ];
  const { theme } = useThemeContext();
  if (setExportHandler) {
    useExportHandler({
      apiEndpoint: `${apiUrls.AveragePeopleCountChart}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });
  }

  // useEffect(() => {
  //   if (setExportHandler) {
  //     setExportHandler(() => async () => {
  //       var selectedIntervalMin = GetMinutesByInterval(
  //         selectedIntervalNameRef.current
  //       );
  //       const payload = {
  //         StartDate: startDate,
  //         EndDate: endDate,
  //         FloorIds: floor,
  //         ZoneIds: zones,
  //         intervalMinute: selectedIntervalMin,
  //       };

  //       await csvWidgetService(
  //         {
  //           data: payload,
  //         },
  //         `${apiUrls.AveragePeopleCountChart}/csv`
  //         //`/api/Widget/PeopleCountByZones/csv`
  //       );
  //     });
  //   }
  // }, [setExportHandler]);

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };

  useEffect(() => {
    selectedIntervalNameRef.current = selectedIntervalName;
  }, [selectedIntervalName]);

  useEffect(() => {
    if (!averagePeopleCountChartData || !categories) return;
    const updatedParsedData: IParsedDataWithCategory = {};
    categories.forEach((cat) => {
      updatedParsedData[cat.key] = averagePeopleCountChartData.map((d) => ({
        date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
        value: d[cat.key] ?? 0,
      }));
    });

    setParsedDataWithCategory(updatedParsedData);
  }, [averagePeopleCountChartData, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 120, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxBarWidth = 24;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const MultiLinechartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = [startDate, endDate] as [Date, Date];

    const xScale = d3
      .scaleTime()
      .domain(xExtent as [Date, Date])
      .range([maxBarWidth / 2, innerWidth]);

    let xTicks = xScale.ticks(selectedInterval);
    if (xTicks.length === 1) {
      xTicks = [xExtent[0], xTicks[0], xExtent[1]];
    }

    // Extract unique sorted dates (assumes all categories share same dates)
    const groupedDates = finalData[categories[0].key]?.map((d) => d.date) || [];

    const yMax = Math.max(
      ...groupedDates.map((date, idx) => {
        // Sum all category values at the same index
        return categories.reduce((sum, cat) => {
          const value = finalData[cat.key]?.[idx]?.value || 0;
          return sum + value;
        }, 0);
      }),
      10
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    const yTickSize = 5;

    const yTicks = yScale.ticks(yTickSize);

    MultiLinechartGroup.append("g")
      .attr("class", "y-grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#E0E0E0")
      .attr("opacity", theme === "light" ? "100%" : "20%")
      .attr("stroke-width", 1);

    let barWidth = (innerWidth - maxBarWidth) / groupedDates.length;
    if (barWidth > maxBarWidth) barWidth = maxBarWidth;

    groupedDates.forEach((date) => {
      let yOffset = 0;

      categories.forEach((cat) => {
        const categoryWisedata = finalData[cat.key];
        if (!categoryWisedata || categoryWisedata.length === 0) return;

        const datum = categoryWisedata.find(
          (d) => d.date.getTime() === date.getTime()
        );
        const value = datum ? datum.value : 0;

        const barHeight = innerHeight - yScale(value);

        MultiLinechartGroup.append("g")
          .selectAll(`.bar-${cat.key}`)
          .data(categoryWisedata)
          .enter()
          .append("rect")
          .attr("class", `bar-${cat.key}`)
          .attr("x", xScale(date)! - barWidth / 2)
          .attr("y", yScale(value) - yOffset)
          .attr("width", barWidth - 2)
          .attr("height", barHeight)
          .attr("fill", cat.color)
          .on("mouseover", (_, d) => {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`<strong>${cat.label}</strong> : ${formatNumber(value)}`);
          })
          .on("mousemove", (event) => {
            d3.select("#tooltip")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 20 + "px");
          })
          .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
          });

        yOffset += barHeight; // Stack next bar on top
      });
    });

    // X Axis
    MultiLinechartGroup.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
      .call((g) => {
        g.select(".domain").attr("stroke", "#70757a");
        g.selectAll(".tick line").attr(
          "stroke",
          theme === "light" ? "#212121" : "#FFFFFF"
        );
      })
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#FFFFFF")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    MultiLinechartGroup.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(yTickSize)
          .tickSize(0)
          .tickFormat(d3.format("~s"))
      )
      .call((g) => g.select(".domain").attr("stroke", "none"))
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedWidth, customizedHeight, finalData, theme]);

  return (
    <Box
      sx={{
        width: customizedWidth,
        height: customizedHeight,
        display: "flex",
        flexDirection: "column",
        padding: "10px 0px",
      }}
    >
      {parsedDataWithCategory && (
        <ChartTicksSelector
          startDate={startDate as Date}
          endDate={endDate as Date}
          parsedDataWithCategory={parsedDataWithCategory}
          operation="avg"
          chartTicksChange={(data) => handleTickChanges(data)}
          onChartDataChange={(result) => {
            setFinalData(result);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 3,
          justifyContent: "center",
          marginBottom: 1,
        }}
      >
        {categories.map((item, idx) => (
          <Box
            key={idx}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: item.color,
                display: "inline-block",
              }}
            ></Box>
            <Typography
              style={{
                fontSize: "12px",
                color: theme === "light" ? "#212121" : "#D4D4D4",
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { AveragePeopleCount2_1_Option2 };
