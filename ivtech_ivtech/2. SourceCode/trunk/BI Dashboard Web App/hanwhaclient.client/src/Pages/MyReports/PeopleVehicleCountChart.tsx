
import { Box, Typography } from '@mui/material';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { PeopleVehicleChartRef, PerformanceComparisonItem } from '../../interfaces/IReport';
import { isNumber } from '@mui/x-data-grid/internals';
import { formatNumber } from '../../utils/formatNumber';

interface PerformanceComparisonTableProps {
    chartData: PerformanceComparisonItem[],
    colors: string[]
    reportType: string;
    comperisionType?: string[] | undefined;
}

const PeopleVehicleCountChart = forwardRef<PeopleVehicleChartRef, PerformanceComparisonTableProps>(
    ({ chartData, colors, reportType, comperisionType }, ref) => {



        // const formatNumbers = (num: any) => {
        //     if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        //     if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        //     return num.toString();
        // };
        // const svgRef = useRef<SVGSVGElement | null>(null);

        // // Expose getSvgElement to parent via ref
        // useImperativeHandle(ref, () => ({
        //     getSvgElement: () => svgRef.current
        // }));
        // useEffect(() => {
        //     if (!svgRef.current || !chartData || chartData.length === 0) return;

        //     const svg = d3.select(svgRef.current);
        //     svg.selectAll("*").remove(); // Clear previous content

        //     const width = 600;
        //     const height = 500;
        //     const margin = { top: 70, right: 10, bottom: 120, left: 70 };
        //     const innerWidth = width - margin.left - margin.right;
        //     const innerHeight = height - margin.top - margin.bottom;

        //     const chartGroup = svg
        //         .attr("width", width)
        //         .attr("height", height)
        //         .append("g")
        //         .attr("transform", `translate(${margin.left},${margin.top - 30})`);

        //     const x0 = d3
        //         .scaleBand()
        //         .domain(chartData.map((d: any) => d.siteZoneName))
        //         .range([0, innerWidth])
        //         .padding(0.3); 

        //     const x1 = d3
        //         .scaleBand()
        //         .domain(["peopleCount", "vehicleCount"])
        //         .range([0, x0.bandwidth()])
        //         .padding(0.3); 
        //     const yMax = d3.max(chartData, (d: any) => Math.max(d.peopleCount || 0, d.vehicleCount || 0));
        //     const yScale = d3.scaleLinear().domain([0, ((yMax ?? 0) + margin.top)]).nice().range([innerHeight, 0]);


        //     const color = d3.scaleOrdinal<string>()
        //         .domain(["peopleCount", "vehicleCount"])
        //         .range(colors.map((color: any) => color));


        //     // Draw grouped bars
        //     chartGroup
        //         .selectAll("g.bar-group")
        //         .data(chartData)
        //         .enter()
        //         .append("g")
        //         .attr("class", "bar-group")
        //         .attr("transform", (d: any) => `translate(${x0(d.siteZoneName)}, 0)`)
        //         .selectAll("rect")
        //         .data((d: any) =>
        //             ["peopleCount", "vehicleCount"].map((key) => ({
        //                 key,
        //                 value: d[key as "peopleCount" | "vehicleCount"] || 0,
        //                 xOffset: x1(key)!,
        //                 xBase: x0(d.siteZoneName)!,
        //                 date: d.dateTime,
        //             }))
        //         )
        //         .enter()
        //         .append("rect")
        //         .attr("x", (d) => (x1(d.key)!))
        //         .attr("y", (d) => yScale(d.value))
        //         .attr("width", x1.bandwidth())
        //         .attr("height", (d) => innerHeight - yScale(d.value))
        //         .attr("fill", (d) => color(d.key))
        //         .attr("rx", Math.min(x1.bandwidth() / 2, 30)) // rounded horizontal corners
        //         .attr("ry", 15) // optional vertical rounding      

        //     const labelPadding = 4;
        //     const labelHeight = 20;

        //     chartGroup
        //         .selectAll("g.individual-labels")
        //         .data(chartData)
        //         .enter()
        //         .append("g")
        //         .attr("class", "individual-labels")
        //         .attr("transform", (d: any) => `translate(${x0(d.siteZoneName)}, 0)`)
        //         .each(function (d: any) {
        //             const group = d3.select(this);
        //             const values = ["peopleCount", "vehicleCount"].map((key) => ({
        //                 key,
        //                 value: d[key as "peopleCount" | "vehicleCount"] || 0,
        //                 xOffset: x1(key)!,
        //             }));

        //             values.forEach((v) => {
        //                 const barHeight = innerHeight - yScale(v.value);
        //                 const labelY = yScale(v.value) - labelHeight - 4;
        //                 const labelText = `${v.value}`;

        //                 //Draw background rect
        //                 group.append("rect")
        //                     .attr("x", v.xOffset - 5)
        //                     .attr("y", labelY)
        //                     .attr("width", x1.bandwidth() + 8)
        //                     .attr("height", labelHeight)
        //                     .attr("rx", 6)
        //                     .attr("ry", 6)
        //                     .attr("fill", "white")
        //                     .attr("stroke", "#ccc");

        //                 // Add value text
        //                 group.append("text")
        //                     .attr("x", v.xOffset + x1.bandwidth() / 2)
        //                     .attr("y", labelY + labelHeight / 2 + 1)
        //                     .attr("text-anchor", "middle")
        //                     .attr("dominant-baseline", "middle")
        //                     .attr("fill", "#333")
        //                     .style("font-size", "10px")
        //                     .style("font-weight", "600")
        //                     .text(formatNumber(Number(labelText)));
        //             });
        //         });





        //     chartGroup
        //         .append("g")
        //         .attr("transform", `translate(0, ${innerHeight})`)
        //         .call(
        //             d3.axisBottom(x0)

        //         )
        //         .selectAll("text")
        //         .style("fill", "#666")
        //         .style("font-size", "12px")
        //         .attr("transform", "rotate(-45)")
        //         .style("text-anchor", "end")
        //         .attr("dx", "-0.8em") // Shift slightly left
        //         .attr("dy", "0.15em"); // Shift slightly down

        //     // chartGroup
        //     //     .append("g")
        //     //     .attr("transform", `translate(0, ${innerHeight})`)
        //     //     .call(d3.axisBottom(x0))
        //     //     .selectAll("text")
        //     //     .each(function (d) {
        //     //         const text = d3.select(this);
        //     //         const label = d ? d.toString() : ""; // Ensure string
        //     //         const words = label.split(" ");

        //     //         text.text(null);

        //     //         words.forEach((word, i) => {
        //     //             text.append("tspan")
        //     //                 .text(word)
        //     //                 .attr("x", 0)
        //     //                 .attr("dy", i === 0 ? 0 : "1.2em");
        //     //         });
        //     //     })
        //     //     .style("fill", "#666")
        //     //     .style("font-size", "12px")
        //     //     .attr("transform", "rotate(-45)")
        //     //     .style("text-anchor", "end")
        //     //     .attr("dx", "-0.8em")
        //     //     .attr("dy", "0.15em");

        //     chartGroup
        //         .selectAll(".domain, .tick line")
        //         .style("stroke", "#666");
        //     // Y-axis
        //     chartGroup.append("g").call(d3.axisLeft(yScale))
        //     .selectAll("text")           
        //     .style("fill", "#666");      

        //     // Style Y-axis line and tick marks
        //     chartGroup
        //         .selectAll(".domain, .tick line")
        //         .style("stroke", "#666");

        //     // Percentage Calculations
        //     const totalPeople = d3.sum(chartData, d => d.peopleCount);
        //     const totalVehicles = d3.sum(chartData, d => d.vehicleCount);
        //     const total = totalPeople + totalVehicles;

        //     const peoplePercentage = !isNaN(((totalPeople / total) * 100)) ? ((totalPeople / total) * 100).toFixed(0) + '%': '0%';
        //     const vehiclePercentage = !isNaN(((totalVehicles / total) * 100)) ? ((totalVehicles / total) * 100).toFixed(0) + '%': '0%';            
        //     const legendGroup = svg
        //         .append("g")
        //         .attr("transform", `translate(${innerWidth / 2 - 60}, ${innerHeight + 130})`);

        //     legendGroup
        //         .append("circle")
        //         .attr("cx", 0)
        //         .attr("cy", 27)
        //         .attr("r", 6)
        //         .style("fill", colors[0]);

        //     legendGroup
        //         .append("text")
        //         .attr("x", 20)
        //         .attr("y", 35)
        //         .text("People")
        //         .style("font-size", "23px")
        //         .style("fill", "#6e6868")
        //         .style("font-weight", "bold");

        //     legendGroup
        //         .append("text")
        //         .attr("x", 20)
        //         .attr("y", 60)
        //         .text(peoplePercentage)
        //         .style("font-size", "15px")
        //         .style("fill", "#FF8A01")
        //         .style("font-weight", "bold");

        //     legendGroup
        //         .append("circle")
        //         .attr("cx", 140)
        //         .attr("cy", 27)
        //         .attr("r", 6)
        //         .style("fill", colors[1]);

        //     legendGroup
        //         .append("text")
        //         .attr("x", 160)
        //         .attr("y", 35)
        //         .text("Vehicle")
        //         .style("font-size", "23px")
        //         .style("fill", "#626262")
        //         .style("font-weight", "700");

        //     legendGroup
        //         .append("text")
        //         .attr("x", 160)
        //         .attr("y", 60)
        //         .text(vehiclePercentage)
        //         .style("font-size", "15px")
        //         .style("fill", "#FF8A01")
        //         .style("font-weight", "700");

        const getChartTitle = () => {
            let base = (reportType && reportType.toLowerCase() === "site report") ? "By Site" : "By Zone";

            if (!comperisionType || comperisionType.length === 0 || (comperisionType.includes("people") && comperisionType.includes("vehicle"))) {
                return `People & Vehicle Count ${base}`;
            } else if (comperisionType.length === 1) {
                if (comperisionType.includes("people")) {
                    return `People Count ${base}`;
                } else if (comperisionType.includes("vehicle")) {
                    return `Vehicle Count ${base}`;
                }
            }
            // fallback
            return `People & Vehicle Count ${base}`;
        };

        const formatNumbers = (num: any) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        };

        const svgRef = useRef<SVGSVGElement | null>(null);

        useImperativeHandle(ref, () => ({
            getSvgElement: () => svgRef.current
        }));

        useEffect(() => {
            if (!svgRef.current || !chartData || chartData.length === 0) return;

            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove(); // Clear previous content
            const width = 600;
            const height = 500;
            const margin = { top: 70, right: 10, bottom: 120, left: 70 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const chartGroup = svg
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top - 30})`);

            // Define keys based on comparison type
            const keys: CountKey[] = [];
            if (!comperisionType || comperisionType.length === 0 || comperisionType.includes('people') && comperisionType.includes('vehicle')) {
                keys.push("peopleCount", "vehicleCount");
            } else {
                if (comperisionType.includes("people")) keys.push("peopleCount");
                if (comperisionType.includes("vehicle")) keys.push("vehicleCount");
            }
            // Create a color mapping based on available keys
            const colorMap: Record<CountKey, string> = {
                peopleCount: colors[0] || "#000",
                vehicleCount: colors[1] || "#000"
            };

            keys.forEach((key, index) => {
                colorMap[key] = colors[index] || "#000";
            });
            // X0 scale
            const x0 = d3
                .scaleBand()
                .domain(chartData.map((d: any) => d.siteZoneName))
                .range([0, innerWidth])
                .padding(0.3);

            // X1 scale based on keys
            const x1 = d3
                .scaleBand()
                .domain(keys)
                .range([0, x0.bandwidth()])
                .padding(0.3);

            // Y scale based on keys
            const yMax = d3.max(chartData, (d: any) =>
                d3.max(keys.map(k => d[k] || 0))
            );
            const yScale = d3.scaleLinear()
                .domain([0, ((yMax ?? 0) + margin.top)])
                .nice()
                .range([innerHeight, 0]);

            // Color scale based on keys
            const color = d3.scaleOrdinal<string>()
                .domain(keys)
                .range(colors.slice(0, keys.length));

            // Draw grouped bars
            chartGroup
                .selectAll("g.bar-group")
                .data(chartData)
                .enter()
                .append("g")
                .attr("class", "bar-group")
                .attr("transform", (d: any) => `translate(${x0(d.siteZoneName)}, 0)`)
                .selectAll("rect")
                .data((d: any) =>
                    keys.map((key) => ({
                        key,
                        value: d[key] || 0,
                        xOffset: x1(key)!,
                        xBase: x0(d.siteZoneName)!,
                        date: d.dateTime,
                    }))
                )
                .enter()
                .append("rect")
                .attr("x", (d) => x1(d.key)!)
                .attr("y", (d) => yScale(d.value))
                .attr("width", x1.bandwidth())
                .attr("height", (d) => innerHeight - yScale(d.value))
                // .attr("fill", (d) => colorMap[d.key]!)  // Using '!' to assure TS this exists
                .attr("fill", (d) => {
                    if (comperisionType?.includes("people") && d.key === "peopleCount") {
                        return colors[0];
                    }
                    if (comperisionType?.includes("vehicle") && d.key === "vehicleCount") {
                        return  colors[1];
                    }
                    // fallback if nothing matches
                    return "#000";
                })
                .attr("rx", Math.min(x1.bandwidth() / 2, 30))
                .attr("ry", 15);

            const labelHeight = 20;

            chartGroup
                .selectAll("g.individual-labels")
                .data(chartData)
                .enter()
                .append("g")
                .attr("class", "individual-labels")
                .attr("transform", (d: any) => `translate(${x0(d.siteZoneName)}, 0)`)
                .each(function (d: any) {
                    const group = d3.select(this);
                    const values = keys.map((key) => ({
                        key,
                        value: d[key] || 0,
                        xOffset: x1(key)!,
                    }));

                    values.forEach((v) => {
                        const barHeight = innerHeight - yScale(v.value);
                        const labelY = yScale(v.value) - labelHeight - 4;
                        const labelText = `${v.value}`;

                        group.append("rect")
                            .attr("x", v.xOffset - 5)
                            .attr("y", labelY)
                            .attr("width", x1.bandwidth() + 8)
                            .attr("height", labelHeight)
                            .attr("rx", 6)
                            .attr("ry", 6)
                            .attr("fill", "white")
                            .attr("stroke", "#ccc");

                        group.append("text")
                            .attr("x", v.xOffset + x1.bandwidth() / 2)
                            .attr("y", labelY + labelHeight / 2 + 1)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "middle")
                            .attr("fill", "#333")
                            .style("font-size", "10px")
                            .style("font-weight", "600")
                            .text(formatNumber(Number(labelText)));
                    });
                });

            // X Axis
            chartGroup
                .append("g")
                .attr("transform", `translate(0, ${innerHeight})`)
                .call(d3.axisBottom(x0))
                .selectAll("text")
                .style("fill", "#666")
                .style("font-size", "12px")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dx", "-0.8em")
                .attr("dy", "0.15em");

            // Y Axis
            chartGroup.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")
                .style("fill", "#666");

            chartGroup
                .selectAll(".domain, .tick line")
                .style("stroke", "#666");

            // Percentage calculations based on filtered keys
            const total = d3.sum(chartData, d =>
                keys.reduce((acc, k) => acc + (d[k] || 0), 0)
            );
            const totalPeople = d3.sum(chartData, d => d.peopleCount);
            const totalVehicles = d3.sum(chartData, d => d.vehicleCount);

            const peoplePercentage = !isNaN(((totalPeople / total) * 100)) ? ((totalPeople / total) * 100).toFixed(0) + '%' : '0%';
            const vehiclePercentage = !isNaN(((totalVehicles / total) * 100)) ? ((totalVehicles / total) * 100).toFixed(0) + '%' : '0%';

            const legendGroup = svg
                .append("g")
                .attr("transform", `translate(${innerWidth / 2 - 60}, ${innerHeight + 130})`);
    
            if (keys.includes("peopleCount")) {
                legendGroup
                    .append("circle")
                    .attr("cx", 0)
                    .attr("cy", 27)
                    .attr("r", 6)
                    .style("fill", colors[0]);

                legendGroup
                    .append("text")
                    .attr("x", 20)
                    .attr("y", 35)
                    .text("People")
                    .style("font-size", "23px")
                    .style("fill", "#6e6868")
                    .style("font-weight", "bold");

                legendGroup
                    .append("text")
                    .attr("x", 20)
                    .attr("y", 60)
                    .text(peoplePercentage)
                    .style("font-size", "15px")
                    .style("fill", "#FF8A01")
                    .style("font-weight", "bold");
            }

            if (keys.includes("vehicleCount")) {
                const offsetX = keys.includes("peopleCount") ? 140 : 0;

                legendGroup
                    .append("circle")
                    .attr("cx", offsetX)
                    .attr("cy", 27)
                    .attr("r", 6)
                    .style("fill", colors[1]);

                legendGroup
                    .append("text")
                    .attr("x", offsetX + 20)
                    .attr("y", 35)
                    .text("Vehicle")
                    .style("font-size", "23px")
                    .style("fill", "#626262")
                    .style("font-weight", "700");

                legendGroup
                    .append("text")
                    .attr("x", offsetX + 20)
                    .attr("y", 60)
                    .text(vehiclePercentage)
                    .style("font-size", "15px")
                    .style("fill", "#FF8A01")
                    .style("font-weight", "700");
            }

        }, [chartData, comperisionType])

        return (
            <>
                <Typography variant="h6">Visualizations</Typography>
                <Box className="reports-repeated-box">
                    <Typography variant="h6" className="reports-chart-name"> {getChartTitle()}</Typography>
                    <Box className="reports-charts-box"><svg ref={svgRef} ></svg></Box>
                </Box>
            </>
        )
    })
export { PeopleVehicleCountChart };