import { useState } from "react";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview?: string;
}

interface DuelCardProps {
  movie: Movie;
  onVote: () => void;
  color: "green" | "blue";
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const DuelCard = ({ movie, onVote, color }: DuelCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const borderClass = color === "green" ? "hover:border-green-500" : "hover:border-blue-500";
  const btnBgClass = color === "green" ? "bg-green-500" : "bg-blue-500";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[200px] md:w-[280px] h-[300px] md:h-[420px] perspective-[1000px]">
        <div 
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <div 
              onClick={onVote}
              className={`w-full h-full rounded-xl overflow-hidden shadow-2xl border-4 border-transparent ${borderClass} transition-all relative cursor-pointer group`}
            >
              <img 
                src={`${IMAGE_BASE}${movie.poster_path}`} 
                className="w-full h-full object-cover"
                alt={movie.title}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                <span className={`opacity-0 group-hover:opacity-100 ${btnBgClass} text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all`}>
                  Vote
                </span>
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="w-full h-full bg-gray-800 text-white rounded-xl p-6 flex flex-col items-center justify-center text-center border-4 border-gray-600 overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">{movie.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed mb-4">{movie.overview || "No overview available."}</p>
              <button 
                onClick={() => setIsFlipped(false)}
                className="mt-auto px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Back to Poster
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <h3 className="font-bold text-lg max-w-[200px] md:max-w-[280px] text-center truncate">
          {movie.title}
        </h3>
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-sm font-semibold text-gray-500 hover:text-purple-500 transition-colors flex items-center gap-1"
        >
          <span>ℹ️</span> {isFlipped ? "Show Poster" : "Read Plot"}
        </button>
      </div>
    </div>
  );
};

export default DuelCard;
