import { useEffect, useRef, useState } from "react";
import { IDetectForkliftsProps } from "../../../../interfaces/IChart";
import { Box } from "@mui/material";
import * as d3 from "d3";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const DetectForklifts2_1_Option1: React.FC<IDetectForkliftsProps> = ({
  forkliftsData,
  proxomityForkliftsData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [detectForklifts, setDetectForklifts] = useState(0);
  const [proximityDetections, setProximityDetections] = useState(0);
  const [totalDetections, setTotalDetections] = useState(0);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (
      !svgRef.current ||
      (!forkliftsData || forkliftsData.length === 0) &&
      (!proxomityForkliftsData || proxomityForkliftsData.length === 0)
    ) {
      // If there's no data, clear the SVG and skip rendering
      d3.select(svgRef.current).selectAll("*").remove();
      return;
    }

    type ForkliftDataItem = {
      dateTime: string;
      queueCount: number;
    };

    const maxPerDate: Record<string, ForkliftDataItem> = {};

    forkliftsData?.forEach((item) => {
      const date = formatDateToConfiguredTimezone(item.dateTime).split("T")[0];
      if (
        !maxPerDate[date] ||
        new Date(item.dateTime) > new Date(maxPerDate[date].dateTime)
      ) {
        maxPerDate[date] = item;
      }
    });

    // Step 2: Sum the queueCounts of those max datetime entries
    const total = Object.values(maxPerDate).reduce(
      (sum, item: any) => sum + item.queueCount,
      0
    );
    const pTotal = getTotalCounts(proxomityForkliftsData ?? []);
    setDetectForklifts(total);
    setProximityDetections(pTotal);
    setTotalDetections(total + pTotal);

    if (
      !svgRef.current ||
      !forkliftsData ||
      forkliftsData.length === 0 ||
      !proxomityForkliftsData ||
      proxomityForkliftsData.length === 0
    )
      return;

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 100, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = 100;

    const data = [
      { label: "Detect Forklifts", value: detectForklifts, color: "#2D6A4F" },
      {
        label: "Proximity detection",
        value: proximityDetections,
        color: "#95D000",
      },
    ];

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Outer sunray-style marks
    const rays = 100;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * 2 * Math.PI;
      const innerR = radius;
      const outerR = radius + 15;
      const x1 = Math.cos(angle) * innerR;
      const y1 = Math.sin(angle) * innerR;
      const x2 = Math.cos(angle) * outerR;
      const y2 = Math.sin(angle) * outerR;
      chart
        .append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#DFF0D8")
        .attr("stroke-width", 2);
    }

    // Arc drawing
    const arc = d3.arc<d3.DefaultArcObject>();

    let startAngle = 0;
    data.forEach((d) => {
      const endAngle = (d.value / totalDetections) * 2 * Math.PI;

      // Choose cornerRadius dynamically
      const arcGenerator = d3
        .arc<d3.DefaultArcObject>()
        .innerRadius(radius - 15)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(startAngle + endAngle)
        .cornerRadius(d.label === "Detect Forklifts" ? 8 : 0); // ✅ Rounded corners

      chart.append("path").attr("d", arcGenerator(d)!).attr("fill", d.color);

      startAngle += endAngle;
    });
    // Center circle
    chart
      .append("circle")
      .attr("r", radius - 30)
      .attr("fill", "#93D200")
      .attr("opacity", "20%");

    // Center total value
    chart
      .append("text")
      .text(formatNumber(total))
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("fill", theme === 'light' ? "#2D6A4F" : "#FFFFFF")
      .style("font-size", "22px")
      .style("font-weight", "bold");

    // Labels on arc segments (aligned with their arc areas)
    startAngle = 0;
    data.forEach((d) => {
      const arcSpan = (d.value / totalDetections) * Math.PI;

      // ✅ Compute angle before updating startAngle
      const angle = startAngle + arcSpan / 2;
      const labelRadius = radius - 8; // Slightly inside arc

      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      const textPadding = 5;
      const labelText = d.value.toString();
      const textSize = 12;
      const labelWidth =
        labelText.length * textSize * 0.6 + textPadding * 2 + 30;
      const labelHeight = textSize + textPadding;
      const tmp = 30;
      chart
        .append("rect")
        .attr("x", x - labelWidth / 2 + tmp)
        .attr("y", y - labelHeight / 2)
        .attr("width", labelWidth)
        .attr("height", labelHeight)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", "#FFFFFF4D")
        .attr("stroke", "#93D200");

      // Label text
      chart
        .append("text")
        .text(!isNaN(Number(labelText)) ? formatNumber(Number(labelText)) : "0")
        .attr("x", x + tmp)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", `${textSize}px`)
        .style("fill", "#1b1b1b")
        .style("font-weight", "bold");

      startAngle += arcSpan;
    });
  }, [
    forkliftsData,
    proxomityForkliftsData,
    customizedWidth,
    customizedHeight,
    theme
  ]);

  const getTotalCounts = (data: any[]) => {
    if (!data) return 0;

    return data.reduce((sum: number, entry: any) => {
      let entryTotal = 0;
      Object.keys(entry).forEach((key) => {
        if (key !== "dateTime") {
          entryTotal += entry[key];
        }
      });
      return sum + entryTotal;
    }, 0);
  };

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
      {(!forkliftsData || forkliftsData.length === 0) &&
        (!proxomityForkliftsData || proxomityForkliftsData.length === 0) ? (
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
      ) :
        <>
          <svg ref={svgRef}></svg>

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
            {[
              {
                label: "Detect Forklifts",
                value: detectForklifts,
                color: "#2D6A4F",
              },
              {
                label: "Proximity detection",
                value: proximityDetections,
                color: "#95D000",
              },
            ].map((item) => (
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
                <Box sx={{ fontSize: 12, fontWeight: 800, color: theme === 'light' ? "#626262" : "#E8E8E8"}}>
                  {item.label}
                </Box>
              </Box>
            ))}
          </Box>
        </>
      }
    </Box>
  );
};
export { DetectForklifts2_1_Option1 };
