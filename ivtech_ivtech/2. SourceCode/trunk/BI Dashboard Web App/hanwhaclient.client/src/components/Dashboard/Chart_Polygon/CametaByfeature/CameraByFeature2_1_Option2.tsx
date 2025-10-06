import React, { useEffect, useRef } from "react";
import {
  CameraByFeatureProps,
  IFeatureTypeData,
} from "../../../../interfaces/IChart";
import * as d3 from "d3";
import { Box } from "@mui/material";

const CameraByFeature2_1_Option2: React.FC<CameraByFeatureProps> = ({
  CameraByFeatureData = [],
  customizedWidth,
  customizedHeight,
}) => {
  const ref = useRef<SVGSVGElement>(null);

  const formatNumbers = (num: any) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  useEffect(() => {
    if (!CameraByFeatureData || CameraByFeatureData.length === 0) return;
    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 50, right: 10, bottom: 30, left: 10 };

    const root = d3
      .hierarchy<{ children: IFeatureTypeData[] }>({
        children: CameraByFeatureData,
      })
      .sum((d) => d.totalCount);

    d3
      .treemap<IFeatureTypeData>()
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
      ])
      .padding(0.5)(root);

    const maxCount = d3.max(CameraByFeatureData, (d) => d.totalCount) || 1;

    // const color = d3.scaleSequential()
    //     .domain([0, maxCount])
    //     .interpolator(d3.interpolateBlues);
    const color = d3
      .scaleSequential()
      .domain([0, maxCount])
      .interpolator(d3.interpolateRgb("#ffffff", "#22B5FF"));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves() as HierarchyRectangularNode<IFeatureTypeData>[])
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) => `translate(${d.x0 + margin.left},${d.y0 + margin.top})`
      );

    nodes
      .on("mouseover", (_, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .style("z-index", 1000)
          .html(
            `<strong>${d.data.featuresName} : </strong> ${d.data.totalCount}`
          );
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    nodes
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.data.totalCount))
      .attr("stroke", "#fff");

    nodes
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .attr("fill", "#003E5E")
      .style("font-size", "12px")
      .each(function (d) {
        const text = d3.select(this);
        const lineHeight = 14;
        const name = d.data.featuresName;
        const count = d.data.totalCount;

        const rectWidth = d.x1 - d.x0;
        const maxChars = Math.floor(rectWidth / 12); // ~7px per character
        const truncatedName =
          name.length > maxChars ? name.slice(0, maxChars) + "..." : name;

        // First line: Feature name
        text
          .append("tspan")
          .attr("x", 4)
          .attr("y", 14)
          .style("font-weight", "600")
          .style("font-size", "10px")
          .style("fill", "#003E5E")
          .text(truncatedName);

        // Second line: Total count
        text
          .append("tspan")
          .attr("x", 4)
          .attr("y", 14 + lineHeight)
          .style("font-weight", "600")
          .style("font-size", "12px")
          .style("fill", "#212121")
          .text(`${formatNumbers(count)}`);
        // .text(`${count}`);

        // Tooltip on parent group
        // if (name.length > 15) {
        //   d3.select(this.parentNode)
        //     .append("title")
        //     .text(name);
        // }
      });
  }, [CameraByFeatureData, customizedWidth, customizedHeight]);

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
      {CameraByFeatureData.length === 0 ? (
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
        <svg
          ref={ref}
          width={customizedWidth}
          height={Math.max(
            (CameraByFeatureData || []).length * 40,
            customizedHeight
          )}
        />
      )}
    </div>
  );
};

export { CameraByFeature2_1_Option2 };
