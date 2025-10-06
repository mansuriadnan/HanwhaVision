import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ICapacityUtilizationforVehicleProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const CapacityUtilizationForVehicle2_1Option1: React.FC<
  ICapacityUtilizationforVehicleProps
> = ({ customizedWidth, customizedHeight, CUForVehicleData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  const legendItems = [
    { label: "Utilization", color: "#A9F7FE" },
    { label: "Percentage", color: "#F05C5C" },
    { label: "Most Day", color: "#FFFF80" },
    { label: "Least Day", color: "#8D6AF6" },
  ];

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const centerX = width / 2;
    const centerY = height / 2;

    const rawValues = [
      CUForVehicleData?.utilization ?? 0,
      CUForVehicleData?.percentage ?? 0,
      CUForVehicleData?.utilizationMostLeastDay?.mostDayUtilization ?? 0,
      CUForVehicleData?.utilizationMostLeastDay?.leastDayUtilization ?? 0,
    ];


    const maxVal = Math.max(...rawValues, 1); // avoid divide by zero
    const minRadius = Math.min(width, height) * 0.05; // 5% of chart size
    const maxRadius = Math.max(width, height) * 0.2; // 20% of chart size

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxVal])
      .range([minRadius, maxRadius]);

    const radii = {
      utilization: radiusScale(CUForVehicleData?.utilization ?? 0),
      // percentage: radiusScale(CUForVehicleData?.percentage ?? 0),
      percentage: radiusScale(((CUForVehicleData?.percentage ?? 0) * (CUForVehicleData?.totalCapacity ?? 0)) / 100),
      mostDay: radiusScale(
        CUForVehicleData?.utilizationMostLeastDay?.mostDayUtilization ?? 0
      ),
      leastDay: radiusScale(
        CUForVehicleData?.utilizationMostLeastDay?.leastDayUtilization ?? 0
      ),
    };

    function getSafeRadius(x: number, y: number, desiredRadius: number): number {
      const padding = 10;

      const maxLeft = x - padding;
      const maxRight = width - x - padding;
      const maxTop = y - padding;
      const maxBottom = height - y - padding;

      const maxAllowedRadius = Math.min(
        desiredRadius,
        maxLeft,
        maxRight,
        maxTop,
        maxBottom
      );

      return Math.max(minRadius, Math.min(maxAllowedRadius, desiredRadius));
    }

    const circles = [
      {
        label: "Utilization",
        value: Math.round(CUForVehicleData?.utilization ?? 0),
        color: "#A9F7FE",
        x: centerX - width * 0.15,
        y: centerY - height * 0.15,
        radius: getSafeRadius(centerX - width * 0.15, centerY - height * 0.15, radii.utilization),
        labelColor: "#000",
      },
      {
        label: "Percentage",
        value: Math.round(CUForVehicleData?.percentage ?? 0),
        color: "#F05C5C",
        x: centerX + width * 0.05,
        y: centerY - height * 0.1,
        radius: getSafeRadius(centerX + width * 0.05, centerY - height * 0.1, radii.percentage),
        labelColor: "#fff",
      },
      {
        label: "Most Day",
        value: Math.round(CUForVehicleData?.utilizationMostLeastDay?.mostDayUtilization ?? 0),
        color: "#FFFF80",
        x: centerX - width * 0.1,
        y: centerY + height * 0.1,
        radius: getSafeRadius(centerX - width * 0.1, centerY + height * 0.1, radii.mostDay),
        labelColor: "#000",
      },
      {
        label: "Least Day",
        value: Math.round(CUForVehicleData?.utilizationMostLeastDay?.leastDayUtilization ?? 0),
        color: "#8D6AF6",
        x: centerX + width * 0.1,
        y: centerY + height * 0.075,
        radius: getSafeRadius(centerX + width * 0.1, centerY + height * 0.075, radii.leastDay),
        labelColor: "#fff",
      },
    ];

    svg.attr("width", width).attr("height", height);
    const g = svg.append("g");

    circles.forEach((circle) => {
      // Tooltip
      // const tooltip = d3
      //   .select("body")
      //   .append("div")
      //   .style("position", "absolute")
      //   // .style("background", "#333")
      //   .style("color", "#333")
      //   .style("padding", "6px 10px")
      //   .style("border-radius", "4px")
      //   .style("font-size", "12px")
      //   .style("pointer-events", "none")
      //   .style("opacity", 0);

      const group = g.append("g");

      group
        .append("circle")
        .attr("cx", circle.x)
        .attr("cy", circle.y)
        .attr("r", circle.radius)
        .attr("fill", circle.color)
        .attr("opacity", 0.85)
        .on("mouseover", (event) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(
              `<strong>${circle.label}:</strong> ${circle.label === "Percentage"
                ? `${circle.value}%`
                : formatNumber(circle.value)
              }`
            );
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });

      group
        .append("text")
        .attr("x", circle.x)
        .attr("y", circle.y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", circle.labelColor)
        .attr("font-size", 15)
        .text(
          circle.label === "Percentage"
            ? `${circle.value}%`
            : formatNumber(circle.value)
        );
    });
  }, [CUForVehicleData, customizedWidth, customizedHeight, theme]);

  // return <svg ref={svgRef}></svg>;
  return (
    <div
      style={{
        width: customizedWidth,
        height: customizedHeight,
        display: "flex",
        flexDirection: "column",
        padding: "10px 0px",
      }}
    >
      {!CUForVehicleData ||
        CUForVehicleData?.totalCapacity === 0 || CUForVehicleData.utilization === 0?
        <Box
          sx={{
            height: customizedHeight,
            width: customizedWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "12px",
            color: "#A8A8A8",
          }}
        >
          No Data Found
        </Box>
        :
        <>
          <svg ref={svgRef} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              marginTop: 2,
            }}
          >
            {legendItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "12px",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    marginRight: 1,
                  }}
                />
                <span style={{ color: theme === 'light' ? "#212121" : "#FFFFFF" }}>
                  {item.label}
                </span>
              </Box>
            ))}
          </Box>
        </>
      }
    </div>
  );
};

export { CapacityUtilizationForVehicle2_1Option1 };
