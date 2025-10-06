import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { AverageVehicleCountProps } from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";

const AverageVehicleCount2_1_Option1: React.FC<AverageVehicleCountProps> = ({
  AVCData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  const selectedIntervalNameRef = useRef<string>("");

  if (setExportHandler) {
    useExportHandler({
      apiEndpoint: `${apiUrls.AverageVehicleCountChart}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });
  }

  const data = [
    {
      label: "Incoming Average",
      value: AVCData?.averageInCount,
      color: "#06B6F6",
    },
    {
      label: "Outgoing Average",
      value: AVCData?.averageOutCount,
      color: "#FFF235",
    },
  ];
  useEffect(() => {
    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const barWidth = 120;
    const gap = 30;
    const radius = 12;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const totalBarsWidth = data.length * (barWidth + gap) - gap;
    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${(width - totalBarsWidth) / 2}, ${margin.top})`
      );

    const maxValue = Math.max(...data.map((d) => d.value ?? 0));
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue + 1000])
      .range([innerHeight, 0]);

    data.forEach((d, i) => {
      const x = i * (barWidth + gap);
      const barHeight = innerHeight - yScale(d.value ?? 0);
      const barY = yScale(d.value ?? 0);

      // Background bar
      g.append("rect")
        .attr("x", x)
        .attr("y", 0)
        .attr("width", barWidth)
        .attr("height", innerHeight)
        .attr("rx", radius)
        .attr("fill", "#f0f0f0");

      // Dimensions
      const topRadius = 30;
      const right = x + barWidth;
      const bottom = barY + barHeight;

      const minHeightForCurve = 2 * topRadius; // bar must be tall enough to show both top corners

      const dynamicRadius = Math.min(topRadius, barHeight / 2);

      let path = "";
      if (barHeight > 2) {
        // Rounded top corners
        path = `
                    M${x},${bottom}
                    V${barY + dynamicRadius}
                    Q${x},${barY} ${x + dynamicRadius},${barY}
                    H${right - dynamicRadius}
                    Q${right},${barY} ${right},${barY + dynamicRadius}
                    V${bottom}
                    Z
                `;
      } else {
        // Plain rectangle (fallback when bar too short for curves)
        path = `
                    M${x},${bottom}
                    V${barY}
                    H${right}
                    V${bottom}
                    Z
                `;
      }
      // Filled portion
      g.append("path")
        .attr("d", path)
        // .attr("x", x)
        // .attr("y", barY)
        // .attr("width", barWidth)
        // .attr("height", barHeight)
        .attr("fill", d.color);
      // .attr("rx", radius);

      // Value label
      const labelWidth = 60;
      const labelHeight = 24;
      const labelX = x + (barWidth - labelWidth) / 2;
      const labelY = barY - labelHeight - 4;

      g.append("rect")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("width", labelWidth)
        .attr("height", labelHeight)
        .attr("rx", 12)
        .attr("fill", "white")
        .attr("stroke", "#ccc");

      g.append("text")
        .attr("x", x + barWidth / 2)
        .attr("y", labelY + labelHeight / 2 + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(formatNumber(d.value ?? 0));
    });
  }, [AVCData, customizedWidth, customizedHeight]);

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
      <svg ref={svgRef} />
      {/* Legend below SVG */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          position: "absolute",
          bottom: 0,
          width: "100%",
          pb: 1,
        }}
      >
        {data.map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: item.color,
                mr: 1,
              }}
            />
            <Box
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: theme === "light" ? "#626262" : "#FFFFFF",
              }}
            >
              {item.label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { AverageVehicleCount2_1_Option1 };
