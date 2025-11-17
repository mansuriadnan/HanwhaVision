import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  CumulativeTotalProps,
  IntervalData,
  IParsedDataWithCategory,
  ParsedDataFormat,
} from "../../../../interfaces/IChart";
import { ChartTicksSelector } from "../../../index";
import { Box } from "@mui/material";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";
import cumulativePeopleIcon from "/images/dashboard/Cumulative_People_Count_Node.svg";

const CumulativePeople2_1_Option1: React.FC<CumulativeTotalProps> = ({
  cumulativePeopleChart,
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

  useEffect(() => {
    selectedIntervalNameRef.current = selectedIntervalName;
  }, [selectedIntervalName]);
  const { theme } = useThemeContext();

  useExportHandler({
    apiEndpoint: `${apiUrls.CumulativePeopleCountChart}/csv`,
    startDate: convertDateToISOLikeString(startDate as Date), // Convert to string
    endDate: convertDateToISOLikeString(endDate as Date), // Convert to string
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    if (!cumulativePeopleChart) return;

    const updatedParsedData: IParsedDataWithCategory = {};

    updatedParsedData["CPData"] = cumulativePeopleChart.map((d) => ({
      date: new Date(formatDateToConfiguredTimezone(d.dateTime as string)),
      value: d.inCount,
    }));

    setParsedDataWithCategory(updatedParsedData);
  }, [cumulativePeopleChart, selectedInterval]);

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };
  // After you get your finalData (array of { date, value }), make it cumulative:
  const getCumulativeData = (data: ParsedDataFormat[]) => {
    // let sum = 0;
    // return data.map(d => {
    //   sum += d.value;
    //   return { ...d, value: sum };
    // });
    const cumulative: any = [];
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        cumulative.push(data[0]);
      } else {
        // const diff = data[i].value - data[i - 1].value;
        // const add = diff < 0 ? data[i].value : diff;
        var add = 0;
        if (data[i].date.getDate() === data[i - 1].date.getDate()) {
          const diff = data[i].value - data[i - 1].value;
          add = diff < 0 ? data[i].value : diff;
        } else {
          add = data[i].value;
        }
        cumulative.push({
          date: data[i].date,
          value: add + cumulative[i - 1].value,
        });
      }
    }

    return cumulative.map((d: { date: any; value: any }) => ({
      date: d.date,
      value: d.value,
    }));
  };

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

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw line with filtered data
    chartGroup
      .append("path")
      .datum(finalData)
      .attr("fill", "none")
      .attr("stroke", "#FFBA00")
      .attr("stroke-width", 2.5)
      .attr("d", line);

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
        .attr("href", cumulativePeopleIcon)
        .style("cursor", "pointer")
        .style("pointer-events", "all")
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(
              `<strong>Cumulative People : </strong> ${formatNumber(d.value)}`
            );
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
            //setFinalData(result?.["CPData"] as ParsedDataFormat[]);
            const cpData = result?.["CPData"] as ParsedDataFormat[];
            setFinalData(getCumulativeData(cpData));
          }}
        />
      )}
      <svg ref={svgRef}></svg>
    </Box>
  );
};

export { CumulativePeople2_1_Option1 };
