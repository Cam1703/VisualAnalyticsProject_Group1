
/*
  Visual Analytics Dashboard
*/

"use client";

import BarChart from "@/components/BarChart";
import Heatmap from "@/components/Heatmap";
import PlayerSideBar from "@/components/PlayerSideBar";
import RadardChart from '@/components/Radar';

const mockDataTennisPlayers = [
  {
    "name": "Roger Federer",
    "country": "Switzerland",
    "rank": 8,
    "age": 40,
    "height": 185,
    "weight": 85,
    "hand": "Right",
    "backhand": "One-handed"
  },
  {
    "name": "Rafael Nadal",
    "country": "Spain",
    "rank": 5,
    "age": 35,
    "height": 185,
    "weight": 85,
    "hand": "Left",
    "backhand": "Two-handed"
  },
  {
    "name": "Novak Djokovic",
    "country": "Serbia",
    "rank": 1,
    "age": 34,
    "height": 188,
    "weight": 80,
    "hand": "Right",
    "backhand": "Two-handed"
  },
  {
    "name": "Andy Murray",
    "country": "United Kingdom",
    "rank": 113,
    "age": 34,
    "height": 190,
    "weight": 84,
    "hand": "Right",
    "backhand": "Two-handed"
  },
  {
    "name": "Stefanos Tsitsipas",
    "country": "Greece",
    "rank": 4,
    "age": 23,
    "height": 193,
    "weight": 89,
    "hand": "Right",
    "backhand": "One-handed"
  },
  {
    "name": "Alexander Zverev",
    "country": "Germany",
    "rank": 6,
    "age": 24,
    "height": 198,
    "weight": 90,
    "hand": "Right",
    "backhand": "Two-handed"
  },
  {
    "name": "Dominic Thiem",
    "country": "Austria",
    "rank": 9,
    "age": 28,
    "height": 185,
    "weight": 79,
    "hand": "Right",
    "backhand": "One-handed"
  }]

export default function Home() {
  return (
    <main className=" p-2 flex flex-col gap-4 h-screen w-full">
      <PlayerSideBar player={mockDataTennisPlayers[0]} playerList={mockDataTennisPlayers} />
      <div className="grid grid-cols-2 grid-rows-2 gap-4">
        <div>
          Top left //TODO: implement dimensionality reduction
        </div>
        <div className="flex flex-col gap-2 h-fit w-full">
          <BarChart />
          <Heatmap />
        </div>
        <div>
          Bottom left //TODO: implement parallel coordinates
        </div>
        <div className="border border-gray-300 p-4 flex items-center justify-center">          
          <RadardChart variables={['Clay', 'Hard', 'Grass']} />
        </div>
      </div>
    </main>
  );
}

