import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";
import { NewVsTotalVisitorProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";

const NewVsTotalVisitors2_1_Option1: React.FC<NewVsTotalVisitorProps> = ({
  newVsTotalVisitorCountData,
  customizedWidth,
  customizedHeight,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const formatNumbers = (num: any) => {
    if (num >= 1000000) {
      const value = (num / 1000000).toFixed(1);
      return (value.endsWith('.0') ? parseInt(value) : value) + "M";
    }
    if (num >= 1000) {
      const value = (num / 1000).toFixed(1);
      return (value.endsWith('.0') ? parseInt(value) : value) + "K";
    }
    return num.toString();
  };
  const data = [
    {
      label: "New Visitors",
      value: newVsTotalVisitorCountData?.newVisitorsCount || 0,
      color: "#B984FF",
      active: true,
    },
    {
      label: "Total Visitors",
      value: newVsTotalVisitorCountData?.totalVisitorsCount || 0,
      color: "#ACACAC",
      active: false,
    },
  ];

  useEffect(() => {
    // Fixed bar dimensions

    const width = customizedWidth as number;
    const height = customizedHeight as number;

    const barWidth = 80;
    const barGap = 20; // Smaller gap
    const totalBarAreaWidth = data.length * (barWidth + barGap) - barGap;
    const barStart = (width - totalBarAreaWidth) / 2; // Center bars horizontally

    const svg = d3.select(svgRef.current);
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    svg.selectAll("*").remove(); // Clear previous render

    svg.attr("width", width).attr("height", height);

    const defs = svg.append("defs");

    // Create a unique striped pattern for each bar
    data.forEach((d) => {
      defs
        .append("pattern")
        .attr("id", `stripes-${d.label.replace(/\s+/g, "-")}`)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 6)
        .attr("height", 6)
        .attr("patternTransform", "rotate(130)")
        .append("rect")
        .attr("width", 1)
        .attr("height", 6)
        .attr("fill", d.color);
    });

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.15);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    const g = svg.append("g");
    // draw bars
    g.selectAll("rect.pattern-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("display", (d) => (d.value === 0 ? "none" : null))
      .attr("class", "pattern-bar")
      .attr("x", (_d, i) => barStart + i * (barWidth + barGap)) // Adjust X to shift the bar to the right by 10% of the bandwidth
      .attr("y", (d) => y(d.value))
      .attr("width", barWidth) // Reduce the width to 80% of the original bandwidth
      .attr("height", (d) => y(0) - y(d.value))
      .attr("fill", (d) => `url(#stripes-${d.label.replace(/\s+/g, "-")})`)
      .attr("rx", 20)
      .attr("ry", 20)
      .attr("stroke", (d) => d.color) // Per-bar stroke color
      .attr("stroke-width", 1);

    g.selectAll("line.dot-line")
      .data(data)
      .enter()
      .append("line")
      .attr("display", (d) => (d.value === 0 ? "none" : null))
      .attr("class", "dot-line")
      .attr("x1", (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2)
      .attr("x2", (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2)
      .attr("y1", (d) => y(0))
      .attr("y2", (d) => y(0) + 20) // Line length
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 2);

    g.selectAll("circle.dot-end")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-end")
      .attr("cx", (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2)
      .attr("cy", (d) => y(0) + 20)
      .attr("r", 4)
      .attr("fill", (d) => d.color);

    // //set Label for each bar
    // g.selectAll("text.bar-label")
    //   .data(data)
    //   .enter()
    //   .append("text")
    //   .attr("class", "bar-label")
    //   .attr("x", (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2)
    //   .attr("y", y(0) + 40) // slightly below the dot
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "#444")
    //   .attr("font-size", "13px")
    //   .attr("font-weight", "700")
    //   .text((d) => d.label);

    // Horizontal line connecting all dots
    const xCoords = data.map(
      (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2
    );
    const minX = d3.min(xCoords) ?? 0;
    const maxX = d3.max(xCoords) ?? 0;

    g.append("line")
      .attr("x1", minX - 40)
      .attr("x2", maxX + 40)
      .attr("y1", y(0) + 20)
      .attr("y2", y(0) + 20)
      .attr("stroke", "#888")
      .attr("stroke-width", 0.15);

    g.selectAll("rect.inner-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("display", (d) => (d.value === 0 ? "none" : null))
      .attr("class", "inner-bar")
      .attr("width", x.bandwidth() * 0.5) // Smaller width for center alignment
      .attr(
        "x",
        (_d, i) =>
          barStart + i * (barWidth + barGap) + (barWidth - barWidth * 0.3) / 6
      )
      .attr("y", (d) => y(0) - 45) // A bit above the bottom of the bar
      .attr("height", 35)
      .attr("fill", (d) => d.color) // Different colors per bar
      .attr("rx", 12)
      .attr("ry", 12);

    //Text inside the rounded rectangle:
    g.selectAll("text.inner-bar-text")
      .data(data)
      .enter()
      .append("text")
      .attr("display", (d) => (d.value === 0 ? "none" : null))
      .attr("class", "inner-bar-text")
      .attr("x", (_d, i) => barStart + i * (barWidth + barGap) + barWidth / 2)
      .attr("y", (d) => y(0) - 45 + 35 / 2 + 4) // Vertically center (rect Y + half height + offset)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "15px")
      .attr("font-weight", "600")
      .text((d) => formatNumbers(d.value)); // Display value like 50k, 2k

    // --- Legend Configuration ---
    const legendGroup = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${(width - data.length * 110) / 2}, ${height - 60})`); // Center the legend horizontally

    const legendSpacing = 140; // Space between legend items

    const legendItem = legendGroup.selectAll("g.legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (_d, i) => `translate(${i * legendSpacing}, 0)`);

    // Circle
    legendItem.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.color)
      .attr("cx", 0)
      .attr("cy", 0);

    // Label
    legendItem.append("text")
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "12px")
      .attr("font-weight", "700")
      .attr("fill", "#626262")
      .text(d => d.label);

    // Count below label
    legendItem.append("text")
      .attr("x", 12)
      .attr("y", 20)
      .attr("font-size", "13px")
      .attr("font-weight", "700")
      .attr("fill", "#FF8A01") // Orange text like in image
      .text(d => formatNumber(d.value)
      );
  }, [newVsTotalVisitorCountData, customizedWidth, customizedHeight]);

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
      {newVsTotalVisitorCountData?.totalVisitorsCount === 0 ?
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
        <svg ref={svgRef} />
      }

    </Box>
  );
};
export { NewVsTotalVisitors2_1_Option1 };
