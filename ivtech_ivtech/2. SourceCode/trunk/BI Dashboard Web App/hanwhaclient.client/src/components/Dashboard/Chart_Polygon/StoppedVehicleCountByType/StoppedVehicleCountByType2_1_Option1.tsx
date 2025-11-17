import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { IStoppedVehicleCountByTypeProps } from "../../../../interfaces/IChart";
// import Bus_Tooltip from "../../../../../public/images/stopped_vehicle_bus_option1.png";
// import Bus_Legend from "../../../../../public/images/stopped_vehicle_bus_option1_legend.png";
// import Bicycle_Tooltip from "../../../../../public/images/stopped_vehicle_bicycle_option1.png";
// import Bicycle_Legend from "../../../../../public/images/stopped_vehicle_bicycle_option1_legend.png";
// import Car_Tooltip from "../../../../../public/images/stopped_vehicle_car_option1.png";
// import Car_Legend from "../../../../../public/images/stopped_vehicle_car_option1_legend.png";
// import Truck_Tooltip from "../../../../../public/images/stopped_vehicle_truck_option1.png";
// import Truck_Legend from "../../../../../public/images/stopped_vehicle_truck_option1_legend.png";
// import Motorcycle_Tooltip from "../../../../../public/images/stopped_vehicle_motorcycle_option1.png";
// import Motorcycle_Legend from "../../../../../public/images/stopped_vehicle_motorcycle_option1_legend.png";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";
interface DataItem {
  label: string;
  value: number;
  color: string;
  tooltipIcon: string;
  legendIcon: string;
}


const StoppedVehicleCountByType2_1_Option1: React.FC<
  IStoppedVehicleCountByTypeProps
