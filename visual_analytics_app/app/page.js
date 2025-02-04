
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
import { Box, FormControlLabel, Paper, Switch, Typography } from "@mui/material";


export default function Home() {
  const [playersList, setPlayersList] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedSurface, setSelectedSurface] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMatches, setSelectedMatches] = useState({});
  const [isYearFilterEnabled, setIsYearFilterEnabled] = useState(false);

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
        setIsYearFilterEnabled(false);
      });
  };

  const handlePlayerSelection = (selectedPlayer) => {
    if (selectedPlayer) {
      fetchPlayerData(selectedPlayer);
    }
  };

  const handleMatchesSelection = (selectedMatches) => {
    setSelectedMatches(selectedMatches);
  };

  useEffect(() => {
    fetch("/players_list.json")
      .then((response) => response.json())
      .then((list) => { setPlayersList(list) })
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
        <PlayerSideBar player={selectedPlayer} playerList={playersList} onPlayerSelect={handlePlayerSelection} />

        <Box component={Paper} elevation={3} sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
          <Box component={Paper}
            elevation={0}
            pl={2}
            pr={2}
            sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isYearFilterEnabled}
                  onChange={() => {
                    setIsYearFilterEnabled(!isYearFilterEnabled)
                    setSelectedMatches({})
                  }}
                  color="primary"
                />
              }
              label={isYearFilterEnabled ? "Year Filtering Enabled" : "Year Filtering Disabled"}
              sx={{ "& .MuiFormControlLabel-label": { fontWeight: "bold" } }}
            />
            {isYearFilterEnabled && (
              <Typography sx={{ fontWeight: "bold" }}>Selected year: {selectedYear}</Typography>
            )}
          </Box>
          <ScatterPlot
            data={selectedPlayerData ? selectedPlayerData.data : null}
            selectedPlayer={selectedPlayer ? selectedPlayer.name : null}
            selectedSurface={selectedSurface}
            selectedYear={selectedYear}
            isYearFilterEnabled={isYearFilterEnabled}
            onMatchesSelection={handleMatchesSelection}
          />
          <ParallelCoordinatesChart
            variables={['ace', 'df', '1st_in_percentage', '1st_win_percentage', '2nd_win_percentage', 'avg_pts_per_sv_game', 'bpFaced', 'saved_breaks_percentage']}
            data={selectedPlayerData ? selectedPlayerData.data : null}
            selectedYear={selectedYear}
            selectedSurface={selectedSurface}
            isYearFilterEnabled={isYearFilterEnabled}
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
                years={years}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedSurface={selectedSurface}
              />
            </div>
            <div className="w-1/3">
            <RadardChart
              variables={['Clay', 'Hard', 'Grass']}
              data={selectedPlayerData ? selectedPlayerData.data : null}
              selectedYear={selectedYear}
              selectedSurface={selectedSurface}
              setSelectedSurface={setSelectedSurface}
            />
            </div>
          </div>
        }
      </div>
    </main>
  );
}

