import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  IZoneWiseCapacityUtilizationAnalysisProps,
  IParsedDataWithCategory,
  IntervalData,
} from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { ChartTicksSelector } from "../../../index";
import { formatDateToConfiguredTimezone } from "../../../../utils/formatDateToConfiguredTimezone";
import { formatNumber } from "../../../../utils/formatNumber";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import apiUrls from "../../../../constants/apiUrls";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";
import { useThemeContext } from "../../../../context/ThemeContext";

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const ZoneWiseCapacityUtilizationForPeople2_1_Option2: React.FC<
  IZoneWiseCapacityUtilizationAnalysisProps
> = ({
  customizedWidth,
  customizedHeight,
  ZoneWiseCUAnalysisData,
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

    const [categories, setCategories] = useState<
      { key: string; label: string; color: string }[]
    >([]);
    const { theme } = useThemeContext();

    const handleTickChanges = (intervalData: IntervalData) => {
      setSelectedInterval(intervalData.tickInterval);
      setSelectedIntervalName(intervalData.intervalName);
      selectedIntervalNameRef.current = intervalData.intervalName;
    };

    useExportHandler({
      apiEndpoint: `${apiUrls.PeopleCameraCapacityUtilizationAnalysisByZones}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });

    useEffect(() => {
      if (!ZoneWiseCUAnalysisData) return;
      const updatedParsedData: IParsedDataWithCategory = {};

      ZoneWiseCUAnalysisData.forEach((zone) => {
        setCategories((prevCategories) => {
          const alreadyExists = prevCategories.some(
            (cat) => cat.key === zone.zoneName
          );

          if (alreadyExists) return prevCategories;
          const updatedCategories = [
            ...prevCategories,
            {
              key: zone.zoneName,
              label: zone.zoneName,
              color: colorScale(zone.zoneName),
            },
          ];
          return updatedCategories;
        });
        updatedParsedData[zone.zoneName] = zone.utilizationData.map((d) => ({
          date: new Date(d.dateTime as string),
          value: d.count ?? 0,
        }));
      });

      setParsedDataWithCategory(updatedParsedData);
    }, [ZoneWiseCUAnalysisData, selectedInterval]);

    useEffect(() => {
      if (!svgRef.current || !finalData) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const width = customizedWidth as number;
      const height = customizedHeight as number;
      const margin = { top: 30, right: 30, bottom: 115, left: 30 };
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
        .attr("opacity",theme === 'light' ? "100%" : "20%")
        .attr("stroke-width", 1);

      const line = d3
        .line<{ date: Date; value: number }>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value));

      categories.forEach((cat, index) => {
        const categoryWisedata = finalData[cat.key];
        if (!categoryWisedata || categoryWisedata.length === 0) return;

        MultiLinechartGroup.append("path")
          .datum(categoryWisedata)
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", cat.color)
          .attr("d", line);

        // Circles
        MultiLinechartGroup.selectAll(`circle-${index}`)
          .data(categoryWisedata)
          .enter()
          .append("circle")
          .attr("class", `circle-${index}`)
          .attr("cx", (d) => xScale(d.date))
          .attr("cy", (d) => yScale(d.value))
          .attr("r", 3)
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
      MultiLinechartGroup.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(4))
        // .call(d3.axisBottom(xScale).ticks(selectedInterval).tickSize(4))
        .call((g) => {
          g.select(".domain").attr("stroke", "#70757a");
          g.selectAll(".tick line").attr("stroke",theme === 'light' ? "#212121" : "#FFFFFF");
        })
        .selectAll("text")
        .style("fill", theme === 'light' ? "#212121" : "#FFFFFF")
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
        .style("fill",  theme === 'light' ? "#212121" : "#D4D4D4")
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
            marginBottom: 1,
            overflowX: "auto", // enable horizontal scroll
            flexWrap: "nowrap", // prevent wrapping
            maxWidth: "90%",
            overflowY: "hidden",
          }}
        >
          {categories.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                minWidth: "max-content", // ensures the item doesn't shrink
              }}
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
              <Typography sx={{ fontSize: "10px", color: theme === 'light' ? "#212121" : "#D4D4D4" }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

export { ZoneWiseCapacityUtilizationForPeople2_1_Option2 };
