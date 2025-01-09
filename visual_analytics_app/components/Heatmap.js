import React from "react";
import * as d3 from "d3";
import { Box, Typography, Paper } from "@mui/material";

// const data = [ // mock data for the heatmap
//     { tournament: "Delray Beach", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Delray Beach", round: "2nd Round", result: "win", dominance: 1 },
//     { tournament: "Delray Beach", round: "3rd Round", result: "win", dominance: 2 },
//     { tournament: "Delray Beach", round: "4th Round", result: "loss", dominance: -1 },
//     { tournament: "Hong Kong", round: "1st Round", result: "win", dominance: 2 },
//     { tournament: "Hong Kong", round: "2nd Round", result: "win", dominance: 3 },
//     { tournament: "Hong Kong", round: "3rd Round", result: "loss", dominance: -2 },
//     { tournament: "United Cup", round: "1st Round", result: "loss", dominance: -3 },
//     { tournament: "Australian Open", round: "1st Round", result: "win", dominance: 1 },
//     { tournament: "Australian Open", round: "2nd Round", result: "win", dominance: 2 },
//     { tournament: "Australian Open", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Australian Open", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "Australian Open", round: "Quarter Finals", result: "win", dominance: 5 },
//     { tournament: "Australian Open", round: "Semifinals", result: "loss", dominance: -1 },
//     { tournament: "Dallas", round: "1st Round", result: "loss", dominance: -1 },
//     { tournament: "Monte Carlo Masters", round: "1st Round", result: "win", dominance: 4 },
//     { tournament: "Monte Carlo Masters", round: "2nd Round", result: "win", dominance: 5 },
//     { tournament: "Monte Carlo Masters", round: "3rd Round", result: "win", dominance: 4 },
//     { tournament: "Monte Carlo Masters", round: "4th Round", result: "loss", dominance: -2 },
//     { tournament: "Rome Masters", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Rome Masters", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "Rome Masters", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Rome Masters", round: "4th Round", result: "loss", dominance: -2 },
//     { tournament: "Roland Garros", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Roland Garros", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "Roland Garros", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Roland Garros", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "Roland Garros", round: "Quarter Finals", result: "win", dominance: 4 },
//     { tournament: "Roland Garros", round: "Semifinals", result: "win", dominance: 2 },
//     { tournament: "Roland Garros", round: "Finals", result: "loss", dominance: -3 },
//     { tournament: "Wimbledon", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Wimbledon", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "Wimbledon", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Wimbledon", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "Wimbledon", round: "Quarter Finals", result: "win", dominance: 4 },
//     { tournament: "Wimbledon", round: "Semifinals", result: "win", dominance: 3 },
//     { tournament: "Wimbledon", round: "Finals", result: "win", dominance: 5 },
//     { tournament: "Washington", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Washington", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "Washington", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Washington", round: "4th Round", result: "loss", dominance: -2 },
//     { tournament: "Cincinnati Masters", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "Cincinnati Masters", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "Cincinnati Masters", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "Cincinnati Masters", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "Cincinnati Masters", round: "Quarter Finals", result: "win", dominance: 4 },
//     { tournament: "Cincinnati Masters", round: "Semifinals", result: "win", dominance: 3 },
//     { tournament: "Cincinnati Masters", round: "Finals", result: "loss", dominance: -2 },
//     { tournament: "Montreal Masters", round: "1st Round", result: "loss", dominance: -3 },
//     { tournament: "US Open", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "US Open", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "US Open", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "US Open", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "US Open", round: "Quarter Finals", result: "win", dominance: 4 },
//     { tournament: "US Open", round: "Semifinals", result: "win", dominance: 3 },
//     { tournament: "US Open", round: "Finals", result: "loss", dominance: -2 },
//     { tournament: "Paris Masters", round: "1st Round", result: "loss", dominance: -1 },
//     { tournament: "ATP Finals", round: "1st Round", result: "win", dominance: 3 },
//     { tournament: "ATP Finals", round: "2nd Round", result: "win", dominance: 4 },
//     { tournament: "ATP Finals", round: "3rd Round", result: "win", dominance: 3 },
//     { tournament: "ATP Finals", round: "4th Round", result: "win", dominance: 4 },
//     { tournament: "ATP Finals", round: "Quarter Finals", result: "win", dominance: 3 },
//     { tournament: "ATP Finals", round: "Semifinals", result: "win", dominance: 3 },
//     { tournament: "ATP Finals", round: "Finals", result: "win", dominance: 4 },
// ];

