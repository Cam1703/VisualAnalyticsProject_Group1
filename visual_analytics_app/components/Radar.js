'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


const RadarChart = ({data, variables}) => {
    const svgRef = useRef();
    const isChartDrawn = useRef(false);

    const parseData = function () {
        let surfaceStats = {};

        data.forEach((row) => {
            let surface = row.surface;

            if (!surfaceStats[surface]) {
                surfaceStats[surface] = {gamesWon: 0, gamesPlayed: 0};
            }

            surfaceStats[surface].gamesPlayed += 1;
            
            if (row.win === "1") {
                surfaceStats[surface].gamesWon += 1;
            }
        });

        let radarData = Object.entries(surfaceStats)
            .map(([surface, stats]) => ({
                variable: surface, 
                value: Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
            }));
    
        return radarData;
    }
    

    useEffect(() => {
        if (!data) {
            return;
        }

        let parsedData = parseData(data);
    
        if (isChartDrawn.current) {
            d3.select(svgRef.current).selectAll('.data-layer').remove();
        }

        //Chart dimensions 
        const width = 450,  
              height = 450,
              gridLevels = 4,
              size = Math.min(width, height),
              r = 0.8 * size,   //Distance between center and edge of the drawing area
              maxRadius = r / 2,   //Maximum distance from center to the edge of the polygon (we need a little gap between the chart area and the edge of the drawing area)
              center = {x: size / 2, y: size / 2};

        let parentGroup
              
        if (!isChartDrawn.current) {
            parentGroup = d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
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

    }, [data, variables]);

    const drawGrid = function (parentGroup, variables, size, center, maxRadius, totalLevels, totalSides) {
        // Size of the angle created by each polygon side (the sum of all angles is 2 * Math.PI)
        const polyAngle = (Math.PI * 2) / totalSides;    

        const extraLinesGroup = parentGroup.append('g')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);

        const labelsGroup = parentGroup.append('g').attr('class', 'labels');
        
        for (let level = 1; level <= totalLevels; level++) {
            let hyp = (level / totalLevels) * maxRadius;

            let points = [];
            for (let vertex = 0; vertex < totalSides; vertex++) {
                let theta = vertex * polyAngle;
                points.push(generatePoint(center, hyp, theta));
            }

            let group = parentGroup.append('g')
                .attr('fill', 'none')
                .attr('stroke', '#ccc');

            drawPath([... points, points[0]], group);
        }
    
        //Draw lines extending from the center and add labels
        for (let vertex = 0; vertex < totalSides; vertex++) {
            let theta = vertex * polyAngle;
            let point = generatePoint(center, maxRadius, theta);
            drawPath([center, point], extraLinesGroup);

            let label = variables[vertex];
            let labelPoint = generatePoint(center, 0.9 * (size / 2), theta);

            drawText(label, labelPoint, false, labelsGroup);
        }
    };

    const drawScale = function (parentGroup, center, maxRadius, totalLevels) {
        const step = 100 / totalLevels;

        let ticks = [];

        for (let i = 0; i <= totalLevels; i++) {
            let num = step * i;
            ticks.push(Number.isInteger(step) ? num : num.toFixed(2));
        }

        let scaleGroup = parentGroup.append('g')
            .attr('stroke', 'rgb(228, 16, 16)')
            .attr('stroke-width', '2px');

        const point = generatePoint(center, maxRadius, 0);
        drawPath([center, point], scaleGroup);

        let ticksGroup = parentGroup.append('g');

        ticks.forEach((elem, i) => {
            let r = (i / totalLevels) * maxRadius;
            let newPoint = generatePoint(center, r, 0);
            let points = [
                newPoint, { ...newPoint, x: newPoint.x - 10}
            ];

            drawPath(points, scaleGroup);
            drawText(elem, newPoint, true, ticksGroup);
        });
    };

    const drawData = function (parentGroup, data, center, maxRadius, totalSides) {
        const scale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, maxRadius]);

        let points = [];
        let dataGroup = parentGroup.append('g').attr('class', 'data-layer');
    
        data.forEach((elem, i) => {
            let len = scale(elem.value);
            let theta = i * (2 * Math.PI / totalSides);

            points.push({
                ...generatePoint(center, len, theta), 
                value: elem.value
            });
        });

        let newGroup = dataGroup.append('g')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('fill', 'rgba(158,202,225, 0.466)');
            
        drawPath([...points, points[0]], newGroup);

        // Draw circles
        const tooltip = d3.select( ".tooltip" );

        const mouseEnter = (event, d) => {
            tooltip.style('opacity', 1);
            const { x, y } = event;
            tooltip.style( "top", `${ y - 20 }px` );
            tooltip.style( "left", `${ x + 15 }px` );
            tooltip.text( d.value + '%');

            if (d.value >= 50) {
                tooltip.style('background-color', 'rgb(0, 255, 0)');
            } else {
                tooltip.style('background-color', 'coral');
            }
        };

        const mouseLeave = () => {
            tooltip.style('opacity', 0);
        };

        dataGroup.append('g')
            .attr('fill', 'rgb(33,113,181)')
            .selectAll('circle')
            .data(points)
            .enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 8)
            .on('mouseenter', mouseEnter)
            .on('mouseleave', mouseLeave);
    };

    const drawText = function (text, point, isAxis, labelGroup) {
        const xSpacing = text.toString().includes( '.' ) ? 30 : 22;

        labelGroup.append('text')
            .attr('x', isAxis ? point.x - xSpacing : point.x)
            .attr('y', isAxis ? point.y + 5 : point.y + 8)
            .html(text)
            .style('text-anchor', 'middle')
            .attr('fill', '#000')
            .style('font-size', isAxis ? '12px' : '15px')
            .style('font-family', 'sans-serif')
            .style('font-weight', 'bold');
    };

    const generatePoint = function (center, length, angle) {
        return {
            x: center.x + (length * Math.sin(Math.PI - angle)),     //Math.PI is an offset to force the first point to start at the top
            y: center.y + (length * Math.cos(Math.PI - angle))
        };
    };

    const drawPath = function (points, parent) {
        const lineGenerator = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        parent.append('path').attr('d', lineGenerator(points));
    }

    
    return (
        <div>
            <svg className='mt-7' ref={svgRef}></svg>
            <div className='tooltip'
                style={{
                    position: 'fixed',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'coral',
                    padding: '5px',
                    borderRadius: '5px',
                    opacity: 0
                }}
            ></div>
        </div>
    );
}

export default RadarChart;