> = ({ stoppedVehicleCountByTypeData, customizedWidth, customizedHeight }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
   
   const allZero =
  !stoppedVehicleCountByTypeData || // null or undefined
  Object.keys(stoppedVehicleCountByTypeData).length === 0 
 

  const data = [
    {
      label: "Truck",
      value: stoppedVehicleCountByTypeData?.truck || 0,
      color: "#FFE601",
      tooltipIcon: "/images/stopped_vehicle_truck_option1.png",
      legendIcon: "/images/stopped_vehicle_truck_option1_legend.png",
    },
    {
      label: "Motorcycle",
      value: stoppedVehicleCountByTypeData?.motorcycle || 0,
      color: "#A48DFF",
      tooltipIcon: "/images/stopped_vehicle_motorcycle_option1.png",
      legendIcon: "/images/stopped_vehicle_motorcycle_option1_legend.png",
    },
    {
      label: "Bus",
      value: stoppedVehicleCountByTypeData?.bus || 0,
      color: "#006FFF",
      tooltipIcon: "/images/stopped_vehicle_bus_option1.png",
      legendIcon: "/images/stopped_vehicle_bus_option1_legend.png",
    },
    {
      label: "Bicycle",
      value: stoppedVehicleCountByTypeData?.cycle || 0,
      color: "#BBFF00",
      tooltipIcon: "/images/stopped_vehicle_bicycle_option1.png",
      legendIcon: "/images/stopped_vehicle_bicycle_option1_legend.png",
    },
    {
      label: "Car",
      value: stoppedVehicleCountByTypeData?.car || 0,
      color: "#FFFFFF",
      tooltipIcon: "/images/stopped_vehicle_car_option1.png",
      legendIcon: "/images/stopped_vehicle_car_option1_legend.png",
    },
  ];
  const getRoundedPercents = (data: any) => {
    const total = data.reduce((sum:any, d:any) => sum + d.value, 0);

    const raw = data.map((d:any) => ({
      ...d,
      rawPercent: total > 0 ? (d.value / total) * 100 : 0,
    }));

    const floored = raw.map((d:any) => ({
      ...d,
      roundedPercent: Math.floor(d.rawPercent),
    }));

    let used = floored.reduce((sum:any, d:any) => sum + d.roundedPercent, 0);
    let diff = 100 - used;

    const sortedRemainders = raw
      .map((d:any, i:any) => ({
        i,
        remainder: d.rawPercent - Math.floor(d.rawPercent),
      }))
      .sort((a:any, b:any) => b.remainder - a.remainder);

    for (let i = 0; i < diff; i++) {
       const idx = sortedRemainders[i % sortedRemainders.length].i;
      floored[idx].roundedPercent += 1;
    }

    // Attach to original data
    for (let i = 0; i < data.length; i++) {
      data[i].percent = floored[i].roundedPercent;
    }

    return data;
  }


  useEffect(() => {
    const pieData = getRoundedPercents(data);
    const customColors = [
      "#FFE601", // Truck
      "#A48DFF", // Motorcycle
      "#006FFF", // Bus
      "#BBFF00", // Bicycle
      "#FFFFFF", // Car
    ];

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 0, right: 80, bottom: 30, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const radius = Math.min(innerWidth, innerHeight) / 2.8;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    svg.attr("width", innerWidth).attr("height", innerHeight);

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map((d) => d.label))
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
        `translate(${innerWidth / 2 }, ${innerHeight / 2})`
      );

    //const defs = svg.append("defs");

    const pattern = g
      .append("pattern")
      .attr("id", "horizontal-stripe")
      .attr("width", 4)
      .attr("height", 4)
      .attr("patternUnits", "userSpaceOnUse");

    pattern
      .append("rect")
      .attr("width", 4)
      .attr("height", 4)
      .attr("fill", theme === 'light' ? "#FFFFFF" : "#3C3C3C"); // Base color
    pattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 2)
      .attr("x2", 4)
      .attr("y2", 2)
      .attr("stroke", "#A0A0A0") // Stripe color
      .attr("stroke-width", 1);

    // ✅ Append arcs to the centered group
    const arcs = g
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => {
        return d.data.label === "Car"
          ? "url(#horizontal-stripe)"
          : d.data.color;
      })
      // .attr("stroke", "white")
      // .attr("stroke-width", 2)
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

    const rectWidth = 70;
    const rectHeight = 20;

    labelGroup
      .append("rect")
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("width", rectWidth - 10)
      .attr("height", rectHeight)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("fill", "#F4F4F4")
      .style("stroke", (d, i) => `url(#border-gradient)`)
      .style("stroke-width", 1.5)
      .style("filter", "url(#label-shadow)");

    // Icon inside label
    labelGroup
      .append("image")
      .attr("xlink:href", (d) => d.data.tooltipIcon)
      .attr("x", -rectWidth / 2 + 4)
      .attr("y", -rectHeight / 2 + 2)
      .attr("width", 16)
      .attr("height", 16);

    // Text shifted to the right of the icon
    labelGroup
      .append("text")
      .attr("x", -rectWidth / 2 + 22)
      .attr("dy", "0.35em")
      .attr("style", "font-family: 'Public Sans', sans-serif; font-size: 11px; fill: #626262; font-weight: 400;")
      .text((d,i) => {
        return `${pieData[i].percent}%`;
      });
  }, [stoppedVehicleCountByTypeData, customizedWidth, customizedHeight, theme]);

  return (
    <Box
      sx={{ display: "flex", width: customizedWidth, height: customizedHeight }}
    >
      {allZero ?
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
        <>
          {/* SVG container */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <svg ref={svgRef} />
          </Box>

          {/* Legend on the right */}
          <Box
            sx={{
              width: 150, // Fixed width for legend
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
              overflow: "hidden", // Optional: prevent overflow
            }}
          >
            {data.map((item, i, arr) => {
              const total = arr.reduce((sum, d) => sum + d.value, 0);
              
              return (
                <Box
                  key={item.label}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {/* Icon on the left */}
                  <img
                    src={item.legendIcon}
                    alt={`${item.label} icon`}
                    style={{ width: 16, height: 16 }}
                  />

                  {/* Label and percent stacked vertically */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
                  >
                    <Box sx={{ fontSize: "12px", fontWeight: 400, color: theme === 'light' ?"#9A9A9A" :"#FFFFFF" , fontFamily:"'Public Sans', sans-serif !important"}}>
                      {item.label}
                    </Box>
                    <Box
                      sx={{ fontSize: "12px", fontWeight: 400, color: "#9A9A9A" , fontFamily:"'Public Sans', sans-serif !important"}}
                    >
                      ({formatNumber(item.value)})
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </>
      }

    </Box>
  );
};
export { StoppedVehicleCountByType2_1_Option1 };
