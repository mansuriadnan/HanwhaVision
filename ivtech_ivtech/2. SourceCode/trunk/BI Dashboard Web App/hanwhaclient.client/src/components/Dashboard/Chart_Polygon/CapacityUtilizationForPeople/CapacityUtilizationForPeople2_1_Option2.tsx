import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  CapacityUtilizationAnanlysisProps,
  IntervalData,
  IParsedDataWithCategory,
  ParsedDataFormat,
} from "../../../../interfaces/IChart";
import { ChartTicksSelector } from "../../../index";
import { Box } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";
import cuforpeopleIcon from "/images/dashboard/basicNode.svg";

const CapacityUtilizationForPeople2_1_Option2: React.FC<
  CapacityUtilizationAnanlysisProps
> = ({
  DateWiseUtilization,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  capacityUtilizationpPeopleData,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [finalData, setFinalData] = useState<ParsedDataFormat[]>([]);
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");

  const selectedIntervalNameRef = useRef<string>("");

  const totalCapacity = capacityUtilizationpPeopleData?.totalCapacity;
  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
    selectedIntervalNameRef.current = intervalData.intervalName;
  };
  const { theme } = useThemeContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.PeopleCapacityUtilization}/csv`,
    startDate: convertDateToISOLikeString(startDate as Date),
    endDate: convertDateToISOLikeString(endDate as Date),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    if (!DateWiseUtilization) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["CUDFPData"] = DateWiseUtilization.map((d) => ({
      date: new Date(d.dateTime),
      value: d.totalCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [DateWiseUtilization, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FF8A01")
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF8A01")
      .attr("stop-opacity", 0.08);

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
      .attr("opacity", theme === "light" ? "100%" : "20%")
      .attr("stroke-width", 1);

    if (typeof totalCapacity === "number") {
      chartGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(totalCapacity))
        .attr("y2", yScale(totalCapacity))
        .attr("stroke", "#FF8A01")
        .attr("stroke-width", 1);

      chartGroup
        .append("text")
        .attr("x", -1)
        .attr("y", yScale(totalCapacity) + 2)
        .attr("text-anchor", "end")
        .style("fill", "#FF8A01")
        .style("font-size", "10px")
        .text(d3.format("~s")(totalCapacity));
    }

    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw line
    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "none")
      .attr("stroke", "#FF8A01")
      .attr("stroke-width", 1)
      .attr("d", line);

    // Draw area
    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "url(#areaGradient)")
      .attr("d", area);

    const iconSize = 16;

    (async () => {
      chartGroup
        .selectAll(".dot-image")
        .data(finalData)
        .enter()
        .append("image")
        .attr("class", "dot-image")
        .attr("x", (d) => xScale(d.date) - iconSize / 2)
        .attr("y", (d) => yScale(d.value) - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("href", cuforpeopleIcon)
        .style("cursor", "pointer")
        .style("pointer-events", "all")
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>Utilization : </strong> ${formatNumber(d.value)}`);
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
    })();

    // X Axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
      .call((g) => {
        g.select(".domain").attr("stroke", "#70757a");
        g.selectAll(".tick line").attr("stroke", "#0000008a");
      })
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#FFFFFF")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

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
          operation="max"
          chartTicksChange={(data) => handleTickChanges(data)}
          onChartDataChange={(result) => {
            setFinalData(result?.["CUDFPData"] as ParsedDataFormat[]);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export { CapacityUtilizationForPeople2_1_Option2 };
