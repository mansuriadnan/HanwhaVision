import React, { useEffect, useRef } from "react";
import { ModalTypesProps } from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { useThemeContext } from "../../../../context/ThemeContext";

const ModaltypesWidget2_1_Option2: React.FC<ModalTypesProps> = ({
  modalTypesData,
  customizedWidth,
  customizedHeight,
  colorMap,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    if (!modalTypesData || modalTypesData.length === 0) return;

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 50, right: 30, bottom: 70, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // Clear previous render

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scaleBand()
      .domain(modalTypesData.map((d) => d.seriesName))
      .range([0, innerWidth])
      .padding(0.2);
    const barWidth = 40;

    // Y Scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(modalTypesData, (d) => d.totalCount)!])
      .nice()
      .range([innerHeight, 0]);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .attr("stroke", "#626262")
      .attr("stroke-width", 0.5)
      .call((g) => {
        g.select(".domain").attr("stroke", theme === 'light' ? "#626262" : "#D4D4D4");
        g.selectAll(".tick line").attr("stroke", theme === 'light' ? "#626262" : "#D4D4D4");
      })
      .selectAll("text")
      .style("fill", "#626262")
      .style("font-size", "12px")
      .style("font-weight", 200)
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .attr("stroke", theme === 'light' ? "#70757a" : '#D4D4D4')
      .attr("stroke-width", 0.5)
      .style("font-size", "10px")
      .style("font-weight", 200)
      .call((g) => {
        // g.select(".domain").remove(); // remove the Y-axis line

        g.selectAll("text")
          .attr("fill", theme === 'light' ? "#212121":"#FFFFFF") // Override text color
          // .style("fill", "#D4D4D4");// set tick labels to gray

        g.select(".domain")
          .attr("stroke", theme === 'light' ? "#70757a" : "#D4D4D4");
      });

    // Bars
    g.selectAll(".bar")
      .data(modalTypesData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      // .attr('x', (d) => x(d.seriesName)!)
      .attr("x", (d) => x(d.seriesName)! + (x.bandwidth() - barWidth) / 2)
      .attr("y", (d) => y(d.totalCount))
      .attr("width", barWidth)
      .attr("height", (d) => innerHeight - y(d.totalCount))
      .attr("rx", 10)
      .attr("fill", (d) => (colorMap && colorMap[d.seriesName]) || "#999");
  }, [modalTypesData, customizedHeight, customizedWidth]);

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
      <svg ref={svgRef} />
    </div>
  );
};

export { ModaltypesWidget2_1_Option2 };
