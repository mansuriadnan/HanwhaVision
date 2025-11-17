import React, { useEffect, useRef } from "react";
import { IZoneWiseCapacityUtilizationProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWiseCapacityUtilizationForVehicle2_1_Option3: React.FC<IZoneWiseCapacityUtilizationProps> = ({
  customizedWidth,
  customizedHeight,
  ZoneWiseCUData
}) => {
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
    const xScale = d3.scaleLinear().domain([0, roundedMax]).range([0, chartWidth]);
    const xTicks = d3.range(0, roundedMax + 1, tickInterval);

    const formatTick = (d: number) => {
      if (d >= 100000) return `${(d / 100000).toFixed(1)}L`;
      if (d >= 1000) return `${(d / 1000).toFixed(0)}k`;
      return d.toString();
    };

    // X Axis
    const axisSvg = d3.select(axisRef.current);
    axisSvg.selectAll("*").remove();
    axisSvg.append("g")
      .attr("transform", `translate(${margin.left}, 30)`)
      .call(d3.axisTop(xScale).tickValues(xTicks).tickFormat(formatTick as any).tickSize(0).tickPadding(10))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill",  theme === 'light' ?'#212121' : "#E8E8E8")
      .style("font-family", "sans-serif");

    axisSvg.select("path").attr("stroke", theme === 'light' ? "#F0F0F0" : "#626262").attr("stroke-width", '1.05px');

    // Bars
    const barsSvg = d3.select(barsRef.current);
    barsSvg.selectAll("*").remove();
    const g = barsSvg.append("g").attr("transform", `translate(${margin.left}, 0)`);

    g.selectAll(".bg-bar")
      .data(ZoneWiseCUData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 10)
      .attr("width", chartWidth)
      .attr("height", barHeight)
      .attr("fill",  theme === 'light' ?  "#F4F4F4" :"#323232");

    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(ZoneWiseCUData.map((d) => d.zoneName))
      .range(d3.schemeCategory10);

    g.selectAll(".bar")
      .data(ZoneWiseCUData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 10)
      .attr("height", barHeight)
      .attr("width", 0)
      .attr("fill", (d) => colorScale(d.zoneName))
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.utilization));

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

    g.selectAll(".percentage-label")
      .data(ZoneWiseCUData)
      .enter()
      .append("text")
      // .attr("x", xScale(roundedMax) * 0.7)
      .attr("x", chartWidth - 5) // Align at the end of gray background bar
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
  const barsHeight = ZoneWiseCUData && ZoneWiseCUData.length ? (ZoneWiseCUData.length * (barHeight + barPadding) - topHeight) : 0;

  return (
    <div
      style={{
        width: customizedWidth,
        height: customizedHeight - 50,
        display: "flex",
        flexDirection: "column",
        padding: "10px 15px 0px 0px", // increased vertical padding
        overflowY: "auto",
        overflowX: "hidden",
        marginTop: '30px',
        color: 'gray'
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
          {/* Fixed X-Axis */}
          <svg
            ref={axisRef}
            width={customizedWidth}
            height={topHeight}
          />

          {/* Scrollable bars */}
          <div
            className="custom-scroll"
            style={{
              height: customizedHeight - topHeight,
              overflowY: "auto",
              overflowX: "hidden",
            }}

          >
            <svg
              ref={barsRef}
              width={customizedWidth}
              height={barsHeight + 60}
            />
          </div>
        </>
      }
    </div>
  );
};

export { ZoneWiseCapacityUtilizationForVehicle2_1_Option3 };
