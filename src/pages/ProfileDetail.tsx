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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

interface GenreData {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

const GRADIENT_COLORS = [
  { start: "#667eea", end: "#764ba2" },
  { start: "#f093fb", end: "#f5576c" },
  { start: "#4facfe", end: "#00f2fe" },
  { start: "#fa709a", end: "#fee140" },
  { start: "#a8edea", end: "#fed6e3" },
  { start: "#667eea", end: "#764ba2" },
  { start: "#11998e", end: "#38ef7d" },
  { start: "#fc4a1a", end: "#f7b733" },
  { start: "#00c6fb", end: "#005bea" },
  { start: "#f857a6", end: "#ff5858" },
];

const COLORS = [
  "#667eea", "#f093fb", "#4facfe", "#fa709a", "#a8edea",
  "#11998e", "#fc4a1a", "#00c6fb", "#f857a6", "#6366f1",
  "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#22c55e",
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
          darkMode ? "bg-[#0f0f1a]" : "bg-gradient-to-br from-slate-50 to-slate-100"
        } min-h-screen flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          <p className={`mt-6 ${darkMode ? "text-gray-400" : "text-gray-500"} animate-pulse text-lg`}>
            Loading your statistics...
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for radial bar chart
  const radialData = genreStats.slice(0, 5).map((genre, index) => ({
    name: genre.name,
    value: genre.value,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div
      className={`${
        darkMode ? "bg-[#0f0f1a] text-white" : "bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 text-gray-800"
      } min-h-screen pb-20`}
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-[1200px] mx-auto p-6 pt-8">
        {/* Modern Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 mb-6 shadow-2xl shadow-purple-500/30">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Profile Statistics
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Discover your watching patterns and personality
          </p>
        </div>

        {/* Stats Overview Cards - Modern Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            className={`group relative p-8 rounded-3xl overflow-hidden ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-4 shadow-lg">
                🎬
              </div>
              <p className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                {totalWatched}
              </p>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Total Items
              </p>
            </div>
          </div>

          <div
            className={`group relative p-8 rounded-3xl overflow-hidden ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-4 shadow-lg">
                🎭
              </div>
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                {genreStats.length}
              </p>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Unique Genres
              </p>
            </div>
          </div>

          <div
            className={`group relative p-8 rounded-3xl overflow-hidden ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-2xl mb-4 shadow-lg">
                👑
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent mb-2 truncate">
                {genreStats[0]?.name || "N/A"}
              </p>
              <p className={`text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Top Genre
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Genre Pie Chart - Modern Donut */}
          <div
            className={`relative p-8 rounded-3xl overflow-hidden ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎬</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Genre Distribution</h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Your watching preferences</p>
              </div>
            </div>
            {genreStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length].start} />
                        <stop offset="100%" stopColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length].end} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={genreStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {genreStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#pieGradient-${index})`}
                        stroke={darkMode ? "#1f2937" : "#ffffff"}
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-sm`}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-20">
                <p className="text-7xl mb-4">🎬</p>
                <p className={`text-xl font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  No data yet!
                </p>
                <p className={`mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Add favorites or watchlist items to see your genre distribution.
                </p>
              </div>
            )}
          </div>

          {/* Top 5 Genres - Radial Bar Chart */}
          <div
            className={`relative p-8 rounded-3xl overflow-hidden ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Top 5 Genres</h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Your most watched categories</p>
              </div>
            </div>
            {radialData.length > 0 ? (
              <div className="space-y-5">
                {radialData.map((item, index) => {
                  const maxValue = Math.max(...radialData.map(d => d.value));
                  const percentage = (item.value / maxValue) * 100;
                  return (
                    <div key={item.name} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`
                            }}
                          >
                            {index + 1}
                          </div>
                          <span className="font-semibold text-lg">{item.name}</span>
                        </div>
                        <span 
                          className="text-2xl font-bold"
                          style={{ 
                            background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text"
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <div className={`h-4 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                          style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-7xl mb-4">📊</p>
                <p className={`text-xl ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Add content to see your top genres
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Genre Bar Chart */}
        {genreStats.length > 0 && (
          <div
            className={`relative p-8 rounded-3xl overflow-hidden mb-10 ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Genre Comparison</h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Visual breakdown of your genres</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genreStats} layout="vertical">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="50%" stopColor="#f093fb" />
                    <stop offset="100%" stopColor="#f5576c" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeOpacity={0.5} horizontal={false} />
                <XAxis 
                  type="number" 
                  tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)" 
                  radius={[0, 8, 8, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Character Analysis - Modern Design */}
        <div
          className={`relative p-8 rounded-3xl overflow-hidden mb-10 ${
            darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
          } shadow-xl`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 mb-6 shadow-xl shadow-purple-500/30">
              <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Analyze Your Watching Character
            </h2>
            <p className={`mb-8 max-w-xl mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Let AI analyze your watching habits and discover your unique viewer personality!
            </p>

            <button
              onClick={handleAnalyzeCharacter}
              disabled={loadingAnalysis || genreStats.length === 0}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loadingAnalysis ? (
                <>
                  <div className="relative w-6 h-6">
                    <div className="absolute inset-0 border-3 border-white/30 rounded-full"></div>
                    <div className="absolute inset-0 border-3 border-transparent border-t-white rounded-full animate-spin"></div>
                  </div>
                  <span className="relative">Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="relative text-2xl">✨</span>
                  <span className="relative">Analyze My Character</span>
                </>
              )}
            </button>
          </div>

          {aiAnalysis && (
            <div className={`mt-8 p-6 rounded-2xl ${darkMode ? "bg-gray-700/50" : "bg-purple-50/80"} border-l-4 border-gradient-to-b from-purple-500 to-pink-500 relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-lg">🎭</span>
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Your Watching Character
                </h3>
              </div>
              <p className={`whitespace-pre-line leading-relaxed text-lg pl-1 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                {aiAnalysis}
              </p>
            </div>
          )}
          
          <p className={`text-center mt-6 text-sm italic ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            * This is not your real personality, it's just an analysis based on your watch history.
          </p>
        </div>

        {/* Genre Breakdown List - Modern */}
        {genreStats.length > 0 && (
          <div
            className={`relative p-8 rounded-3xl overflow-hidden mb-10 ${
              darkMode ? "bg-gray-800/40 backdrop-blur-xl border border-gray-700/50" : "bg-white/60 backdrop-blur-xl border border-gray-200/50"
            } shadow-xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Genre Breakdown</h2>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Detailed view of your preferences</p>
              </div>
            </div>
            <div className="space-y-5">
              {genreStats.map((genre, index) => {
                const total = genreStats.reduce((sum, g) => sum + g.value, 0);
                const percent = (genre.value / total) * 100;
                return (
                  <div 
                    key={genre.name} 
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01] ${
                      darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-100/50"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="flex-1 font-semibold text-lg">{genre.name}</span>
                    <div className={`flex-1 max-w-xs h-4 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percent}%`,
                          background: `linear-gradient(90deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`,
                        }}
                      />
                    </div>
                    <div className={`w-16 h-10 rounded-xl flex items-center justify-center font-bold ${darkMode ? "bg-gray-700/50" : "bg-gray-100"}`}>
                      {genre.value}
                    </div>
                    <div 
                      className="w-20 text-right font-bold text-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    >
                      {percent.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button - Modern */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/profile")}
            className={`group relative py-4 px-10 rounded-2xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 ${
              darkMode
                ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50"
                : "bg-white/60 backdrop-blur-xl border border-gray-200/50 hover:border-purple-500/50"
            } shadow-xl hover:shadow-2xl`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back to Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
