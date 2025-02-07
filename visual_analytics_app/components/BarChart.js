import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box, Paper } from "@mui/material";

const legendStyleTitle = "text-[#597393] text-[14px] font-bold leading-tight";


const BarChart = ({ playerData, selectedPlayer, years, selectedSurface, selectedYear }) => {
    const chartRef = useRef();
    const data = formatData(playerData, selectedPlayer);

    useEffect(() => {
        drawChart();
        window.addEventListener("resize", drawChart);
        return () => window.removeEventListener("resize", drawChart);
    }, [playerData, selectedPlayer, years, selectedSurface, selectedYear]);


    function formatData(playerData = [], selectedPlayer = "") {
        if (!selectedPlayer) {
            console.log("Selected player is not defined or has no name.");
            return [];
        }

        const data = playerData.filter(match => match.winner_name === selectedPlayer.name || match.loser_name === selectedPlayer.name);
        const surfaces = ["Hard", "Grass", "Clay"];
        const formattedData = years.map((year) => {
            const matches = data.filter((d) => d.tourney_date.startsWith(year));
            const stats = { year };
            surfaces.forEach((surface) => {
                stats[surface.toLowerCase()] = matches.filter((d) => d.surface === surface).length;
            });
            return stats;
        });
        return formattedData;
    }

    const drawChart = () => {
        const margin = { top: 10, right: 100, bottom: 20, left: 40 };
        const width = chartRef.current.clientWidth - margin.left - margin.right;
        const height = 280 - margin.top - margin.bottom;

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
            .domain([0, Math.ceil(d3.max(data, (d) => Math.max(d.hard, d.grass, d.clay)) / 10) * 10])
            .nice()
            .range([height, 0]);

        const colors = {
            hard: selectedSurface == "Hard" || !selectedSurface ? "rgb(163, 201, 255)" : "rgb(163, 201, 255, 0.5)",
            grass: selectedSurface == "Grass" || !selectedSurface ? "rgb(160, 217, 149)" : "rgb(160, 217, 149, 0.5)",
            clay: selectedSurface == "Clay" || !selectedSurface ? "rgb(230, 185, 140)" : "rgb(230, 185, 140, 0.5)",
        };

        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("text-anchor", "middle");

        svg.append("g").call(d3.axisLeft(yScale).ticks((yScale.domain()[1] - yScale.domain()[0]) / 10));

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
            ["hard", "grass", "clay"].forEach((surface, i) => {
                const surfaceLabel = surface === "hard" ? "hard_court" : surface;
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
                                `<strong>${surfaceLabel.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase())}:</strong> ${d[surface]}<br><strong>Year:</strong> ${d.year}`
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
            .attr("transform", (d, i) => `translate(${width + 20},${i * 20})`);

        legend
            .append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", (d) => colors[d]);

        legend
            .append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text((d) => d === "hard" ? "Hard Court" : d.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()))
            .style("font-size", "12px");
    };


    return (
        <Box
            component={Paper}
            elevation={3}
            sx={{
                p: 1,
                textAlign: "center",
                width: "100%",
                height: "100%"
            }}>
            <h2 className={legendStyleTitle}>Matches by Season</h2>
            <div ref={chartRef} style={{ width: "100%"}}></div>
        </Box>
    );
};

export default BarChart;
