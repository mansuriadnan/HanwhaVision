import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CameraCountDataType } from "../../../../interfaces/IChart";
import { useThemeContext } from "../../../../context/ThemeContext";

const RadialProgressBar: React.FC<CameraCountDataType> = ({
  value,
  color,
  name,
  type,
  maxCapacity,
  width = 68,
  height = 68,
}) => {
  const { theme } = useThemeContext();
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Clamp value to maxCapacity
  value = value > maxCapacity ? maxCapacity : value;

  useEffect(() => {
    if (svgRef.current) {
      // Clear existing content
      const svgRoot = d3.select(svgRef.current);
      svgRoot.selectAll("*").remove();

      const radius = Math.min(width, height) / 2;

      // Append SVG group
      const svg = svgRoot
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      // Blur filter
      const defs = svg.append("defs");
      const filter = defs
        .append("filter")
        .attr("id", "blur-filter")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
        
      filter
        .append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 8.89)
       .attr("result", "blurred");
       

      // Scale
      const radialScale = d3
        .scaleLinear()
        .domain([0, maxCapacity])
        .range([0, radius - 20]);

      // Tick Marks
      // const tickCount = 60;
      // const tickLength = 4;
      // for (let i = 0; i < tickCount; i++) {
      //   const angle = (i / tickCount) * 2 * Math.PI;
      //   const x1 = (radius - 5) * Math.cos(angle);
      //   const y1 = (radius - 5) * Math.sin(angle);
      //   const x2 = (radius - 5 - tickLength) * Math.cos(angle);
      //   const y2 = (radius - 5 - tickLength) * Math.sin(angle);

      //   svg
      //     .append("line")
      //     .attr("x1", x1)
      //     .attr("y1", y1)
      //     .attr("x2", x2)
      //     .attr("y2", y2)
      //     .attr("stroke", "#191919")
      //     .attr("stroke-width", 1);
      // }

      // Tick Marks
      const tickCount = 60;
      const tickLength = radius * 0.08; // 8% of radius
      const tickStrokeWidth = Math.max(1, radius * 0.01); // Scale stroke width

      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * 2 * Math.PI;
        const x1 = (radius - tickLength) * Math.cos(angle);
        const y1 = (radius - tickLength) * Math.sin(angle);
        const x2 = radius * Math.cos(angle);
        const y2 = radius * Math.sin(angle);

        svg
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", theme === "light"? "#191919" : "#E8E8E8")
          .attr("stroke-width", tickStrokeWidth);
      }

      // Inner blurred circle
      svg
        .append("circle")
        .attr("r", 0) // start from 0 for animation
        .attr("fill", color)
        .attr("filter", "url(#blur-filter)")
        .transition()
        .duration(1000)
        .attr("r", radialScale(value));

      // Center Text
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", 18)
        .style("font-weight", "600")
        .attr("fill",theme === "light"? "#000" : "#E8E8E8")
        .text(value);
    }
  }, [value, width, height, maxCapacity, color,theme]);

  return (
    <div className="online-offline-cameras">
      <svg ref={svgRef}></svg>
      <p>
        {name.replace(" ", "\n")}
      </p>

    </div>
  );
};

export { RadialProgressBar };
