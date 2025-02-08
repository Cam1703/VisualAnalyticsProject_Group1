'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot for React 18
import ReactDOM from "react-dom";
import * as d3 from 'd3';
import { Box, Paper, Tooltip } from '@mui/material';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ParallelCoordinatesChart = ({ data, variables, selectedSurface, selectedYear, selectedMatches }) => {
    const svgRef = useRef();
    const containerRef = useRef();

    const axisLabels = {
        "ace": "Aces",
        "df": "Double Faults",
        "1st_in_percentage": "1st Serve In %",
        "1st_win_percentage": "% Pts.Won 1st Serve",
        "2nd_win_percentage": "% Pts.Won 2nd Serve",
        "avg_pts_per_sv_game": "Avg. Points per Game",
        "bpFaced": "Break Points Faced"
        // "saved_breaks_percentage": "% Break Points Saved"
    };

    const labelExplanations = {
        "ace": "Legal serve not touched by the receiver, winning the point for the server.",
        "df": "The server misses both serves and loses the point.",
        "1st_in_percentage": "Percentage of 1st serve attempts that were inside the service box.",
        "1st_win_percentage": "Percentage of points won when the player hit a 1st serve.",
        "2nd_win_percentage": "Percentage of points won when the player hit a 2nd serve.",
        "avg_pts_per_sv_game": "Average number of points played on the player's service games.",
        "bpFaced": "Number of opportunities for the opponent to break the player's serve."
        // "saved_breaks_percentage": "Percentage of break points played that were not converted by the opponent."
    }
    
    const filterData = (rawData) => {
        return rawData.filter((row) => {
            let isYearValid = !selectedYear || row['tourney_year'] === String(selectedYear);
            let isSurfaceValid = !selectedSurface || row.surface === selectedSurface;

            return isSurfaceValid && isYearValid;
        });
    };


    const drawChart = () => {
        // Clear the previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Get container dimensions
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

        // Chart dimensions
        const margin = { top: 60, right: 50, bottom: 30, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // SVG and group element
        const parentGroup = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // **ADDING TITLE**
        parentGroup.append("text")
            .attr("x", width / 2)  // Centered horizontally
            .attr("y", -50)        // Positioned above the graph
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .style("fill", "#597393")
            .text("Serve Metrics per Match");

        const xScale = d3.scalePoint()
            .domain(variables)
            .range([0, width]);

        const lineScales = {};
        
        variables.forEach((elem) => {
            const values = data.map(d => Number(d[elem]))
                                .filter(v => v !== undefined && v !== null && Number.isNaN(v) === false);        
            const extent = d3.extent(values);
        
            lineScales[elem] = d3.scaleLinear()
                .domain(extent)  // Ajusta a escala com base no mínimo e máximo reais
                .range([height, 0]);
        });

        drawStructure(parentGroup, xScale, lineScales, variables);
        drawData(parentGroup, xScale, lineScales, data, variables);

        // AQUI vem a parte da legenda!
        const legendGroup = parentGroup.append('g')
        .attr('class', 'legend')
        // Ajuste a posição da legenda conforme achar melhor
        .attr('transform', `translate(${width - 80}, 0)`);

        // Quadradinho verde
        legendGroup.append('rect')
        .attr('x', 0)
        .attr('y', -60)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', '#4daf4a');

        // Texto "Victory"
        legendGroup.append('text')
        .attr('x', 20)
        .attr('y', -53)
        .text('Win')
        .style("font-size", "12px")
        .attr("alignment-baseline","middle");

        // Quadradinho vermelho
        legendGroup.append('rect')
        .attr('x', 60)
        .attr('y', -60)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', '#e41a1c');

        // Texto "Defeat"
        legendGroup.append('text')
        .attr('x', 80)
        .attr('y', -53)
        .text('Loss')
        .style("font-size", "12px")
        .attr("alignment-baseline","middle");

    };

    const drawStructure = (parentGroup, xScale, lineScales, variables) => {
        variables.forEach((elem) => {
            const axis = d3.axisLeft(lineScales[elem]);
    
            const axisGroup = parentGroup.append('g')
                .attr('transform', `translate(${xScale(elem)},0)`)
                .call(axis);
    
            // Get formatted axis name
            const label = axisLabels[elem] || elem;
            const words = label.split(" "); // Split text by spaces
            
            const lines = [];
            for (let i = 0; i < words.length; i += 2) {
                lines.push(words.slice(i, i + 2).join(" ")); // 2 words for each line
            }
    
            // Creates a group for the text of each axis
            const textGroup = axisGroup.append("g")
                .attr("transform", "translate(0,-25)"); // Places text a bit upper in the graph
            
            // Get metric explanation
            const explanation = labelExplanations[elem] || elem;    

            // Adding each line separately
            lines.forEach((line, i) => {
                textGroup.append("text")
                    .attr("x", 0)
                    .attr("y", i * 12) // Spacing between lines
                    .attr("text-anchor", "middle")
                    .attr("fill", "black")
                    .style("font-size", "10px")
                    .text(line);
            });

            // Once the text is rendered, measure its bounding box
            const bbox = textGroup.node().getBBox(); 

            // Create a container for the tooltip icon
            const iconContainer = document.createElement("div");
            iconContainer.style.position = "absolute";

            // Because we used text-anchor = "middle", the text is centered at x=0.
            // BBox.x is likely negative. So to place the icon at the right edge of the text:
            iconContainer.style.left = `${xScale(elem) + bbox.x + bbox.width + 50}px`;
            iconContainer.style.top = `${bbox.y + 20    }px`; 
            iconContainer.style.display = "inline-block";

            // Render the tooltip icon into the container using createRoot
            const root = createRoot(iconContainer);
            root.render(
                <Tooltip title={explanation}>
                    <InfoOutlinedIcon
                        fontSize="small"
                        sx={{
                            color: "#597393",
                            cursor: "pointer",
                            fontSize: "13px"
                        }} 
                    />
                </Tooltip>
            );

            // Append the icon container to the parent container with the correct ID
            const graphContainer = document.getElementById("graph-container");
            if (graphContainer) {
                graphContainer.appendChild(iconContainer);
            } else {
                console.error("Container with id 'graph-container' not found.");
            }

        });
    };


    const drawData = (parentGroup, xScale, lineScales, data, variables) => {
        let filteredData = filterData(data);

        const lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x((d) => xScale(d.dimension))
            .y((d) => lineScales[d.dimension](d.value));

        const lineData = filteredData.map((match) => ({
            id: match['match_id'],
            elem: variables.map((elem) => ({
                dimension: elem,
                value: match[elem]
            })),
            win: Number(match['win']),
            isSelected: selectedMatches[match['match_id']] || false
        }));

        // Check if there are any selected matches
        const hasSelectedMatches = Object.values(selectedMatches).some(value => value);

        parentGroup.selectAll('.path')
            .data(lineData)
            .enter()
            .append('path')
            .attr('d', (d) => lineGenerator(d.elem))
            .attr('fill', 'none')
            .attr('stroke', (d) => {

                if (hasSelectedMatches) {
                    return d.isSelected ? (d.win === 1 ? "#4daf4a" : "#e41a1c") : "#B0B0B0";
                }
                return d.win === 1 ? "#4daf4a" : "#e41a1c";
            })
            .attr('stroke-width', (d) => selectedMatches[d.id] ? 2.5 : 1)
            .attr('opacity', (d) => Object.keys(selectedMatches).length === 0 || selectedMatches[d.id] ? 1 : 0.1);
    };

    useEffect(() => {
        if (!data || data.length === 0) {
            console.warn("Skipping drawChart: No valid data available.");
            return;
        }
    
        drawChart();
    
        const handleResize = () => {
            drawChart();
        };
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data, variables, selectedYear, selectedSurface, selectedMatches]);

    if (!data || data.length === 0) {
        return (
            <Box ref={containerRef} component={Paper} elevation={3} sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <p style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#555" }}>Loading data...</p>
            </Box>
        );
    }    

    return (
        <Box
            ref={containerRef}
            id="graph-container"
            component={Paper}
            elevation={0}
            sx={{
                width: '100%', 
                height: '100%', 
                position: 'relative'
            }}>
            <svg ref={svgRef} />
        </Box>
    );
};

export default ParallelCoordinatesChart;
