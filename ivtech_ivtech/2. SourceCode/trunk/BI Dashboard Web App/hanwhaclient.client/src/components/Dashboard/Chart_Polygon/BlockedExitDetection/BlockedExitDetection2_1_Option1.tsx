import React, { useEffect, useRef, useState } from "react";
import {
  IBlockedExitDetectionChartProp,
  IntervalData,
  IParsedDataWithCategory,
  ParsedDataFormat,
} from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const BlockedExitDetection2_1_Option1: React.FC<
  IBlockedExitDetectionChartProp
> = ({
  blockedExitDetectionChartData,
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
    const [finalData, setFinalData] = useState<ParsedDataFormat[]>([]);
    const [parsedDataWithCategory, setParsedDataWithCategory] =
      useState<IParsedDataWithCategory>({});
    const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
    const selectedIntervalNameRef = useRef<string>("");
    const { theme } = useThemeContext();

    useEffect(() => {
      if (!blockedExitDetectionChartData) return;

      const updatedParsedData: IParsedDataWithCategory = {};

      updatedParsedData["BEDData"] = blockedExitDetectionChartData.map((d) => ({
        date: new Date(formatDateToConfiguredTimezone(d.dateTime)),
        value: d.queueCount,
      }));

      setParsedDataWithCategory(updatedParsedData);
    }, [blockedExitDetectionChartData, selectedInterval]);

    useExportHandler({
      apiEndpoint: `${apiUrls.BlockedExitDetecion}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });

    useEffect(() => {
      selectedIntervalNameRef.current = selectedIntervalName;
    }, [selectedIntervalName]);

    const handleTickChanges = (intervalData: IntervalData) => {
      setSelectedInterval(intervalData.tickInterval);
      setSelectedIntervalName(intervalData.intervalName);
    };
    useEffect(() => {
      if (!svgRef.current || !finalData) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = customizedWidth as number;
      const height = customizedHeight as number;
      const margin = { top: 30, right: 30, bottom: 100, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const maxBarWidth = 24;

      const defs = svg.append("defs");

      const gradient = defs
        .append("linearGradient")
        .attr("id", "barGradient")
        .attr("x1", "100%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "0%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#9080D6");

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#F5F0FF");

      const chartGroup = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const yExtent = [startDate, endDate] as [Date, Date];

      var yScale = d3
        .scaleTime()
        .domain(yExtent)
        .range([maxBarWidth, innerHeight]);

      let yTicks = yScale.ticks(selectedInterval);
      if (yTicks.length === 1) {
        yTicks = [yExtent[0], yTicks[0], yExtent[1]];
      }

      const xMax = Math.max(d3.max(finalData, (d) => d.value) ?? 0, 10);

      let barWidth = (innerHeight - maxBarWidth) / finalData.length;
      if (barWidth > maxBarWidth) barWidth = maxBarWidth;

      const xScale = d3
        .scaleLinear()
        .domain([0, xMax])
        .nice()
        .range([0, innerWidth]);

      const xTickSize = 5;

      const xTicks = xScale.ticks(xTickSize);

      chartGroup
        .append("g")
        .attr("class", "x-grid-lines")
        .selectAll("line")
        .data(xTicks)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d))
        .attr("x2", (d) => xScale(d))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#E0E0E0")
        .attr("opacity", theme === 'light' ? "100%" : "20%")
        .attr("stroke-width", 1);

      // Bars
      chartGroup
        .selectAll(".bar")
        .data(finalData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => yScale(d.date)!)
        .attr("x", xScale(0))
        .attr("height", barWidth - 2)
        .attr("width", (d) => xScale(d.value))
        .attr("fill", "url(#barGradient)")
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>Blocked Exit Detection : </strong> ${formatNumber(d.value)}`);
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });

      // X Axis
      chartGroup
        .append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(xTickSize).tickSize(0))
        .call((g) => g.select(".domain").attr("stroke", "none"))
        .selectAll("text")
        .style("fill", theme === 'light' ? "#212121" : "#D4D4D4")
        .style("font-size", "10px");

      // Y Axis with formatted date
      chartGroup
        .append("g")
        .call(d3.axisLeft(yScale).tickValues(yTicks))
        .call((g) => {
          g.select(".domain").attr("stroke", "#70757a");
          g.selectAll(".tick line").attr("stroke",theme === 'light' ? "#212121" : "#FFFFFF");
        })
        .selectAll("text")
        .style("fill", theme === 'light' ? "#212121" : "#FFFFFF")
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
            operation="sum"
            chartTicksChange={(data) => handleTickChanges(data)}
            onChartDataChange={(result) => {
              setFinalData(result?.["BEDData"] as ParsedDataFormat[]);
            }}
          />
        )}
        <svg ref={svgRef}></svg>
      </Box>
    );
  };

export { BlockedExitDetection2_1_Option1 };
