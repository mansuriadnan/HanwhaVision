import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import {
  IDetectForkliftsProps,
  IntervalData,
  IParsedDataWithCategory,
} from "../../../../interfaces/IChart";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import apiUrls from "../../../../constants/apiUrls";
import { useThemeContext } from "../../../../context/ThemeContext";

const DetectForklifts2_1_Option2: React.FC<IDetectForkliftsProps> = ({
  detectForkliftsCharts,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<number>();
  const [finalData, setFinalData] = useState<IParsedDataWithCategory>({});
  const [parsedDataWithCategory, setParsedDataWithCategory] =
    useState<IParsedDataWithCategory>({});
  const [selectedIntervalName, setSelectedIntervalName] = useState<string>("");
  const selectedIntervalNameRef = useRef<string>("");
  const { theme } = useThemeContext();

  useEffect(() => {
    selectedIntervalNameRef.current = selectedIntervalName;
  }, [selectedIntervalName]);

  useExportHandler({
    apiEndpoint: `${apiUrls.ProxomityDetectionAnalysis}/csv`,
    startDate: convertDateToISOLikeString(startDate as Date), 
    endDate: convertDateToISOLikeString(endDate as Date), 
    floor,
    zones,
    selectedIntervalNameRef,
    setExportHandler,
  });

  type vehicleKey = "forkliftsCount" | "proximityForkliftsCount";
  const categories: {
    key: vehicleKey;
    label: string;
    color: string;
    dotColor: string;
  }[] = [
    {
      key: "forkliftsCount",
      label: "Detect Forklifts",
      color: "#55AA2F",
      dotColor: "#5AB236",
    },
    {
      key: "proximityForkliftsCount",
      label: "Proximity detection",
      color: "#FFEA00",
      dotColor: "#C4B400",
    },
  ];

  useEffect(() => {
    if (!detectForkliftsCharts || !categories) return;
    const updatedParsedData: IParsedDataWithCategory = {};
    categories.forEach((cat) => {
      updatedParsedData[cat.key] = detectForkliftsCharts.map((d) => ({
        date: new Date(formatDateToConfiguredTimezone(d.dateTime) as string),
        value: d[cat.key] ?? 0,
      }));
    });

    setParsedDataWithCategory(updatedParsedData);
  }, [detectForkliftsCharts, selectedInterval]);

  const handleTickChanges = (intervalData: IntervalData) => {
    setSelectedInterval(intervalData.tickInterval);
    setSelectedIntervalName(intervalData.intervalName);
  };
  useEffect(() => {
    if (!svgRef.current || !finalData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 20, right: 15, bottom: 112, left: 25 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const maxBarWidth = 24;

    const MultiBarchartGroup = svg
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
      .range([maxBarWidth, innerWidth]);

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

    MultiBarchartGroup.append("g")
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
      .attr("opacity",theme === 'light' ? "100%" : "20%")
      .attr("stroke-width", 1);

    categories.forEach((cat, catIndex) => {
      const categoryWisedata = finalData[cat.key];
      if (!categoryWisedata || categoryWisedata.length === 0) return;

      const groupCount = categories.length;
      const groupSpacing = 0.8; // between 0 and 1
      const tickSpacing = innerWidth / categoryWisedata.length;
      const groupWidth = tickSpacing * groupSpacing;
      var barWidth = groupWidth / groupCount;
      if (barWidth > maxBarWidth) barWidth = maxBarWidth;
      const groupOffset = (groupCount * barWidth) / 2;

      MultiBarchartGroup.append("g")
        .selectAll(`.bar-${cat.key}`)
        .data(categoryWisedata)
        .enter()
        .append("rect")
        .attr("class", `bar-${cat.key}`)
        .attr(
          "x",
          (d) => xScale(d.date)! - groupOffset + catIndex * barWidth
          // (d) => xScale(d.date)! - groupWidth / 2 + catIndex * barWidth
        )
        .attr("y", (d) => yScale(d.value))
        .attr("width", barWidth)
        .attr("height", (d) => innerHeight - yScale(d.value))
        .attr("fill", cat.color)
        .on("mouseover", (_, d) => {
          d3.select("#tooltip")
            .style("opacity", 1)
            .html(`<strong>${cat.label}</strong> : ${formatNumber(d.value)}`);
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

    // X Axis
    MultiBarchartGroup.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
      // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
      .call((g) => {
        g.select(".domain").attr("stroke", "#70757a");
        g.selectAll(".tick line").attr("stroke", theme === 'light' ? "#212121" : "#FFFFFF");
      })
      .selectAll("text")
      .style("fill", theme === 'light' ? "#212121" : "#FFFFFF")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    MultiBarchartGroup.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(yTickSize)
          .tickSize(0)
          .tickFormat(d3.format("~s"))
      )
      .call((g) => g.select(".domain").attr("stroke", "none"))
      .selectAll("text")
      .style("fill", theme === 'light' ? "#212121" : "#D4D4D4")
      .style("font-size", "10px");
  }, [customizedWidth, customizedHeight, finalData, theme]);

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
          gap: 3,
          justifyContent: "center",
          marginBottom:1
        }}
      >
        {categories.map((item, idx) => (
          <Box
            key={idx}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Box
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: item.color,
                display: "inline-block",
              }}
            ></Box>
            <Typography style={{ fontSize: "12px", color: theme === 'light' ? "#333" : "#E8E8E8" }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
export { DetectForklifts2_1_Option2 };
