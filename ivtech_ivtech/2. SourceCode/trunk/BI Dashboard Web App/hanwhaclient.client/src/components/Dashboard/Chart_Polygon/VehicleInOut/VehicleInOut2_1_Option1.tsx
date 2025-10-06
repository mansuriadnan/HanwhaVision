import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  PVInOutProps,
  IParsedDataWithCategory,
  IntervalData,
  IPVInOutProps,
} from "../../../../interfaces/IChart";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { ChartTicksSelector } from "../../../index";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { useThemeContext } from "../../../../context/ThemeContext";
import { timeFormat } from "d3-time-format";

const VehicleInOut2_1_Option1: React.FC<PVInOutProps> = ({
  customizedWidth,
  customizedHeight,
  selectedStartDate,
  selectedEndDate,
  vInOutData,
  filetredDevices,
  OnDeviceChange,
  selectedCamera,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [finalData, setFinalData] = useState<IPVInOutProps[]>();
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
  const selectedIntervalNameRef = useRef<string>("");
  const { theme } = useThemeContext();

  const formatHour = timeFormat("%-I %p"); // e.g., 6 PM
  const formatDay = timeFormat("%b %d"); // e.g., Jul 31
  // const formatMonth = timeFormat("%b %Y"); // e.g., Jul 2025
  // const formatFull = timeFormat("%b %d, %I %p"); // e.g., Jul 31, 6 PM

  const getTimeLabel = (dateStr: string | Date): string => {
    const date = new Date(dateStr);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (hours === 0 && minutes === 0 && seconds === 0) {
      return formatDay(date);
    }

    return formatHour(date);
  };

  type GenderKey = "inCount" | "outCount";
  const categories: { key: GenderKey; label: string; color: string }[] = [
    { key: "inCount", label: "In", color: "#FF9500" },
    { key: "outCount", label: "Out", color: "#3CBD00" },
  ];

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };

  useExportHandler({
    apiEndpoint: `${apiUrls.VehicleInOutCountChart}/csv`,
    startDate: convertDateToISOLikeString(selectedStartDate),
    endDate: convertDateToISOLikeString(selectedEndDate),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  useEffect(() => {
    selectedIntervalNameRef.current = selectedIntervalName;
  }, [selectedIntervalName]);

  useEffect(() => {
    if (!vInOutData || !categories) return;
    const updatedParsedData: IParsedDataWithCategory = {};
    categories.forEach((cat) => {
      updatedParsedData[cat.key] = vInOutData.map((d) => ({
        date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
        value: d[cat.key] ?? 0,
      }));
    });

    setParsedDataWithCategory(updatedParsedData);
  }, [vInOutData, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 10, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const innerRadius = 30;
    const outerRadius = 115;

    const RadialGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      //   .attr("transform", `translate(${margin.left},${margin.top})`);
      .attr(
        "transform",
        "translate(" + innerWidth / 2 + "," + innerHeight / 2 + ")"
      );

    const angle = d3
      .scaleLinear()
      .domain([0, finalData.length])
      .range([0, 2 * Math.PI]);

    const maxVal: number = d3.max(finalData, (d) => Math.max(d.in, d.out)) ?? 0;

    const radius = d3
      .scaleLinear()
      .domain([0, maxVal])
      .range([innerRadius, outerRadius]);

    const lineIn = d3
      .lineRadial<IPVInOutProps>()
      .curve(d3.curveCardinalClosed)
      .angle((d, i) => angle(i))
      .radius((d) => radius(d.in));

    const lineOut = d3
      .lineRadial<IPVInOutProps>()
      .curve(d3.curveCardinalClosed)
      .angle((d, i) => angle(i))
      .radius((d) => radius(d.out));

    // Draw grid circles
    const numTicks = 4;
    const tickVals = d3
      .range(1, numTicks + 1)
      .map((d) => (d * maxVal) / numTicks);
    tickVals.forEach((tick) => {
      RadialGroup.append("circle")
        .attr("class", "grid-circle")
        .attr("r", radius(tick))
        .style("fill", "none")
        .style("stroke", "#E0E0E0")
        .style("stroke-dasharray", "2,2");
      //   RadialGroup.append("text")
      //     .attr("y", -radius(tick))
      //     .attr("text-anchor", "middle")
      //     .text(formatNumber(Math.round(tick)))
      //     .style("fill", "#555")
      //     .style("font-size", "11px");
    });

    // Radial lines + labels
    finalData.forEach((d, i) => {
      const a = angle(i) - Math.PI / 2;
      const x = outerRadius * Math.cos(a);
      const y = outerRadius * Math.sin(a);

      const timeLabel = getTimeLabel(d.time);

      RadialGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "#E0E0E0")
        .style("stroke-width", "1px");

      RadialGroup.append("text")
        .attr("x", (outerRadius + 15) * Math.cos(a))
        .attr("y", (outerRadius + 15) * Math.sin(a))
        .attr("text-anchor", "middle")
        .text(timeLabel)
        .style("fill", theme === "light" ? "#212121" : "#FFFFFF")
        .style("font-size", "10px");
    });

    // Draw lines
    RadialGroup.append("path")
      .datum(finalData)
      .attr("d", lineIn)
      .style("fill", "none")
      .style("stroke", "#FF9500")
      .style("stroke-width", "2px");

    RadialGroup.append("path")
      .datum(finalData)
      .attr("d", lineOut)
      .style("fill", "none")
      .style("stroke", "#3CBD00")
      .style("stroke-width", "2px");

    const drawDots = (key: keyof IPVInOutProps, color: string) => {
      RadialGroup.selectAll(".dot-" + key)
        .data(finalData)
        .enter()
        .append("circle")
        .attr("r", 5)
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .attr("cx", (d, i) => radius(d[key]) * Math.cos(angle(i) - Math.PI / 2))
        .attr("cy", (d, i) => radius(d[key]) * Math.sin(angle(i) - Math.PI / 2))
        .style("cursor", "pointer")
        .on("mouseover", (_, d) => {
          const value = d[key];
          const capitalKey = key.charAt(0).toUpperCase() + key.slice(1);
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(
              `<strong>${capitalKey} </strong> : ${formatNumber(
                value as number
              )}`
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
    };

    drawDots("in", "#FF9500");
    drawDots("out", "#3CBD00");
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
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Select
          value={selectedCamera}
          label="All Camera"
          onChange={OnDeviceChange}
          size="small"
          className="in-out-label"
        >
          {filetredDevices?.map((camera) => (
            <MenuItem key={camera.deviceId} value={camera.deviceId}>
              {camera.cameraName}
            </MenuItem>
          ))}
        </Select>
        {parsedDataWithCategory && (
          <ChartTicksSelector
            startDate={selectedStartDate as Date}
            endDate={selectedEndDate as Date}
            parsedDataWithCategory={parsedDataWithCategory}
            operation="max"
            chartTicksChange={(data) => handleTickChanges(data)}
            onChartDataChange={(result) => {
              if (
                result &&
                Array.isArray(result.inCount) &&
                Array.isArray(result.outCount)
              ) {
                const mergedData = result.inCount.map((inItem) => {
                  const matchingOut = result.outCount.find(
                    (outItem) =>
                      new Date(outItem.date).getTime() ===
                      new Date(inItem.date).getTime()
                  );

                  return {
                    time: inItem.date,
                    in: inItem.value,
                    out: matchingOut ? matchingOut.value : 0,
                  };
                });

                setFinalData(mergedData);
              } else {
                console.warn(
                  "Invalid result format or missing inCount/outCount"
                );
              }
            }}
            // onChartDataChange={(result) => {
            //   setFinalData(result);
            // }}
          />
        )}
      </Box>
      <svg ref={svgRef}></svg>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 3,
          justifyContent: "center",
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

export { VehicleInOut2_1_Option1 };
