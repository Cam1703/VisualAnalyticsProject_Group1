
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
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPlayerData, setSelectedPlayerData] = useState(null);


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
        });
  };

  const handlePlayerSelection = (selectedPlayer) => {
    if (selectedPlayer) {
      fetchPlayerData(selectedPlayer);
    }
  };
  
  useEffect(() => {
    fetch("/players_list.json")
      .then((response) => response.json())
      .then((list) => { setPlayersList(list)})
  }, []);

  useEffect(() => {
    if (playersList.length > 0) {
      let defaultPlayer = playersList[0];
      fetchPlayerData(defaultPlayer);
    }
  }, [playersList]);


  return (
    <main className=" p-2 flex flex-col gap-4 h-screen w-full">
      <PlayerSideBar player={selectedPlayer} playerList={playersList} onPlayerSelect={handlePlayerSelection} />
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <div>
          Top left //TODO: implement dimensionality reduction
        </div>
        <div className="flex flex-col gap-2 h-fit w-full">
          <BarChart />
          <Heatmap />
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

