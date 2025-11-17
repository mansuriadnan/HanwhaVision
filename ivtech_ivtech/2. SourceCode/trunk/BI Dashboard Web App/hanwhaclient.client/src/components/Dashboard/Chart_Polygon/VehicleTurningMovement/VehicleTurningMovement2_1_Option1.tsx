import React, { useEffect, useRef } from "react";
import { IVTurningMovmentProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleTurningMovement2_1_Option1: React.FC<IVTurningMovmentProps> = ({
  customizedHeight,
  customizedWidth,
  vTMBubbleChartData,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const noTurningData =
    !vTMBubbleChartData ||
    (vTMBubbleChartData.left === 0 &&
      vTMBubbleChartData.right === 0 &&
      vTMBubbleChartData.straight === 0);
  const { theme } = useThemeContext();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // const width = customizedWidth;
    // const height = customizedHeight;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;

    const rawValues = [
      vTMBubbleChartData?.left ?? 0,
      vTMBubbleChartData?.right ?? 0,
      vTMBubbleChartData?.straight ?? 0,
    ];

    const maxVal = Math.max(...rawValues, 1); // avoid divide by zero
    const minRadius = Math.min(width, height) * 0.05; // 5% of chart size
    const maxRadius = Math.min(width, height) * 0.2; // 20% of chart size

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxVal])
      .range([minRadius, maxRadius]);

    // Compute radii ahead of time
    const radii = {
      left: radiusScale(vTMBubbleChartData?.left ?? 0),
      right: radiusScale(vTMBubbleChartData?.right ?? 0),
      straight: radiusScale(vTMBubbleChartData?.straight ?? 0),
    };

    const circles = [
      {
        label: "Left",
        value: Math.round(vTMBubbleChartData?.left) ?? 0,
        color: "#FF5683",
        x: centerX - 60,
        y: centerY - 60,
        radius: radii.left,
        labelColor: "#212121",
      },
      {
        label: "Straight",
        value: Math.round(vTMBubbleChartData?.straight) ?? 0,
        color: "#20A2FF",
        x: centerX - 40,
        y: centerY + 40,
        radius: radii.straight,
        labelColor: "#FFFFFF",
      },
      {
        label: "Right",
        value: Math.round(vTMBubbleChartData?.right) ?? 0,
        color: "#FFD900",
        x: centerX + 20,
        y: centerY - 40,
        radius: radii.right,
        labelColor: "#121212",
      },
    ];

    svg.attr("width", width).attr("height", height);
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    circles.forEach((circle) => {
      const group = g.append("g");

      group
        .append("circle")
        .attr("cx", circle.x)
        .attr("cy", circle.y)
        .attr("r", circle.radius)
        .attr("fill", circle.color)
        .attr("opacity", 0.85);

      group
        .append("text")
        .attr("x", circle.x)
        .attr("y", circle.y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", circle.labelColor)
        .attr("font-size", circle.radius * 0.2)
        .attr("font-weight", "600")
        .text(formatNumber(circle.value));

      const labelBoxWidth = Math.max(80, circle.label.length * 8);
      const labelGroup = group.append("g");

      labelGroup
        .append("rect")
        .attr("x", circle.x - labelBoxWidth / 2)
        .attr("y", circle.y - circle.radius)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", labelBoxWidth)
        .attr("height", 22)
        .attr("fill", "#fff")
        .attr("stroke", "#ccc");

      labelGroup
        .append("circle")
        .attr("cx", circle.x - labelBoxWidth / 2 + 10)
        .attr("cy", circle.y - circle.radius + 11)
        .attr("r", 5)
        .attr("fill", circle.color);

      labelGroup
        .append("text")
        .attr("x", circle.x - labelBoxWidth / 2 + 20)
        .attr("y", circle.y - circle.radius + 13)
        .attr("font-size", "10px")
        .attr("fill", "#000")
        .attr("font-weight", "400")
        .text(circle.label);
    });
  }, [vTMBubbleChartData, customizedWidth, customizedHeight]);

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
      {noTurningData ? (
        <Box
          sx={{
            width: customizedWidth,
            height: customizedHeight,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "16px",
            color: "#888",
          }}
        >
          No Data Found
        </Box>
      ) : (
        <>
          <svg ref={svgRef}></svg>
          {/* <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 3,
          justifyContent: "center",
          marginBottom: "25px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#FF5683",
              width: 10,
              height: 10,
              borderRadius: 10,
            }}
          ></Box>
          <Box>
            <Typography>Left</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#20A2FF",
              width: 10,
              height: 10,
              borderRadius: 10,
            }}
          ></Box>
          <Box>
            <Typography>Straignt</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#FFD900",
              width: 10,
              height: 10,
              borderRadius: 10,
            }}
          ></Box>
          <Box>
            <Typography>Right</Typography>
          </Box>
        </Box>
      </Box> */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Left", color: "#FF5683", value: 0 },
              { label: "Straight", color: "#20A2FF", value: 0 },
              { label: "Right", color: "#FFD900", value: 0 },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: item.color,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      fontSize: "12px",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: theme === "light" ? "#212121" : "#D4D4D4",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
                {/* <Typography fontSize={12} color="text.secondary">
              {item.value}
            </Typography> */}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export { VehicleTurningMovement2_1_Option1 };
