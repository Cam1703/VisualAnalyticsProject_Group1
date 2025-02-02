'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper } from '@mui/material';

const ParallelCoordinatesChart = ({ data, variables, selectedSurface, selectedYear, selectedMatches, isYearFilterEnabled }) => {
    const svgRef = useRef();
    const containerRef = useRef();

    const axisLabels = {
        "ace": "Aces",
        "df": "Double Faults",
        "1st_in_percentage": "1st Serve In %",
        "1st_win_percentage": "% Pts.Won 1st Serve",
        "2nd_win_percentage": "% Pts.Won 2nd Serve",
        "avg_pts_per_sv_game": "Avg. Points per Game",
        "bpFaced": "Break Points Faced",
        "saved_breaks_percentage": "% Break Points Saved"
    };
    
    const filterData = (rawData) => {
        return rawData.filter((row) => {
            let isYearValid = !selectedYear || row['tourney_year'] === String(selectedYear);
            let isSurfaceValid = !selectedSurface || row.surface === selectedSurface;

            return isSurfaceValid && (!isYearFilterEnabled || isYearValid);
        });
    };


    const drawChart = () => {
        // Clear the previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Get container dimensions
        const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

        // Chart dimensions
        const margin = { top: 30, right: 50, bottom: 30, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        // SVG and group element
        const parentGroup = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xScale = d3.scalePoint()
            .domain(variables)
            .range([0, width]);

        const lineScales = {};
        
        variables.forEach((elem) => {
            const values = data.map(d => Number(d[elem]))
                                .filter(v => v !== undefined && v !== null && Number.isNaN(v) === false);
            console.log(`Values for ${elem}:`, values);
        
            const extent = d3.extent(values);
            console.log(`Extent for ${elem}:`, extent);
        
            lineScales[elem] = d3.scaleLinear()
                .domain(extent)  // Ajusta a escala com base no mínimo e máximo reais
                .range([height, 0]);
        });

        drawStructure(parentGroup, xScale, lineScales, variables);
        drawData(parentGroup, xScale, lineScales, data, variables);
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
                .attr("transform", "translate(0,-20)"); // Places text a bit upper in the graph
    
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
            }))
        }));

        parentGroup.selectAll('.path')
            .data(lineData)
            .enter()
            .append('path')
            .attr('d', (d) => lineGenerator(d.elem))
            .attr('fill', 'none')
            .attr('stroke', (d) => selectedMatches[d.id] ? '#627B00' :'#627BC9')
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
                <p style={{ textAlign: "center", padding: "20px", fontSize: "16px", color: "#555" }}>Loading data...</p>
            </Box>
        );
    }    

    return (
        <Box ref={containerRef} component={Paper} elevation={0} sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} />
        </Box>
    );
};

export default ParallelCoordinatesChart;
