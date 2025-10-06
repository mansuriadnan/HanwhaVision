import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { GenderProps, IGenderData } from "../../../../interfaces/IChart";
import * as d3 from "d3";

interface Totals {
  totalMale: number;
  totalFemale: number;
  totalUndefined: number;
}
const Gender2_1_Option1: React.FC<GenderProps> = ({
  customizedWidth,
  customizedHeight,
  groupbyDateData
}) => {
  // const maleData = genderData?.find((item) => item.gender === "Male");
  // const femaleData = genderData?.find((item) => item.gender === "Female");
  // const unknownData = genderData?.find((item) => item.gender === "Unknown");
  const svgRef = useRef<SVGSVGElement | null>(null);
  // const [totals, setTotals] = useState<Totals>({
  //   totalMale: 0,
  //   totalFemale: 0,
  //   totalUndefined: 0,
  // });
  const [genderData, setGenderData]= useState<IGenderData[] | null>([]);

  useEffect(() => {
    if (!groupbyDateData) return;

    if (!groupbyDateData.length) return;

    const totals: Totals = groupbyDateData.reduce<Totals>(
      (acc, curr) => {
        acc.totalMale += curr.maleCount;
        acc.totalFemale += curr.femaleCount;
        acc.totalUndefined += curr.undefinedCount;
        return acc;
      },
      { totalMale: 0, totalFemale: 0, totalUndefined: 0 }
    );

    // setTotals(totalsResult as Totals);

    const chartData: IGenderData[] = [
      {
        gender: "Male",
        count: totals.totalMale,
        minCount: totals.totalMale, // fallback: same as total
        minDate: "",
        maxCount: totals.totalMale,
        maxDate: "",
      },
      {
        gender: "Female",
        count: totals.totalFemale,
        minCount: totals.totalFemale,
        minDate: "",
        maxCount: totals.totalFemale,
        maxDate: "",
      },
      {
        gender: "Unknown",
        count: totals.totalUndefined,
        minCount: totals.totalUndefined,
        minDate: "",
        maxCount: totals.totalUndefined,
        maxDate: "",
      },
    ];

 setGenderData(chartData);

  }, [groupbyDateData]);

  useEffect(() => {
    if (!svgRef.current || !genderData || genderData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = customizedWidth as number;
    const height = customizedHeight as number;
    const margin = { top: 70, right: 30, bottom: 50, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const radius = Math.min(innerWidth, innerHeight) / 3;
   
    const colorMap: { [key: string]: string } = {
      Male: "#FFE503", // Yellow
      Female: "#B5D5FF", // Blue
      Unknown: "#DBDADA", // Gray
    };

    const PiechartGroup = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${innerWidth / 2 + 40}, ${innerHeight / 2 + 40})`);
    // .attr("transform", `translate(${margin.left},${margin.top})`);

    const pie = d3
      .pie<IGenderData>()
      .value((d) => d.count)
      .sort(null);

    const arcOuter = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius + 25);

    PiechartGroup.selectAll(".outer-arc")
      .data(pie(genderData))
      .enter()
      .append("path")
      .attr("class", "outer-arc")
      .attr("d", arcOuter as any)
      .attr("fill", "white")
      .attr("stroke", "#DBDADA")
      .style("stroke-width", "2px");


    const arcInner = d3.arc().innerRadius(0).outerRadius(radius);

    PiechartGroup.selectAll(".inner-arc")
      .data(pie(genderData))
      .enter()
      .append("path")
      .attr("class", "inner-arc")
      .attr("d", arcInner as any)
      .attr("fill", (d) => colorMap[d.data.gender] || "#ccc")
      .attr("stroke", "#DBDADA")
      .style("stroke-width", "1px")
      .on("mouseover", (_, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(`<strong>${d.data.gender}</strong> : ${d.data.count}`);
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });
    return () => {
      //tooltip.remove();
    };
  }, [customizedWidth, genderData]);

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
      {!genderData || genderData.length === 0 || genderData.every(item => item.count === 0) ? (
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
      )
        :
        (
          <>
            <svg ref={svgRef}></svg>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
              {/* Male */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ backgroundColor: "#FFE503", width: 10, height: 10, borderRadius: "50%" }} />
                  <Typography sx={{ color: "#626262", fontSize: "12px" }}>Male</Typography>
                </Box>
                {/* <Typography sx={{ color: "#FF8A01", fontWeight: 700, fontSize: "10px" }}>
                  {maleData?.count?.toLocaleString()}
                </Typography> */}
              </Box>

              {/* Female */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ backgroundColor: "#328BFF", width: 10, height: 10, borderRadius: "50%" }} />
                  <Typography sx={{ color: "#626262", fontSize: "12px" }}>Female</Typography>
                </Box>
                {/* <Typography sx={{ color: "#FF8A01", fontWeight: 700, fontSize: "10px" }}>
                  {femaleData?.count?.toLocaleString()}
                </Typography> */}
              </Box>

              {/* Undefined */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ backgroundColor: "#717171", width: 10, height: 10, borderRadius: "50%" }} />
                  <Typography sx={{ color: "#626262", fontSize: "12px" }}>Undefined</Typography>
                </Box>
                {/* <Typography sx={{ color: "#FF8A01", fontWeight: 700, fontSize: "10px" }}>
                  {unknownData?.count?.toLocaleString()}
                </Typography> */}
              </Box>
            </Box>
          </>
        )
      }


    </Box>
  );
};

export { Gender2_1_Option1 };
