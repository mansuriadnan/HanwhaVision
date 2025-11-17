import React, { useEffect, useRef } from "react";
import { IZoneWiseCapacityUtilizationProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWiseCapacityUtilizationForPeople2_1_Option3: React.FC<
  IZoneWiseCapacityUtilizationProps
> = ({ customizedWidth, customizedHeight, ZoneWiseCUData }) => {
  const axisRef = useRef<SVGSVGElement | null>(null);
  const barsRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!ZoneWiseCUData || ZoneWiseCUData.length === 0 || !barsRef.current)
      return;

    const margin = { top: 0, right: 50, bottom: 0, left: 50 };
    const barHeight = 25;
    const barPadding = 20;
    const chartWidth = customizedWidth - margin.left - margin.right;

    const xMax = d3.max(ZoneWiseCUData, (d) => d.utilization) || 100;
    const roundedMax = Math.ceil(xMax / 100) * 100;
    const numTicks = xMax >= 200000 ? 4 : xMax >= 100000 ? 5 : 10;
    const tickInterval = roundedMax / numTicks;
    const xTicks = d3.range(0, roundedMax + 1, tickInterval);

    const xScale = d3.scaleLinear().domain([0, roundedMax]).range([0, chartWidth]);

    const formatTick = (d: number) => {
      if (d >= 100000) return `${(d / 100000).toFixed(1)}L`;
      if (d >= 1000) return `${(d / 1000).toFixed(0)}k`;
      return d.toString();
    };

    // Top Axis
    const axisSvg = d3.select(axisRef.current);
    axisSvg.selectAll("*").remove();
    axisSvg
      .append("g")
      .attr("transform", `translate(${margin.left}, 30)`)
      .call(d3.axisTop(xScale).tickValues(xTicks).tickFormat(formatTick as any).tickSize(0).tickPadding(10))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", theme === 'light' ? '#212121' : "#E8E8E8")
      .style("font-family", "sans-serif");

    axisSvg.select("path").attr("stroke", theme === 'light' ? "#F0F0F0" : "#626262").attr("stroke-width", '1.05px');

    // Bars
    const barsSvg = d3.select(barsRef.current);
    barsSvg.selectAll("*").remove();

    // Gradient definition
    const defs = barsSvg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "bar-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#FFC06D");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#FF9100");

    const g = barsSvg.append("g").attr("transform", `translate(${margin.left}, 0)`);

    // Background bars
    g.selectAll(".bg-bar")
      .data(ZoneWiseCUData)
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 10)
      .attr("width", chartWidth)
      .attr("height", barHeight)
      .attr("fill", theme === 'light' ? "#F4F4F4" : "#323232")
      .attr("rx", 10)
      .attr("ry", 10); // optional, to smooth vertical edges too


    // Main bars
    g.selectAll(".bar")
      .data(ZoneWiseCUData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 10)
      .attr("height", barHeight)
      .attr("width", 0)
      .attr("fill", "url(#bar-gradient)")
      .attr("rx", 10)
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.utilization));

    // Zone labels
    g.selectAll(".zone-label")
      .data(ZoneWiseCUData)
      .enter()
      .append("text")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + barHeight + 22)
      .text((d) => d.zoneName)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("fill", theme === 'light' ? "#212121" : "#FFFFFF");

    // Percentage labels
    g.selectAll(".percentage-label")
      .data(ZoneWiseCUData)
      .enter()
      .append("text")
      .attr("x", chartWidth - 5)
      .attr("text-anchor", "end")
      .attr("y", (_, i) => i * (barHeight + barPadding) + barHeight + 22)
      .attr("dy", "0.35em")
      .text((d) => `${d.utilization}`)
      .style("font-size", "12px")
      .style("fill", theme === 'light' ? "#212121" : "#FFFFFF")
      .style("font-family", "sans-serif");
  }, [ZoneWiseCUData, customizedWidth, customizedHeight, theme]);

  const topHeight = 40;
  const barHeight = 25;
  const barPadding = 20;
  const barsHeight = (ZoneWiseCUData?.length || 0) * (barHeight + barPadding) - topHeight;

  return (
    <div
      style={{
        width: customizedWidth,
        height: customizedHeight - 50,
        display: "flex",
        flexDirection: "column",
        padding: "10px 15px 0px 0px",
        overflowY: "auto",
        overflowX: "hidden",
        marginTop: "30px",
        color: "gray",
      }}
    >
      {!ZoneWiseCUData || ZoneWiseCUData.length === 0 ?
        <Box
          sx={{
            height: customizedHeight,
            width: customizedWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "16px",
            color: "#888",
          }}
        >
          No Data Found
        </Box>
        :
        <>
          {/* Top Fixed Axis */}
          <svg ref={axisRef} width={customizedWidth} height={topHeight} />

          {/* Scrollable Bars */}
          <div
            className="custom-scroll"
            style={{
              height: customizedHeight - topHeight,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <svg ref={barsRef} width={customizedWidth} height={barsHeight + 60} />
          </div>
        </>
      }
    </div>
  );
};

export { ZoneWiseCapacityUtilizationForPeople2_1_Option3 };
