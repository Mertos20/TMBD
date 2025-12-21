import { useEffect, useState } from "react";
import { useTheme } from "../components/ThemaContext";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

interface PodiumMovie {
  movieId: number;
  title: string;
  poster_path: string;
  points: number;
}

const DuelPage = () => {
  const { darkMode } = useTheme();
  
  // Game State
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [currentRoundMatches, setCurrentRoundMatches] = useState<Movie[][]>([]);
  const [nextRoundWinners, setNextRoundWinners] = useState<Movie[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [gameStatus, setGameStatus] = useState<"loading" | "start" | "playing" | "finished">("loading");
  const [tournamentWinner, setTournamentWinner] = useState<Movie | null>(null);
  
  // Daily Stats
  const [podium, setPodium] = useState<PodiumMovie[]>([]);

  const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
  const userId = localStorage.getItem("userId");
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `duel_state_${userId}_${today}`;

  useEffect(() => {
    fetchDailyData();
  }, []);

  const fetchDailyData = async () => {
    try {
      const [moviesRes, podiumRes] = await Promise.all([
        fetch("http://localhost:5000/api/duel/daily"),
        fetch("http://localhost:5000/api/duel/daily-podium")
      ]);
      
      const movies = await moviesRes.json();
      const podiumData = await podiumRes.json();

      setAllMovies(movies);
      setPodium(podiumData);

      // Check for saved state
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setCurrentRoundMatches(parsed.currentRoundMatches);
        setNextRoundWinners(parsed.nextRoundWinners);
        setCurrentMatchIndex(parsed.currentMatchIndex);
        setRound(parsed.round);
        setTournamentWinner(parsed.tournamentWinner);
        setGameStatus(parsed.gameStatus);
      } else {
        setGameStatus("start");
      }
    } catch (err) {
      console.error("Failed to fetch daily duel data", err);
    }
  };

  const saveProgress = (state: any) => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  const startTournament = () => {
    // Shuffle movies
    const shuffled = [...allMovies].sort(() => 0.5 - Math.random());
    
    // Create first round pairs
    const pairs: Movie[][] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      }
    }

    const newState = {
      currentRoundMatches: pairs,
      nextRoundWinners: [],
      currentMatchIndex: 0,
      round: 1,
      gameStatus: "playing",
      tournamentWinner: null
    };

    setCurrentRoundMatches(newState.currentRoundMatches);
    setNextRoundWinners(newState.nextRoundWinners);
    setCurrentMatchIndex(newState.currentMatchIndex);
    setRound(newState.round);
    setGameStatus("playing");
    
    saveProgress(newState);
  };

  const handleVote = async (winner: Movie) => {
    // Optimistic UI update
    const newWinners = [...nextRoundWinners, winner];
    setNextRoundWinners(newWinners);

    // Send vote to backend
    try {
      await fetch("http://localhost:5000/api/duel/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          winnerId: winner.id,
          title: winner.title,
          poster_path: winner.poster_path
        }),
      });
    } catch (err) {
      console.error("Vote failed", err);
    }

    let newState: any = {};

    // Check if round is over
    if (currentMatchIndex + 1 >= currentRoundMatches.length) {
      // Round Complete
      if (newWinners.length === 1) {
        // Tournament Finished
        setTournamentWinner(newWinners[0]);
        setGameStatus("finished");
        
        newState = {
          currentRoundMatches,
          nextRoundWinners: newWinners,
          currentMatchIndex,
          round,
          gameStatus: "finished",
          tournamentWinner: newWinners[0]
        };

        // Refresh podium
        const res = await fetch("http://localhost:5000/api/duel/daily-podium");
        setPodium(await res.json());
      } else {
        // Prepare Next Round
        const nextPairs: Movie[][] = [];
        for (let i = 0; i < newWinners.length; i += 2) {
          if (newWinners[i + 1]) {
            nextPairs.push([newWinners[i], newWinners[i + 1]]);
          }
        }
        
        newState = {
          currentRoundMatches: nextPairs,
          nextRoundWinners: [],
          currentMatchIndex: 0,
          round: round + 1,
          gameStatus: "playing",
          tournamentWinner: null
        };

        setCurrentRoundMatches(nextPairs);
        setNextRoundWinners([]);
        setCurrentMatchIndex(0);
        setRound(prev => prev + 1);
      }
    } else {
      // Next Match
      newState = {
        currentRoundMatches,
        nextRoundWinners: newWinners,
        currentMatchIndex: currentMatchIndex + 1,
        round,
        gameStatus: "playing",
        tournamentWinner: null
      };
      setCurrentMatchIndex(prev => prev + 1);
    }

    saveProgress(newState);
  };

  const getRoundName = (r: number, total: number) => {
    if (total === 1) return "Final";
    if (total === 2) return "Semi-Finals";
    if (total === 4) return "Quarter-Finals";
    return `Round ${r}`;
  };

  return (
    <div className={`min-h-screen pt-20 pb-10 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
          Daily Movie Tournament
        </h1>
        <p className="opacity-70 mb-8">Vote for your favorites and crown the winner!</p>

        {/* PODIUM SECTION */}
        {podium.length > 0 && gameStatus !== "playing" && (
          <div className="mb-24 flex justify-center items-end gap-4 md:gap-8 h-[300px]">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="flex flex-col items-center animate-fade-in-up delay-100">
                <div className="relative w-24 md:w-32 rounded-lg overflow-hidden shadow-xl border-4 border-gray-400 mb-2 transform hover:scale-105 transition-transform">
                  <img src={`${IMAGE_BASE}${podium[1].poster_path}`} className="w-full" />
                  <div className="absolute top-0 left-0 bg-gray-400 text-white font-bold w-8 h-8 flex items-center justify-center rounded-br-lg">2</div>
                </div>
                <div className="h-24 w-24 md:w-32 bg-gray-400/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-gray-400">
                  <p className="font-bold text-sm md:text-base truncate w-full px-2">{podium[1].title}</p>
                  <p className="text-xs opacity-70">{podium[1].points} pts</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podium[0] && (
              <div className="flex flex-col items-center z-10 animate-fade-in-up">
                <div className="relative w-32 md:w-40 rounded-lg overflow-hidden shadow-2xl border-4 border-yellow-500 mb-2 transform hover:scale-110 transition-transform">
                  <img src={`${IMAGE_BASE}${podium[0].poster_path}`} className="w-full" />
                  <div className="absolute top-0 left-0 bg-yellow-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-br-lg text-xl">1</div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl">👑</div>
                </div>
                <div className="h-32 w-32 md:w-40 bg-yellow-500/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-yellow-500">
                  <p className="font-bold text-base md:text-lg truncate w-full px-2">{podium[0].title}</p>
                  <p className="text-sm opacity-70">{podium[0].points} pts</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <div className="flex flex-col items-center animate-fade-in-up delay-200">
                <div className="relative w-24 md:w-32 rounded-lg overflow-hidden shadow-xl border-4 border-orange-600 mb-2 transform hover:scale-105 transition-transform">
                  <img src={`${IMAGE_BASE}${podium[2].poster_path}`} className="w-full" />
                  <div className="absolute top-0 left-0 bg-orange-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-br-lg">3</div>
                </div>
                <div className="h-16 w-24 md:w-32 bg-orange-600/20 rounded-t-lg flex flex-col items-center justify-center border-t-4 border-orange-600">
                  <p className="font-bold text-sm md:text-base truncate w-full px-2">{podium[2].title}</p>
                  <p className="text-xs opacity-70">{podium[2].points} pts</p>
                </div>
              </div>
            )}
          </div>
        )}

        {gameStatus === "loading" && (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
          </div>
        )}

        {gameStatus === "start" && (
          <div className="py-20">
            <div className="text-6xl mb-6">⚔️</div>
            <h2 className="text-2xl font-bold mb-4">Ready for today's challenge?</h2>
            <p className="mb-8 opacity-70">32 Movies. 5 Rounds. 1 Winner.</p>
            <button 
              onClick={startTournament}
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full text-xl hover:bg-purple-700 hover:scale-105 transition-all shadow-lg shadow-purple-500/30"
            >
              Start Tournament
            </button>
          </div>
        )}

        {gameStatus === "playing" && currentRoundMatches.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <span className="px-4 py-1 rounded-full bg-gray-700 text-white text-sm font-bold">
                {getRoundName(round, currentRoundMatches.length)}
              </span>
              <p className="mt-2 opacity-50 text-sm">Match {currentMatchIndex + 1} of {currentRoundMatches.length}</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 mb-12">
              {/* MOVIE 1 */}
              <div 
                onClick={() => handleVote(currentRoundMatches[currentMatchIndex][0])}
                className="group cursor-pointer transform transition hover:scale-105"
              >
                <div className="w-[200px] md:w-[280px] rounded-xl overflow-hidden shadow-2xl border-4 border-transparent hover:border-green-500 transition-all relative">
                  <img 
                    src={`${IMAGE_BASE}${currentRoundMatches[currentMatchIndex][0].poster_path}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-green-500 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Vote
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 font-bold text-lg max-w-[200px] md:max-w-[280px] mx-auto">
                  {currentRoundMatches[currentMatchIndex][0].title}
                </h3>
              </div>

              <div className="text-2xl font-bold text-gray-500">VS</div>

              {/* MOVIE 2 */}
              <div 
                onClick={() => handleVote(currentRoundMatches[currentMatchIndex][1])}
                className="group cursor-pointer transform transition hover:scale-105"
              >
                <div className="w-[200px] md:w-[280px] rounded-xl overflow-hidden shadow-2xl border-4 border-transparent hover:border-blue-500 transition-all relative">
                  <img 
                    src={`${IMAGE_BASE}${currentRoundMatches[currentMatchIndex][1].poster_path}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Vote
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 font-bold text-lg max-w-[200px] md:max-w-[280px] mx-auto">
                  {currentRoundMatches[currentMatchIndex][1].title}
                </h3>
              </div>
            </div>
          </div>
        )}

        {gameStatus === "finished" && tournamentWinner && (
          <div className="py-10 animate-bounce-in">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold mb-6">Tournament Champion!</h2>
            
            <div className="w-[240px] mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-yellow-500 mb-8">
              <img src={`${IMAGE_BASE}${tournamentWinner.poster_path}`} className="w-full" />
            </div>
            
            <h3 className="text-2xl font-bold mb-8">{tournamentWinner.title}</h3>
            
            <div className="text-gray-400">
              Come back tomorrow for a new tournament!
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DuelPage;
