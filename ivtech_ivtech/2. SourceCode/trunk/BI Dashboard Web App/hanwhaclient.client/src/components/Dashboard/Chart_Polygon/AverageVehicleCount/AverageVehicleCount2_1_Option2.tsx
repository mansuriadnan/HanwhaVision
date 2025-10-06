import React, { useEffect, useRef } from "react";
import { AverageVehicleCountProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";
import apiUrls from "../../../../constants/apiUrls";
import { useExportHandler } from "../../../../hooks/useExportHandler";
import { convertDateToISOLikeString } from "../../../../utils/convertDateToISOLikeString";

const AverageVehicleCount2_1_Option2: React.FC<AverageVehicleCountProps> = ({
  AVCData,
  customizedWidth,
  customizedHeight,
  startDate,
  endDate,
  floor,
  zones,
  setExportHandler,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  const selectedIntervalNameRef = useRef<string>("");

  if (setExportHandler) {
    useExportHandler({
      apiEndpoint: `${apiUrls.AverageVehicleCountChart}/csv`,
      startDate: convertDateToISOLikeString(startDate as Date),
      endDate: convertDateToISOLikeString(endDate as Date),
      floor,
      zones,
      selectedIntervalNameRef,
      setExportHandler,
    });
  }

  const allZero =
    !AVCData || (!AVCData.averageInCount && !AVCData.averageOutCount);

  const data = [
    {
      label: "Incoming Average",
      value: AVCData?.averageInCount,
      color: "#06B6F6",
    },
    {
      label: "Outgoing Average",
      value: AVCData?.averageOutCount,
      color: "#FFF235",
    },
  ];

  useEffect(() => {
    if (!svgRef.current || !AVCData || AVCData === null) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 80, right: 30, bottom: 50, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const radius = Math.min(innerWidth, innerHeight) / 3;

    const colorMap: { [key: string]: string } = {
      "Incoming Average": "#06B6F6", // Yellow
      "Outgoing Average": "#FFF235", // Blue
    };

    const PiechartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr(
        "transform",
        `translate(${innerWidth / 2 + 10}, ${innerHeight / 2 + 40})`
      );
    // .attr("transform", `translate(${margin.left},${margin.top})`);

    const pie = d3
      .pie<any>()
      .value((d) => d.value)
      .sort(null);

    const arcOuter = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius + 25);

    PiechartGroup.selectAll(".outer-arc")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("class", "outer-arc")
      .attr("d", arcOuter as any)
      .attr("fill", "white")
      .attr("stroke", "#DBDADA")
      .style("stroke-width", "2px");

    const arcInner = d3.arc().innerRadius(0).outerRadius(radius);

    PiechartGroup.selectAll(".inner-arc")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("class", "inner-arc")
      .attr("d", arcInner as any)
      .attr("fill", (d) => colorMap[d.data.label] || "#ccc")
      .attr("stroke", "#DBDADA")
      .style("stroke-width", "1px");

    // Add dot and value labels on outer arc
    const labelArc = d3
      .arc()
      .innerRadius(radius + 35)
      .outerRadius(radius + 35);

    PiechartGroup.selectAll(".label-dot")
      .data(pie(data))
      .enter()
      .append("circle")
      .attr("class", "label-dot")
      .attr("cx", (d) => labelArc.centroid(d as any)[0])
      .attr("cy", (d) => labelArc.centroid(d as any)[1])
      .attr("r", 5)
      .attr("fill", (d) => colorMap[d.data.label]);

    PiechartGroup.selectAll(".label-text")
      .data(pie(data))
      .enter()
      .append("text")
      .attr("class", "label-text")
      .attr("x", (d) => labelArc.centroid(d as any)[0] + 10)
      .attr("y", (d) => labelArc.centroid(d as any)[1])
      .attr("alignment-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", theme === "light" ? "#212121" : "#D4D4D4")
      .text((d) => formatNumber(d.data.value));
  }, [AVCData, customizedWidth, customizedHeight]);

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
      {allZero ? (
        <Box
          sx={{
            width: customizedWidth,
            height: customizedHeight,
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
          <svg ref={svgRef} style={{ width: "100%", height: "auto" }}></svg>
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              marginTop: "10px",
              justifyContent: "center",
              marginBottom: 1,
            }}
          >
            {data.map((item, idx) => (
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
                <Typography
                  style={{
                    fontSize: "12px",
                    color: theme === "light" ? "#212121" : "#D4D4D4",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export { AverageVehicleCount2_1_Option2 };
