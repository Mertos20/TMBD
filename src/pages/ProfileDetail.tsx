import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

interface GenreData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const COLORS = [
  "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#22c55e",
  "#84cc16", "#eab308", "#f97316", "#ef4444", "#ec4899",
  "#a855f7", "#6366f1", "#14b8a6", "#f59e0b", "#dc2626",
];

const ProfileDetail = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [genreStats, setGenreStats] = useState<GenreData[]>([]);
  const [totalWatched, setTotalWatched] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const fetchGenreStats = async () => {
      try {
        const [favRes, watchRes] = await Promise.all([
          fetch(`http://localhost:5000/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/watchlists`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const favorites = await favRes.json();
        const watchlist = await watchRes.json();

        console.log("Favorites:", favorites);
        console.log("Watchlist:", watchlist);

        const favArray = Array.isArray(favorites) ? favorites : [];
        const watchArray = Array.isArray(watchlist) ? watchlist : [];

        // Combine and deduplicate based on movieId
        const uniqueItemsMap = new Map();
        
        [...favArray, ...watchArray].forEach(item => {
            if (item.movieId && !uniqueItemsMap.has(item.movieId)) {
                uniqueItemsMap.set(item.movieId, item);
            }
        });
        
        const allItems = Array.from(uniqueItemsMap.values());
        setTotalWatched(allItems.length);

        if (allItems.length === 0) {
          setLoading(false);
          return;
        }

        const genreCount: Record<string, number> = {};

        await Promise.all(
          allItems.map(async (item: { movieId: number; media_type?: string }) => {
            try {
              const type = item.media_type || "movie";
              const res = await fetch(
                `https://api.themoviedb.org/3/${type}/${item.movieId}?api_key=${API_KEY}`
              );
              const data = await res.json();

              if (data.genres) {
                data.genres.forEach((genre: { id: number; name: string }) => {
                  genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
                });
              }
            } catch (err) {
              console.error("Genre fetch error:", err);
            }
          })
        );

        const genreData = Object.entries(genreCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setGenreStats(genreData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching genre stats:", err);
        setLoading(false);
      }
    };

    fetchGenreStats();
  }, [token, userId, navigate]);

  const handleAnalyzeCharacter = async () => {
    if (genreStats.length === 0) {
      setAiAnalysis("You need to add some favorites or watchlist items first!");
      return;
    }

    setLoadingAnalysis(true);
    try {
      const genreText = genreStats.map((g) => `${g.name}: ${g.value}`).join(", ");

      const response = await fetch("http://localhost:5000/api/chatbot/analyze-character", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          genres: genreText,
          totalWatched,
          username,
        }),
      });

      const data = await response.json();
      setAiAnalysis(data.analysis || "Could not generate analysis.");
    } catch (err) {
      console.error("AI analysis error:", err);
      setAiAnalysis("An error occurred while analyzing your watching character.");
    }
    setLoadingAnalysis(false);
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: GenreData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = genreStats.reduce((sum, item) => sum + item.value, 0);
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div
          className={`p-4 rounded-xl shadow-xl border ${
            darkMode
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-white text-black border-gray-200"
          }`}
        >
          <p className="font-bold text-lg">{data.name}</p>
          <p className="text-sm">Count: {data.value}</p>
          <p className="text-purple-500 font-bold text-xl">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div
        className={`${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        } min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
          <p>Loading your statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } min-h-screen pb-20`}
    >
      <div
        className={`max-w-[1200px] mx-auto p-6 mt-6 rounded-xl shadow-lg ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Profile Statistics</h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Discover your watching patterns and personality
          </p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div
            className={`p-6 rounded-xl text-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            } shadow-lg hover:scale-105 transition-transform cursor-pointer`}
          >
            <p className="text-5xl font-bold text-purple-500 mb-2">{totalWatched}</p>
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Total Items
            </p>
          </div>
          <div
            className={`p-6 rounded-xl text-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            } shadow-lg hover:scale-105 transition-transform cursor-pointer`}
          >
            <p className="text-5xl font-bold text-blue-500 mb-2">{genreStats.length}</p>
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Unique Genres
            </p>
          </div>
          <div
            className={`p-6 rounded-xl text-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            } shadow-lg hover:scale-105 transition-transform cursor-pointer`}
          >
            <p className="text-2xl font-bold text-green-500 mb-2">
              {genreStats[0]?.name || "N/A"}
            </p>
            <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Top Genre
            </p>
          </div>
        </div>

        {/* Genre Pie Chart */}
        <div
          className={`p-6 rounded-xl mb-8 ${
            darkMode ? "bg-gray-700" : "bg-white"
          } shadow-lg`}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            🎬 Genre Distribution
          </h2>
          {genreStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={genreStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {genreStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={darkMode ? "#1f2937" : "#ffffff"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">🎬</p>
              <p className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                No data yet!
              </p>
              <p className={`${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Add favorites or watchlist items to see your genre distribution.
              </p>
            </div>
          )}
        </div>

        {/* AI Character Analysis */}
        <div
          className={`p-6 rounded-xl mb-8 ${
            darkMode ? "bg-gray-700" : "bg-white"
          } shadow-lg`}
        >
          <h2 className="text-2xl font-semibold mb-4 text-center">
            🤖 Analyze Your Watching Character
          </h2>
          <p
            className={`text-center mb-6 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Let AI analyze your watching habits and discover your unique viewer
            personality!
          </p>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleAnalyzeCharacter}
              disabled={loadingAnalysis || genreStats.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
            >
              {loadingAnalysis ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>✨ Analyze My Character</>
              )}
            </button>
          </div>

          {aiAnalysis && (
            <div
              className={`p-6 rounded-xl ${
                darkMode ? "bg-gray-600" : "bg-purple-50"
              } border-l-4 border-purple-500`}
            >
              <h3 className="font-bold text-xl mb-3 text-purple-500">
                🎭 Your Watching Character
              </h3>
              <p className="whitespace-pre-line leading-relaxed text-lg">
                {aiAnalysis}
              </p>
            </div>
          )}
          
          <p className={`text-center mt-4 text-xs italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            * This is not your real personality, it's just an analysis based on your watch history.
          </p>
        </div>

        {/* Genre Breakdown List */}
        {genreStats.length > 0 && (
          <div
            className={`p-6 rounded-xl ${
              darkMode ? "bg-gray-700" : "bg-white"
            } shadow-lg`}
          >
            <h2 className="text-2xl font-semibold mb-6 text-center">
              📋 Genre Breakdown
            </h2>
            <div className="space-y-4">
              {genreStats.map((genre, index) => {
                const total = genreStats.reduce((sum, g) => sum + g.value, 0);
                const percent = (genre.value / total) * 100;
                return (
                  <div key={genre.name} className="flex items-center gap-4">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 font-medium">{genre.name}</span>
                    <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold">{genre.value}</span>
                    <span
                      className={`w-16 text-right ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/profile")}
            className={`py-3 px-8 rounded-full font-semibold text-lg ${
              darkMode
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-all hover:scale-105`}
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
