
export default function ChoosePlayerButton({ player, onClick, rank }) {
    return (
        <button
            onClick={onClick}
            className="bg-gray-200 hover:bg-gray-300 py-1 px-4 rounded-full flex flex-col gap-0.5"
        >
            <h className="text-black font-bold text-xs">{player.name}</h>
            <h className="text-gray-400 font-light text-xs">Rank: {rank == "Retired" ? "" : "#"}{rank}</h>
        </button>
    );
}