import { useEffect, useState } from "react";
import { useTheme } from "../components/ThemaContext";
import { DuelCard, DuelPodium, DuelCalendar } from "../components/duel";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview?: string;
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

  // Calendar State
  const [showCalendar, setShowCalendar] = useState(false);

  const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
  const userId = localStorage.getItem("userId");
  // Use local date to match server's Turkey time logic (assuming user is in TR or similar)
  const today = new Date().toLocaleDateString('en-CA');
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

        // Helper to enrich movies with fresh data (like overview)
        const enrichMovie = (m: Movie) => {
          const fresh = movies.find((fm: Movie) => fm.id === m.id);
          return fresh ? { ...m, ...fresh } : m;
        };

        // Enrich current matches
        const enrichedMatches = parsed.currentRoundMatches.map((pair: Movie[]) => 
          pair.map(enrichMovie)
        );

        // Enrich next round winners
        const enrichedWinners = parsed.nextRoundWinners.map(enrichMovie);

        setCurrentRoundMatches(enrichedMatches);
        setNextRoundWinners(enrichedWinners);
        setCurrentMatchIndex(parsed.currentMatchIndex);
        setRound(parsed.round);
        setTournamentWinner(parsed.tournamentWinner ? enrichMovie(parsed.tournamentWinner) : null);
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
    <div className={`min-h-screen pt-20 pb-10 relative overflow-hidden ${darkMode ? "text-white" : "text-gray-900"}`}>
      {/* Animated colorful blurred background - Teal/Turquoise/Aqua theme */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#032541] via-[#0d4f6e] to-[#01b4e4]"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-400/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "0.5s" }}></div>
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-[#1ed5a9]/25 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-sky-400/20 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-[#1ed5a9] via-cyan-400 to-[#01b4e4] bg-clip-text text-transparent drop-shadow-lg">
          ⚔️ Daily Movie Tournament ⚔️
        </h1>
        <p className="opacity-80 mb-4 text-lg">Vote for your favorites and crown the winner!</p>

        {/* Calendar Toggle Button - Only show when not playing */}
        {gameStatus !== "playing" && (
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="mb-8 px-6 py-2 bg-white/10 backdrop-blur-sm border border-[#1ed5a9]/30 rounded-full text-sm font-semibold hover:bg-white/20 transition-all"
          >
            📅 {showCalendar ? "Hide Calendar" : "View Monthly Calendar"}
          </button>
        )}

        {/* MONTHLY CALENDAR - Only show when not playing */}
        {gameStatus !== "playing" && (
          <DuelCalendar show={showCalendar} onClose={() => setShowCalendar(false)} />
        )}

        {/* PODIUM SECTION */}
        {gameStatus !== "playing" && (
          <DuelPodium podium={podium} />
        )}

        {gameStatus === "loading" && (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#1ed5a9] border-r-4 border-r-cyan-400"></div>
          </div>
        )}

        {gameStatus === "start" && (
          <div className="py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl mx-4">
            <div className="text-6xl mb-6">⚔️</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Ready for today's challenge?</h2>
            <p className="mb-8 opacity-80 text-gray-200">32 Movies. 5 Rounds. 1 Winner.</p>
            <button 
              onClick={startTournament}
              className="px-8 py-4 bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] text-white font-bold rounded-full text-xl hover:from-teal-400 hover:to-cyan-500 hover:scale-105 transition-all shadow-lg shadow-teal-500/50 ring-2 ring-white/20"
            >
              🎮 Start Tournament
            </button>
          </div>
        )}

        {gameStatus === "playing" && currentRoundMatches.length > 0 && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <span className="px-6 py-2 rounded-full bg-gradient-to-r from-[#032541] to-[#01b4e4] text-white text-sm font-bold shadow-lg border border-[#1ed5a9]/30">
                {getRoundName(round, currentRoundMatches.length)}
              </span>
              <p className="mt-2 opacity-70 text-sm text-gray-300">Match {currentMatchIndex + 1} of {currentRoundMatches.length}</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 mb-12">
              {/* MOVIE 1 */}
              <DuelCard 
                movie={currentRoundMatches[currentMatchIndex][0]} 
                onVote={() => handleVote(currentRoundMatches[currentMatchIndex][0])}
                color="green"
              />

              <div className="text-3xl font-bold text-white/80 bg-white/10 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center shadow-lg">VS</div>

              {/* MOVIE 2 */}
              <DuelCard 
                movie={currentRoundMatches[currentMatchIndex][1]} 
                onVote={() => handleVote(currentRoundMatches[currentMatchIndex][1])}
                color="blue"
              />
            </div>
          </div>
        )}

        {gameStatus === "finished" && tournamentWinner && (
          <div className="py-10 animate-bounce-in">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold mb-6 text-[#1ed5a9] drop-shadow-lg">Tournament Champion!</h2>
            
            <div className="w-[240px] mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-[#1ed5a9] mb-8 ring-4 ring-teal-400/50">
              <img src={`${IMAGE_BASE}${tournamentWinner.poster_path}`} className="w-full" />
            </div>
            
            <h3 className="text-2xl font-bold mb-8">{tournamentWinner.title}</h3>
            
            <div className="text-gray-200 bg-[#032541]/50 backdrop-blur-sm px-6 py-3 rounded-full inline-block border border-[#1ed5a9]/30">
              🎮 Come back tomorrow for a new tournament!
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DuelPage;
