import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { IZWPeopleCount } from "../../../../interfaces/IChart";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const ZoneWisePeopleCounting2_1Option2: React.FC<IZWPeopleCount> = ({
  customizedWidth,
  customizedHeight,
  zoneWisePeopleCountingData,
}) => {
  const { theme } = useThemeContext();
  const yAxisRef = useRef<SVGSVGElement | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!zoneWisePeopleCountingData || !yAxisRef.current || !chartRef.current) return;


    const height = customizedHeight as number;
    const margin = { top: 55, right: 20, bottom: 112, left: 0 };
    const barMinWidth = 30;
    const chartWidth = Math.max(customizedWidth as number, zoneWisePeopleCountingData.length * barMinWidth);
    const innerHeight = height - margin.top - margin.bottom;

    // Clear existing SVGs
    d3.select(yAxisRef.current).selectAll("*").remove();
    d3.select(chartRef.current).selectAll("*").remove();

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(zoneWisePeopleCountingData.map((d) => d.zoneName))
      .range([0, chartWidth - margin.left - margin.right])
      .padding(0.3);

    const maxValue = d3.max(zoneWisePeopleCountingData, d => (d.peopleInCount || 0) + (d.peopleOutCount || 0)) || 0;
    const roundedMax = Math.ceil(maxValue / 100) * 100;

    const yScale = d3.scaleLinear()
      .domain([0, roundedMax])
      .range([innerHeight, 0])
      .nice();

    const tickCount = Math.max(3, Math.min(10, Math.floor(innerHeight / 50)));
    const customTickFormat = (d: number) => {
      if (d >= 10000000) return `${d / 10000000}Cr`;
      if (d >= 100000) return `${d / 100000}L`;
      if (d >= 1000) return `${d / 1000}K`;
      return d.toString();
    };

    // Y Axis (fixed)
    const yAxisSvg = d3.select(yAxisRef.current)
      .attr("width", 50)
      .attr("height", height);

    const yAxisGroup = yAxisSvg.append("g")
      .attr("transform", `translate(45, ${margin.top})`);

    yAxisGroup
      .call(d3.axisLeft(yScale).ticks(tickCount).tickFormat(customTickFormat as any).tickSize(0).tickPadding(8))
      .call((g) => g.select(".domain").attr("stroke", theme === 'light' ? "#D4D4D4" : "#9C9C9C"))
      .selectAll("text")
      .attr("fill", theme === 'light' ? "#212121" : "#FFFFFF")             // Use fill for text color (not stroke)
      .style("font-size", "10px");
    // .style("font-size", "1px");

    // Chart (scrollable)
    const chartSvg = d3.select(chartRef.current)
      .attr("width", chartWidth)
      .attr("height", height);

    const chart = chartSvg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X Axis
    chart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", theme === 'light' ? "#D4D4D4" : "#9C9C9C"))
      .selectAll("text")
      .attr("fill", theme === 'light' ? "#212121" : "#FFFFFF")             // Use fill for text color (not stroke)
      .style("font-size", "10px")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start")
      .style("font-size", "10px");

    // Bars
    zoneWisePeopleCountingData.forEach((d) => {
      const x = xScale(d.zoneName) || 0;
      const barWidth = xScale.bandwidth() * 0.5;
      const offset = (xScale.bandwidth() - barWidth) / 2;

      const outCount = d.peopleOutCount || 0;
      const inCount = d.peopleInCount || 0;

      const yOut = yScale(outCount);
      const yIn = yScale(outCount + inCount);

      const outHeight = innerHeight - yOut;
      // const inHeight = yOut - yIn - 5;
      const gapBetweenBars = 2;
      const inHeight = Math.max(yOut - yIn - gapBetweenBars, 1); // Ensure bar is not too thin


      // Out bar
      chart.append("rect")
        .attr("x", x + offset)
        .attr("y", yOut)
        .attr("width", barWidth)
        .attr("height", outHeight)
        .attr("fill", theme === 'light' ? "#E5E5E5" : "#B8B8B8")
        .attr("rx", 10)
        .style("cursor", "pointer")
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>Out</strong> : ${formatNumber(outCount)}`);        
        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });

      // In bar
      chart.append("rect")
        .attr("x", x + offset)
        // .attr("y", yIn)
        .attr("y", yIn - gapBetweenBars)
        .attr("width", barWidth)
        .attr("height", inHeight)
        .attr("fill", "#D2FF58")
        .attr("rx", 10)
        .style("cursor", "pointer")
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>In</strong> : ${formatNumber(inCount)}`);

        })
        .on("mousemove", (event) => {
          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        });
    });

  }, [zoneWisePeopleCountingData, customizedWidth, customizedHeight, theme]);

  return (
    <div style={{ width: customizedWidth }}>

      {/* Main chart area */}
      <div style={{ display: "flex", flexDirection: "row", height: customizedHeight as number - 40, margin: '0px 30px 0px 0px' }}>
        {/* Sticky Y-Axis */}
        <svg ref={yAxisRef} style={{ flex: "0 0 50px" }} />

        {/* Scrollable chart */}
        <div style={{ overflowX: "auto", overflowY: "hidden", flexGrow: 1 }}>
          <svg ref={chartRef} />
        </div>
      </div>

      {/* Legend below the chart */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginLeft: '85px',
          paddingLeft: 10,
          color: theme === 'light' ? "#212121" : "#D4D4D4"
          // marginTop:'5px'
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#D2FF58",
              marginRight: 6,
            }}
          ></div>
          <span style={{ fontSize: 12 }}>People In</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#E5E5E5",
              marginRight: 6,
            }}
          ></div>
          <span style={{ fontSize: 12 }}>People Out</span>
        </div>
      </div>

    </div>
  );
};

export { ZoneWisePeopleCounting2_1Option2 };
