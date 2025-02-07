import { Box, Paper, Switch, FormControlLabel, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

const outcomeColorSolid = {
  Win: "rgb(27, 120, 55)",
  Loss: "rgb(165, 15, 21)"
};

const outcomeColorOpacity = {
  Win: "rgb(77, 175, 74)",
  Loss: "rgb(228, 26, 28)"
};

const courtShapes = {
  Hard: d3.symbolSquare,
  Clay: d3.symbolTriangle,
  Grass: d3.symbolCircle,
};


export default function ScatterPlot({data, selectedPlayer, selectedSurface, selectedYear, selectedMatches, onMatchesSelection}) {
    const svgRef = useRef();
    const isChartDrawn = useRef(false);
    const [currentPlayer, setCurrentPlayer] = useState("");

    const parseData = (rawData) => {
      let parsedData = [];
      
      rawData.forEach((row) => {
        let newElem = {
          x: Number(row['serve_first_component']),
          y: Number(row['serve_second_component']),
          court: row.surface,
          isWin: row.win === '1',
          year: row['tourney_year'],
          id: row['match_id']
        };

        parsedData.push(newElem);       
      });

      return parsedData;
    };

    const filterData = (parsedData, targetSurface, targetYear) => {
      return parsedData.filter((elem) => {
        let isCorrectYear = !targetYear || elem.year === String(targetYear);
        let isCorrectSurface = !targetSurface || elem.court === targetSurface;

        return isCorrectSurface && isCorrectYear;
      });      
    };


    useEffect(() => {
      if (!data) {
        return;
      }

      const width = 580;
      const height = 280;
      const margin = { top: 30, right: 100, bottom: 20, left: 50 };

      let parsedData = parseData(data);

      //We want to draw a new xScale and a new yScale if:
      // --> We need to draw the chart for first time (in this case we also need to draw the legend)
      // --> A different player has been selected
      if (!isChartDrawn.current || selectedPlayer !== currentPlayer) {
        if (isChartDrawn.current) {
          d3.select(svgRef.current).select(".scales-group").remove();          
        } else {
          isChartDrawn.current = true;
          drawLegend(width, outcomeColorOpacity, courtShapes);
        }

        drawScales(parsedData, width, height, margin);
        setCurrentPlayer(selectedPlayer);
      }

      d3.select(svgRef.current).select(".data-group").remove();

      let filteredData = filterData(parsedData, selectedSurface, selectedYear);
      let scales = createScales(parsedData, width, height, margin);

      drawData(filteredData, scales, width, height, margin, courtShapes, outcomeColorOpacity, outcomeColorSolid);
    }, [data, selectedSurface, selectedYear]);

    useEffect(() => {
      let scatterPoints = d3.selectAll(".point");

      if (selectedMatches && Object.keys(selectedMatches).length > 0) {
        scatterPoints.attr("fill", (d) => {
          if (selectedMatches[d.id]) {
            let originalColor = d3.color(d.isWin ? outcomeColorOpacity.Win : outcomeColorSolid.Loss);
            let vividColor = d3.hsl(originalColor);
            vividColor.s = 1;
            return vividColor.toString();
          }
          return d.isWin ? outcomeColorOpacity.Win : outcomeColorOpacity.Loss;
        })
        .attr("stroke", (d) => selectedMatches[d.id] ? "black" : (d.isWin ? outcomeColorSolid.Win : outcomeColorSolid.Loss))
        .attr("stroke-width", (d) => selectedMatches[d.id] ? 2 : 1)
        .attr("opacity", (d) => selectedMatches[d.id] ? 1 : 0.3);
      } else {
        scatterPoints.attr("fill", (d) => d.isWin ? outcomeColorOpacity.Win : outcomeColorOpacity.Loss)
          .attr("stroke", (d) => d.isWin ? outcomeColorSolid.Win : outcomeColorSolid.Loss)
          .attr("stroke-width", 1)
          .attr("opacity", 0.7);
      }

    }, [selectedMatches]);

  
    const drawScales = (chartData, width, height, margin) => {
      let scales = createScales(chartData, width, height, margin);

      let scalesGroup = d3.select(svgRef.current)
        .append('g')
        .attr('class', 'scales-group');

      // Add X axis
      scalesGroup.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(scales.x));
      
        // Add X axis label
      scalesGroup.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 10) // Position below the axis
        .style("font-size", "12px")
        .text("Serve First Component");

      // Add Y axis
      scalesGroup.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(scales.y));
    
      // Add Y axis label
      scalesGroup.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -height / 2)
        .attr("y", margin.left - 30) // Offset from the axis
        .style("font-size", "12px")
        .text("Serve Second Component");

      // Add title
      scalesGroup.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", margin.top - 20)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#597393")
        .text("Serve Principal Components");
    };

    const createScales = (chartData, width, height, margin) => {
      const globalMinValue = Math.min(d3.min(chartData, (d) => d.x), d3.min(chartData, (d) => d.y));

      let newXScale = d3.scaleLinear()
          .domain([globalMinValue, d3.max(chartData, (d) => d.x)])
          .range([margin.left, width - margin.right]);

      let newYScale = d3.scaleLinear()
        .domain([globalMinValue, d3.max(chartData, (d) => d.y)])
        .range([height - margin.bottom, margin.top]);

      return {x: newXScale, y: newYScale};
    };

    const drawLegend = (width, outcomeColorOpacity, courtShapes) => {
      let parentGroup = d3.select(svgRef.current)
          .append('g')
          .attr('class', 'legend-group');

      //Legend for match shapes
      let courtLegend = parentGroup.append('g')
          .attr('class', 'court-legend')
          .attr('transform', `translate(${width - 60}, 20)`); 

      let courtGroups = courtLegend.selectAll('.court-item')
          .data(Object.keys(courtShapes))
          .enter()
          .append('g')
          .attr('class', 'court-item')
          .attr('transform', (d, i) => `translate(0, ${i * 25})`);


      courtGroups.append('path')
          .attr('d', (d) => d3.symbol().type(courtShapes[d]).size(100)())
          .attr('fill', 'gray')
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('transform', "translate(10,10)");    

      courtGroups.append('text')
          .text((d) => d)
          .attr('x', 25)
          .attr('y', 15)
          .style('font-size', '12px');

      //Legend for court colors
      let colorLegend = parentGroup.append('g')
          .attr('class', 'color-legend')
          .attr('transform', `translate(${width - 60}, 110)`);

      let colorGroups = colorLegend.selectAll('.color-item')
          .data(Object.keys(outcomeColorOpacity))
          .enter()
          .append('g')
          .attr('class', 'color-item')
          .attr('transform', (d, i) => `translate(0, ${i * 25})`);

      colorGroups.append('text')
        .text((d) => d)
        .attr('x', 25)
        .attr('y', 15)
        .style('font-size', '12px');

      colorGroups.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d) => outcomeColorOpacity[d])
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    };

    const drawData = (chartData, scales, width, height, margin, courtShapes, outcomeColorOpacity, outcomeColorSolid) => {
      let dataGroup = d3.select(svgRef.current)
        .append('g')
        .attr('class', 'data-group');

      //Add points
      let points = dataGroup.selectAll(".point")
        .data(chartData)
        .enter()
        .append("path")
        .attr("class", "point")
        .attr("transform", (d) => `translate(${scales.x(d.x)},${scales.y(d.y)})`)
        .attr("d", (d) => d3.symbol().type(courtShapes[d.court]).size(100)())
        .attr("fill", (d) => d.isWin ? outcomeColorOpacity.Win : outcomeColorOpacity.Loss)
        .attr("stroke", (d) => d.isWin ? outcomeColorSolid.Win : outcomeColorSolid.Loss) // Add border color
        .attr("stroke-width", 1) // Set border width
        .attr('opacity', 0.7);

      //Brushing
      const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height-margin.bottom]])
        .on("end", ({selection}) => {
          if (!selection) {       
            onMatchesSelection({});
            return;
          }        

          let [[x0, y0], [x1, y1]] = selection;

          let selectedMatchesMap = chartData.filter((elem) => {
            let px = scales.x(elem.x);
            let py = scales.y(elem.y);
            return px >= x0 && px <= x1 && py >= y0 && py <= y1;
          }).reduce((acc, elem) => {
            acc[elem.id] = true;
            return acc;
          }, {});
        
          onMatchesSelection(selectedMatchesMap);
        });

      dataGroup.append('g').attr('class', 'brush').call(brush);
    };

    return (
      <Box
        component={Paper} 
        elevation={0}
        sx={{ 
          display: 'flex',
          textAlign: "center", 
          width: '100%', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          flexDirection: 'column'
        }}>
        <svg ref={svgRef} width={600} height={300}></svg>
      </Box>
    );
}
