import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CameraOnlineOfflineProps } from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const CameraOnlineOffline2_1_Option1: React.FC<CameraOnlineOfflineProps> = ({
  OnlineOfflineCameraData,
  customizedWidth,
  customizedHeight,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useThemeContext();

  const totalCameras = OnlineOfflineCameraData?.totalCameraCount ?? 0;
  const onlineCameras = OnlineOfflineCameraData?.onlineCameraCount ?? 0;
  const offlineCameras = OnlineOfflineCameraData?.oflineCameraCount ?? 0;

  const data = [
    { count: onlineCameras, total: totalCameras, type: "Online" },
    { count: offlineCameras, total: totalCameras, type: "Offline" },
  ];

  useEffect(() => {
    const width = customizedWidth as number;
    const height = (customizedHeight as number) - 80;
    const margin = { top: 80, right: 30, bottom: 20, left: 30 };
    const chartHeight = height - margin.top - margin.bottom;
    const chartWidth = width - margin.left - margin.right;

    const barWidth = chartWidth / 5;
    const barGap = chartWidth / 2.5;

    const totalGroupWidth = (data.length - 1) * barGap + barWidth;
    const startX = (chartWidth - totalGroupWidth) / 2;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    defs.append("pattern")
      .attr("id", "diagonalHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 6)  // Smaller spacing
      .attr("height", 6)
      .attr("patternTransform", "rotate(45)")  // Ensure clean diagonal lines
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 6)
      .attr("stroke", "#FF8A01")
      .attr("stroke-width", "0.93px");

    const maxTotal = d3.max(data, (d) => d.total) || 100;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxTotal])
      .range([chartHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bars
    g.selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => startX + i * barGap)
      .attr("y", (d) => yScale(d.count))
      .attr("width", barWidth)
      .attr("height", (d) => chartHeight - yScale(d.count))
      .attr("rx", 10)
      .attr("fill", (d) =>
        d.type === "Online" ? "#C3FF11" : "url(#diagonalHatch)"
      )
      .attr("stroke", (d) => (d.type === "Offline" ? "#FF8A01" : "none"))
      .attr("stroke-width", "0.93px");
    const nonZeroData = data.filter((d) => d.count > 0);
    // Percentage bubbles
    g.selectAll("rect.bubble")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bubble")
      .attr("x", (_, i) => startX + i * barGap + barWidth / 2 - 30)
      .attr("y", (d) => yScale(d.count) - 15)
      .attr("width", 60)
      .attr("height", 30)
      .attr("rx", 12)
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))");

    // Percentage Labels
    g.selectAll("text.bubble-text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bubble-text")
      .attr("x", (_, i) => startX + i * barGap + barWidth / 2)
      .attr("y", (d) => yScale(d.count))
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text((d) => `${Math.round((d.count / d.total) * 100)}%`)
      .attr("fill", "#333")
      .style("font-size", "14px")
      .style("font-weight", "600");

    // Count above bars
    g.selectAll("text.count-total")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "count-total")
      .attr("x", (_, i) => startX + i * barGap + barWidth / 2)
      .attr("y", (d) => yScale(d.count) - 20)
      .attr("text-anchor", "middle")
      .attr("fill", theme === 'light' ? "black" : "#E8E8E8")
      .style("font-size", "11px")
      .text((d) => `${d.count}/${d.total}`);

    // Horizontal X-axis line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", chartHeight)
      .attr("y2", chartHeight)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5);

    // Bottom labels
    g.selectAll("text.label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (_, i) => startX + i * barGap + barWidth / 2)
      .attr("y", chartHeight + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text((d) => d.type);

  }, [customizedWidth, customizedHeight, data]);

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
      {totalCameras === 0 ?
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
        <div>
          <svg ref={svgRef} />
        </div>
      }


      <div className="camera-online-offline-count">
        <div className="camera-online-offline-count-total-count"  style={{ color: theme === 'light'? '#444444' : '#A8A8A8' }}>
          Total Count :{" "}
          <span style={{ fontWeight: 600,color: theme === 'light'? '#444444' : '#E8E8E8' }}>{totalCameras}</span>
        </div>
        <div className="camera-online-offline-count-right">
          <div className="camera-online-offline-data">
            <img
              src="/images/online.svg"
              alt="online"
              style={{ width: "8px", height: "8px" }}
            />
            Online Cameras
          </div>
          <div className="camera-online-offline-data">
            <img
              src="/images/offline.svg"
              alt="offline"
              style={{ width: "8px", height: "8px" }}
            />
            Offline Cameras
          </div>
        </div>
      </div>
    </Box>
  );
};

export { CameraOnlineOffline2_1_Option1 };
