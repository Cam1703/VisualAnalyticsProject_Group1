
/*
  Visual Analytics Dashboard
*/

"use client";

import BarChart from "@/components/BarChart";
import Heatmap from "@/components/Heatmap";
import ParallelCoordinatesChart from "@/components/ParallelCoordinates";
import PlayerSideBar from "@/components/PlayerSideBar";
import ScatterPlot from "@/components/ScatterPlot";
import RadardChart from '@/components/Radar';

import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Box, FormControlLabel, MenuItem, Paper, Select } from "@mui/material";


const surfaces = [
  { value: "", label: "None"},
  { value: "Hard", label: "Hard"},
  { value: "Grass", label: "Grass"},
  { value: "Clay", label: "Clay"}
];

export default function Home() {
  const [playersList, setPlayersList] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedSurface, setSelectedSurface] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState({});
  const [rankingsData, setRankingsData] = useState([]);

  const fetchPlayerData = (selectedPlayer) => {
    fetch(`/players_data/${selectedPlayer.name}.csv`)
      .then((response) => response.text())
      .then((csvText) => {
        let parsedData = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });

        setSelectedPlayer(selectedPlayer);
        setSelectedPlayerData(parsedData);
        setYears(getYears(parsedData?.data));
        setSelectedYear(getYears(parsedData?.data)[0]);
        setSelectedSurface("");
      });
  };

  const handlePlayerSelection = (selectedPlayer) => {
    if (selectedPlayer) {
      fetchPlayerData(selectedPlayer);
    }
  };

  const handleYearSelection = (event) => {
    setSelectedYear(event.target.value);
  }

  const handleMatchesSelection = (selectedMatches) => {
    setSelectedMatches(selectedMatches);
  };

  const handleSurfaceSelection = (event) => {
    setSelectedSurface(event.target.value);
  }

  useEffect(() => {
    fetch("/players_list.json")
      .then((response) => response.json())
      .then((list) => {
        setPlayersList(list);
      });

    fetch("/players_ranking.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsedRankings = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

      setRankingsData(parsedRankings.data);
    });
  }, []);

  useEffect(() => {
    if (playersList.length > 0) {
      let defaultPlayer = playersList[0];
      fetchPlayerData(defaultPlayer);
    }
  }, [playersList]);


  function getYears(playerData) {
    const years = playerData ? playerData.map(match => match.tourney_date.substring(0, 4)) : [];
    return [...new Set(years)];
  }

  return (
    <main className="p-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-screen w-full ">

      <div className="flex flex-col gap-2 w-full h-full">       
        <Box component={Paper}
            elevation={0}            
            pr={2}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', gap: "2%" }}
        >
            <PlayerSideBar
              player={selectedPlayer} 
              playerList={playersList} 
              onPlayerSelect={handlePlayerSelection}
              selectedYear={selectedYear}
              rankingsData={rankingsData}
            />
            <Box component={Paper}  
                 elevation={0}
                 sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20%'}}
            >
              {years.length > 0 && (
                <FormControlLabel size="small"
                    control = {
                      <Select value={selectedYear}      
                              onChange={handleYearSelection}                      
                              sx={{
                                width: "100%",
                                height: "80%",
                                fontSize: "70%",
                                lineHeight: "tight",
                                letterSpacing: "tight",
                                "&:before": { borderBottom: "none" },
                                "&:after": { borderBottom: "none" },
                                "&:hover": { borderBottom: "none" }
                              }}>
                        {years.map(year => <MenuItem value={year} key={year}>{year}</MenuItem>)}
                      </Select>
                    }
                    label="Year"
                    sx={{
                      m: 0,
                      gap: "5%",
                      "&.MuiFormControlLabel-root": {
                        height: "100%"
                      },
                      "& .MuiFormControlLabel-label": { 
                        fontWeight: "bold" 
                      } 
                    }}>
                </FormControlLabel>
              )}  
              <FormControlLabel size="small"
                  control = {
                    <Select value={selectedSurface}      
                            onChange={handleSurfaceSelection}         
                            displayEmpty
                            renderValue={(value) => 
                              value === "" ? "Select Surface" : value
                            }             
                            sx={{
                                width: "12em",
                                height: "80%",
                                fontSize: "70%",
                                lineHeight: "tight",
                                letterSpacing: "tight",
                                "&:before": { borderBottom: "none" },
                                "&:after": { borderBottom: "none" },
                                "&:hover": { borderBottom: "none" }
                            }}
                    >
                      {surfaces.map((option) => (
                        <MenuItem key={option.value ?? "none"} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  }
                  label="Surface"
                  sx={{
                    m: 0,
                    gap: "5%",
                    "&.MuiFormControlLabel-root": {
                      height: "100%"
                    },
                    "& .MuiFormControlLabel-label": { 
                      fontWeight: "bold" 
                    } 
                  }}>
              </FormControlLabel>
            </Box>                     
        </Box>

        <Box component={Paper} elevation={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>        
          <ScatterPlot
            data={selectedPlayerData ? selectedPlayerData.data : null}
            selectedPlayer={selectedPlayer ? selectedPlayer.name : null}
            selectedSurface={selectedSurface}
            selectedYear={selectedYear}      
            selectedMatches={selectedMatches}
            onMatchesSelection={setSelectedMatches}
          />
          <ParallelCoordinatesChart
            variables={[
              'ace',
              'df',
              '1st_in_percentage',
              '1st_win_percentage',
              '2nd_win_percentage',
              'avg_pts_per_sv_game',
              'bpFaced'
              // 'saved_breaks_percentage'
            ]}
            data={selectedPlayerData ? selectedPlayerData.data : null}
            selectedYear={selectedYear}
            selectedSurface={selectedSurface}
            selectedMatches={selectedMatches}
          />
        </Box>
      </div>

      <div className="flex flex-col gap-2 h-full w-full">
        {playersList.length > 0 && years.length > 0 &&
          <BarChart
            playerData={selectedPlayerData ? selectedPlayerData.data : null}
            selectedPlayer={playersList ? playersList[0]?.name : ""}
            years={years}
            selectedSurface={selectedSurface}
          />}
        {playersList.length > 0 && years.length > 0 && selectedYear &&
          <div className="flex flex-row gap-1 ">
            <div className="w-2/3">
              <Heatmap
                playerData={selectedPlayerData ? selectedPlayerData.data : null}
                selectedPlayer={playersList ? playersList[0]?.name : ""}           
                selectedYear={selectedYear}
                selectedSurface={selectedSurface}
                selectedMatches={selectedMatches}
                onMatchSelection={setSelectedMatches}
              />
            </div>
            <div className="w-1/3">
            <RadardChart
              variables={['Clay', 'Hard', 'Grass']}
              data={selectedPlayerData ? selectedPlayerData.data : null}
              selectedYear={selectedYear}
              selectedSurface={selectedSurface}
            />
            </div>
          </div>
        }
      </div>
    </main>
  );
}

