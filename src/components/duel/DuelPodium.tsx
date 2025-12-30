interface PodiumMovie {
  movieId: number;
  title: string;
  poster_path: string;
  points: number;
}

interface DuelPodiumProps {
  podium: PodiumMovie[];
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const DuelPodium = ({ podium }: DuelPodiumProps) => {
  if (podium.length === 0) return null;

  return (
    <div className="mt-32 mb-24 flex justify-center items-end gap-4 md:gap-8 h-[300px]">
      {/* 2nd Place */}
      {podium[1] && (
        <div className="flex flex-col items-center animate-fade-in-up delay-100">
          <div className="relative w-24 md:w-32 rounded-lg overflow-hidden shadow-xl border-4 border-gray-400 mb-2 transform hover:scale-105 transition-transform">
            <img src={`${IMAGE_BASE}${podium[1].poster_path}`} className="w-full" alt={podium[1].title} />
            <div className="absolute top-0 left-0 bg-gray-400 text-white font-bold w-8 h-8 flex items-center justify-center rounded-br-lg">2</div>
          </div>
          <div className="h-24 w-24 md:w-32 bg-gray-400/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-gray-400">
            <p className="font-bold text-sm md:text-base truncate w-full px-2 text-center">{podium[1].title}</p>
            <p className="text-xs opacity-70">{podium[1].points} pts</p>
          </div>
        </div>
      )}

      {/* 1st Place */}
      {podium[0] && (
        <div className="flex flex-col items-center z-10 animate-fade-in-up">
          <div className="relative w-32 md:w-40 rounded-lg overflow-hidden shadow-2xl border-4 border-yellow-500 mb-2 transform hover:scale-110 transition-transform">
            <img src={`${IMAGE_BASE}${podium[0].poster_path}`} className="w-full" alt={podium[0].title} />
            <div className="absolute top-0 left-0 bg-yellow-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-br-lg text-xl">1</div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl">👑</div>
          </div>
          <div className="h-32 w-32 md:w-40 bg-yellow-500/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-yellow-500">
            <p className="font-bold text-base md:text-lg truncate w-full px-2 text-center">{podium[0].title}</p>
            <p className="text-sm opacity-70">{podium[0].points} pts</p>
          </div>
        </div>
      )}

      {/* 3rd Place */}
      {podium[2] && (
        <div className="flex flex-col items-center animate-fade-in-up delay-200">
          <div className="relative w-24 md:w-32 rounded-lg overflow-hidden shadow-xl border-4 border-orange-600 mb-2 transform hover:scale-105 transition-transform">
            <img src={`${IMAGE_BASE}${podium[2].poster_path}`} className="w-full" alt={podium[2].title} />
            <div className="absolute top-0 left-0 bg-orange-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-br-lg">3</div>
          </div>
          <div className="h-16 w-24 md:w-32 bg-orange-600/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-orange-600">
            <p className="font-bold text-sm md:text-base truncate w-full px-2 text-center">{podium[2].title}</p>
            <p className="text-xs opacity-70">{podium[2].points} pts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuelPodium;
