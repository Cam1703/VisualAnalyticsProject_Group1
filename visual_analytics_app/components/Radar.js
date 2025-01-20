'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, Paper } from '@mui/material';

const RadarChart = ({ data, variables, selectedYear, selectedSurface, setSelectedSurface }) => {
    const svgRef = useRef();
    const isChartDrawn = useRef(false);

    const parseData = (data) => {
        let surfaceStats = {};

        data.forEach((row) => {
            let surface = row.surface;
            if (!surfaceStats[surface]) {
                surfaceStats[surface] = { gamesWon: 0, gamesPlayed: 0 };
            }

            surfaceStats[surface].gamesPlayed += 1;

            if (row.win === "1") {
                surfaceStats[surface].gamesWon += 1;
            }
        });

        let radarData = Object.entries(surfaceStats).map(([surface, stats]) => ({
            variable: surface,
            value: Math.round((stats.gamesWon / stats.gamesPlayed) * 100),
        }));

        return radarData;
    };

    useEffect(() => {
        if (!data) {
            return;
        }

        let parsedData = parseData(data);
        if (isChartDrawn.current) {
            d3.select(svgRef.current).selectAll('.data-layer').remove();
        }

        const width = 350,
            height = 250,
            gridLevels = 4,
            size = Math.min(width, height),
            r = 0.8 * size,
            maxRadius = r / 2,
            center = { x: size / 2, y: size / 2 };

        let parentGroup;

        if (!isChartDrawn.current) {
            parentGroup = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('transform', `translate(0, ${height / 10})`)
                .append('g')
                .attr('class', 'parent-group');
        } else {
            parentGroup = d3.select(svgRef.current).select('.parent-group');
        }

        if (!isChartDrawn.current) {
            drawGrid(parentGroup, variables, size, center, maxRadius, gridLevels, variables.length);
            drawScale(parentGroup, center, maxRadius, gridLevels);
            isChartDrawn.current = true;
        }

        drawData(parentGroup, parsedData, center, maxRadius, variables.length);

        if (selectedYear) {
            let selectedYearData = data.filter(
                (row) => row.tourney_date?.slice(0, 4) === selectedYear.toString()
            );
            let parsedSelectedYearData = parseData(selectedYearData);
            drawData(parentGroup, parsedSelectedYearData, center, maxRadius, variables.length, 'rgba(0, 0, 255, 0.5)');
            drawLegend(parentGroup, width, height, selectedYear);
        }

        updateLabelStyles(selectedSurface);

    }, [data, variables, selectedYear]);

    const drawLegend = (parentGroup, width, height, selectedYear) => {
        parentGroup.select('.legend').remove();

        const legendGroup = parentGroup.append('g').attr('class', 'legend').attr('transform', `translate(${width - 150}, ${height - 170})`);

        // Default data legend
        legendGroup
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', 'rgba(0, 0, 255, 0.5)');
        legendGroup.append('text').attr('x', 20).attr('y', 12).text('All years').style('font-size', '12px');

        // Filtered data legend
        legendGroup
            .append('rect')
            .attr('x', 0)
            .attr('y', 20)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', 'rgba(0, 0, 255)');
        legendGroup.append('text').attr('x', 20).attr('y', 32).text(selectedYear).style('font-size', '12px');
    };

    const drawGrid = (parentGroup, variables, size, center, maxRadius, totalLevels, totalSides) => {
        const polyAngle = (Math.PI * 2) / totalSides;

        const extraLinesGroup = parentGroup.append('g').attr('stroke', '#000').attr('stroke-width', 2);
        const labelsGroup = parentGroup.append('g').attr('class', 'labels');

        for (let level = 1; level <= totalLevels; level++) {
            let hyp = (level / totalLevels) * maxRadius;

            let points = [];
            for (let vertex = 0; vertex < totalSides; vertex++) {
                let theta = vertex * polyAngle;
                points.push(generatePoint(center, hyp, theta));
            }

            let group = parentGroup.append('g').attr('fill', 'none').attr('stroke', '#ccc');
            drawPath([...points, points[0]], group);
        }

        for (let vertex = 0; vertex < totalSides; vertex++) {
            let theta = vertex * polyAngle;
            let point = generatePoint(center, maxRadius, theta);
            drawPath([center, point], extraLinesGroup);

            let label = variables[vertex];
            let labelPoint = generatePoint(center, 0.9 * (size / 2), theta);

            drawText(label, labelPoint, false, labelsGroup, vertex);
        }
    };

    const drawScale = (parentGroup, center, maxRadius, totalLevels) => {
        const step = 100 / totalLevels;
        let ticks = [];

        for (let i = 0; i <= totalLevels; i++) {
            let num = step * i;
            ticks.push(Number.isInteger(step) ? num : num.toFixed(2));
        }

        let scaleGroup = parentGroup.append('g').attr('stroke', 'rgb(228, 16, 16)').attr('stroke-width', '2px');
        const point = generatePoint(center, maxRadius, 0);
        drawPath([center, point], scaleGroup);

        let ticksGroup = parentGroup.append('g');

        ticks.forEach((elem, i) => {
            let r = (i / totalLevels) * maxRadius;
            let newPoint = generatePoint(center, r, 0);
            let points = [{ ...newPoint, x: newPoint.x - 10 }, newPoint];
            drawPath(points, scaleGroup);
            drawText(elem, newPoint, true, ticksGroup);
        });
    };

    const drawData = (parentGroup, data, center, maxRadius, totalSides, color) => {
        const scale = d3.scaleLinear().domain([0, 100]).range([0, maxRadius]);
        let points = [];
        let dataGroup = parentGroup.append('g').attr('class', 'data-layer');

        data.forEach((elem, i) => {
            let len = scale(elem.value);
            let theta = i * (2 * Math.PI / totalSides);
            points.push({ ...generatePoint(center, len, theta), value: elem.value });
        });

        let newGroup = dataGroup.append('g').attr('stroke', 'blue').attr('stroke-width', 2).attr('fill', color || 'rgba(0, 0, 255, 0.5)');
        drawPath([...points, points[0]], newGroup);

        const tooltip = d3.select('.tooltip');
        const mouseEnter = (event, d) => {
            tooltip.style('opacity', 1);
            const { x, y } = event;
            tooltip.style('top', `${y - 20}px`);
            tooltip.style('left', `${x + 15}px`);
            tooltip.text(d.value + '%');
            tooltip.style('background-color', d.value >= 50 ? 'rgb(0, 255, 0)' : 'coral');
        };

        const mouseLeave = () => {
            tooltip.style('opacity', 0);
        };

        dataGroup
            .append('g')
            .attr('fill', 'rgb(33,113,181)')
            .selectAll('circle')
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('r', 8)
            .on('mouseenter', mouseEnter)
            .on('mouseleave', mouseLeave);
    };

    const drawText = (text, point, isAxis, labelGroup, vertexIndex) => {
        labelGroup
            .append('text')
            .attr('x', isAxis ? point.x - 22 : point.x)
            .attr('y', isAxis ? point.y + 5 : point.y + 8)
            .html(text)
            .style('text-anchor', 'middle')
            .attr('fill', '#000')
            .style('font-size', '15px')
            .style('font-family', 'sans-serif')
            .style('font-weight', 'bold')
            .style('cursor', 'pointer')
            .attr('data-surface', text) // Atributo para identificar las etiquetas
            .on('click', () => {
                setSelectedSurface((prev) => (prev === text ? null : text)); // Alterna selección y deselección
            });
    };

    const generatePoint = (center, length, angle) => {
        return {
            x: center.x + length * Math.sin(Math.PI - angle),
            y: center.y + length * Math.cos(Math.PI - angle),
        };
    };

    const drawPath = (points, parent) => {
        const lineGenerator = d3.line().x((d) => d.x).y((d) => d.y);
        parent.append('path').attr('d', lineGenerator(points));
    };

    const updateLabelStyles = (surface) => {
        d3.selectAll('.labels text').attr('fill', (d, i, nodes) => {
            const node = d3.select(nodes[i]);
            return node.attr('data-surface') === surface ? 'blue' : '#000';
        });
    };

    return (
        <Box component={Paper} elevation={3} sx={{ display: 'flex', textAlign: 'center', width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <svg className="mt-1" ref={svgRef}></svg>
            <div
                className="tooltip"
                style={{
                    position: 'fixed',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'coral',
                    padding: '5px',
                    borderRadius: '5px',
                    opacity: 0,
                }}
            ></div>
        </Box>
    );
};

export default RadarChart;