const legendStyle = "text-[#597393]/50 text-[11px] font-normal font-['Inter'] leading-tight";
const legendStyleSubtitle ="text-[#597393]/70 text-[11px] font-bold font-['Inter'] leading-tight"
const legendStyleTitle = "text-[#597393] text-[14px] font-bold font-['Inter'] leading-tight";
const legendColorStyle = "w-5 h-5 rounded";
const winColorsTw = ["bg-[#E2F5D8]", "bg-[#C5ECB2]", "bg-[#56C364]" , "bg-[#11865B]", "bg-[#236a50]", "bg-[#0A593C]"];
const lossColorsTw = ["bg-[#540B0B]", "bg-[#652323]", "bg-[#861111]", "bg-[#C35656]", "bg-[#ECB2B2]", "bg-[#F5D8D8]"];

const winColors = ["#E2F5D8", "#C5ECB2", "#56C364", "#11865B", "#236a50", "#0A593C"];
const lossColors = ["#540B0B", "#652323", "#861111", "#C35656", "#ECB2B2", "#F5D8D8"];

const Heatmap = ({playerData, selectedPlayer}) => {
    console.log("player_data",playerData);
    console.log("selectedPlayer", selectedPlayer);

    const data = formatData(playerData, selectedPlayer);

    const tournaments = [...new Set(data.map(d => d.tournament))];
    const rounds = [...new Set(data.map(d => d.round))];
    const matches = data.map(d => ({ ...d, tournament: d.tournament, round: d.round }));

    const cellSize = 20;
    const margin = { top: 90, right: 20, bottom: 50, left: 100 };
    const width = tournaments.length * cellSize + margin.left + margin.right;
    const height = rounds.length * cellSize + margin.top + margin.bottom;

    React.useEffect(() => {

        // Remove old SVG content before re-rendering
        d3.select("#heatmap").select("svg").remove();

        const svg = d3.select("#heatmap")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(tournaments)
            .range([0, tournaments.length * cellSize]);

        const y = d3.scaleBand()
            .domain(rounds)
            .range([0, rounds.length * cellSize]);

        const color = d3.scaleQuantize()
            .domain([-5, 5])
            .range([...lossColors, ...winColors]);

        svg.selectAll("rect")
            .data(matches)
            .enter()
            .append("rect")
            .attr("x", d => x(d.tournament))
            .attr("y", d => y(d.round))
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", d => color(d.dominance))
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("rx", 5)
            .attr("ry", 5);

        svg.append("g")
            .call(d3.axisTop(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start");

        svg.append("g")
            .call(d3.axisLeft(y));
    }, [width, height]);


    function getDominance(match_data) {
        // score stored in format 6-1 6-1 6-2 or 4-6 6-7(5) 6-4 6-2 6-1 or 6-4 2-0 RET

        const scores = match_data.score.split(" ");
        let dominance = 0;

        scores.forEach(set => {
            // Handle retirement cases like 6-4 2-0 RET
            if (set === "RET") return;

            // Handle tiebreak scores like 6-7(5)
            const [playerScore, opponentScore] = set.includes("(") 
                ? set.split(/[-()]/).slice(0, 2).map(Number) 
                : set.split("-").map(Number);

            dominance += playerScore - opponentScore;
        });

        return dominance;
    }

    function formatData(playerData = [], selectedPlayer = "") {
        if (!selectedPlayer) {
            console.log("Selected player is not defined or has no name.");
            return []; // Return an empty array if selectedPlayer is invalid.
        }
    
        return playerData? playerData
            .filter(match => match.winner_name === selectedPlayer.name || match.loser_name === selectedPlayer.name)
            .map(match => ({
                tournament: match.tourney_name,
                round: match.round,
                result: selectedPlayer.name === match.winner_name ? "win" : "loss",
                dominance: selectedPlayer.name === match.winner_name ? getDominance(match) : -getDominance(match)
            })) : [];
    }
    
    

    return (
        <Box component={Paper} elevation={3} sx={{ p: 2, textAlign: "center" }}>
            <div className="flex flex-row justify-center items-center">
                <div id="heatmap" className="h-full w-2/3"></div>
                <div className="h-full w-1/3 flex flex-col gap-2 mx-2">
                    <div className="flex-col justify-start items-start gap-3 flex">
                        <div className={legendStyleTitle}>2024 Season Matches</div>
                        <div className="flex-col justify-start items-center gap-4 flex">
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
            </div>
        </Box>
    );
};

export default Heatmap;
