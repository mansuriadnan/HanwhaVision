import React, { useEffect, useRef, useState } from "react";
import {
  NewVsTotalVisitorProps,
  IParsedDataWithCategory,
  IntervalData,
} from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";

const NewVsTotalVisitors2_1_Option2: React.FC<NewVsTotalVisitorProps> = ({
  newVsTotalVisitorsChartData,
  newVsTotalVisitorCountData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const formatNumbers = (num: any) => {
    if (num >= 1000000) {
      const value = (num / 1000000).toFixed(1);
      return (value.endsWith(".0") ? parseInt(value) : value) + "M";
    }
    if (num >= 1000) {
      const value = (num / 1000).toFixed(1);
      return (value.endsWith(".0") ? parseInt(value) : value) + "K";
    }
    return num.toString();
  };
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [finalData, setFinalData] = useState<IParsedDataWithCategory>({});
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
  const selectedIntervalNameRef = useRef<string>("");
  const { theme } = useThemeContext();

  type VisitorKey = "newVisitor" | "totalVisitor";
  const categories: {
    key: VisitorKey;
    label: string;
    color: string;
    bordercolor: string;
    totalCount: number;
  }[] = [
    {
      key: "newVisitor",
      label: "New Visitor",
      color: "#E9D8FF",
      bordercolor: "#B984FF",
      totalCount: newVsTotalVisitorCountData?.newVisitorsCount || 0,
    },
    {
      key: "totalVisitor",
      label: "Total Visitor",
      color: "#D2D2D2",
      bordercolor: "#D2D2D2",
      totalCount: newVsTotalVisitorCountData?.totalVisitorsCount || 0,
    },
  ];

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };

  useEffect(() => {
    selectedIntervalNameRef.current = selectedIntervalName;
  }, [selectedIntervalName]);

  useEffect(() => {
    if (!newVsTotalVisitorsChartData || !categories) return;
    const updatedParsedData: IParsedDataWithCategory = {};
    categories.forEach((cat) => {
      updatedParsedData[cat.key] = newVsTotalVisitorsChartData.map((d) => ({
        date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
        value: d[cat.key] ?? 0,
      }));
    });

    setParsedDataWithCategory(updatedParsedData);
  }, [newVsTotalVisitorsChartData, selectedInterval]);

  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 30, right: 30, bottom: 130, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const MultiLinechartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = [startDate, endDate] as [Date, Date];
    const allValues = Object.values(finalData)
      .flat()
      .map((d) => d.value);

    const yMax = Math.max(d3.max(allValues) ?? 0, 10);

    const xScale = d3
      .scaleTime()
      .domain(xExtent as [Date, Date])
      .range([0, innerWidth]);

    let xTicks = xScale.ticks(selectedInterval);
    if (xTicks.length === 1) {
      xTicks = [xExtent[0], xTicks[0], xExtent[1]];
    }
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    const yTickSize = 5;

    const yTicks = yScale.ticks(yTickSize);

    MultiLinechartGroup.append("g")
      .attr("class", "y-grid-lines")
      .selectAll("line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#E0E0E0")
      .attr("opacity", theme === "light" ? "100%" : "20%")
      .attr("stroke-width", 1);

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.9));

    const area = d3
      .area<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveCatmullRom.alpha(0.9));

    const defs = svg.append("defs");

    categories.forEach((cat) => {
      const categoryWisedata = finalData[cat.key];
      if (!categoryWisedata || categoryWisedata.length === 0) return;

      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${cat.key}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%"); // Vertical gradient

      if (cat.key === "newVisitor") {
        // Gradient: top #E9D8FF → bottom rgba(255,255,255,0)
        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#E9D8FF")
          .attr("stop-opacity", 1);

        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#FFFFFF")
          .attr("stop-opacity", 0.8);
      } else {
        // Gradient: top #D2D2D2 → bottom rgba(217, 217, 217, 0)
        gradient
          .append("stop")
          .attr("offset", "2.52%")
          .attr("stop-color", "#D2D2D2")
          .attr("stop-opacity", 1);

        gradient
          .append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#D9D9D9")
          .attr("stop-opacity", 0);
      }

      // Actual visible line
      MultiLinechartGroup.append("path")
        .datum(categoryWisedata)
        .attr("class", `line-${cat.key}`)
        .attr("fill", "none")
        .attr("stroke", cat.bordercolor)
        .attr("stroke-width", "2px")
        .attr("d", line);

      // Transparent overlay for easier hover interaction
      MultiLinechartGroup.append("path")
        .datum(categoryWisedata)
        .attr("class", `line-hover-${cat.key}`)
        .attr("fill", "none")
        .attr("stroke", "transparent")
        .attr("stroke-width", "10px") // easier to hover
        .attr("d", line)
        .on("mousemove", function (event) {
          const [x] = d3.pointer(event);
          const xDate: any = xScale.invert(x);

          // Find nearest point by date
          const bisect = d3.bisector((d: any) => d.date).left;
          const index = bisect(categoryWisedata, xDate);
          const d0: any = categoryWisedata[index - 1];
          const d1: any = categoryWisedata[index];
          const d =
            d0 && d1 ? (xDate - d0.date > d1.date - xDate ? d1 : d0) : d0 || d1;

          if (d) {
            d3.select("#tooltip")
              .style("opacity", 1)
              .html(`<strong>${cat.label}</strong>: ${formatNumber(d.value)}`);
          }

          d3.select("#tooltip")
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
          d3.select("#tooltip").style("opacity", 0);
        }).raise();

      MultiLinechartGroup.append("path")
        .datum(categoryWisedata)
        .attr("fill", `url(#gradient-${cat.key})`)
        .attr("stroke", "none")
        .attr("d", area).lower();

      // //Circles
      // MultiLinechartGroup.selectAll(`.circle-${cat.key}`)
      //   .data(categoryWisedata)
      //   .enter()
      //   .append("circle")
      //   .attr("class", `circle-${cat.key}`)
      //   .attr("cx", (d) => xScale(d.date))
      //   .attr("cy", (d) => yScale(d.value))
      //   .attr("r", 1)
      //   .attr("fill", cat.color)
      //   .on("mouseover", (_, d) => {
      //     d3.select("#tooltip")
      //       .style("opacity", 1)
      //       .html(`<strong>${cat.label}</strong> : ${formatNumber(d.value)}`);
      //   })
      //   .on("mousemove", (event) => {
      //     d3.select("#tooltip")
      //       .style("left", event.pageX + 10 + "px")
      //       .style("top", event.pageY - 20 + "px");
      //   })
      //   .on("mouseout", () => {
      //     d3.select("#tooltip").style("opacity", 0);
      //   });
    });

    // X Axis
    MultiLinechartGroup.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
      .call((g) => {
        g.select(".domain").attr("stroke", "#70757a");
        g.selectAll(".tick line").attr(
          "stroke",
          theme === "light" ? "#212121" : "#FFFFFF"
        );
      })
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#FFFFFF")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    MultiLinechartGroup.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(yTickSize)
          .tickSize(0)
          .tickFormat(d3.format("~s"))
      )
      .call((g) => g.select(".domain").attr("stroke", "none"))
      .selectAll("text")
      .style("fill", theme === "light" ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedWidth, customizedHeight, finalData, theme]);

  useExportHandler({
    apiEndpoint: `${apiUrls.NewVsTotalVisitorsChart}/csv`,
    startDate: convertDateToISOLikeString(startDate as Date),
    endDate: convertDateToISOLikeString(endDate as Date),
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

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
      {parsedDataWithCategory && (
        <ChartTicksSelector
          startDate={startDate as Date}
          endDate={endDate as Date}
          parsedDataWithCategory={parsedDataWithCategory}
          operation="max"
          chartTicksChange={(data) => handleTickChanges(data)}
          onChartDataChange={(result) => {
            setFinalData(result);
          }}
        />
      )}
      <svg ref={svgRef}></svg>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 6,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {categories.map((item, idx) => {
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: item.bordercolor,
                    display: "inline-block",
                  }}
                />
                <Typography
                  style={{
                    fontSize: "12px",
                    color: "#626262",
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
              <Typography
                style={{ fontSize: "12px", color: "#FF8A01", fontWeight: 700 }}
              >
                {formatNumber(item.totalCount)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export { NewVsTotalVisitors2_1_Option2 };
