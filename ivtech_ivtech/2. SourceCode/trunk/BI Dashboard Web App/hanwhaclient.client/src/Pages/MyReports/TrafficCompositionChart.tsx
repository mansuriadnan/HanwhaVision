import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { PerformanceComparisonItem, TrafficCompositionChartRef } from "../../interfaces/IReport";

interface PerformanceComparisonTableProps {
  chartData: PerformanceComparisonItem[],
  colors: string[],
  reportType: string,
  comperisionType?: string[] | undefined;
}
const TrafficCompositionChart = forwardRef<TrafficCompositionChartRef, PerformanceComparisonTableProps>(
  ({ chartData, colors, reportType, comperisionType }, ref) => {
    // Sum peopleCount and vehicleCount over all sites
    const totalPeopleCount = chartData.reduce((sum: any, d: any) => sum + d.peopleCount, 0);
    const totalVehicleCount = chartData.reduce((sum: any, d: any) => sum + d.vehicleCount, 0);

    // Map to pie chart data format
    // const pieChartData = [
    //   { label: "People", value: totalPeopleCount, color: colors[0] },
    //   { label: "Vehicle", value: totalVehicleCount, color: colors[1] },
    // ];

    // --- Filter data based on comperisionType ---
let pieChartData = [
  { label: "People", value: totalPeopleCount, color: colors[0] },
  { label: "Vehicle", value: totalVehicleCount, color: colors[1] },
];

if (
  comperisionType?.includes("people") &&
  !comperisionType.includes("vehicle")
) {
  // Only People → show one full slice
  pieChartData = [
    { label: "People", value: 100, color: colors[0] }
  ];
} else if (
  comperisionType?.includes("vehicle") &&
  !comperisionType.includes("people")
) {
  // Only Vehicle → show one full slice
  pieChartData = [
    { label: "Vehicle", value: 100, color: colors[1] }
  ];
}

    const svgRef = useRef<SVGSVGElement | null>(null);

    // Expose getSvgElement to parent via ref
    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current
    }));

    useEffect(() => {

      if (!svgRef.current || !chartData?.length) return;



      const width = 600;
      const height = 500;

      const radius = Math.min(width, height) / 2 - 50;
      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .html("") // Clear previous renders
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const pie = d3.pie<any>().value((d) => d.value);
      const arc = d3.arc<d3.PieArcDatum<any>>().innerRadius(0).outerRadius(radius - 40);

      const outerArc = d3
        .arc<d3.PieArcDatum<any>>()
        .innerRadius(radius - 40)
        .outerRadius(radius - 40);

      const arcs = pie(pieChartData);

      // Draw pie slices
      svg
        .selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => d.data.color)

      // Append rect + text at outer arc

      // Add SVG shadow filter
      const defs = svg.append("defs");

      defs
        .append("filter")
        .attr("id", "shadow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%")
        .append("feDropShadow")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("stdDeviation", 2)
        .attr("flood-color", "#000")
        .attr("flood-opacity", 0.3);

      svg
        .selectAll(".label-group")
        .data(arcs)
        .enter()
        .append("g")
        .attr("class", "label-group")
        .each(function (d) {
          const group = d3.select(this);
          const [x, y] = outerArc.centroid(d);

          // const labelText = `${isNaN(Math.round((d.data.value / d3.sum(pieChartData, (d) => d.value)) * 100))
          //     ? 0
          //     : Math.round((d.data.value / d3.sum(pieChartData, (d) => d.value)) * 100)
          //   }%`;
          const total = d3.sum(pieChartData, (d) => d.value);
          const percentage = (d.data.value / total) * 100;

          if (d.data.value === 0 || isNaN(percentage) || percentage === 0) {
            return;
          }

          const labelText = `${Math.round(percentage)}%`;

          const rectWidth = labelText.length * 15;
          const rectHeight = 30;

          group
            .append("rect")
            .attr("x", x - rectWidth / 2)
            .attr("y", y - rectHeight / 2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .attr("fill", "#fff")
            .attr("stroke", "#eee")
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("filter", "url(#shadow)");

          group
            .append("text")
            .attr("x", x)
            .attr("y", y + 4)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(labelText)
            .style("font-size", "10px")
            .style("fill", "#000");
        });
      //  Add custom legend inside SVG
      const legendGroup = svg
        .append("g")
        .attr("transform", `translate(-130, ${radius - 10})`); // Adjust vertical position

      // We use exact totals here
      const totalValues = [totalPeopleCount, totalVehicleCount];
      // Math.round(
      //             chartData.reduce((sum: any, d: any) => sum + d.peopleCount, 0)
      //           ),

      pieChartData.forEach((item, i) => {
        const g = legendGroup.append("g").attr("transform", `translate(${i * 140}, 0)`); // spacing

        // Dot
        g.append("circle")
          .attr("cx", 0 + 20 + (i * 3))
          .attr("cy", 8)
          .attr("r", 6)
          .attr("fill", item.color);

        // Label (e.g., "People")
        g.append("text")
          .text(item.label)
          .attr("x", 12 + 30 + (i * 4))
          .attr("y", 15)
          .style("fill", "#626262")
          .style("font-size", "23px")
          .style("font-weight", "700");

        // Actual count (e.g., 258) instead of percentage
        g.append("text")
          .text(`${item.value.toLocaleString()}`)
          .attr("x", 12 + 30 + (i * 4))
          .attr("y", 35)
          .style("fill", "#FF8A01")
          .style("font-size", "15px")
          .style("font-weight", "700");
      });

    }, [chartData, colors,comperisionType]);

    const getTrafficTitle = () => {
      // 1️⃣ Handle both or empty → show People vs Vehicles
      if (
        !comperisionType ||
        comperisionType.length === 0 ||
        (comperisionType.includes("people") && comperisionType.includes("vehicle"))
      ) {
        return "Traffic Composition (People Vs Vehicles)";
      }

      // 2️⃣ Handle single selections
      if (comperisionType.includes("vehicle")) {
        return "Traffic Composition (Vehicles)";
      }

      if (comperisionType.includes("people")) {
        return "Traffic Composition (People)";
      }

      // 3️⃣ Fallback
      return "Traffic Composition";
    };


    return (
      <Box>
        {/* <Typography variant="h6">Traffic Composition (People Vs Vehicles)</Typography> */}
        <Box className="reports-repeated-box">
          <Typography variant="h6" className="reports-chart-name">{getTrafficTitle()}</Typography>
          <Box className="reports-charts-box"><svg ref={svgRef} style={{ display: "block" }}></svg></Box>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "row",
              gap: 32, // spacing between People and Vehicles groups
            }}
          >
            {[
              {
                label: "People",
                color: colors[0],
                total: Math.round(
                  chartData.reduce((sum: any, d: any) => sum + d.peopleCount, 0)
                ),
              },
              {
                label: "Vehicles",
                color: colors[1],
                total: Math.round(
                  chartData.reduce((sum: any, d: any) => sum + d.vehicleCount, 0)
                ),
              },
            ].map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />
                  <Box sx={{ fontSize: 18, color: "#333", fontWeight: "bold" }}>
                    {item.label}
                  </Box>
                </Box>
                <Box sx={{ fontSize: 20, fontWeight: "bold", mt: "0px", color: "#FF9900" }}>
                  {item.total}
                </Box>
              </Box>
            ))}
          </div>

        </Box> */}
      </Box>
    );
  });
export { TrafficCompositionChart };
