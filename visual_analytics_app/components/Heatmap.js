import React, { useState } from "react";
import * as d3 from "d3";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Tooltip } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const legendStyle = "text-[#597393]/50 text-[9px] font-bold leading-tight";
const legendStyleSubtitle = "text-[#597393]/70 text-[11px] font-bold leading-tight"
const legendStyleTitle = "text-[#597393] text-[14px] font-bold leading-tight";
const legendColorStyle = "w-5 h-5 rounded";
const winColorsTw = ["bg-[#d9f0a3]", "bg-[#addd8e]", "bg-[#78c679]", "bg-[#31a354]", "bg-[#006837]"];
const lossColorsTw = ["bg-[#fed976]", "bg-[#feb24c]", "bg-[#fd8d3c]", "bg-[#f03b20]", "bg-[#bd0026]"];

const winColors = ["#d9f0a3", "#addd8e", "#78c679", "#31a354", "#006837"];
const lossColors = ["#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];

const Heatmap = ({ playerData, selectedPlayer, years, selectedYear, setSelectedYear, selectedSurface }) => {
    const data = formatData(playerData, selectedPlayer);

    const tournaments = [...new Set(data.map(d => d.tournament))];
    const rounds = [...new Set(data.map(d => d.round))];
    const matches = data.map(d => ({ ...d, tournament: d.tournament, round: d.round }));

    const cellSize = 25;
    const margin = { top: 20, right: 20, bottom: 20, left: 100 };
    const width = rounds.length * cellSize + margin.left + margin.right;
    const height = tournaments.length * cellSize + margin.top + margin.bottom;

    React.useEffect(() => {
        d3.select("#heatmap").select("svg").remove();

        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%")           // Responsive width
            .style("height", "auto")          // Maintain aspect ratio      // Maintain aspect ratio
            .style("max-height", "400px")     // Max height limit
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(rounds)
            .range([0, rounds.length * cellSize]);

        const y = d3.scaleBand()
            .domain(tournaments)
            .range([0, tournaments.length * cellSize]);

        const color = d3.scaleQuantize()
            .domain([-5, 5])
            .range([...lossColors, ...winColors]);

        svg.selectAll("rect")
            .data(matches)
            .enter()
            .append("rect")
            .attr("x", d => x(d.round))
            .attr("y", d => y(d.tournament))
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", d => color(d.dominance))
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .attr("border-radius","5px")
            .attr("rx", 3)
            .attr("ry", 3);

        svg.append("g")
            .call(d3.axisTop(x).tickSize(0).tickPadding(3))
            .style("font-size", "11px")
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("dx", "0.8")

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(3))
            .style("font-size", "11px");

        //tooltip
        const tooltip = d3.select("#heatmap")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("font-size", "10px");

        svg.selectAll("rect")
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Tournament: ${d.tournament}<br>Round: ${d.round}<br>Dominance: ${d.dominance}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }, [width, height]);

    function formatData(playerData = [], selectedPlayer = "") {
        if (!selectedPlayer) {
            console.log("Selected player is not defined or has no name.");
            return []; // Return an empty array if selectedPlayer is invalid.
        }

        //tourney_date
        //eight digits, YYYYMMDD, usually the Monday of the tournament week.

        //round
        //R128 -> R64 -> R32 -> R16 -> QF -> SF -> F
        const playerWins = playerData.filter(match => match.tourney_year == selectedYear && match.win == 1 && selectedSurface == match.surface);
        const playerLosses = playerData.filter(match => match.tourney_year == selectedYear && match.win == 0 && selectedSurface == match.surface);

        console.log("playerWins", playerWins);
        console.log("playerLosses", playerLosses);
        console.log("selectedSurface", selectedSurface);

        return playerData
            ? playerData
                .filter(match => match.tourney_year == selectedYear)
                .filter(match => !selectedSurface || match.surface === selectedSurface)
                .map(match => ({
                    tournament: match.tourney_name,
                    round: match.round,
                    result: match.win == 1 ? "win" : "loss",
                    dominance: match.total_games_won - match.total_games_lost,
                }))
                .sort((a, b) => {
                    const roundOrder = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
                    return roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
                }) // Sort by round
            : [];
    }

    const handleChange = (event) => {
        setSelectedYear(event.target.value);
    };

    return (
        <Box component={Paper} elevation={3} sx={{ textAlign: "center", width: "100%", height: "100%" }}>
            <div className="flex flex-col justify-center items-center">
                <div className="h-full w-full flex flex-col gap-2 mx-2">
                    <div className="flex-col justify-start items-start gap-3 flex p-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className={legendStyleTitle}>
                            <FormControl sx={{ m: 0, minWidth: 80 }} size="small">
                                <InputLabel id="demo-select-small-label">Year</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedYear}
                                    label="Year"
                                    onChange={handleChange}
                                    sx={{
                                        width: "80px",
                                        height: "30px",
                                        fontSize: "12px",
                                        color: "#597393",
                                        lineHeight: "tight",
                                        letterSpacing: "tight",
                                        "&:before": { borderBottom: "none" },
                                        "&:after": { borderBottom: "none" },
                                        "&:hover": { borderBottom: "none" }
                                    }}
                                >
                                    {years.map(year => <MenuItem value={year} key={year}>{year}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <Box display="inline-flex" alignItems="flex-start" sx={{ position: "relative" }}>
                                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#597393" }}>Player Dominance by Match</span>
                                <Tooltip 
                                    title="The dominance metric is the difference between the number of games won and lost by the player in the match."
                                    placement="bottom"
                                >
                                    <InfoOutlinedIcon 
                                        sx={{ 
                                            color: "#597393", 
                                            cursor: "pointer", 
                                            fontSize: "13px", // Make the icon smaller
                                            position: "relative", 
                                            top: "-3px", // Move it slightly above
                                            marginLeft: "2px" // Space it properly from the title
                                        }} 
                                    />
                                </Tooltip>
                            </Box>

                            {/* <span>Player Dominance by Match</span>
                            <Tooltip
                                title="The dominance metric is the difference between the number of games won and lost by the player in the match."
                                placement="top"
                            >
                                <InfoOutlinedIcon
                                    fontSize="small"
                                    sx={{
                                        color: "#597393",
                                        cursor: "pointer",
                                        fontSize: "13px", // Make the icon smaller
                                        position: "relative", 
                                        top: "-3px" // Move it slightly above
                                        // marginLeft: "0.1px" // Space it properly from the title
                                    }} 
                                />
                            </Tooltip> */}
                        </div>
                        <div className="flex-row justify-between items-center gap-4 flex w-full">
                            <div className="h-1/2 flex-col justify-start items-start gap-2 flex">
                                <div className={legendStyleSubtitle}>Winning Match Dominance:</div>
                                <div className="justify-start items-center gap-1 flex">
                                    <div className={legendStyle}>Less</div>
                                    {winColorsTw.map(color => <div className={`${legendColorStyle} ${color}`} key={color}></div>)}
                                    <div className={legendStyle}>More</div>
                                </div>
                            </div>
                            <div className="h-1/2 flex-col justify-start items-start gap-2 flex">
                                <div className={legendStyleSubtitle}>Losing Match Dominance:</div>
                                <div className="justify-start items-center gap-1 flex">
                                    <div className={legendStyle}>Less</div>
                                    {lossColorsTw.map(color => <div className={`${legendColorStyle} ${color}`} key={color}></div>)}
                                    <div className={legendStyle}>More</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div id="heatmap" className="h-full w-full text-[6px]"></div>

            </div>
        </Box>
    );
};

export default Heatmap;
