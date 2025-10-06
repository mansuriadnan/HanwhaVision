import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box,  Typography } from "@mui/material";
import { VehicleByTypeProps } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

interface DataItem {
  name: string;
  value: number;
}

type VehicleCountKey =
  | "truckInCount"
  | "motorCycleInCount"
  | "busInCount"
  | "bicycleInCount"
  | "carInCount";

const categories: { key: VehicleCountKey; label: string; color: string }[] = [
  { key: "truckInCount", label: "Truck", color: "#FF4D8F" },
  { key: "motorCycleInCount", label: "MotorCycle", color: "#9E4AFF" },
  { key: "busInCount", label: "Bus", color: "#ACE322" },
  { key: "bicycleInCount", label: "Bicycle", color: "#39EFFF" },
  { key: "carInCount", label: "Car", color: "#FFBD06" },
];

const VehicleByType2_1_Option3: React.FC<VehicleByTypeProps> = ({
  vehicleByTypeCountData,
  customizedWidth,
  customizedHeight,
}) => {
  const allZero =
    !vehicleByTypeCountData ||
    (vehicleByTypeCountData.truckInCount === 0 &&
      vehicleByTypeCountData.motorCycleInCount === 0 &&
      vehicleByTypeCountData.busInCount === 0 &&
      vehicleByTypeCountData.bicycleInCount === 0 &&
      vehicleByTypeCountData.carInCount === 0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  // const formatNumbers = (num: any) => {
  //   if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  //   if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  //   return num.toString();
  // };

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
    // const total = d3.sum(data, (d) => d.value);
    const customColors = [
      "#FF4D8F", // Truck
      "#9E4AFF", // Motorcycle
      "#ACE322", // Bus
      "#39EFFF", // Bicycle
      "#FFBD06", // Car
    ];
    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 10, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const radius = Math.min(innerWidth, innerHeight) / 2.3;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    svg.attr("width", innerWidth).attr("height", innerHeight);

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.name))
      .range(customColors);

    const pie = d3
      .pie<DataItem>()
      .sort(null)
      .value((d) => d.value)
      .padAngle(0.01);

    const arc = d3
      .arc<d3.PieArcDatum<DataItem>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius - 15)
      .cornerRadius(8);

    // ✅ Create a group centered in the SVG
    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${innerWidth / 2}, ${innerHeight / 2 + 10})`
      );

    // ✅ Append arcs to the centered group
    const arcs = g
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.name))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .transition()
      .duration(1000)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(i(t))!;
        };
      });

    const gradientId = `border-gradient`;
    const gradient = g
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#86868600");

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ECECEC");

    const outerLabelArc = d3
      .arc<d3.PieArcDatum<DataItem>>()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10);

    const labelGroup = g
      .selectAll("g.label-group")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("transform", (d) => {
        const [x, y] = outerLabelArc.centroid(d);
        return `translate(${x}, ${y})`;
      });

    const rectWidth = 60;
    const rectHeight = 20;

    labelGroup
      .append("rect")
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("width", rectWidth - 5)
      .attr("height", rectHeight)
      .attr("rx", 8)
      .attr("ry", 8)
      .style("fill", "#fff")
      .style("stroke", (d, i) => `url(#border-gradient)`)
      .style("stroke-width", 1.5)
      .style("filter", "url(#label-shadow)");

    labelGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .style("fill", "#626262")
      .style("font-weight", "400")
      .text((d) => formatNumber(d.data.value));
  }, [vehicleByTypeCountData, customizedWidth, customizedHeight, theme]);

  return (
    <Box
      sx={{
        width: customizedWidth,
        height: customizedHeight,
        display: "flex",
        flexDirection: "column",
        padding: "10px 0px 0px 30px",
      }}
    >
      {allZero ? (
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
      ) : (
        <>
          <svg ref={svgRef} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 3,
              justifyContent: "center",
              marginBottom: 1,
            }}
          >
            {categories.map((item, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    display: "inline-block",
                  }}
                />
                <Typography sx={{ fontSize: "10px", color:theme === 'light' ? "#212121" : "#D4D4D4"}}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 2,
              position: "relative",
              lineHeight: "1.5",
              marginBottom: "15px",
            }}
          >
            {[
              {
                label: "Truck",
                value: vehicleByTypeCountData?.truckInCount || 0,
                color: "#FF4D8F",
              },
              {
                label: "Motorcycle",
                value: vehicleByTypeCountData?.motorCycleInCount || 0,
                color: "#9E4AFF",
              },
              {
                label: "Bus",
                value: vehicleByTypeCountData?.busInCount || 0,
                color: "#ACE322",
              },
              {
                label: "Bicycle",
                value: vehicleByTypeCountData?.bicycleInCount || 0,
                color: "#39EFFF",
              },
              {
                label: "Car",
                value: vehicleByTypeCountData?.carInCount || 0,
                color: "#FFBD06",
              },
            ].map((item, i, arr) => {
              const total = arr.reduce((sum, d) => sum + d.value, 0);
              const percent =
                total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
              return (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    minWidth: 50,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        mr: 1,
                      }}
                    />
                    <Box sx={{ fontSize: 12, fontWeight: 800, color: "#626262" }}>
                      {item.label}
                    </Box>
                  </Box>
                   <Box
                    sx={{
                      fontSize: 11,
                      color: "#FF7C01",
                      mt: 0,
                      fontWeight: "bold",
                    }}
                  >
                    {percent}%
                  </Box> 
                </Box>
              );
            })}
          </div> */}
        </>
      )}
    </Box>
  );
};
export { VehicleByType2_1_Option3 };
