
export default function ChoosePlayerButton({ player, onClick }) {
    console.log(player);
    return (
        <button
            onClick={onClick}
            className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-full flex flex-col gap-1"
        >
            <h className="text-black font-bold text-xs">{player.name}</h>
            <h className="text-gray-400 font-light text-xs">rank: #{player.rank}</h>
        </button>
    );
}