import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatNumber } from "../../../../utils/formatNumber";
import { CameraByFeatureProps } from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const CameraByFeature2_1_Option1: React.FC<CameraByFeatureProps> = ({
  CameraByFeatureData = [],
  customizedWidth,
  customizedHeight,
}) => {
  const axisRef = useRef<SVGSVGElement | null>(null);
  const barsRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!CameraByFeatureData.length || !axisRef.current || !barsRef.current) return;

    const margin = { top: 0, right: 50, bottom: 0, left: 50 };
    const barHeight = 25;
    const barPadding = 20;
    const chartWidth = customizedWidth - margin.left - margin.right;
    const xMax = d3.max(CameraByFeatureData, d => d.totalCount) ?? 1000;
    const tickInterval = xMax / 7;
    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, chartWidth]);
    const xTicks = d3.range(0, xMax + tickInterval, tickInterval);

    //  const xMax = 10000;
    //     const tickInterval = xMax / 10;
    //     const xTicks = d3.range(0, xMax + tickInterval, tickInterval);

    //     const xScale = d3.scaleLinear().domain([0, xMax]).range([0, chartWidth]);

    const defs = d3.select(barsRef.current)
      .append("defs")
      .append("linearGradient")
      .attr("id", "bar-gradientforfeature")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    defs.append("stop").attr("offset", "0%").attr("stop-color", "#7AD3FF");
    defs.append("stop").attr("offset", "100%").attr("stop-color", "#4FBAF0");

    // Draw X-axis
    const axisSvg = d3.select(axisRef.current);
    axisSvg.selectAll("*").remove();

    const xAxisGroup = axisSvg.append("g")
      .attr("transform", `translate(${margin.left}, 30)`);

    xAxisGroup
      .call(d3.axisTop(xScale).tickValues(xTicks).tickSize(0).tickPadding(10))
      .selectAll("text")
      .style('fill', theme === 'light' ? "#212121" : "#E8E8E8")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

    xAxisGroup.select("path").attr("stroke", theme === 'light' ? "#F0F0F0" : "#3C3C3C").attr("stroke-width", '1.05px');

    // Draw Bars
    const barsSvg = d3.select(barsRef.current);
    barsSvg.selectAll("g").remove();
    const g = barsSvg.append("g").attr("transform", `translate(${margin.left}, 0)`);

    g.selectAll(".bg-bar")
      .data(CameraByFeatureData)
      .enter()
      .append("rect")
      .attr("class", "bg-bar")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 20)
      .attr("width", chartWidth)
      .attr("height", barHeight)
      .attr("rx", 10)
      .attr("fill", "#f0f0f0");

    g.selectAll(".feature-bar")
      .data(CameraByFeatureData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (_, i) => i * (barHeight + barPadding) + 20)
      .attr("height", barHeight)
      .attr("rx", 10)
      .attr("fill", "url(#bar-gradientforfeature)")
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.totalCount));

    g.selectAll(".feature-label")
      .data(CameraByFeatureData)
      .enter()
      .append("text")
      .attr("x", 5)
      .attr("y", (_, i) => i * (barHeight + barPadding) + barHeight + 32)
      .text((d) => d.featuresName)
      .style("font-size", "10px")
      .style("font-weight", 400)
      .style("font-family", "sans-serif")
      .style("fill", theme === 'light' ? "#333" : "#E8E8E8");

    g.selectAll(".count-label")
      .data(CameraByFeatureData)
      .enter()
      .append("text")
      .attr("x", chartWidth - 5) // Align at the end of gray background bar
      .attr("text-anchor", "end") // Right-align the text
      .attr("y", (_, i) => i * (barHeight + barPadding) + barHeight + 30)
      .attr("dy", "0.35em")
      .text((d) => formatNumber(d.totalCount))
      .style("font-size", "10px")
      .style("font-weight", 400)
      .style("fill", theme === 'light' ? "#333" : "#E8E8E8")
      .style("font-family", "sans-serif");


  }, [CameraByFeatureData, customizedWidth, customizedHeight]);

  const topHeight = 40;
  const barHeight = 30;
  const barPadding = 20;
  const barsHeight = CameraByFeatureData.length * (barHeight + barPadding) - topHeight;

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
      {CameraByFeatureData.length === 0 ?
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
              height={barsHeight}
            />
          </div>
        </>
      }
    </div>
  );
};

export { CameraByFeature2_1_Option1 };
