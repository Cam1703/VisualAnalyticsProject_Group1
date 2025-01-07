'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const ParallelCoordinatesChart = ({data, variables}) => {
    const svgRef = useRef();

    //TODO: remove this
    const initMockData = function () {
        return [
            {'ace': 5, 'df': 2, 'svpt': 20, '1stIn': 5, '1stWon': 10, '2ndWon': 2, 'SvGms': 20, 'bpSaved': 2, 'bpFaced': 2},
            {'ace': 0, 'df': 12, 'svpt': 15, '1stIn': 2, '1stWon': 20, '2ndWon': 5, 'SvGms': 10, 'bpSaved': 5, 'bpFaced': 15},
            {'ace': 1, 'df': 0, 'svpt': 4, '1stIn': 7, '1stWon': 0, '2ndWon': 15, 'SvGms': 15, 'bpSaved': 0, 'bpFaced': 5}
        ];
    }

    useEffect(() => {
        //TODO: remove mocked data
        if (!data) {
            data = initMockData();
        }

        d3.select(svgRef.current).selectAll("*").remove();

        //Chart dimensions
        const margin = {top: 30, right: 50, bottom: 30, left: 50},
              width = 800 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom;

        const parentGroup = d3.select(svgRef.current)
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr("transform", `translate(${margin.left}, ${margin.top + 10})`);

        const xScale = d3.scalePoint()
            .domain(variables)
            .range([0, width]);

        const lineScales = {};

        variables.forEach((elem) => {
            console.log(d3.max(data, (d) => d[elem]));

            lineScales[elem] = d3.scaleLinear()
                .domain([0, d3.max(data, (d) => d[elem])])
                .range([height - margin.top - margin.bottom, 0]);
        });
        

        drawStructure(parentGroup, xScale, lineScales, variables);
        drawData(parentGroup, xScale, lineScales, data, variables);

    }, [data, variables]);


    const drawStructure = function (parentGroup, xScale, lineScales, variables) {
        
        variables.forEach((elem) => {
            let axis = d3.axisLeft(lineScales[elem]);

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

    const drawData = function (parentGroup, xScale, lineScales, data, variables) {
        const lineGenerator = d3.line()
            .curve(d3.curveLinear)
            .x((d) => xScale(d.dimension))
            .y((d) => lineScales[d.dimension](d.value));

        const lineData = data.map((match) =>
            variables.map((elem) => ({dimension: elem, value: match[elem]}))
        );

        parentGroup.selectAll('.path')
            .data(lineData)
            .enter()
            .append('path')
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(3, 5, 116, 1)')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.7);
    };


    return (
        <svg ref={svgRef}></svg>
    );
};


export default ParallelCoordinatesChart;
