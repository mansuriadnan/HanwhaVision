import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { IZWPeopleCount } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWisePeopleCounting2_1Option1: React.FC<IZWPeopleCount> = ({
  customizedWidth,
  customizedHeight,
  zoneWisePeopleCountingData,
}) => {
  const { theme } = useThemeContext();
  const axisRef = useRef<SVGSVGElement | null>(null);
  const barsRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!zoneWisePeopleCountingData || !axisRef.current || !barsRef.current) return;

    const width = customizedWidth as number;
    const barHeight = 14;
    const margin = { top: 20, right: 80, bottom: 0, left: 85 };
    const innerWidth = width - margin.left - margin.right;

    const maxValue =
      d3.max(zoneWisePeopleCountingData, (d) =>
        Math.max(d.peopleInCount || 0, d.peopleOutCount || 0)
      ) || 0;
    const roundedMax = Math.ceil(maxValue / 100) * 100;

    const xScale = d3.scaleLinear().domain([0, roundedMax]).range([0, innerWidth]);

    const tickCount = Math.max(3, Math.min(10, Math.floor(innerWidth / 50)));
    const customTickFormat = (domainValue: d3.NumberValue, _index: number): string => {
      const d = Number(domainValue);
      if (d >= 100000) return `${(d / 100000).toFixed(1).replace(/\.0$/, '')}L`;
      if (d >= 1000) return `${(d / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      return d.toString();
    };
    // const customTickFormat = (d: number) => {
    //   if (d >= 100000) return `${(d / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    //   if (d >= 1000) return `${(d / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    //   return d.toString();
    // };

    // Draw top axis
    const axisSvg = d3.select(axisRef.current);
    axisSvg.selectAll("*").remove();
    axisSvg
      .append("g")
      .attr("transform", `translate(${margin.left}, 20)`)
      .call(d3.axisTop(xScale).ticks(tickCount).tickFormat(customTickFormat).tickSize(0).tickPadding(10))
      .attr("stroke", theme === 'light' ? "#212121" : "#E8E8E8")
      .attr("stroke-width", 0.3)
      .selectAll("text")
      .style("font-size", "11px");

    axisSvg.select("path")
      .attr("stroke", theme === 'light' ? "#F0F0F0" : "#626262")
      .attr("stroke-width", '1.05px');

    // Draw bars
    const barsSvg = d3.select(barsRef.current);
    barsSvg.selectAll("*").remove();
    const chart = barsSvg.append("g").attr("transform", `translate(${margin.left}, 10)`);

    zoneWisePeopleCountingData.forEach((d, i) => {
      // const y = i * barSpacing;
      const groupHeight = barHeight * 2 + 6;
      const gapBetweenGroups = 30; // Space after the group
      const y = i * (groupHeight + gapBetweenGroups);

      // Gray bar (People Out)
      chart.append("rect")
        .attr("x", 0)
        .attr("y", y)
        .attr("width", xScale(d.peopleOutCount || 0))
        .attr("height", barHeight)
        .attr("fill", theme === 'light' ? "#E7E7E7" : "#B8B8B8")
        .attr("rx", 5);

      // Lime bar (People In)
      chart.append("rect")
        .attr("x", 0)
        .attr("y", y + barHeight + 6)
        .attr("width", xScale(d.peopleInCount || 0))
        .attr("height", barHeight)
        .attr("fill", "#D2FF58")
        .attr("rx", 5);

      // Left label
      chart.append("text")
        .attr("x", -10)
        .attr("y", y + barHeight + 4)
        .attr("transform", `rotate(-45, -10, ${y + barHeight + 4})`)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .text(d.zoneName);

      // Right values
      chart.append("text")
        .attr("x", xScale.range()[1] + 5)
        .attr("y", y + barHeight / 2)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .text(formatNumber(d.peopleOutCount || 0));

      chart.append("text")
        .attr("x", xScale.range()[1] + 5)
        .attr("y", y + barHeight * 1.5 + 6)
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .text(formatNumber(d.peopleInCount || 0));
    });
  }, [zoneWisePeopleCountingData, customizedWidth, customizedHeight, theme]);

  const topHeight = 30;
  const barSpacing = 65;
  const barsHeight = (zoneWisePeopleCountingData?.length || 0) * barSpacing;

  return (
    <Box
      sx={{
        width: customizedWidth,
        height: customizedHeight as number - 80,
        display: "flex",
        flexDirection: "column",
        // padding: "10px 10px 0px 0px",
        overflow: "hidden",
        // marginTop: "10px",
        color: "gray",
        margin: '50px 0px 0px 0px'
      }}
    >
      {/* Fixed Axis */}
      <svg ref={axisRef} width={customizedWidth} height={topHeight} />

      {/* Scrollable Bars */}
      <div
        style={{
          height: customizedHeight as number - topHeight - 70,
          overflowY: "auto",
          overflowX: "hidden",
          marginRight: '10px'
        }}
      >
        <svg ref={barsRef} width={customizedWidth} height={barsHeight + 20} />
      </div>

      {/* Legend */}
      <div
        style={{
          height: "1.05px",
          background: theme === 'light' ? "#F0F0F0" : "#626262",
          width: "55%",
          margin: "10px 85px",
        }}
      ></div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "20px",
          marginTop: "10px",
          paddingLeft: "10px",
          marginLeft: '70px'
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#D2FF58",
              marginRight: 6,
            }}
          ></div>
          <span style={{ fontSize: 12 }}>People In</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#E5E5E5",
              marginRight: 6,
            }}
          ></div>
          <span style={{ fontSize: 12 }}>People Out</span>
        </div>
      </div>
    </Box>
  );
};

export { ZoneWisePeopleCounting2_1Option1 };
