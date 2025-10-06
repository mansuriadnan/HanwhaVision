import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { OccupancyChartRef, PerformanceComparisonItem } from "../../interfaces/IReport";

interface PerformanceComparisonTableProps {
  chartData: PerformanceComparisonItem[],
  colors: string[],
  comperisionType?: string[] | undefined;
}
const OccupancyRateComparisonChart = forwardRef<OccupancyChartRef, PerformanceComparisonTableProps>(
  ({ chartData, colors, comperisionType }, ref) => {
    
    // const filteredChartData = chartData?.map(d => ({
    //   ...d,
    //   peopleOccupancy: d.peopleOccupancy < 0 ? 0 : d.peopleOccupancy,
    //   vehicleOccupancy: d.vehicleOccupancy < 0 ? 0 : d.vehicleOccupancy
    // }));
    
    // const svgRef = useRef<SVGSVGElement | null>(null);
    // const [selectedInterval, setSelectedInterval] = useState<number>();

    // useImperativeHandle(ref, () => ({
    //   getSvgElement: () => svgRef.current
    // }));

    // const handleTickChanges = (value: number) => {
    //   setSelectedInterval(value);
    // };

    // useEffect(() => {

    //   if (
    //     !svgRef.current ||
    //     !filteredChartData ||
    //     filteredChartData.length === 0
    //   )
    //     return;

    //   const svg = d3.select(svgRef.current);
    //   svg.selectAll("*").remove(); // Clear previous content

    //   const width = 600;
    //   const height = 500;
    //   const margin = { top: 50, right: 20, bottom: 150, left: 60 };
    //   const innerWidth = width - margin.left - margin.right;
    //   const innerHeight = height - margin.top - margin.bottom;

    //   type SMKey =
    //     | "peopleOccupancy"
    //     | "vehicleOccupancy"
    //   const categories: { key: SMKey; label: string; color: string }[] = [
    //     { key: "peopleOccupancy", label: "People", color: colors[0] },
    //     { key: "vehicleOccupancy", label: "Vehicles", color: colors[1] }
    //   ];

    //   const MultiLinechartGroup = svg
    //     .attr("width", width)
    //     .attr("height", height)
    //     .append("g")
    //     .attr("transform", `translate(${margin.left},${margin.top})`);


    //   const xDomain = filteredChartData.map((d) => d.siteZoneName);
    //   const yMax =
    //     d3.max(filteredChartData, (d) =>
    //       Math.max(
    //         d.peopleOccupancy,
    //         d.vehicleOccupancy
    //       )
    //     ) ?? 0;

    //   const xScale = d3
    //     .scaleBand()
    //     .domain(xDomain)
    //     .range([0, innerWidth])
    //     .padding(0.2);
      
    //   const yScale = d3
    //     .scaleLinear()
    //     .domain([0, yMax])
    //     .nice()
    //     .range([innerHeight, 0]);

    //   let yTickCount = 6; // number of ticks including 0 and max
    //   let yStep = yMax / (yTickCount - 1);
    //   // Create evenly spaced ticks from 0 to yMax inclusive
    //   let yTicks = Array.from({ length: yTickCount }, (_, i) => i * yStep);
    //   // Vertical grid lines
    //   MultiLinechartGroup.append("g")
    //     .attr("class", "x-grid-lines")
    //     .selectAll("line")
    //     .data(xDomain)
    //     .enter()
    //     .append("line")
    //     .attr("x1", (d) => xScale(d)! + xScale.bandwidth() / 2)
    //     .attr("x2", (d) => xScale(d)! + xScale.bandwidth() / 2)
    //     .attr("y1", yScale(d3.max(yTicks)!)) // Top of Y scale
    //     .attr("y2", yScale.range()[0]) // Bottom of Y scale
    //     .attr("stroke", "#E0E0E0")
    //     .attr("stroke-width", 1)

    //   const topY = yScale(d3.max(yTicks)!);
    //   const bottomY = yScale.range()[0];

    //   // Vertical lines at start and end of x-axis
    //   MultiLinechartGroup.append("line")
    //     .attr("x1", xScale.range()[0])
    //     .attr("x2", xScale.range()[0])
    //     .attr("y1", topY)
    //     .attr("y2", bottomY)
    //     .attr("stroke", "#E0E0E0")
    //     .attr("stroke-width", 1);

    //   MultiLinechartGroup.append("line")
    //     .attr("x1", xScale.range()[1])
    //     .attr("x2", xScale.range()[1])
    //     .attr("y1", topY)
    //     .attr("y2", bottomY)
    //     .attr("stroke", "#E0E0E0")
    //     .attr("stroke-width", 1);

    //   // Horizontal grid lines (from ticks)
    //   MultiLinechartGroup.append("g")
    //     .attr("class", "y-grid-lines")
    //     .selectAll("line")
    //     .data(yTicks)
    //     .enter()
    //     .append("line")
    //     .attr("x1", 0)
    //     .attr("x2", innerWidth)
    //     .attr("y1", d => yScale(d))
    //     .attr("y2", d => yScale(d))
    //     .attr("stroke", "#E0E0E0")
    //     .attr("stroke-width", 1);

    //   // Ensure top and bottom lines are drawn explicitly
    //   const yEdgeLines = [0, yMax];
    //   MultiLinechartGroup
    //     .append("g")
    //     .selectAll("line")
    //     .data(yEdgeLines)
    //     .enter()
    //     .append("line")
    //     .attr("x1", 0)
    //     .attr("x2", innerWidth)
    //     .attr("y1", (d) => yScale(d))
    //     .attr("y2", (d) => yScale(d))
    //     .attr("stroke", "#E0E0E0")
    //     .attr("stroke-width", 1);

    //   const line = d3
    //     .line<{ site: string; value: number }>()
    //     .x((d) => xScale(d.site)! + xScale.bandwidth() / 2)
    //     .y((d) => yScale(d.value))      

    //   // Create a separate group for lines and for circles
    //   const lineGroup = MultiLinechartGroup.append("g").attr("class", "line-group");
    //   const circleGroup = MultiLinechartGroup.append("g").attr("class", "circle-group");

    //   categories.forEach((cat) => {
    //     const lineData = filteredChartData.map((d) => ({
    //       site: d.siteZoneName,
    //       value: d[cat.key],
    //     }));

    //     // Line path
    //     lineGroup.append("path")
    //       .datum(lineData)
    //       .attr("class", "line")
    //       .attr("fill", "none")
    //       .attr("stroke", cat.color)
    //       .style("stroke-width", 2)
    //       .attr("d", line);

    //     // Hollow border circles — drawn on top
    //     circleGroup.selectAll(`.circle-${cat.key}`)
    //       .data(lineData)
    //       .enter()
    //       .append("circle")
    //       .attr("class", `circle-${cat.key}`)
    //       .attr("cx", (d) => xScale(d.site)! + xScale.bandwidth() / 2)
    //       .attr("cy", (d) => yScale(d.value))
    //       .attr("r", 4)
    //       .attr("fill", "white") // optional: white fill for clarity
    //       .attr("stroke", cat.color)
    //       .attr("stroke-width", 1.5)
    //       .style("fill", "white")
    //       .style("stroke", cat.color)         
    //       .style("stroke-width", "1.5px") 
    //       .on("mouseover", (_, d) => {
    //         d3.select("#tooltip").style("opacity", 1).html(`${d.value}`);
    //       })
    //       .on("mousemove", (event) => {
    //         d3.select("#tooltip")
    //           .style("left", event.pageX + 10 + "px")
    //           .style("top", event.pageY - 20 + "px");
    //       })
    //       .on("mouseout", () => {
    //         d3.select("#tooltip").style("opacity", 0);
    //       });
    //   });

    //   // X Axis
    //   MultiLinechartGroup.append("g")
    //     .attr("transform", `translate(0, ${innerHeight})`)
    //     .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(0)) // No tick lines
    //     .call((g) => {
    //       g.select(".domain").remove(); // Remove the x-axis line
    //       g.selectAll(".tick line").remove(); // Remove tick lines (redundant but safe)
    //     })
    //     .selectAll("text")
    //     .style("fill", "#666")
    //     .style("font-size", "11px")
    //     .attr("transform", "rotate(-45)")
    //     .style("text-anchor", "end");

    //   // Y axis
    //   const yAxis = d3.axisLeft(yScale)
    //     .tickValues(yTicks)
    //     .tickSize(0);

    //   MultiLinechartGroup.append("g")
    //     .call(yAxis)
    //     .call(g => g.select(".domain").remove()) // remove axis line if needed
    //     .selectAll("text")
    //     .style("fill", "#666")
    //     .style("font-size", "12px");

    //   // Create tooltip div
    //   const tooltip = d3.select("#tooltipSM");

    //   if (tooltip.empty()) {
    //     d3.select("body")
    //       .append("div")
    //       .attr("id", "tooltipSM")
    //       .style("position", "absolute")
    //       .style("background", "#fff")
    //       .style("padding", "4px 8px")
    //       .style("border", "2px solid #ccc")
    //       .style("border-radius", "4px")
    //       .style("font-size", "12px")
    //       .style("pointer-events", "none")
    //       .style("opacity", 0);
    //   }

    //   //Calculate averages for each category
    //   const legendData = categories.map((cat) => {
    //     const avg = d3.mean(filteredChartData, (d) => d[cat.key]) ?? 0;
    //     return {
    //       label: cat.label,
    //       color: cat.color,
    //       average: Math.round(avg),
    //     };
    //   });

    //   // Add SVG legend group (position bottom center)
    //   const legendGroup = svg
    //     .append("g")
    //     .attr("transform", `translate(${innerWidth / 2 - 60}, ${innerHeight / 2 + 300})`); // Centered horizontally, near bottom

    //   legendData.forEach((item, i) => {
        
    //     const itemGroup = legendGroup
    //       .append("g")
    //       .attr("transform", `translate(${i * 120}, 0)`); // Horizontal spacing

    //     // Row 1: dot + label
    //     const row1 = itemGroup.append("g");

    //     row1
    //       .append("circle")
    //       .attr("cx", 0 + (i*20))
    //       .attr("cy", 0)
    //       .attr("r", 6)
    //       .attr("fill", item.color);

    //     row1
    //       .append("text")
    //       .text(item.label)
    //       .attr("x", 20 + (i*18))
    //       .attr("y", 8)
    //       .style("fill", "#626262")
    //       .style("font-size", "23px")
    //       .style("font-weight", "700");

    //     // Row 2: percentage below
    //     itemGroup
    //       .append("text")
    //       .text(`${item.average}%`)
    //       .attr("x", 20 + (i*18))
    //       .attr("y", 30)
    //       .style("fill", "#FF8A01")
    //       .style("font-size", "15px")
    //       .style("font-weight", "700");
    //   });
    const filteredChartData = chartData?.map(d => ({
      ...d,
      peopleOccupancy: d.peopleOccupancy < 0 ? 0 : d.peopleOccupancy,
      vehicleOccupancy: d.vehicleOccupancy < 0 ? 0 : d.vehicleOccupancy
    }));
    
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<number>();

    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current
    }));

    const handleTickChanges = (value: number) => {
      setSelectedInterval(value);
    };

    useEffect(() => {
      if (!svgRef.current || !filteredChartData || filteredChartData.length === 0)
        return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous content

      const width = 600;
      const height = 500;
      const margin = { top: 50, right: 20, bottom: 150, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      type SMKey = "peopleOccupancy" | "vehicleOccupancy";
      const categories: { key: SMKey; label: string; color: string }[] = [
        { key: "peopleOccupancy", label: "People", color: colors[0] },
        { key: "vehicleOccupancy", label: "Vehicles", color: colors[1] }
      ];

      // Filter categories based on comperisionType
      const filteredCategories = categories.filter(cat => {
        if (!comperisionType || comperisionType.length === 0) {
          return true; // Show all if no filter is provided
        }
        return comperisionType.includes(cat.key === "peopleOccupancy" ? "people" : "vehicle");
      });

      const MultiLinechartGroup = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xDomain = filteredChartData.map((d) => d.siteZoneName);
      // const yMax =
      //   d3.max(filteredChartData, (d) =>
      //     Math.max(
      //       ...filteredCategories.map(cat => d[cat.key])
      //     )
      //   ) ?? 0;
      // Calculate max from data
      let dataMax = d3.max(filteredChartData, (d) =>
        Math.max(...filteredCategories.map(cat => d[cat.key]))
      ) ?? 0;

      // If all values are 0, set yMax to 1 so chart is visible
      const yMax = dataMax === 0 ? 1 : dataMax;

     

      const xScale = d3
        .scaleBand()
        .domain(xDomain)
        .range([0, innerWidth])
        .padding(0.2);

       const yScale = d3
        .scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([innerHeight, 0]);

      let yTickCount = 6;
      let yStep = yMax / (yTickCount - 1);
      let yTicks = Array.from({ length: yTickCount }, (_, i) => i * yStep);

      // Vertical grid lines
      MultiLinechartGroup.append("g")
        .attr("class", "x-grid-lines")
        .selectAll("line")
        .data(xDomain)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d)! + xScale.bandwidth() / 2)
        .attr("x2", (d) => xScale(d)! + xScale.bandwidth() / 2)
        .attr("y1", yScale(d3.max(yTicks)!))
        .attr("y2", yScale.range()[0])
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1);

      const topY = yScale(d3.max(yTicks)!);
      const bottomY = yScale.range()[0];

      // Vertical boundary lines
      MultiLinechartGroup.append("line")
        .attr("x1", xScale.range()[0])
        .attr("x2", xScale.range()[0])
        .attr("y1", topY)
        .attr("y2", bottomY)
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1);

      MultiLinechartGroup.append("line")
        .attr("x1", xScale.range()[1])
        .attr("x2", xScale.range()[1])
        .attr("y1", topY)
        .attr("y2", bottomY)
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1);

      // Horizontal grid lines
      MultiLinechartGroup.append("g")
        .attr("class", "y-grid-lines")
        .selectAll("line")
        .data(yTicks)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1);

      const yEdgeLines = [0, yMax];
      MultiLinechartGroup.append("g")
        .selectAll("line")
        .data(yEdgeLines)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", "#E0E0E0")
        .attr("stroke-width", 1);

      const line = d3.line<{ site: string; value: number }>()
        .x((d) => xScale(d.site)! + xScale.bandwidth() / 2)
        .y((d) => yScale(d.value));

      // Groups for lines and circles
      const lineGroup = MultiLinechartGroup.append("g").attr("class", "line-group");
      const circleGroup = MultiLinechartGroup.append("g").attr("class", "circle-group");

      filteredCategories.forEach((cat) => {
        const lineData = filteredChartData.map((d) => ({
          site: d.siteZoneName,
          value: d[cat.key],
        }));

        // Line path
        lineGroup.append("path")
          .datum(lineData)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", cat.color)
          .style("stroke-width", 2)
          .attr("d", line);

        // Circles
        circleGroup.selectAll(`.circle-${cat.key}`)
          .data(lineData)
          .enter()
          .append("circle")
          .attr("class", `circle-${cat.key}`)
          .attr("cx", (d) => xScale(d.site)! + xScale.bandwidth() / 2)
          .attr("cy", (d) => yScale(d.value))
          .attr("r", 4)
          .attr("fill", "white")
          .attr("stroke", cat.color)
          .attr("stroke-width", 1.5)
          .on("mouseover", (_, d) => {
            d3.select("#tooltipSM").style("opacity", 1).html(`${d.value}`);
          })
          .on("mousemove", (event) => {
            d3.select("#tooltipSM")
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 20 + "px");
          })
          .on("mouseout", () => {
            d3.select("#tooltipSM").style("opacity", 0);
          });
      });

      // X Axis
      MultiLinechartGroup.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(0))
        .call((g) => {
          g.select(".domain").remove();
          g.selectAll(".tick line").remove();
        })
        .selectAll("text")
        .style("fill", "#666")
        .style("font-size", "11px")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // Y Axis
      const yAxis = d3.axisLeft(yScale)
        .tickValues(yTicks)
        .tickSize(0);

      MultiLinechartGroup.append("g")
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("fill", "#666")
        .style("font-size", "12px");

      // Tooltip
      const tooltip = d3.select("#tooltipSM");

      if (tooltip.empty()) {
        d3.select("body")
          .append("div")
          .attr("id", "tooltipSM")
          .style("position", "absolute")
          .style("background", "#fff")
          .style("padding", "4px 8px")
          .style("border", "2px solid #ccc")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("opacity", 0);
      }

      // Legend
      const legendData = filteredCategories.map((cat) => {
        const avg = d3.mean(filteredChartData, (d) => d[cat.key]) ?? 0;
        return {
          label: cat.label,
          color: cat.color,
          average: Math.round(avg),
        };
      });

      const legendGroup = svg
        .append("g")
        .attr("transform", `translate(${innerWidth / 2 - 60}, ${innerHeight / 2 + 300})`);

      legendData.forEach((item, i) => {
        const itemGroup = legendGroup
          .append("g")
          .attr("transform", `translate(${i * 120}, 0)`);

        const row1 = itemGroup.append("g");

        row1
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 6)
          .attr("fill", item.color);

        row1
          .append("text")
          .text(item.label)
          .attr("x", 20)
          .attr("y", 8)
          .style("fill", "#626262")
          .style("font-size", "23px")
          .style("font-weight", "700");

        itemGroup
          .append("text")
          .text(`${item.average}%`)
          .attr("x", 20)
          .attr("y", 30)
          .style("fill", "#FF8A01")
          .style("font-size", "15px")
          .style("font-weight", "700");
      });
    }, [chartData, colors]);

    return (
   <div>
         <Box className="reports-repeated-box">
          <Typography variant="h6" className="reports-chart-name">Occupancy Rate Comparison</Typography>
            <Box className="reports-charts-box"><svg ref={svgRef}></svg></Box>
          </Box>
      </div>
    );
  });
export { OccupancyRateComparisonChart };
