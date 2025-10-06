import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";
import {
  IParsedDataWithCategory,
  ParsedDataFormat,
  IForkliftDataProps,
  IntervalData,
} from "../../../../interfaces/IChart";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { useThemeContext } from "../../../../context/ThemeContext";

const CountingForForklift2_1Option1: React.FC<IForkliftDataProps> = ({
  ForkliftData,
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

  useExportHandler({
    apiEndpoint: `${apiUrls.ForkliftCountAnalysis}/csv`,
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
    if (!ForkliftData) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["CFLData"] = ForkliftData.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime)),
      value: d.queueCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [ForkliftData, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxBarWidth = 24;

    const chartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    var xExtent = [startDate, endDate] as [Date, Date];

    const yMax = Math.max(d3.max(finalData, (d) => d.value + 2) ?? 0, 10);

    let barWidth = (innerWidth - maxBarWidth) / finalData.length;
    if (barWidth > maxBarWidth) barWidth = maxBarWidth;

    var xScale = d3
      .scaleTime()
      .domain(xExtent)
      .range([maxBarWidth / 2, innerWidth]);

    let xTicks = xScale.ticks(selectedInterval);
    if (xTicks.length === 1) {
      xTicks = [xExtent[0], xTicks[0], xExtent[1]];
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    const yTickSize = 5;

    const yTicks = yScale.ticks(yTickSize);

    chartGroup
      .append("g")
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
      .attr("opacity",theme === 'light' ? "100%" : "20%")
      .attr("stroke-width", 1);

    // Bars
    svg
      .select("g")
      .selectAll(".bar")
      .data(finalData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.date)! - barWidth / 2)
      .attr("y", (d) => yScale(d.value))
      .attr("width", barWidth - 2)
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("fill", "#ECF1FF")
      .attr("rx", barWidth / 2)
      .on("mouseover", (_, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>Forklift</strong> : ${formatNumber(d.value)}`);
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    const lineData = finalData.map((d) => ({
      x: xScale(d.date),
      y: yScale(d.value),
    }));

    const iconSize = barWidth / 2;

    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveMonotoneX);

    // Draw line
    chartGroup
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#2C4CF5")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Draw dots

    chartGroup
      .selectAll(".dot-image")
      .data(lineData)
      .enter()
      .append("image")
      .attr("class", "dot-image")
      .attr("x", (d) => d.x - iconSize / 2)
      .attr("y", (d) => d.y - iconSize / 2)
      // .attr("y", (d) => d.y + iconSize / 2)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("href", "/images/dashboard/Counting_forklift_Node.svg")
      .attr("href", "/images/dashboard/Counting_forklift_Node.svg")
      .style("cursor", "pointer");

    // X Axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
      .call((g) => {
        g.select(".domain").attr("stroke", "#70757a");
        g.selectAll(".tick line").attr("stroke", theme === 'light' ? "#212121" : "#FFFFFF");
      })
      .selectAll("text")
      .style("fill", theme === 'light' ? "#212121" : "#FFFFFF")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    chartGroup
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(yTickSize)
          .tickSize(0)
          .tickFormat(d3.format("~s"))
      )
      .call((g) => g.select(".domain").attr("stroke", "none"))
      .selectAll("text")
      .style("fill",theme === 'light' ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedWidth, customizedHeight, finalData,theme]);

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
          operation="max"
          chartTicksChange={(data) => handleTickChanges(data)}
          onChartDataChange={(result) => {
            setFinalData(result?.["CFLData"] as ParsedDataFormat[]);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export { CountingForForklift2_1Option1 };
