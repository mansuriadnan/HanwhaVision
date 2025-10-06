import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { GenderProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import moment from "moment";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { theme } from "antd";
import { useThemeContext } from "../../../../context/ThemeContext";

const Gender3_1_Option1: React.FC<GenderProps> = ({
  customizedWidth,
  customizedHeight,
  genderData,
}) => {
  const maleData = genderData?.find((item) => item.gender === "Male");
  const femaleData = genderData?.find((item) => item.gender === "Female");
  const unknownData = genderData?.find((item) => item.gender === "Unknown");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!svgRef.current || !genderData || genderData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 70, right: 5, bottom: 70, left: 10 };
    // const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const colors = ["#FFE503", "#A0C9FF", "#717171"];
    const spacing = 250; // distance between charts

    // Define the gradient
    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "maxBarGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%"); // horizontal gradient (left to right)

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#D7D7D7"); // left side

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ECECEC00"); // right side

    genderData.forEach((item, index) => {
      const group = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${index * spacing + 30}, 40)`);

      const yScale = d3
        .scaleLinear()
        .domain([0, item.count])
        .range([innerHeight, 0]);

      const barWidth = 100;
      const barGap = 10;

      const maxY = yScale(item.maxCount);
      const minY = yScale(item.minCount);

      // Min Bar
      group
        .append("rect")
        .attr("x", 0)
        .attr("y", minY)
        .attr("width", barWidth)
        .attr("height", innerHeight - minY)
        // .attr("fill", "pink")
        .attr("fill", colors[index % colors.length])
        .attr("rx", 10);

      // Min Line
      group
        .append("line")
        .attr("x1", 10)
        .attr("x2", barWidth - 10)
        .attr("y1", minY + 2)
        .attr("y2", minY + 2)
        .attr("stroke", "#007BFF")
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round");

      // Min Count
      group
        .append("text")
        .attr("x", barWidth / 2)
        .attr("y", minY - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .text(formatNumber(item.minCount));

      // min Date
      group
        .append("text")
        .attr("x", barWidth / 2)
        .attr("y", minY + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("font-weight", 600)
        .text(moment(formatDateToConfiguredTimezone(item.maxDate)).format("DD-MM-YYYY"));

      // Max Bar
      group
        .append("rect")
        .attr("x", barWidth + barGap)
        .attr("y", maxY)
        .attr("width", barWidth)
        .attr("height", innerHeight - maxY)
        // .attr("fill", "#FFE503")
        .attr("fill", "url(#maxBarGradient)")
        .attr("rx", 10)
        .attr("stroke", "#F0F0F0")         // border color
        .attr("stroke-width", 1);

      // Max Line
      group
        .append("line")
        .attr("x1", barWidth + barGap + 10)
        .attr("x2", barWidth + barGap + barWidth - 10)
        .attr("y1", maxY + 2)
        .attr("y2", maxY + 2)
        .attr("stroke", "#007BFF")
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round");

      // Max Count
      group
        .append("text")
        .attr("x", barWidth + barGap + barWidth / 2)
        .attr("y", maxY - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .text(formatNumber(item.maxCount));

      // Max Date
      group
        .append("text")
        .attr("x", barWidth + barGap + barWidth / 2)
        .attr("y", maxY + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("font-weight", 600)
        .text(moment(formatDateToConfiguredTimezone(item.minDate)).format("DD-MM-YYYY"));

      // Gender Label
      // group
      //   .append("text")
      //   .attr("x", (barWidth * 2 + barGap) / 2)
      //   .attr("y", chartHeight + 20)
      //   .attr("text-anchor", "middle")
      //   .style("font-weight", "bold")
      //   .text(item.gender);

      // const yAxis = d3
      //   .axisLeft(yScale)
      //   .ticks(5)
      //   .tickFormat((d) => `${d}`);

      // group.append("g").call(yAxis);
    });
  }, [customizedWidth, genderData, theme]);

  return (
    <Box
      sx={{
        width: customizedWidth,
        height: customizedHeight,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box className="gender-one-by-three-value" >
        <Box className="gender-one-by-three-value-repeat" color={theme === 'light' ? "#626262" : "#FFFFFF"}>Male: <span>{formatNumber(maleData?.count ?? 0)}</span></Box>
        <Box className="gender-one-by-three-value-repeat" color={theme === 'light' ? "#626262" : "#FFFFFF"}>Female: <span>{formatNumber(femaleData?.count ?? 0)}</span></Box>
        <Box className="gender-one-by-three-value-repeat" color={theme === 'light' ? "#626262" : "#FFFFFF"}>Undefined: <span>{formatNumber(unknownData?.count ?? 0)}</span></Box>
      </Box>
      <svg ref={svgRef}> </svg>
    </Box>
  );
};

export { Gender3_1_Option1 };
