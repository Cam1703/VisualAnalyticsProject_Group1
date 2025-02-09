import React, { useEffect, useState } from "react";
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
const lossColors = ["#bd0026", "#f03b20", "#fd8d3c", "#feb24c", "#fed976"];

const Heatmap = ({ playerData, selectedPlayer, selectedYear, selectedSurface, selectedMatches, onMatchSelection }) => {
    const data = formatData(playerData, selectedPlayer);
    data.sort((a,b) => {
        const dateDiff = a.tourney_date - b.tourney_date;
        if (dateDiff !== 0) return dateDiff; // sort by the tournament date

        const roundOrder = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
        return roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round); // Sort by round
    });

    // Arrays de dominance de vitórias e derrotas
    const winDominances = data
        .filter(d => d.isWin)
        .map(d => d.dominance);

    const lossDominances = data
        .filter(d => !d.isWin)
        .map(d => d.dominance);

    const myWinScale = d3.scaleQuantile()
        .domain(winDominances) // possible dominance values for a win
        .range(winColors);
        
    const myLossScale = d3.scaleQuantile()
        .domain(lossDominances) // possible dominance values for a loss
        .range(lossColors);

    const tournaments = [...new Set(data.map(d => d.tournament))];

    const canonicalRounds = ["R128", "R64", "R32", "R16", "QF", "SF", "F"];
    const rounds = canonicalRounds.filter(r => data.some(d => d.round === r));
    const matches = data.map(d => ({ ...d, tournament: d.tournament, round: d.round }));

    const cellSize = 25;
    const margin = { top: 20, right: 20, bottom: 20, left: 100 };
    const width = 295
    const height = 490

    React.useEffect(() => {
        if (!playerData) {
            return;
        }

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

        svg.selectAll("rect")
            .data(matches)
            .enter()
            .append("rect")
            .attr("x", d => x(d.round))
            .attr("y", d => y(d.tournament))
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", d => {
                return d.isWin ? myWinScale(d.dominance) : myLossScale(d.dominance);                
            })
            .attr("stroke", "white")
            .attr("stroke-width", 3)
            .attr("border-radius","5px")
            .attr("rx", 3)
            .attr("ry", 3)
            .on('click', (_, d) => {
                onMatchSelection(oldSelectedMatches => {
                    let newSelectedMatches = { ...oldSelectedMatches};
                
                    if (oldSelectedMatches[d.id]) {
                        delete newSelectedMatches[d.id];
                    } else {
                        newSelectedMatches[d.id] = true;
                    }

                    return newSelectedMatches;
                });                
            });

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
                tooltip.html(`
                    Tournament: ${d.tournament}<br>
                    Round: ${d.round}<br>
                    Dominance: ${d.dominance.toFixed(2)}<br>
                    Score: ${d.score}
                `)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }, [playerData, selectedPlayer, selectedYear, selectedSurface]);

    useEffect(() => {
        let matchBoxes = d3.select("#heatmap").selectAll('rect');

        if (selectedMatches && Object.keys(selectedMatches).length > 0) {
            matchBoxes.attr('fill', (d) => {
                if (selectedMatches[d.id]) {
                    return d.isWin ? myWinScale(d.dominance) : myLossScale(d.dominance);
                }
                return 'gray';
            })
            .attr('opacity', (d) => selectedMatches[d.id] ? 1 : 0.3);
        } else {
            matchBoxes.attr('fill', (d) => {
                return d.isWin ? myWinScale(d.dominance) : myLossScale(d.dominance)
            })
            .attr('opacity', 1);
        }

    }, [selectedMatches]);


    function formatData(playerData = [], selectedPlayer = "") {
        if (!selectedPlayer) {
            console.log("Selected player is not defined or has no name.");
            return []; // Return an empty array if selectedPlayer is invalid.
        }


        //round
        //R128 -> R64 -> R32 -> R16 -> QF -> SF -> F
        const playerWins = playerData.filter(match => match.tourney_year == selectedYear && match.win == 1 && selectedSurface == match.surface);
        const playerLosses = playerData.filter(match => match.tourney_year == selectedYear && match.win == 0 && selectedSurface == match.surface);

        return playerData
            .filter(match => match.tourney_year == selectedYear)
            .filter(match => !selectedSurface || match.surface === selectedSurface)
            .map(match => ({
                id: match['match_id'],
                tournament: match.tourney_name,
                round: match.round,
                isWin: match.win == 1,
                dominance: Number(match.total_games_won) / (Number(match.total_games_won) + Number(match.total_games_lost)),
                tourney_date: Number(match.tourney_date),
                score: match['score']
            }));
    }

    return (
        <Box component={Paper} elevation={3} sx={{ textAlign: "center", width: "100%", height: "100%" }}>
            <div className="flex flex-col justify-center items-center">
                <div className="h-full w-full flex flex-col gap-2 mx-2">
                    <div className="flex-col justify-start items-start gap-3 flex p-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className={legendStyleTitle}>                            
                            <Box display="inline-flex" alignItems="flex-start" sx={{ position: "relative" }}>
                                <span style={{ fontSize: "14px", fontWeight: "bold", color: "#597393" }}>Player Dominance by Match</span>
                                <Tooltip 
                                    title="The dominance metric is the ratio between the number of games won and the total of games played in the match."
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
