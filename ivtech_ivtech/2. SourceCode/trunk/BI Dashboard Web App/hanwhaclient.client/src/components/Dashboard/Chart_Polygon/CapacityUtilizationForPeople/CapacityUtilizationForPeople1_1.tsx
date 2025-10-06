import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { CapacityUtilizationAnanlysisProps, DateWiseUtilization } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import moment from "moment";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";
import { imagePathToBase64 } from "../../../../utils/convertImageToBase64";


const CapacityUtilizationForPeople1_1: React.FC<
  CapacityUtilizationAnanlysisProps
> = ({
  DateWiseUtilization,
  capacityUtilizationpPeopleData,
  customizedWidth,
  customizedHeight,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable,
}) => {
    const { theme } = useThemeContext();
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [overallMin, setOverallMin] = React.useState<DateWiseUtilization | null>(null);
    const [overallMax, setOverallMax] = React.useState<DateWiseUtilization | null>(null);


    useEffect(() => {
      if (!DateWiseUtilization || DateWiseUtilization.length === 0) {
        setOverallMin(null);
        setOverallMax(null);
        return;
      }
      function groupByDate(data: DateWiseUtilization[]) {
        const grouped: Record<string, DateWiseUtilization[]> = {};

        data.forEach((item) => {
          //const date = item.dateTime.split("T")[0]; // Extract YYYY-MM-DD
            const date = moment(item.dateTime).format("YYYY-MM-DD"); // Extract YYYY-MM-DD
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(item);
        });

        return grouped;
      }

      function findMaxByDate(data: DateWiseUtilization[]) {
        const grouped = groupByDate(data);

        const result = Object.entries(grouped).map(([date, values]) => {
          const max = values.reduce((max, item) =>
            item.totalCount > max.totalCount ? item : max
          );
          return { date, max };
        });

        return result;
      }


      const MaxByDate = findMaxByDate(DateWiseUtilization);
      

      // const overallMin = MaxByDate.reduce((min, item) =>
      //   item.max.totalCount < min.max.totalCount ? item : min
      // );
      const nonZeroItems = MaxByDate.filter(item => item.max.totalCount > 0);

      const overallMin = nonZeroItems.length > 0
        ? nonZeroItems.reduce((min, item) =>
          item.max.totalCount < min.max.totalCount ? item : min
        )
        : null; // or fallback value

      
      const overallMax = MaxByDate.reduce((max, item) =>
        item.max.totalCount > max.max.totalCount ? item : max
      );
      setOverallMin(overallMin ? overallMin.max : null);
      setOverallMax(overallMax.max);


    }, [DateWiseUtilization])


    useEffect(() => {
      if (!customizedWidth || !customizedHeight) return;

      const margin = { top: 60, right: 22, bottom: 105, left: 20 };

      const fullWidth = parseInt(customizedWidth as string, 10);
      const fullHeight = parseInt(customizedHeight as string, 10);

      const width = fullWidth - margin.left - margin.right;
      const height = fullHeight - margin.top - margin.bottom;

      const svg = d3
        .select(svgRef.current)
        .attr("width", width)
        .attr("height", height);
      svg.selectAll("*").remove(); // Clear previous content

      const borderRadius = height * 0.2; // radius based on height

      const block1Height = height * 0.37; // Top Block (Utilization/Percentage)
      const block2Height = height * 0.37; // Bottom Block (Most Day / Least Day)

      // === Top block: Utilization + Percentage ===
      const block1Group = svg.append("g");

      block1Group
        .append("rect")
        .attr("x", width * 0.02)
        .attr("y", height * 0.05)
        .attr("rx", borderRadius)
        .attr("ry", borderRadius)
        .attr("width", width * 0.96)
        .attr("height", block1Height)
        .attr("fill", theme === 'light' ? "white" : "#1D1E21")
        .attr("stroke", "#FFBF6B")
        .attr("stroke-width", 13)
        .attr("stroke-dasharray", "2,4");

      const defs = svg.append("defs");

      defs.append("clipPath")
        .attr("id", "circle-clip")
        .append("circle")
        .attr("cx", width * 0.18) // center x (x + radius)
        .attr("cy", block1Height * 0.65) // center y (y + radius)
        .attr("r", (width * 0.12) / 2); // radius = half of width

      // Person icon
      // block1Group
      //   .append("image")
      //   .attr("x", width * 0.12)
      //   .attr("y", block1Height * 0.4)
      //   .attr("width", width * 0.12)
      //   .attr("height", width * 0.12)
      //   .attr("clip-path", "url(#circle-clip)")
      //   .attr(
      //     "xlink:href",
      //     theme === 'light' ? "/images/dashboard/Capacity_Utilization_for_People.gif" :
      //       '/images/dark-theme/dashboard/Capacity_Utilization_for_People.gif'
      //   );

      const imagePath =
        theme === "light"
          ? "/images/dashboard/Capacity_Utilization_for_People.gif"
          : "/images/dark-theme/dashboard/Capacity_Utilization_for_People.gif";

      // Convert to Base64 before appending
      (async () => {
        const base64Img = await imagePathToBase64(imagePath);

        block1Group
          .append("image")
          .attr("x", width * 0.12)
          .attr("y", block1Height * 0.4)
          .attr("width", width * 0.12)
          .attr("height", width * 0.12)
          .attr("clip-path", "url(#circle-clip)")
          .attr("xlink:href", base64Img); // Use Base64 instead of direct path
      })();
      // Utilization Value
      block1Group
        .append("text")
        .attr("x", width * 0.4)
        .attr("y", block1Height * 0.6)
        // .attr("font-size", width * 0.07)
        .attr("font-size", "20px")
        .attr("font-weight", 600)
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .attr("text-anchor", "middle")
        .text(
          capacityUtilizationpPeopleData?.utilization
            ? formatNumber(
              Math.round(capacityUtilizationpPeopleData?.utilization)
            )
            : 0
        );

      block1Group
        .append("text")
        .attr("x", width * 0.4)
        .attr("y", block1Height * 0.9)
        .attr("font-size", width * 0.035)
        .attr("fill", theme === 'light' ? "#666" : "#A8A8A8")
        .attr("text-anchor", "middle")
        .text("Utilization");

      // Percentage Value
      block1Group
        .append("text")
        .attr("x", width * 0.75)
        .attr("y", block1Height * 0.6)
        // .attr("font-size", width * 0.7)
        .attr("font-size", "20px")
        .attr("font-weight", 600)
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .attr("text-anchor", "middle")
        .text(`${Math.round(capacityUtilizationpPeopleData?.percentage ?? 0)}%`);

      block1Group
        .append("text")
        .attr("x", width * 0.75)
        .attr("y", block1Height * 0.9)
        .attr("font-size", width * 0.035)
        .attr("fill", theme === 'light' ? "#666" : "#A8A8A8")
        .attr("text-anchor", "middle")
        .text("Percentage");

      // === Bottom block: Most Day / Least Day ===
      const block2Group = svg
        .append("g")
        .attr("transform", `translate(0, ${block1Height + height * 0.15})`);


      const block2Padding = width * 0.03; // padding inside gray container
      const block2OuterHeight = block2Height + block2Padding * 2;

      // Outer Gray Dashed Container
      block2Group
        .append("rect")
        .attr("x", width * 0.01)
        .attr("y", 0)
        .attr("width", width * 0.98)
        .attr("height", block2OuterHeight)
        .attr("rx", 50)
        .attr("ry", 50)
        .attr("fill", theme === 'light' ? "#ffffff" : "#1D1E21")
        .attr("stroke", "#DFDFDF")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

      // Inner Block (actual orange content)
      const innerBlock = block2Group
        .append("g")
        .attr(
          "transform",
          `translate(${width * 0.01 + block2Padding}, ${block2Padding})`
        );

      innerBlock
        .append("rect")
        .attr("width", width * 0.96 - block2Padding * 1.5)
        .attr("height", block2Height)
        .attr("rx", 40)
        .attr("ry", 40)
        .attr("fill", theme === 'light' ? "#FFF3E6" : "#1D1E21");

      // Then append all Block 2 content like image/text into `innerBlock` instead of `block2Group`

      // Most Day
      block2Group
        .append("image")
        .attr("x", width * 0.08)
        .attr("y", block2Height * 0.3)
        .attr("width", width * 0.05)
        .attr("height", width * 0.05)
        .attr("xlink:href", "/images/up_arrow.svg");

      block2Group
        .append("text")
        .attr("x", width * 0.25)
        .attr("y", block2Height * 0.45)
        .attr("font-size", width * 0.04)
        .attr("fill", theme === 'light' ? "#000000" : "#E8E8E8")
        .attr("text-anchor", "middle")
        .text("Most Day");

      block2Group
        .append("text")
        .attr("x", width * 0.5)
        .attr("y", block2Height * 0.45)
        // .attr("font-size", width * 0.06)
        .attr("font-size", "18px")
        .attr("font-weight", 600)
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .attr("text-anchor", "middle")
        // .text(
        //   capacityUtilizationpPeopleData?.utilizationMostLeastDay
        //     ?.mostDayUtilization != null
        //     ? formatNumber(
        //       Math.round(
        //         capacityUtilizationpPeopleData.utilizationMostLeastDay
        //           .mostDayUtilization
        //       )
        //     )
        //     : 0
        // );
        .text(
          overallMax
            ? formatNumber(Math.round(overallMax.totalCount))
            : 0
        );

      block2Group
        .append("text")
        .attr("x", width * 0.75)
        .attr("y", block2Height * 0.45)
        .attr("font-size", width * 0.04)
        .attr("fill", theme === 'light' ? "#626262" : "#A8A8A8")
        .attr("text-anchor", "middle")
        // .text(
        //   moment(
        //     capacityUtilizationpPeopleData?.utilizationMostLeastDay
        //       ?.mostDayUtilizationDay
        //   ).format("D MMM YYYY") ?? null
        // );
        .text(
          overallMax
            ? moment(overallMax.dateTime).format("D MMM YYYY")
            : "-"
        );

      // Least Day
      block2Group
        .append("image")
        .attr("x", width * 0.08)
        .attr("y", block2Height * 0.7)
        .attr("width", width * 0.05)
        .attr("height", width * 0.05)
        .attr("xlink:href", "/images/down_arrow.svg");

      block2Group
        .append("text")
        .attr("x", width * 0.25)
        .attr("y", block2Height * 0.9)
        .attr("font-size", width * 0.04)
        .attr("fill", theme === 'light' ? "#000000" : "#E8E8E8")
        .attr("text-anchor", "middle")
        .text("Least Day");

      block2Group
        .append("text")
        .attr("x", width * 0.5)
        .attr("y", block2Height * 0.9)
        // .attr("font-size", width * 0.06)
        .attr("font-size", "18px")
        .attr("font-weight", 600)
        .attr("fill", theme === 'light' ? "#212121" : "#E8E8E8")
        .attr("text-anchor", "middle")
        // .text(
        //   capacityUtilizationpPeopleData?.utilizationMostLeastDay
        //     ?.leastDayUtilization
        //     ? formatNumber(
        //       Math.round(
        //         capacityUtilizationpPeopleData?.utilizationMostLeastDay
        //           ?.leastDayUtilization
        //       )
        //     )
        //     : 0
        // );
        .text(
          overallMin
            ? formatNumber(Math.round(overallMin.totalCount))
            : 0
        );

      block2Group
        .append("text")
        .attr("x", width * 0.75)
        .attr("y", block2Height * 0.9)
        .attr("font-size", width * 0.04)
        .attr("fill", theme === 'light' ? "#626262" : "#A8A8A8")
        .attr("text-anchor", "middle")
        // .text(
        //   moment(
        //     capacityUtilizationpPeopleData?.utilizationMostLeastDay
        //       ?.leastDayUtilizationDay
        //   ).format("D MMM YYYY") ?? null
        // );
        .text(
          overallMin
            ? moment(overallMin.dateTime).format("D MMM YYYY")
            : "-"
        );

    }, [capacityUtilizationpPeopleData, customizedWidth, customizedHeight, theme, overallMax, overallMin]);

    return (
      <Box sx={{ width: customizedWidth }}>
        <Box className="widget-main-wrapper">
          <Box className="widget-main-header">
            <Typography variant="h6" component="h2">
              {displayName}
            </Typography>
          </Box>

          <Box
            className="widget-main-body"
          // style={{
          //   display: "flex",
          //   flexDirection: "column",
          //   marginBottom: -20,
          // }}
          >
            <div className="widget-data-wrapper">
              <div
                className={
                  openZoomDialog ? "capacity-utilization-pPeople-image" : ""
                }
              >
                {/* <div style={{ overflow: "hidden" }}> */}
                <svg ref={svgRef}></svg>
                {/* </div> */}
              </div>
            </div>
          </Box>

          <Box className="widget-main-footer">
            <Box className="widget-main-footer-value">
              <Typography>Total No of Capacity : </Typography>
              <span style={{ fontWeight: 600 }}>
                {formatNumber(capacityUtilizationpPeopleData?.totalCapacity ?? 0)}
              </span>
            </Box>
            {!openZoomDialog ? (
              <Box
                className="widget-main-footer-zoom-i"
                onMouseEnter={() => setIsDraggable?.(true)}
                onMouseLeave={() => setIsDraggable?.(false)}
              >
                <img
                  src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                  alt="vehicle"
                  width={35}
                  height={35}
                />
              </Box>
            ) : null}
            {!openZoomDialog ? (
              <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomWidgetBtnCapacityUtilizationforPeople">
                <img
                  src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                  alt="vehicle"
                  width={35}
                  height={35}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    );
  };

export { CapacityUtilizationForPeople1_1 };
