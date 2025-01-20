'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper } from '@mui/material';

const ParallelCoordinatesChart = ({ data, variables }) => {
    const svgRef = useRef();
    const containerRef = useRef();

    //TODO: remove this
    const initMockData = function () {
        return [
            { 'ace': 5, 'df': 2, 'svpt': 20, '1stIn': 5, '1stWon': 10, '2ndWon': 2, 'SvGms': 20, 'bpSaved': 2, 'bpFaced': 2 },
            { 'ace': 0, 'df': 12, 'svpt': 15, '1stIn': 2, '1stWon': 20, '2ndWon': 5, 'SvGms': 10, 'bpSaved': 5, 'bpFaced': 15 },
            { 'ace': 1, 'df': 0, 'svpt': 4, '1stIn': 7, '1stWon': 0, '2ndWon': 15, 'SvGms': 15, 'bpSaved': 0, 'bpFaced': 5 },
        ];
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
            lineScales[elem] = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d[elem])])
                .range([height, 0]);
        });

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
        // Mock data if none provided
        if (!data) {
            data = initMockData();
        }

        drawChart();

        const handleResize = () => {
            drawChart();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data, variables]);

    return (
        <Box ref={containerRef} component={Paper} elevation={3} sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} />
        </Box>
    );
};

export default ParallelCoordinatesChart;
