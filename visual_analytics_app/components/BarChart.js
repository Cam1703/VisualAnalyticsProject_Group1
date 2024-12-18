import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box, Paper } from "@mui/material";

const legendStyleTitle = "text-[#597393] text-[14px] font-bold font-['Inter'] leading-tight";


const BarChart = () => {
    const chartRef = useRef();

    const data = [
        { year: 2014, hard_court: 15, grass: 20, clay: 35 },
        { year: 2015, hard_court: 75, grass: 65, clay: 90 },
        { year: 2016, hard_court: 10, grass: 40, clay: 60 },
        { year: 2017, hard_court: 45, grass: 80, clay: 85 },
        { year: 2018, hard_court: 30, grass: 50, clay: 5 },
        { year: 2019, hard_court: 25, grass: 30, clay: 100 },
        { year: 2020, hard_court: 20, grass: 15, clay: 75 },
        { year: 2021, hard_court: 5, grass: 85, clay: 80 },
        { year: 2022, hard_court: 70, grass: 35, clay: 78 },
        { year: 2023, hard_court: 40, grass: 45, clay: 10 },
    ];

    useEffect(() => {
        drawChart();
        window.addEventListener("resize", drawChart);
        return () => window.removeEventListener("resize", drawChart);
    }, []);

    const drawChart = () => {
        const margin = { top: 20, right: 30, bottom: 50, left: 40 };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;
    
        d3.select(chartRef.current).select("svg").remove();
    
        const svg = d3
            .select(chartRef.current)
            .append("svg")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
        const xScale = d3
            .scaleBand()
            .domain(data.map((d) => d.year))
            .range([0, width])
            .padding(0.2);
    
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => Math.max(d.hard_court, d.grass, d.clay))])
            .nice()
            .range([height, 0]);
    
        const colors = {
            hard_court: "#a3c9ff",
            grass: "#a0d995",
            clay: "#e6b98c",
        };
    
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("text-anchor", "middle");
    
        svg.append("g").call(d3.axisLeft(yScale));
    
        // Tooltip div
        const tooltip = d3
            .select(chartRef.current)
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px")
            .style("border-radius", "4px")
            .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0);
    
        data.forEach((d) => {
            ["hard_court", "grass", "clay"].forEach((surface, i) => {
            svg
                .append("rect")
                .attr("x", xScale(d.year) + i * (xScale.bandwidth() / 3))
                .attr("y", yScale(d[surface]))
                .attr("width", xScale.bandwidth() / 3)
                .attr("height", height - yScale(d[surface]))
                .attr("fill", colors[surface])
                .on("mouseenter", (event) => {
                tooltip
                    .style("opacity", 1)
                    .style("font-size", "10px")
                    .style("padding", "2px 4px")
                    .html(
                    `<strong>${surface.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}:</strong> ${d[surface]}<br><strong>Year:</strong> ${d.year}`
                    );
                })
                .on("mousemove", (event) => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
                })
                .on("mouseleave", () => {
                tooltip.style("opacity", 0);
                });
            });
        });
    
        const legend = svg
            .selectAll(".legend")
            .data(Object.keys(colors))
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${width - 50},${i * 20})`);
        
        legend
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d) => colors[d]);
        
        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text((d) => d.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()))
            .style("font-size", "12px");
    };
    
    return (
        <Box component={Paper} elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <h2 className={legendStyleTitle}>Matches by Season</h2>
            <div ref={chartRef} style={{ width: "100%" }}></div>
        </Box>
    );
};

export default BarChart;
