'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Paper, Typography } from '@mui/material';

const RadarChart = ({ data, variables, selectedYear, selectedSurface, setSelectedSurface }) => {
    const svgRef1 = useRef();
    const svgRef2 = useRef();
    const isChartDrawn1 = useRef(false);
    const isChartDrawn2 = useRef(false);

    const parseData = (data) => {
        let surfaceStats = {
            'Clay': { gamesWon: 0, gamesPlayed: 0},
            'Hard': { gamesWon: 0, gamesPlayed: 0},
            'Grass': { gamesWon: 0, gamesPlayed: 0}
        };

        data.forEach((row) => {
            let surface = row.surface;
            surfaceStats[surface].gamesPlayed += 1;

            if (row.win === "1") {
                surfaceStats[surface].gamesWon += 1;
            }
        });

        let radarData = Object.entries(surfaceStats).map(([surface, stats]) => ({
            variable: surface,
            value: stats.gamesPlayed != 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0,
        }));

        return radarData;
    };

    useEffect(() => {
        if (!data) {
            return;
        }

        let parsedData = parseData(data);
        if (isChartDrawn1.current) {
            d3.select(svgRef1.current).selectAll('.data-layer').remove();
        }
        if (isChartDrawn2.current) {
            d3.select(svgRef2.current).selectAll('.data-layer').remove();
        }

        const width = 200,
            height = 200,
            gridLevels = 4,
            size = Math.min(width, height),
            r = 0.8 * size,
            maxRadius = r / 2,
            center = { x: size / 2, y: size / 2 };

        let parentGroup1, parentGroup2;

        if (!isChartDrawn1.current) {
            parentGroup1 = d3.select(svgRef1.current)
                .attr('width', width)
                .attr('height', height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .append('g')
                .attr('class', 'parent-group')
                .attr('transform', `translate(0, ${height / 12})`);
        } else {
            parentGroup1 = d3.select(svgRef1.current).select('.parent-group');
        }

        if (!isChartDrawn2.current) {
            parentGroup2 = d3.select(svgRef2.current)
                .attr('width', width)
                .attr('height', height)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .append('g')
                .attr('class', 'parent-group')
                .attr('transform', `translate(0, ${height / 12})`);
        } else {
            parentGroup2 = d3.select(svgRef2.current).select('.parent-group');
        }

        if (!isChartDrawn1.current) {
            drawGrid(parentGroup1, variables, size, center, maxRadius, gridLevels, variables.length);
            drawScale(parentGroup1, center, maxRadius, gridLevels);
            isChartDrawn1.current = true;
        }

        if (!isChartDrawn2.current) {
            drawGrid(parentGroup2, variables, size, center, maxRadius, gridLevels, variables.length);
            drawScale(parentGroup2, center, maxRadius, gridLevels);
            isChartDrawn2.current = true;
        }

        drawData(parentGroup1, parsedData, center, maxRadius, variables.length, 'rgba(197, 27, 138, 0.2)');

        if (selectedYear) {
            let selectedYearData = data.filter(
                (row) => row.tourney_date?.slice(0, 4) === selectedYear.toString()
            );
            let parsedSelectedYearData = parseData(selectedYearData);
            drawData(parentGroup2, parsedSelectedYearData, center, maxRadius, variables.length, 'rgba(197, 27, 138, 0.2)');
        }

        updateLabelStyles(selectedSurface);

    }, [data, variables, selectedYear]);

    const drawGrid = (parentGroup, variables, size, center, maxRadius, totalLevels, totalSides) => {
        const polyAngle = (Math.PI * 2) / totalSides;

        const extraLinesGroup = parentGroup.append('g').attr('stroke', '#000').attr('stroke-width', '1px');
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

        let scaleGroup = parentGroup.append('g').attr('stroke', 'rgb(0, 0, 0)').attr('stroke-width', '1px');
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

        let newGroup = dataGroup.append('g').attr('stroke', '#c51b8a').attr('stroke-width', 2).attr('fill', color || 'rgba(197, 27, 138, 0.2)');
        drawPath([...points, points[0]], newGroup);

        const tooltip = d3.select('.tooltip');

        const mouseEnter = (event, d) => {
            tooltip.style('opacity', 1);
            const {x, y} = event;
            tooltip.style( "top", `${ y - 20 }px` );
            tooltip.style( "left", `${ x - 40 }px` );
            tooltip.text( d.value + '%');
            tooltip.style("font-size", "12px");

            if (d.value >= 50) {
                tooltip.style('background-color', '#78c679');
            } else {
                tooltip.style('background-color', '#fd8d3c');
            }
        };

        const mouseLeave = () => {
            tooltip.style('opacity', 0);
        };


        dataGroup.append('g')
            .attr('fill', '#c51b8a')
            .selectAll('circle')
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y)
            .attr('r', 4)
            .on('mouseenter', mouseEnter)
            .on('mouseleave', mouseLeave);
    };

    const drawText = (text, point, isAxis, labelGroup, vertex) => {
        labelGroup
            .append('text')
            .attr('x', isAxis ? point.x - 22 : point.x)
            .attr('y', isAxis ? point.y + 5 : (vertex === 0 ? point.y - 3 : point.y + 15))
            .html(text)
            .style('text-anchor', 'middle')
            .attr('fill', '#000')
            .style('font-size', '12px')
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
        d3.selectAll('.labels text').attr('font-weight', (d, i, nodes) => {
            const node = d3.select(nodes[i]);
            return node.attr('data-surface') === surface ? 'bold' : 'normal';
        });
    };

    return (
        <Box
            component={Paper}
            elevation={3}
            pt={2}
            pl={3}
            pr={3}
            sx={{
                display: 'grid',
                gridTemplateRows: '1fr 1fr',
                paddingTop: 2,
                textAlign: 'center',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '100%',
                height: '100%'
            }}
        >
            <Box>
                <h6 variant="h6" className = "text-[#597393] text-[14px] font-bold leading-tight">Overall Data</h6>
                <svg ref={svgRef1}></svg>
            </Box>
            <Box>
                <h6 variant="h6" className = "text-[#597393] text-[14px] font-bold leading-tight">Filtered Data ({selectedYear})</h6>
                <svg ref={svgRef2}></svg>
            </Box>
            <div className='tooltip'
                style={{
                    position: 'fixed',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'coral',
                    padding: '4px',
                    borderRadius: '4px',
                    opacity: 0
                }}
            ></div>
        </Box>
    );
};

export default RadarChart;
