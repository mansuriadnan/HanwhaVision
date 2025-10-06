import React, { useEffect, useRef } from "react";
import { CapacityUtilizationAnanlysisProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { formatNumber } from "../../../../utils/formatNumber";
import { opacity } from "html2canvas/dist/types/css/property-descriptors/opacity";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const CapacityUtilizationForPeople2_1_Option1: React.FC<
  CapacityUtilizationAnanlysisProps
> = ({ capacityUtilizationpPeopleData, customizedWidth, customizedHeight }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  // const data = [
  //   {
  //     label: "Capacity",
  //     value: Math.max(
  //       0,
  //       Math.round(capacityUtilizationpPeopleData?.totalCapacity || 0)
  //     ),
  //     color: "#FFBF6B",
  //     opacity: '10%'
  //   },
  //   {
  //     label: "Utilization",
  //     value: Math.max(
  //       0,
  //       Math.round(capacityUtilizationpPeopleData?.utilization || 0)
  //     ),
  //     color: "#FFBF6B",
  //     opacity: '20%'
  //   },
  //   {
  //     label: "Most Day",
  //     value: Math.max(
  //       0,
  //       Math.round(
  //         capacityUtilizationpPeopleData?.utilizationMostLeastDay
  //           ?.mostDayUtilization || 0
  //       )
  //     ),
  //     color: "#FFBF6B",
  //     opacity: '30%'
  //   },
  //   {
  //     label: "Least Day",
  //     value: Math.max(
  //       0,
  //       Math.round(
  //         capacityUtilizationpPeopleData?.utilizationMostLeastDay
  //           ?.leastDayUtilization || 0
  //       )
  //     ),
  //     color: "#FFBF6B",
  //     opacity: '100%'
  //   },
  // ];

  const rawData = [
    {
      label: "Capacity",
      value: Math.max(
        0,
        Math.round(capacityUtilizationpPeopleData?.totalCapacity || 0)
      ),
      color: "#FFBF6B",
    },
    {
      label: "Utilization",
      value: Math.max(
        0,
        Math.round(capacityUtilizationpPeopleData?.utilization || 0)
      ),
      color: "#FFBF6B",
    },
    {
      label: "Most Day",
      value: Math.max(
        0,
        Math.round(
          capacityUtilizationpPeopleData?.utilizationMostLeastDay
            ?.mostDayUtilization || 0
        )
      ),
      color: "#FFBF6B",
    },
    {
      label: "Least Day",
      value: Math.max(
        0,
        Math.round(
          capacityUtilizationpPeopleData?.utilizationMostLeastDay
            ?.leastDayUtilization || 0
        )
      ),
      color: "#FFBF6B",
    },
  ];

  // Sort by value to find min and max
  // const values = rawData.map((d) => d.value);
  // const min = Math.min(...values);
  // const max = Math.max(...values);

  // // Create opacity scale from 0.2 to 1
  // const opacityScale = d3.scaleLinear()
  //   .domain([min, max])     // min → max values in your data
  //   .range([1, 0.2]);        // reversed: min → 1, max → 0.2

  // // Add dynamic opacity based on value
  // const data = rawData.map((d) => ({
  //   ...d,
  //   opacity: opacityScale(d.value),
  // }));

  const minValue = Math.min(...rawData.map((d) => d.value));

  // Assign opacity: '100%' to min, '30%' to others
  const data = rawData.map((d) => ({
    ...d,
    opacity: d.value === minValue ? "1" : "0.3",
  }));
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = parseInt(customizedWidth as string, 10) - 20;
    const height = parseInt(customizedHeight as string, 10) - 50;

    const centerX = width / 2;
    const bottomPadding = 50;
    const baseY = height - bottomPadding; // dynamic bottom space

    const maxRadius = (Math.min(width, height) / 4) * 1.5; // based on available space

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(data, (d) => d.value)!])
      .range([0, maxRadius]);

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const group = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${centerX}, 0)`);

    const labelXStart = width / 8; // dynamic label starting point

    sortedData.forEach((d, i) => {
      const r = radiusScale(d.value);
      const cy = baseY - r;

      // Group for each circle and its label box
      const itemGroup = group.append("g");

      // Main circle
      const circle = itemGroup
        .append("circle")
        .attr("r", r)
        .attr("cx", 0)
        .attr("cy", cy)
        .attr("fill", d.color)
        .attr("opacity", d.opacity)
        .attr("stroke", "#ccc")
        .style("cursor", "pointer");

      // Value text inside the circle
      itemGroup
        .append("text")
        .text(`${formatNumber(d.value)}`)
        .attr("x", 0)
        .attr("y", cy - r + 20)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-weight", 600)
        // .style("font-size", `${Math.max(10, width / 40)}px`)
        .style("font-size", `14px`)
        .style("fill", theme === "light" ? "#212121" : "#FFFFFF");

      const labelBoxX = r / 2 + 25;

      // Subgroup for label box + dot + label
      const labelGroup = itemGroup.append("g").style("display", "none").raise();

      // Background box
      labelGroup
        .append("rect")
        .attr("rx", 12)
        .attr("ry", 12)
        .attr("width", width / 5)
        .attr("height", 45)
        .attr("fill", "white")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1)
        .attr("x", labelBoxX + 25)
        .attr("y", cy - 15);

      // // Colored dot
      labelGroup
        .append("circle")
        .attr("cx", labelBoxX + 35)
        .attr("cy", cy)
        .attr("r", 5)
        .attr("fill", d.color)
        .attr("opacity", d.opacity);

      // Label text
      labelGroup
        .append("text")
        .text(d.label)
        .attr("x", labelBoxX + 45)
        .attr("y", cy)
        .attr("text-anchor", "start")
        .attr("dy", "0.35em")
        .style("font-size", `${Math.max(10, width / 60)}px`)
        .style("fill", "#333");

      labelGroup
        .append("text")
        .text(formatNumber(d.value))
        .attr("x", labelBoxX + 45)
        .attr("y", cy + 20) // position below label
        .attr("text-anchor", "start")
        .style("font-size", `${Math.max(10, width / 60)}px`)
        .style("fill", "#666");

      // Hover handlers to toggle label visibility
      circle
        .on("mouseover", () => {
          labelGroup.style("display", "block");
        })
        .on("mouseout", () => {
          labelGroup.style("display", "none");
        });
    });

    // --- Add Legend ---
    const legendY = height - 30;
    const legendItemWidth = 80;

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${(width - data.length * legendItemWidth) / 2}, ${legendY})`
      );

    data.forEach((d, i) => {
      const legendGroup = legend
        .append("g")
        .attr("transform", `translate(${i * legendItemWidth}, 0)`);

      // Dot
      legendGroup
        .append("circle")
        .attr("r", 6)
        .attr("fill", d.color)
        .attr("opacity", d.opacity)
        .attr("cx", 0)
        .attr("cy", 20);

      // Text
      legendGroup
        .append("text")
        .text(d.label)
        .attr("x", 10)
        .attr("y", 21)
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px")
        .style("fill", theme === "light" ? "#212121" : "#FFFFFF"); // Optional: use matching label color
    });
  }, [
    capacityUtilizationpPeopleData,
    customizedWidth,
    customizedHeight,
    theme,
  ]);

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
      {!capacityUtilizationpPeopleData ||
      capacityUtilizationpPeopleData?.totalCapacity === 0 ? (
        <Box
          sx={{
            height: customizedHeight,
            width: customizedWidth,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "16px",
            color: "#A8A8A8",
          }}
        >
          No Data Found
        </Box>
      ) : (
        <svg ref={svgRef} />
      )}
    </div>
  );
};

export { CapacityUtilizationForPeople2_1_Option1 };
