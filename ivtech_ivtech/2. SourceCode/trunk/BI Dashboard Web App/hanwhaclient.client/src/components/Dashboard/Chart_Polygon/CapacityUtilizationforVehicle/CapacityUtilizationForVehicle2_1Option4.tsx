import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
    ICapacityUtilizationforVehicleProps,
} from "../../../../interfaces/IChart";

import { useThemeContext } from "../../../../context/ThemeContext";
import { Box } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";

const CapacityUtilizationForVehicle2_1Option4: React.FC<
    ICapacityUtilizationforVehicleProps
> = ({ customizedWidth, customizedHeight, CUForVehicleData }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { theme } = useThemeContext();

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = customizedWidth as number;
        const height = customizedHeight as number;

        const margin = { top: 20, right: 30, bottom: 100, left: 30 };
        const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;

        const utilization = CUForVehicleData?.utilization || 0;
        const totalCapacity = CUForVehicleData?.totalCapacity || 0;
        const maxValue = Math.max(utilization, totalCapacity, 1);

        const angleScale = d3
            .scaleLinear()
            .domain([0, maxValue])
            .range([0, 2 * Math.PI]); // full circle

        const svgGroup = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        // Background full arc
        const backgroundArc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        svgGroup.append("path")
            .attr("d", backgroundArc())
            // .attr("fill", "#e0e0e0");
            .attr("fill", "none")
            .attr("stroke", "#D5D5D5")
            .attr("stroke-width", 30)
            .attr("stroke-dasharray", "2,4");

        // Utilization arc
        const utilizationArc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius)
            .startAngle(0)
            .endAngle(angleScale(utilization));


        // svgGroup
        //     .append("path")
        //     .attr("d", utilizationArc()!)
        //     .attr("fill", "none")
        //     .attr("stroke", utilization > totalCapacity ? "#e53935" : "#00c853")
        //     .attr("stroke-width", 30)
        //     .attr("stroke-dasharray", "2,4");

        const arcPath = svgGroup
            .append("path")
            .attr("fill", "none")
            .attr("stroke", utilization > totalCapacity ? "#e53935" : "#00c853")
            .attr("stroke-width", 30)
            .attr("stroke-dasharray", "2,4");

        const interpolator = d3.interpolate(0, angleScale(utilization));

        arcPath
            .transition()
            .duration(2000)
            .attrTween("d", () => t =>
                utilizationArc.endAngle(interpolator(t))()
            );

        // Ticks
        const tickCount = 10;
        const tickValues = d3.range(0, tickCount + 1).map(i => (i * maxValue) / tickCount);
        const labelRadius = radius + 30;

        tickValues.forEach((val) => {
            if (val === 0) return; 
            const angle = angleScale(val) - Math.PI / 2;
            const x = Math.cos(angle) * labelRadius;
            const y = Math.sin(angle) * labelRadius;

            svgGroup.append("text")
                .attr("x", x)
                .attr("y", y)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .style("font-size", "10px")
                .style("fill", theme === "dark" ? "#FFFFFF" : "#333")
                .text(formatNumber(Math.round(val)));
        });

        // Center text
        svgGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 5)
            .style("font-size", "14px")
            .style("fill", theme === "dark" ? "#FFFFFF" : "#000")
            .text(`Utilization: ${formatNumber(utilization)}`);

        // Optional: Target marker
        if (totalCapacity > 0) {
            const targetAngle = angleScale(totalCapacity) - Math.PI / 2;
            const x = Math.cos(targetAngle) * radius;
            const y = Math.sin(targetAngle) * radius;

            svgGroup.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", x)
                .attr("y2", y)
                .attr("stroke", "red")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4,2");

            svgGroup.append("text")
                .attr("x", Math.cos(targetAngle) * (radius - 40))
                .attr("y", Math.sin(targetAngle) * (radius - 40))
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .attr("fill", "red")
                .text(`Capacity: ${formatNumber(totalCapacity)}`);

            const needleLength = radius - 10;
            const needleAngle = angleScale(utilization) - Math.PI / 2;
            const needleX = Math.cos(needleAngle) * needleLength;
            const needleY = Math.sin(needleAngle) * needleLength;

            // Needle line
            const needleGroup = svgGroup.append("g")
                .attr("class", "needle")
                .attr("transform", "rotate(0)");

            const needleRotationDeg = (needleAngle + Math.PI / 2) * (180 / Math.PI); // convert to degrees

            needleGroup.transition()
                .duration(2000)
                .ease(d3.easeCubicOut)
                .attrTween("transform", () => {
                    const interpolate = d3.interpolate(0, needleRotationDeg);
                    return (t) => `rotate(${interpolate(t)})`;
                });

            // Needle line
            needleGroup.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", -needleLength)
                .attr("stroke", "#53ced9ff")
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round");

            // Needle base circle
            needleGroup.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", 4)
                .attr("fill", "#53ced9ff");
        }


    }, [CUForVehicleData, customizedWidth, customizedHeight, theme]);




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
            {!CUForVehicleData ||
                CUForVehicleData?.totalCapacity === 0 ?
                <Box
                    sx={{
                        height: customizedHeight,
                        width: customizedWidth,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "16px",
                        color: "#A8A8A8",
                    }}
                >
                    No Data Found
                </Box>
                :
                <svg ref={svgRef} />
            }
        </div>
    );
};

export { CapacityUtilizationForVehicle2_1Option4 };
