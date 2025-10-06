import React, { useEffect, useRef } from "react";
import {
  CameraOnlineOfflineProps,
  IOnlineOfflineCameraData,
} from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { formatNumber } from "../../../../utils/formatNumber";
import { Box } from "@mui/material";
import { useThemeContext } from "../../../../context/ThemeContext";

const CameraOnlineOffline2_1_Option2: React.FC<CameraOnlineOfflineProps> = ({
  OnlineOfflineCameraData,
  customizedWidth,
  customizedHeight,
}) => {
  const { theme } = useThemeContext();
  const ref = useRef(null);

  useEffect(() => {
    const thickness = 50;
    const width = (customizedWidth as number) - 150;
    const height = (customizedHeight as number) - 150;
    const margin = { top: 50, right: 60, bottom: 50, left: 60 };
    const radius = Math.min(width, height) / 2;

    let percentage: number | null = null;

    const { onlineCameraCount, oflineCameraCount, totalCameraCount } =
      (OnlineOfflineCameraData ?? {}) as IOnlineOfflineCameraData;

    if (
      onlineCameraCount !== null &&
      totalCameraCount !== null &&
      totalCameraCount !== 0
    ) {
      percentage = Math.round((onlineCameraCount / totalCameraCount) * 100);
    }

    const data = [
      { label: "Online", value: onlineCameraCount },
      { label: "Offline", value: oflineCameraCount },
    ];

    d3.select(ref.current).selectAll("*").remove();
    
    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const defs = svg.append("defs");
    const pattern = defs
      .append("pattern")
      .attr("id", "diagonalHatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", "rotate(40)")
      .attr("width", 8)
      .attr("height", 8);

    pattern
      .append("path")
      .attr("d", "M0,0 l0,18")
      .attr("stroke", "orange")
      .attr("stroke-width", 3);

    const color = d3
      .scaleOrdinal<string>()
      .domain(["Online", "Offline"])
      .range(["#CDFF01", "url(#diagonalHatch)"]);

    const arc = d3
      .arc<any>()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    const pie = d3
      .pie<any>()
      .sort(null)
      .value((d) => d.value);

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + width / 2}, ${margin.top + height / 2})`
      );

    g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.label))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", (_, d) => {
        const percent = Math.round((d.data.value / totalCameraCount!) * 100);
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>${d.data.label}</strong> : ${percent}%`);
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "22px")
      .attr("fill", theme === "light" ? "black" : "#E8E8E8")
      .style("font-weight", 400)
      .text(formatNumber(totalCameraCount ?? 0));

    g.append("text")
      .attr("x", -radius - 40)
      .attr("y", -radius / 2)
      .style("font-size", "12px")
      .attr("fill", theme === "light" ? "black" : "#E8E8E8")
      .style("text-anchor", "start")
      .html(`${oflineCameraCount}/${totalCameraCount}`);

    g.append("text")
      .attr("x", radius)
      .attr("y", radius / 2.8)
      .style("font-size", "12px")
      .attr("fill", theme === "light" ? "black" : "#E8E8E8")
      .style("text-anchor", "start")
      .html(`${onlineCameraCount}/${totalCameraCount}`);

    // g.append("foreignObject")
    //   .attr("x", radius / 1.5)
    //   .attr("y", radius / 2)
    //   .attr("width", 70)
    //   .attr("height", 40)
    //   .append("xhtml:div")
    //   .style("background", "#fff")
    //   .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.3)")
    //   .style("border-radius", "30px")
    //   .style("text-align", "center")
    //   .text(`${percentage}%`);
  }, [OnlineOfflineCameraData, customizedWidth, customizedHeight, theme]);

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
      {OnlineOfflineCameraData?.totalCameraCount === 0 ? (
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
        <svg ref={ref}></svg>
      )}

      <div className="camera-online-offline-count">
        <div
          className="camera-online-offline-count-total-count"
          style={{ color: theme === "light" ? "#444444" : "#A8A8A8" }}
        >
          Total Count :{" "}
          <span
            style={{
              fontWeight: 600,
              color: theme === "light" ? "#444444" : "#E8E8E8",
            }}
          >
            {OnlineOfflineCameraData?.totalCameraCount}
          </span>
        </div>
        <div className="camera-online-offline-count-right">
          <div className="camera-online-offline-data">
            <img
              src="/images/online.svg"
              alt="online"
              style={{ width: "8px", height: "8px" }}
            />
            Online Cameras
          </div>
          <div className="camera-online-offline-data">
            <img
              src="/images/offline.svg"
              alt="offline"
              style={{ width: "8px", height: "8px" }}
            />
            Offline Cameras
          </div>
        </div>
      </div>
    </Box>
  );
};

export { CameraOnlineOffline2_1_Option2 };
