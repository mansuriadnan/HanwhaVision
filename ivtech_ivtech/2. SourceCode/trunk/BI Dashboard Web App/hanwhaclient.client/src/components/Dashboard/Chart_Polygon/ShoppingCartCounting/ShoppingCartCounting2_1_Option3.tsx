import React, { useEffect, useRef, useState } from "react";
import {
  IShoppingCartCountingProps,
  IParsedDataWithCategory,
  ParsedDataFormat,
  IntervalData,
} from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { useThemeContext } from "../../../../context/ThemeContext";

const ShoppingCartCounting2_1_Option3: React.FC<IShoppingCartCountingProps> = ({
  ShoppingCartData,
  customizedHeight,
  customizedWidth,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
   const { theme } = useThemeContext();

  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [finalData, setFinalData] = useState<ParsedDataFormat[]>([]);
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
  const selectedIntervalNameRef = useRef<string>("");

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };

  useExportHandler({
    apiEndpoint: `${apiUrls.ShoppingCartCountAnalysis}/csv`,
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
    if (!ShoppingCartData) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["SCData"] = ShoppingCartData.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime)),
      value: d.queueCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [ShoppingCartData, selectedInterval]);

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
      .attr("id", "areaGradientblue1")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%"); // top to bottom (same as 180deg)

    // First stop (top color)
    gradient
      .append("stop")
      .attr("offset", "10%")
      .attr("stop-color", "#00FFF2")
      .attr("stop-opacity", 1); // Fully opaque like CSS

    // Second stop (bottom color)
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#02CDD7")
      .attr("stop-opacity", 1); // Fully opaque like CSS

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
      .attr("opacity",theme === 'light' ? "100%" : "20%")
      .attr("stroke-width", 1);

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value));

    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "url(#areaGradientblue1)")
      .attr("d", area);

    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "none")
      .attr("stroke", "#02CDD7")
      .attr("stroke-width", 1)
      .attr("d", line);

    const iconSize = 16; // Adjust size as needed

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
      .attr("href", "/images/dashboard/elipse_blue.svg")
      .attr("href", "/images/dashboard/elipse_blue.svg") 
      .style("cursor", "pointer")
      .style("pointer-events", "all")
      .on("mouseover", (_, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>Shopping cart</strong> : ${formatNumber(d.value)}`);
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
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
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
      .style("fill", theme === 'light' ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedHeight, customizedWidth, finalData, theme]);

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
            setFinalData(result?.["SCData"] as ParsedDataFormat[]);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export { ShoppingCartCounting2_1_Option3 };
