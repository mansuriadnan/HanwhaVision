import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { VehicleByTypeProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const VehicleByType2_1_Option1: React.FC<VehicleByTypeProps> = ({
  vehicleByTypeCountData,
  customizedWidth,
  customizedHeight,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  const formatNumbers = (num: any) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  useEffect(() => {
    const data = [
      { name: "Truck", value: vehicleByTypeCountData?.truckInCount || 0 },
      {
        name: "Motorcycle",
        value: vehicleByTypeCountData?.motorCycleInCount || 0,
      },
      { name: "Bus", value: vehicleByTypeCountData?.busInCount || 0 },
      { name: "Bicycle", value: vehicleByTypeCountData?.bicycleInCount || 0 },
      { name: "Car", value: vehicleByTypeCountData?.carInCount || 0 },
    ];

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const barHeight = 40;
    const bargap = 0;
    const barStartX = 100;
    const radius = 20;
    const svgHeight = data.length * (barHeight + bargap);

    svg.attr("width", width).attr("height", Math.max(height, svgHeight));
    const paddingRight = 80; // enough room for value text at the end

    const barMaxWidth = width - barStartX - paddingRight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const barWidth = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([0, barMaxWidth]);

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    gradient
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#FFFFFF" },
        { offset: "100%", color: "#FFE817 " },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    const gradient2 = defs
      .append("linearGradient")
      .attr("id", "gradient2")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient2
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#FFFFFF" },
        { offset: "100%", color: "#F8FF31" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    const barGroups = svg
      .selectAll("g.bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr(
        "transform",
        (d, i) => `translate(${barStartX}, ${i * (barHeight + bargap) + 50})`
      );

    barGroups.each(function (d, i) {
      const group = d3.select(this);
      const bw = barWidth(d.value);
      let path = "";

      if (i === 0) {
        // First bar: bottom-left corner rounded
        path = `
                      M${radius},0
                      Q0,0 0,${radius}
                      V${barHeight}
                      H${bw}
                      V0
                      H${radius}
                      Z
                    `;
      } else if (i === data.length - 1) {
        // Last bar: bottom-right corner rounded
        path = `
                      M0,0
                      H${bw}
                      V${barHeight}
                      H${radius}
                      Q0,${barHeight} 0,${barHeight - radius}
                      V0
                      Z
                    `;
      } else {
        // Middle bars: plain rectangle
        path = `
                      M0,0
                      H${bw}
                      V${barHeight}
                      H0
                      Z
                    `;
      }

      group
        .append("path")
        .attr("d", path)
        .attr("fill", (d, i) => {
          // Alternate gradient per bar
          return i % 2 === 0 ? "url(#gradient)" : "url(#gradient2)";
        })
        .attr("stroke", "#ffcc00")
        .attr("stroke-width", 1);

      // Add vehicle type text
      group
        .append("text")
        .attr("x", -10)
        .attr("y", barHeight / 2)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr("fill",theme === 'light' ? "#212121" : "#FFFFFF")
        .attr("font-weight", 400)
        .text(d.name);

      // Add value text
      group
        .append("text")
        .attr("x", bw + 5)
        .attr("y", barHeight / 2 + 4)
        .attr("fill",theme === 'light' ? "#212121" : "#FFFFFF")
        .attr("font-weight", 600)
        .text(formatNumber(d.value));
    });
  }, [vehicleByTypeCountData, customizedWidth, customizedHeight, theme]);

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
    </Box>
  );
};
export { VehicleByType2_1_Option1 };
