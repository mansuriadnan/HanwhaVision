import React, { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";
import * as d3 from "d3";
import {
  IShopptingQueueEventProps,
  IParsedDataWithCategory,
  ParsedDataFormat,
  IntervalData,
} from "../../../../interfaces/IChart";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { useThemeContext } from "../../../../context/ThemeContext";

const ShoppingQueueEvent2_1_Option1: React.FC<IShopptingQueueEventProps> = ({
  customizedWidth,
  customizedHeight,
  shoppingQueueEventsData,
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

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };

  useExportHandler({
    apiEndpoint: `${apiUrls.ShoppingCartQueueAnalysis}/csv`,
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

  useEffect(() => {
    if (!shoppingQueueEventsData) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["SQEData"] = shoppingQueueEventsData.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime)),
      value: d.queueCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [shoppingQueueEventsData, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = [startDate, endDate] as [Date, Date];
    const allValues = Object.values(finalData)
      .flat()
      .map((d) => d.value);

    const yMax = Math.max(d3.max(allValues) ?? 0, 10);

    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
    let xTicks = xScale.ticks(selectedInterval);
    if (xTicks.length === 1) {
      xTicks = [xExtent[0], xTicks[0], xExtent[1]];
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight / 2, 0]);

    const yScaleMirror = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight / 2, innerHeight]);

    const yTickSize = 4;

    const yTicks = yScale.ticks(yTickSize);
    const yTicksMirror = yScaleMirror.ticks(yTickSize);

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
      .attr("opacity", theme === "light" ? "100%" : "20%")
      .attr("stroke-width", 1);

    chartGroup
      .append("g")
      .attr("class", "y-grid-lines")
      .selectAll("line")
      .data(yTicksMirror)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScaleMirror(d))
      .attr("y2", (d) => yScaleMirror(d))
      .attr("stroke", "#E0E0E0")
      .attr("opacity", theme === "light" ? "100%" : "20%")
      .attr("stroke-width", 1);

    // Area for top half
    const areaTop = d3
      .area<{ date: Date; value: number }>()
      .x((d: any) => xScale(d.date))
      .y0(innerHeight / 2)
      .y1((d: any) => yScale(d.value));

    // Area for bottom half (mirrored)
    const areaBottom = d3
      .area<{ date: Date; value: number }>()
      .x((d: any) => xScale(d.date))
      .y0(innerHeight / 2)
      .y1((d: any) => yScaleMirror(d.value));

    // Draw top
    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "#4CDEE6")
      .attr("stroke", "none")
      .attr("d", areaTop);

    // Draw mirrored bottom
    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "#4CDEE6")
      .attr("stroke", "none")
      .attr("d", areaBottom);

    // Add count labels in the center (middle of mirrored area)
    chartGroup
      .selectAll(".count-label")
      .data(finalData)
      .enter()
      .append("g")
      .attr("class", "count-label")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.date)}, ${innerHeight / 2})`
      )
      .each(function (d) {
        const g = d3.select(this);
        const label = d.value.toString();

        // Background rectangle
        const padding = 4;
        const fontSize = 8;
        const textLength = label.length * fontSize * 0.6;

        g.append("rect")
          .attr("x", -textLength / 2 - padding)
          .attr("y", -fontSize / 2 - padding)
          .attr("width", textLength + padding * 2)
          .attr("height", fontSize + padding * 2)
          .attr("rx", 12)
          .attr("ry", 12)
          .attr("fill", "white")
          .attr("stroke", "#ccc");

        // Text
        g.append("text")
          .text(!isNaN(Number(label)) ? formatNumber(Number(label)) : "")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .style("font-size", `${fontSize}px`)
          .style("fill", "#333")
          .style("font-weight", "400");
      });

    // X Axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
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
      .style("fill", theme === "light" ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");

    chartGroup
      .append("g")
      .call(d3.axisLeft(yScaleMirror).ticks(yTickSize).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", "none"))
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedWidth, finalData, theme]);

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
            setFinalData(result?.["SQEData"] as ParsedDataFormat[]);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export { ShoppingQueueEvent2_1_Option1 };
