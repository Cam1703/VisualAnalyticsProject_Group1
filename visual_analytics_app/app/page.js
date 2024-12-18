
/*
  Visual Analytics Dashboard
*/

"use client";

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
    <main className="h-screen w-screen grid grid-cols-2 grid-rows-2 p-2 flex justify-start ">
        <div className="border border-gray-300 p-4">          
          <PlayerSideBar player={mockDataTennisPlayers[0]} playerList={mockDataTennisPlayers}/>
        </div>

        <div className="border border-gray-300 p-4">
          <h2 className="text-xl font-semibold">Top Right</h2>        
        </div>

        <div className="border border-gray-300 p-4">
          <h2 className="text-xl font-semibold">Bottom Left</h2>        
        </div>

        <div className="border border-gray-300 p-4 flex items-center justify-center">          
          <RadardChart variables={['Clay', 'Hard', 'Grass']} />
        </div>
    </main>
  );
}
