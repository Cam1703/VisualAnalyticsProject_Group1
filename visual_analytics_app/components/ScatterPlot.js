import { Box, Paper } from "@mui/material";
import { useEffect, useRef } from "react";
import * as d3 from 'd3';

export default function ScatterPlot({selectedSurface}) {
  // To Do: 
  // -integrate with real data
  // -implement selection
  // -implement relation to other charts
  // -name x and y on the graph

  const svgRef = useRef();

  useEffect(() => {

    let data = [
      { x: 10, y: 4, court: "Hard" },
      { x: 15, y: 5, court: "Clay" },
      { x: 20, y: 3, court: "Grass" },
      { x: 25, y: 6, court: "Hard" },
      { x: 30, y: 7, court: "Clay" },
      { x: 35, y: 2, court: "Grass" },
      { x: 40, y: 8, court: "Hard" },
      { x: 45, y: 9, court: "Clay" },
      { x: 50, y: 4, court: "Grass" },
      { x: 55, y: 7, court: "Hard" },
      { x: 60, y: 6, court: "Clay" },
      { x: 65, y: 5, court: "Grass" },
      { x: 70, y: 8, court: "Hard" },
      { x: 75, y: 9, court: "Clay" },
      { x: 80, y: 4, court: "Grass" },
      { x: 85, y: 7, court: "Hard" },
      { x: 90, y: 6, court: "Clay" },
      { x: 95, y: 5, court: "Grass" },
      { x: 100, y: 8, court: "Hard" },
      { x: 105, y: 9, court: "Clay" },
      { x: 110, y: 4, court: "Grass" },
      { x: 115, y: 7, court: "Hard" },
      { x: 120, y: 6, court: "Clay" },
      { x: 125, y: 5, court: "Grass" },
      { x: 130, y: 8, court: "Hard" },
      { x: 135, y: 9, court: "Clay" }
    ];
    
    if(selectedSurface){ 
      data = data.filter((d) => selectedSurface == d.court)
    }

    const courtColorsSolid = {
      Hard: "#56B4E9",
      Clay: "#D55E00",
      Grass: "#009E73",
    };

    const courtColorOpacity ={
      Hard: "rgb(163, 201, 255)",
      Grass: "rgb(160, 217, 149)",
      Clay: "rgb(230, 185, 140)"
    }

    const courtShapes = {
      Hard: d3.symbolSquare,
      Clay: d3.symbolTriangle,
      Grass: d3.symbolCircle,
    };

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 100, bottom: 30, left: 40 };

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x) + 5])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) + 1])
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add points
    svg
      .selectAll(".point")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "point")
      .attr("transform", (d) => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .attr("d", (d) => d3.symbol().type(courtShapes[d.court]).size(100)())
      .attr("fill", (d) => courtColorOpacity[d.court])
      .attr("stroke", (d) => courtColorsSolid[d.court]) // Add border color
      .attr("stroke-width", 1); // Set border width

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(Object.keys(courtColorOpacity))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width - 80}, ${20 + i * 20})`);

    legend
      .append("path")
      .attr("d", (d) => d3.symbol().type(courtShapes[d]).size(100)())
      .attr("fill", (d) => courtColorOpacity[d])
      .attr("stroke", (d) => courtColorsSolid[d.court]) // Add border color to legend symbols
      .attr("stroke-width", 1) // Set border width
      .attr("transform", "translate(10,10)");

    legend
      .append("text")
      .text((d) => d == "Hard" ? "Hard Court" : d.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()))
      .attr("x", 20)
      .attr("y", 15)
      .style("font-size", "12px");

  }, [selectedSurface]);

  return (
    <Box component={Paper} elevation={3} sx={{ display: 'flex', textAlign: "center", width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <svg ref={svgRef} width={600} height={300}></svg>
    </Box>
  );
}
