import { Box, Paper, Switch, FormControlLabel, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

export default function ScatterPlot({data, selectedPlayer, selectedSurface, selectedYear}) {
  // To Do: 
  // -implement relation with parallel coordinates
  // -name x and y on the graph

    const svgRef = useRef();
    const isChartDrawn = useRef(false);
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [isYearFilterEnabled, setIsYearFilterEnabled] = useState(false);
    const [selectedPoints, setSelectedPoints] = useState([]);

    const parseData = (rawData) => {
      let parsedData = [];
      
      rawData.forEach((row) => {
        let newElem = {
          x: Number(row['serve_first_component']),
          y: Number(row['serve_second_component']),
          court: row.surface,
          year: row['tourney_year']
        };

        parsedData.push(newElem);       
      });

      return parsedData;
    };

    const filterData = (parsedData, targetSurface, targetYear) => {
      return parsedData.filter((elem) => {
        let isCorrectYear = !targetYear || elem.year === String(targetYear);
        let isCorrectSurface = !targetSurface || elem.court === targetSurface;

        return isCorrectSurface && (!isYearFilterEnabled || isCorrectYear);
      });      
    };


    useEffect(() => {
      if (!data) {
        return;
      }

      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 100, bottom: 30, left: 40 };

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

      let parsedData = parseData(data);

      //We want to draw a new xScale and a new yScale if:
      // --> We need to draw the chart for first time (in this case we also need to draw the legend)
      // --> A different player has been selected
      if (!isChartDrawn.current || selectedPlayer !== currentPlayer) {
        if (isChartDrawn.current) {
          d3.select(svgRef.current).select(".scales-group").remove();          
        } else {
          isChartDrawn.current = true;
          drawLegend(width, courtColorsSolid, courtColorOpacity, courtShapes);
        }

        drawScales(parsedData, width, height, margin);
        setCurrentPlayer(selectedPlayer);
        setIsYearFilterEnabled(false);
      }

      d3.select(svgRef.current).select(".data-group").remove();

      let filteredData = filterData(parsedData, selectedSurface, selectedYear);
      let scales = createScales(parsedData, width, height, margin);

      drawData(filteredData, scales, width, height, margin, courtShapes, courtColorOpacity, courtColorsSolid);
    }, [data, selectedSurface, selectedYear, isYearFilterEnabled]);


    const drawScales = (chartData, width, height, margin) => {
      let scales = createScales(chartData, width, height, margin);

      let scalesGroup = d3.select(svgRef.current)
        .append('g')
        .attr('class', 'scales-group');

      // Add X axis
      scalesGroup.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(scales.x));

      // Add Y axis
      scalesGroup.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(scales.y));      
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

    const drawLegend = (width, courtColorsSolid, courtColorOpacity, courtShapes) => {
      let parentGroup = d3.select(svgRef.current)
          .append('g')
          .attr('class', 'legend-group');

      let legendGroups = parentGroup.selectAll(".legend")
        .data(Object.keys(courtColorOpacity))
        .enter()
        .append("g")        
        .attr("transform", (d, i) => `translate(${width - 80}, ${20 + i * 20})`);

      legendGroups.append("path")
        .attr("d", (d) => d3.symbol().type(courtShapes[d]).size(100)())
        .attr("fill", (d) => courtColorOpacity[d])
        .attr("stroke", (d) => courtColorsSolid[d.court]) // Add border color to legend symbols
        .attr("stroke-width", 1) // Set border width
        .attr("transform", "translate(10,10)");

      legendGroups.append("text")
        .text((d) => d == "Hard" ? "Hard Court" : d.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()))
        .attr("x", 20)
        .attr("y", 15)
        .style("font-size", "12px");
    };

    const drawData = (chartData, scales, width, height, margin, courtShapes, courtColorOpacity, courtColorsSolid) => {
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
        .attr("fill", (d) => courtColorOpacity[d.court])
        .attr("stroke", (d) => courtColorsSolid[d.court]) // Add border color
        .attr("stroke-width", 1); // Set border width

      //Brushing
      const brush = d3.brush()
        .extent([[margin.left, margin.top], [width - margin.right, height-margin.bottom]])
        .on("end", ({selection}) => {
          if (!selection) {
            setSelectedPoints([]);
            points.attr("fill", (d) => courtColorOpacity[d.court])
              .attr("stroke", (d) => courtColorsSolid[d.court])
              .attr("stroke-width", 1)
              .attr("opacity", 1);

            return;
          }        

          let [[x0, y0], [x1, y1]] = selection;
          let brushedPoints = chartData.filter((elem) => {
            let px = scales.x(elem.x);
            let py = scales.y(elem.y);
            return px >= x0 && px <= x1 && py >= y0 && py <= y1;
          });
          
          setSelectedPoints(brushedPoints);

          points.attr("fill", (d) => {
              if (brushedPoints.includes(d)) {
                let originalColor = d3.color(courtColorOpacity[d.court]);
                let vividColor = d3.hsl(originalColor);
                vividColor.s = 1;
                return vividColor.toString();
              }
              return courtColorOpacity[d.court];
            })
            .attr("stroke", (d) => brushedPoints.includes(d) ? "black" : courtColorsSolid[d.court])
            .attr("stroke-width", (d) => brushedPoints.includes(d) ? 2 : 1)
            .attr("opacity", (d) => brushedPoints.includes(d) ? 1 : 0.3)
        });

      dataGroup.append('g').attr('class', 'brush').call(brush);
    };

    return (
      <Box component={Paper} 
        elevation={3}
        sx={{ 
          display: 'flex',
          textAlign: "center", 
          width: '100%', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          flexDirection: 'column'
        }}
      >
        <Box component={Paper}
          elevation={0}   
          pl={2}      
          pr={2} 
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <FormControlLabel
            control={
              <Switch 
                checked={isYearFilterEnabled}
                onChange={() => setIsYearFilterEnabled(!isYearFilterEnabled)}
                color="primary" 
              />
            }
            label={isYearFilterEnabled ? "Year Filtering Enabled" : "Year Filtering Disabled"}
            sx={{ "& .MuiFormControlLabel-label": { fontWeight: "bold" } }}
          />    
          {isYearFilterEnabled && (
            <Typography sx={{fontWeight: "bold"}}>Selected year: {selectedYear}</Typography>
          )}
        </Box>              
        <svg ref={svgRef} width={600} height={300}></svg>
      </Box>
    );
}
