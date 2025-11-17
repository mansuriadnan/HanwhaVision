import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { AveragePeopleCountProps } from "../../../../interfaces/IChart";
import { Box, Paper } from "@mui/material";
import moment from "moment";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import apiUrls from "../../../../constants/apiUrls";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";

const AveragePeopleCount3_1_Option1: React.FC<AveragePeopleCountProps> = ({
  APCData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  //const selectedIntervalNameRef = useRef<string>("");

  // useExportHandler({
  //   apiEndpoint: `${apiUrls.AveragePeopleCountChart}/csv`,
  //   startDate: convertDateToISOLikeString(startDate), // Convert to string
  //   endDate: convertDateToISOLikeString(endDate), // Convert to string
  //   floor,
  //   zones,
  //   selectedIntervalNameRef,
  //   setExportHandler,
  // });

  useEffect(() => {
    const width = parseInt(customizedWidth as string, 10) || 700;
    const height = parseInt(customizedHeight as string, 10) || 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    svg.attr("width", width).attr("height", height);
    const sectionWidth = width / 2;

    const data = [
      {
        label: "Min",
        name: "Incoming Min",
        value: APCData?.minInCount || 500,
        color:theme === 'light' ? "#DCECFF" : "#96B4D6",
        patterned: false,
        barValue: APCData?.minInCount || 500,
        date: formatDateToConfiguredTimezone(
          APCData?.minInDate ? new Date(APCData.minInDate).toISOString() : ""
        ),
        type: "incoming",
      },
      {
        label: "Max",
        name: "Incoming Max",
        value: APCData?.maxInCount || 500,
        color: "none",
        patterned: true,
        patternId: "patternGrey",
        barValue: APCData?.maxInCount || 400,
        date: formatDateToConfiguredTimezone(
          APCData?.maxInDate ? new Date(APCData?.maxInDate).toISOString() : ""
        ),
        type: "incoming",
      },
      {
        label: "Min",
        name: "Outgoing Min",
        value: APCData?.minOutCount || 500,
        color: "#FFE3E1",
        patterned: false,
        barValue: APCData?.minOutCount || 700,
        date: formatDateToConfiguredTimezone(
          APCData?.minOutDate ? new Date(APCData?.minOutDate).toISOString() : ""
        ),
        type: "outgoing",
      },
      {
        label: "Max",
        name: "Outgoing Max",
        value: APCData?.maxOutCount || 500,
        color: "none",
        patterned: true,
        patternId: "patternGrey",
        barValue: APCData?.maxOutCount || 1000,
        date: formatDateToConfiguredTimezone(
          APCData?.maxOutDate ? new Date(APCData?.maxOutDate).toISOString() : ""
        ),
        type: "outgoing",
      },
    ];

    svg.selectAll("*").remove(); // Clear on re-render

    const margin = { top: 20, right: 20, bottom: 100, left: 60 };
    const barWidth = 120;
    const barSpacing = 40;
    const cornerRadius = 15;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.attr("width", width).attr("height", height);

    // Pattern
    const defs = svg.append("defs");
    const pattern = defs
      .append("pattern")
      .attr("id", "patternGrey")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 5)
      .attr("height", 8)
      .attr("patternTransform", "rotate(55)");

    pattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 8)
      .attr("stroke", "#999")
      .attr("stroke-width", 3);

    const yScale = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.value + 5000) ?? 0) * 1.1])
      .range([innerHeight, 0]);

    svg.append("g").attr("transform", `translate(${margin.left},0)`);
    // .call(d3.axisLeft(yScale));

    const barGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 30},${margin.top + 20})`);

    const bars = barGroup
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr(
        "transform",
        (d, i) => `translate(${i * (barWidth + barSpacing)}, 0)`
      );

    bars
      .append("rect")
      .attr("y", (d) => yScale(d.value) + 10)
      .attr("width", barWidth)
      .attr("height", (d) => height - margin.bottom - yScale(d.value))
      .attr("fill", (d) => (d.patterned ? `url(#${d.patternId})` : d.color))
      .attr("rx", cornerRadius)
      .attr("ry", cornerRadius)
      .attr("stroke", "none")
      .attr("stroke-width", (d) => (d.patterned ? 1 : 0));

    bars
      .append("line")
      .filter((d) => d.value > 0) // only if a condition is met, modify as needed
      .attr("x1", barWidth / 2 - 40)
      .attr("x2", barWidth / 2 + 40)
      .attr("y1", (d) => yScale(d.value) + 8)
      .attr("y2", (d) => yScale(d.value) + 8)
      .attr("stroke", (d) => {
        if (d.name == "Incoming Min") return "#006FFF";
        if (d.name == "Incoming Max") return "#006FFF";
        if (d.name == "Outgoing Min") return "#FF9C95";
        if (d.name == "Outgoing Max") return "#FF6C61";
        return "yellow";
      })
      .attr("stroke-width", 2);

    const minBars = bars.filter((d) => !d.patterned);

    minBars
      .append("text")
      .attr("class", "inner-text")
      .attr("x", barWidth / 2 - 25)
      .attr("y", (d) => {
        const y = yScale(d.value);
        const h = height - margin.bottom - y;
        return y + 20;
      })
      .attr("fill", "#000")
      .attr("font-size", "10px")
      .text((d) => moment(d.date).format("DD-MM-YYYY"));

    const maxBars = bars.filter((d) => d.patterned);

    maxBars
      .append("text")
      .attr("class", "inner-text")
      .attr("x", barWidth / 2 - 25)
      .attr("y", (d) => {
        const y = yScale(d.value);
        const h = height - margin.bottom - y;
        return y + 20; // Date inside white background for max bar
      })
      .attr("fill", "#000")
      .attr("font-size", "10px")
      .text((d) => moment(d.date).format("DD-MM-YYYY"));

    const labelColors = ["#2F8DFC", "#2F8DFC", "#FF5245", "#FF5245"];
    bars
      .append("text")
      .attr("class", "label")
      .attr("x", barWidth / 2)
      .attr("y", (d) => yScale(d.value) + 4)
      .attr("text-anchor", "middle")
      .style("fill", (d, i) => labelColors[i % labelColors.length]) // Cycle through colors
      .attr("font-weight", "600")
      .text((d) => formatNumber(d.value));

    svg
      .append("rect")
      .attr("x", margin.left + 70 - 10)
      .attr("y", margin.top - 10)
      .attr("width", "200px")
      .attr("height", "40px")
      .attr("rx", 20)
      .attr("ry", 20)
      .attr("fill", "#FFF") // light gray background
      .attr("stroke", "#ccc");

    svg
      .append("rect")
      .attr("x", margin.left + sectionWidth + 50)
      .attr("y", margin.top - 10)
      .attr("width", "200px")
      .attr("height", "40px")
      .attr("rx", 20)
      .attr("ry", 20)
      .attr("radius", 20)
      .attr("fill", "#FFF") // light gray background
      .attr("stroke", "#ccc");

    svg
      .append("text")
      .attr("x", margin.left + 70)
      .attr("y", margin.top + 15)
      .attr("text-anchor", "start")
      .attr("font-size", "13px")
      .attr("fill", "#000")
      .text("Incoming Average ")
      .append("tspan")
      .attr("fill", "#626262");

    svg
      .append("text")
      .attr("x", margin.left + 190)
      .attr("y", margin.top + 15)
      .attr("text-anchor", "start")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#000")
      .append("tspan")
      .attr("fill", "#2F8DFC")
      .text(formatNumber(APCData?.averageInCount ?? 0) ?? "0");

    svg
      .append("text")
      .attr("x", margin.left + sectionWidth + 60)
      .attr("y", margin.top + 15)
      .attr("text-anchor", "start")
      .attr("font-size", "13px")
      .attr("fill", "#000")
      .text("Outgoing Average")
      .append("tspan")
      .attr("fill", "#626262");

    svg
      .append("text")
      .attr("x", margin.left + sectionWidth + 180)
      .attr("y", margin.top + 15)
      .attr("text-anchor", "start")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#000")
      .append("tspan")
      .attr("fill", "#2F8DFC")
      .text(formatNumber(APCData?.averageOutCount ?? 0) ?? "0");

    const verticalLineIndexes = data
      .map((d, i) =>
        d.name === "Incoming Min" || d.name === "Outgoing Min" ? i : null
      )
      .filter((i) => i !== null);

    verticalLineIndexes.forEach((i) => {
      if (i == 0) return;
      const lineX = margin.left + 30 + i * (barWidth + barSpacing) - 20; // adjust -5 for slight spacing

      svg
        .append("line")
        .attr("x1", lineX)
        .attr("y1", margin.top + 50)
        .attr("x2", lineX)
        .attr("y2", height - margin.bottom + 50)
        .attr("stroke", "rgba(0, 0, 0, 0.2)")
        .attr("stroke-width", 0.5)
        .attr("stroke-array", "2,2"); // optional dashed line
    });
  }, [APCData, customizedWidth, customizedHeight, theme]);

  return (
    <Box
      sx={{
        // p: 2,
        width: customizedWidth,
        height: "auto",
        overflow: "visible",
      }}
    >
      <svg ref={svgRef} />
    </Box>
  );
};

export { AveragePeopleCount3_1_Option1 };
