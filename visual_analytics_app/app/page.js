
/*
  Visual Analytics Dashboard
*/

"use client";

import BarChart from "@/components/BarChart";
import Heatmap from "@/components/Heatmap";
import ParallelCoordinatesChart from "@/components/ParallelCoordinates";
import PlayerSideBar from "@/components/PlayerSideBar";
import RadardChart from '@/components/Radar';

import Papa from "papaparse";
import { useEffect, useState } from "react";


export default function Home() {
  const [playersList, setPlayersList] = useState([]);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);
  const [years, setYears] = useState([]);

  console.log("pl", playersList[0]);
  useEffect(() => {
    fetch("/players_list.json")
      .then((response) => response.json())
      .then((list) => { setPlayersList(list) })
  }, []);

  useEffect(() => {
    if (playersList.length > 0) {
      let defaultPlayer = playersList[0];
      console.log("def", defaultPlayer)
      fetch(`/players_data/${defaultPlayer.name}.csv`)
        .then((response) => response.text())
        .then((csvText) => {
          let parsedData = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
          });
          setSelectedPlayerData(parsedData);
          setYears(getYears(parsedData?.data));
        })
    }

  }, [playersList])

  function getYears(playerData) {
    const years = playerData ? playerData.map(match => match.tourney_date.substring(0, 4)) : [];
    return [...new Set(years)];
  }

  return (
    <main className=" p-2 flex flex-col gap-4 h-screen w-full">
      <PlayerSideBar player={playersList[0]} playerList={playersList} />
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <div>
          Top left //TODO: implement dimensionality reduction
        </div>
        <div className="flex flex-col gap-2 h-fit w-full">
        {playersList.length > 0 && years.length > 0 &&
          <BarChart
            playerData={selectedPlayerData ? selectedPlayerData.data : null}
            selectedPlayer={playersList ? playersList[0]?.name : ""}
            years={years}
          />}
          {playersList.length > 0 && years.length > 0 &&
            <Heatmap
              playerData={selectedPlayerData ? selectedPlayerData.data : null}
              selectedPlayer={playersList ? playersList[0]?.name : ""}
              years={years} />}
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center">
          <ParallelCoordinatesChart variables={['ace', 'df', 'svpt', '1stIn', '1stWon', '2ndWon', 'SvGms', 'bpSaved', 'bpFaced']} />
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center">
          <RadardChart variables={['Clay', 'Hard', 'Grass']} data={selectedPlayerData ? selectedPlayerData.data : null} />
        </div>
      </div>
    </main>
  );
}

