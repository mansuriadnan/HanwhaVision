import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { ModalTypesProps } from "../../../../interfaces/IChart";
import { useThemeContext } from "../../../../context/ThemeContext";
import { Box } from "@mui/material";

const ModaltypesWidget2_1_Option1: React.FC<ModalTypesProps> = ({
  modalTypesData = [],
  customizedWidth,
  customizedHeight,
  colorMap = {},
}) => {
  const ref = useRef<SVGSVGElement>(null);
  const { theme } = useThemeContext();
  useEffect(() => {
    if (!Array.isArray(modalTypesData) || modalTypesData.length === 0) return;

    const width = Number(customizedWidth);
    const height = Number(customizedHeight);
    const radius = Math.min(width, height) / 2 - 60;
    const centerX = width / 3;
    const centerY = height / 2;

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove(); // Clear previous renders

    const total = d3.sum(modalTypesData, (d) => d.totalCount) || 1; // prevent divide-by-zero
    let currentAngle = -Math.PI / 2;

    // Outer circle
    svg
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius * 0.6)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    // Inner circle
    svg
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", radius * 1)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    modalTypesData.forEach((d) => {
      const arcValue = (d.totalCount / total) * 2 * Math.PI;
      const arcGenerator = d3
        .arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9)
        .startAngle(currentAngle)
        .endAngle(currentAngle + arcValue + 0.2)
        .cornerRadius(20);

      svg
        .append("path")
        .attr("d", arcGenerator()!)
        .attr("fill", colorMap?.[d.seriesName] || "#ccc")
        .attr("transform", `translate(${centerX}, ${centerY})`);

      currentAngle += arcValue;
    });

    // Center label
    svg
      .append("text")
      .text("Model Types")
      .attr("x", centerX)
      .attr("y", centerY + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", radius * 0.15)
      .attr("fill", "#999")
      .attr("font-weight", 600);

    // Dynamic Legend
    const legendX = radius * 2 + width * 0.1;
    const legendTopOffset =
      height / 2 - modalTypesData.length * (height * 0.06);
    const lineSpacing = height * 0.15;

    const legendG = svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendTopOffset})`);

    modalTypesData.forEach((d, i) => {
      const y = i * lineSpacing;
      const fontSize = height * 0.03;
      const lineHeight = fontSize + 3;

      legendG
        .append("circle")
        .attr("cx", 0)
        .attr("cy", y)
        .attr("r", fontSize / 2.5)
        .attr("fill", colorMap?.[d.seriesName] || "#ccc");

      legendG
        .append("text")
        .attr("x", 12)
        .attr("y", y)
        .attr("font-size", fontSize)
        .attr("fill", theme === "light" ? "#626262" : "#888888")
        .text(d.seriesName);

      legendG
        .append("text")
        .attr("x", 12)
        .attr("y", y + lineHeight)
        .attr("font-size", fontSize)
        .attr("fill", theme === "light" ? "#000" : "#E8E8E8")
        .attr("font-weight", 600)
        .text(d.totalCount.toString());

      legendG
        .append("text")
        .attr("x", 70)
        .attr("y", y)
        .attr("font-size", fontSize)
        .attr("fill", theme === "light" ? "orange" : "#E8E8E8")
        .attr("font-weight", 600)
        .text(`${Math.round((d.totalCount / total) * 100)}%`);
    });
  }, [modalTypesData, customizedWidth, customizedHeight, colorMap]);

  return modalTypesData?.some((x) => x.totalCount > 0) ? (
    <svg ref={ref} />
  ) : (
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
  );
};

export { ModaltypesWidget2_1_Option1 };
