'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper } from '@mui/material';

const ParallelCoordinatesChart = ({ data, variables }) => {
    const svgRef = useRef();
    const containerRef = useRef();

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
        // variables.forEach((elem) => {
        //     const values = data.map(d => d[elem]);
        //     console.log(`Values for ${elem}:`, values);
        //     console.log(`Types of values for ${elem}:`, values.map(v => typeof v));
        // });
        
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
            
        // console.log("Variables used:", variables);
        // console.log("Sample data row:", data.length > 0 ? data[0] : "No data available");

        drawStructure(parentGroup, xScale, lineScales, variables);
        drawData(parentGroup, xScale, lineScales, data, variables);
    };

    const drawStructure = (parentGroup, xScale, lineScales, variables) => {
        variables.forEach((elem) => {
            const axis = d3.axisLeft(lineScales[elem]);
            parentGroup.append('g')
                .attr('transform', `translate(${xScale(elem)},0)`)
                .call(axis)
                .append('text')
                .attr('y', -10)
                .attr('text-anchor', 'middle')
                .attr('fill', 'black')
                .text(elem);
        });
    };

    const drawData = (parentGroup, xScale, lineScales, data, variables) => {
        const lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x((d) => xScale(d.dimension))
            .y((d) => lineScales[d.dimension](d.value));

        const lineData = data.map((match) =>
            variables.map((elem) => ({ dimension: elem, value: match[elem] }))
        );

        parentGroup.selectAll('.path')
            .data(lineData)
            .enter()
            .append('path')
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#627BC9')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.7);
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
    }, [data, variables]);

    if (!data || data.length === 0) {
        return (
            <Box ref={containerRef} component={Paper} elevation={3} sx={{ width: '100%', height: '100%', position: 'relative' }}>
                <p style={{ textAlign: "center", padding: "20px", fontSize: "16px", color: "#555" }}>Loading data...</p>
            </Box>
        );
    }    

    return (
        <Box ref={containerRef} component={Paper} elevation={3} sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} />
        </Box>
    );
};

export default ParallelCoordinatesChart;
