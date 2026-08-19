import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";
import { API_URL } from "../config/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from "recharts";
import PowerBIAnalytics from "../components/PowerBIAnalytics";

interface User {
  _id: string;
  username: string;
  email: string;
  isPrivate: boolean;
  isAdmin: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  createdAt: string;
  commentCount: number;
  favoriteCount: number;
  watchlistCount: number;
}

interface Stats {
  totalUsers: number;
  suspendedUsers: number;
  privateUsers: number;
  totalComments: number;
  totalFavorites: number;
  totalWatchlist: number;
  dailyRegistrations: { _id: string; count: number }[];
  dailyComments: { _id: string; count: number }[];
  topCommenters: { username: string; count: number }[];
  topFavorites: { _id: number; title: string; count: number }[];
}

interface Activity {
  type: "comment" | "favorite" | "watchlist";
  data: any;
  createdAt: string;
}

interface Report {
  _id: string;
  commentId: string;
  reportedBy: { _id: string; username: string };
  commentAuthor: { _id: string; username: string };
  commentText: string;
  movieTitle: string;
  movieId: number;
  status: "pending" | "reviewed" | "dismissed" | "deleted";
  createdAt: string;
}

const GRADIENT_COLORS = {
  primary: ["#667eea", "#764ba2"],
  secondary: ["#f093fb", "#f5576c"],
  success: ["#4facfe", "#00f2fe"],
  warning: ["#fa709a", "#fee140"],
  info: ["#a8edea", "#fed6e3"],
  purple: ["#667eea", "#764ba2"]
};

const CHART_COLORS = ["#667eea", "#f093fb", "#4facfe", "#fa709a", "#a8edea", "#fed6e3"];

const AdminPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "activities" | "reports">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } else if (activeTab === "users") {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(await res.json());
        }
      } else if (activeTab === "activities") {
        const res = await fetch(`${API_URL}/api/admin/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setActivities(await res.json());
        }
      } else if (activeTab === "reports") {
        const res = await fetch(`${API_URL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setReports(await res.json());
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSuspend = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: suspendReason })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isSuspended: true, suspendedReason: suspendReason } : u
        ));
        setSuspendReason("");
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to suspend user:", err);
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/unsuspend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isSuspended: false, suspendedReason: undefined } : u
        ));
      }
    } catch (err) {
      console.error("Failed to unsuspend user:", err);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUserDetails(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReportAction = async (reportId: string, status: string, deleteComment: boolean = false) => {
    try {
      const res = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, deleteComment })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => 
          r._id === reportId ? { ...r, status: status as Report["status"] } : r
        ));
      }
    } catch (err) {
      console.error("Failed to update report:", err);
    }
  };

  const pendingReports = reports.filter(r => r.status === "pending");

  if (!isAdmin) {
    return null;
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl ${darkMode ? "bg-gray-800/90 border border-gray-700" : "bg-white/90 border border-gray-200"}`}>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0f0f1a]" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
      {/* Modern Header with Glassmorphism */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl ${darkMode ? "bg-gray-900/80 border-b border-gray-800" : "bg-white/80 border-b border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🛡️</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Manage your platform</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="group px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              Back to Site
            </button>
          </div>

          {/* Modern Tabs */}
          <div className="flex gap-2 mt-6">
            {(["dashboard", "users", "activities", "reports"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                  activeTab === tab
                    ? "text-white shadow-lg"
                    : darkMode
                      ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300"
                      : "bg-white/50 hover:bg-white/80 text-gray-600"
                }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
                )}
                <span className="relative z-10 text-lg">
                  {tab === "dashboard" && "📊"}
                  {tab === "users" && "👥"}
                  {tab === "activities" && "📜"}
                  {tab === "reports" && "⚠️"}
                </span>
                <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                {tab === "reports" && pendingReports.length > 0 && (
                  <span className="relative z-10 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {pendingReports.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} animate-pulse`}>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && stats && (
              <div className="space-y-8">
                {/* Modern Stats Cards with Glassmorphism */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <ModernStatCard 
                    icon="👥" 
                    label="Total Users" 
                    value={stats.totalUsers} 
                    gradient="from-blue-500 to-cyan-400"
                    darkMode={darkMode}
                  />
                  <ModernStatCard 
                    icon="🚫" 
                    label="Suspended" 
                    value={stats.suspendedUsers} 
                    gradient="from-red-500 to-orange-400"
                    darkMode={darkMode}
                  />
                  <ModernStatCard 
                    icon="🔒" 
                    label="Private" 
                    value={stats.privateUsers} 
                    gradient="from-amber-500 to-yellow-400"
                    darkMode={darkMode}
                  />
                  <ModernStatCard 
                    icon="💬" 
                    label="Comments" 
                    value={stats.totalComments} 
                    gradient="from-green-500 to-emerald-400"
                    darkMode={darkMode}
                  />
                  <ModernStatCard 
                    icon="❤️" 
                    label="Favorites" 
                    value={stats.totalFavorites} 
                    gradient="from-pink-500 to-rose-400"
                    darkMode={darkMode}
                  />
                  <ModernStatCard 
                    icon="📋" 
                    label="Watchlist" 
                    value={stats.totalWatchlist} 
                    gradient="from-purple-500 to-violet-400"
                    darkMode={darkMode}
                  />
                </div>

                {/* Power BI Embedded & Data Analytics Stream Section */}
                <div className="mb-6">
                  <PowerBIAnalytics mode="admin" />
                </div>

                {/* Charts Row 1 - Modern Area & Bar Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Registrations - Area Chart */}
                  <div className={`relative p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl">📈</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">User Registrations</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Last 7 days</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={stats.dailyRegistrations}>
                        <defs>
                          <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="_id" 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }} 
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <YAxis 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#667eea" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorRegistrations)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Daily Comments - Modern Bar Chart */}
                  <div className={`relative p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-lg">
                        <span className="text-xl">💬</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Comment Activity</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Last 7 days</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.dailyComments}>
                        <defs>
                          <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="_id" 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <YAxis 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          fill="url(#colorComments)" 
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Row 2 - Top Commenters & User Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Commenters - Horizontal Bar */}
                  <div className={`relative p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-lg">
                        <span className="text-xl">🏆</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Top Contributors</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Most active users</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.topCommenters} layout="vertical">
                        <defs>
                          <linearGradient id="colorTopCommenters" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeOpacity={0.5} horizontal={false} />
                        <XAxis 
                          type="number" 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <YAxis 
                          dataKey="username" 
                          type="category" 
                          width={100} 
                          tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                          axisLine={{ stroke: darkMode ? "#374151" : "#e5e7eb" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          fill="url(#colorTopCommenters)" 
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* User Distribution - Modern Donut */}
                  <div className={`relative p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg">
                        <span className="text-xl">📊</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">User Distribution</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Account status overview</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <defs>
                          <linearGradient id="colorActive" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                          <linearGradient id="colorPrivate" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#d97706" />
                          </linearGradient>
                          <linearGradient id="colorSuspended" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#dc2626" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={[
                            { name: "Active", value: stats.totalUsers - stats.suspendedUsers - stats.privateUsers },
                            { name: "Private", value: stats.privateUsers },
                            { name: "Suspended", value: stats.suspendedUsers }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="url(#colorActive)" />
                          <Cell fill="url(#colorPrivate)" />
                          <Cell fill="url(#colorSuspended)" />
                        </Pie>
                        <Legend 
                          verticalAlign="bottom"
                          formatter={(value) => <span className={darkMode ? "text-gray-300" : "text-gray-600"}>{value}</span>}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Favorites - Modern Cards */}
                <div className={`relative p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Most Favorited Movies</h3>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Top picks from users</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stats.topFavorites.map((movie, i) => (
                      <div 
                        key={movie._id} 
                        className={`group relative p-5 rounded-xl ${darkMode ? "bg-gray-700/50 hover:bg-gray-700/80" : "bg-white/50 hover:bg-white/80"} transition-all duration-300 hover:scale-105 hover:shadow-xl border ${darkMode ? "border-gray-600/50" : "border-gray-200/50"}`}
                      >
                        <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ${
                          i === 0 ? "bg-gradient-to-br from-yellow-400 to-amber-500" :
                          i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                          i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-600" :
                          "bg-gradient-to-br from-purple-500 to-pink-500"
                        }`}>
                          {["🥇", "🥈", "🥉", "4", "5"][i]}
                        </div>
                        <p className="font-bold text-sm mb-2 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {movie.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-pink-500">❤️</span>
                          <span className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {movie.count} favorites
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <span className="text-xl">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border-gray-700/50" : "bg-white/70 backdrop-blur-xl border-gray-200/50"} border focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300`}
                  />
                </div>

                {/* Modern Users Table */}
                <div className={`rounded-2xl overflow-hidden ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? "bg-gray-900/50" : "bg-gray-100/50"}`}>
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Comments</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Favorites</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {filteredUsers.map(user => (
                          <tr key={user._id} className={`group transition-all duration-300 ${darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-100/50"}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${user.isAdmin ? "from-purple-500 to-pink-500" : "from-blue-500 to-cyan-400"} flex items-center justify-center text-white font-bold shadow-lg`}>
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-semibold">{user.username}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    {user.isAdmin && (
                                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-medium">Admin</span>
                                    )}
                                    {user.isPrivate && (
                                      <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">🔒 Private</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-100"} font-semibold`}>
                                {user.commentCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${darkMode ? "bg-gray-700/50" : "bg-gray-100"} font-semibold`}>
                                {user.favoriteCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {user.isSuspended ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-red-500/20">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-green-500/20">
                                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    fetchUserDetails(user._id);
                                  }}
                                  className="group/btn px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-1.5"
                                >
                                  <span>👁️</span>
                                  <span className="group-hover/btn:translate-x-0.5 transition-transform">View</span>
                                </button>
                                {!user.isAdmin && (
                                  user.isSuspended ? (
                                    <button
                                      onClick={() => handleUnsuspend(user._id)}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center gap-1.5"
                                    >
                                      <span>✓</span>
                                      Unsuspend
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setSelectedUser(user)}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center gap-1.5"
                                    >
                                      <span>🚫</span>
                                      Suspend
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className={`rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-xl">📜</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Recent Activities</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Latest user interactions</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                  {activities.map((activity, i) => (
                    <div 
                      key={i} 
                      className={`group p-4 rounded-xl flex items-center gap-4 ${darkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-100/50 hover:bg-gray-100"} transition-all duration-300 border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"} hover:scale-[1.01]`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg ${
                        activity.type === "comment" ? "bg-gradient-to-br from-green-500 to-emerald-400" :
                        activity.type === "favorite" ? "bg-gradient-to-br from-pink-500 to-rose-400" :
                        "bg-gradient-to-br from-blue-500 to-cyan-400"
                      }`}>
                        {activity.type === "comment" && "💬"}
                        {activity.type === "favorite" && "❤️"}
                        {activity.type === "watchlist" && "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">
                          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            {activity.data.userId?.username || "Unknown"}
                          </span>
                          <span className={`font-normal ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {activity.type === "comment" && " commented on "}
                            {activity.type === "favorite" && " added to favorites "}
                            {activity.type === "watchlist" && " added to watchlist "}
                          </span>
                          <span className="font-semibold">{activity.data.title || activity.data.name}</span>
                        </p>
                        {activity.type === "comment" && (
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} truncate mt-1`}>
                            "{activity.data.comment}"
                          </p>
                        )}
                      </div>
                      <div className={`text-xs px-3 py-1.5 rounded-full ${darkMode ? "bg-gray-600/50" : "bg-gray-200/50"}`}>
                        {new Date(activity.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className={`rounded-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"} shadow-xl p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Reported Comments</h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Review user reports</p>
                  </div>
                </div>
                
                {reports.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No reports yet</p>
                    <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Everything looks clean!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div 
                        key={report._id} 
                        className={`group relative p-5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${darkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-100/50 hover:bg-gray-100"} border ${darkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
                      >
                        {/* Status indicator line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          report.status === "pending" 
                            ? "bg-gradient-to-b from-yellow-400 to-orange-500" 
                            : report.status === "deleted" 
                              ? "bg-gradient-to-b from-red-400 to-red-600" 
                              : "bg-gradient-to-b from-green-400 to-emerald-500"
                        }`}></div>

                        <div className="flex justify-between items-start mb-4 pl-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                              report.status === "pending" 
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" 
                                : report.status === "deleted"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                              {new Date(report.createdAt).toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            on <span className="font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{report.movieTitle}</span>
                          </span>
                        </div>

                        <div className={`relative p-4 rounded-xl mb-4 ml-3 ${darkMode ? "bg-gray-800/50" : "bg-white/70"} border ${darkMode ? "border-gray-600/30" : "border-gray-200/50"}`}>
                          <div className="absolute -left-2 top-4 w-4 h-4 rotate-45 ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'}"></div>
                          <p className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Comment by <span className="font-semibold text-blue-500">{report.commentAuthor?.username || "Unknown"}</span>:
                          </p>
                          <p className="italic text-lg">"{report.commentText}"</p>
                        </div>

                        <div className="flex justify-between items-center pl-3">
                          <p className={`text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Reported by: <span className="font-semibold text-orange-500">{report.reportedBy?.username || "Unknown"}</span>
                          </p>

                          {report.status === "pending" && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleReportAction(report._id, "dismissed")}
                                className="px-5 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-gray-500/30 transition-all duration-300 flex items-center gap-2"
                              >
                                <span>✓</span>
                                Dismiss
                              </button>
                              <button
                                onClick={() => handleReportAction(report._id, "deleted", true)}
                                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center gap-2"
                              >
                                <span>🗑️</span>
                                Delete Comment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modern User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border ${darkMode ? "border-gray-700/50" : "border-gray-200/50"}`}>
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-700/30">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10"></div>
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedUser.isAdmin ? "from-purple-500 to-pink-500" : "from-blue-500 to-cyan-400"} flex items-center justify-center text-white text-2xl font-bold shadow-xl`}>
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {selectedUser.username}
                      {selectedUser.isSuspended && (
                        <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full">Suspended</span>
                      )}
                    </h2>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                  className={`w-10 h-10 rounded-xl ${darkMode ? "bg-gray-800 hover:bg-red-500/20" : "bg-gray-100 hover:bg-red-500/20"} flex items-center justify-center transition-all duration-300 hover:text-red-500`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              {/* User Info Card */}
              <div className={`p-5 rounded-2xl mb-6 ${darkMode ? "bg-gray-800/50" : "bg-gray-100/50"} border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Joined</p>
                      <p className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedUser.isPrivate ? "🔒" : "🌐"}</span>
                    <div>
                      <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Account</p>
                      <p className="font-semibold">{selectedUser.isPrivate ? "Private" : "Public"}</p>
                    </div>
                  </div>
                </div>
                {selectedUser.isSuspended && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm">
                      <span className="font-bold">Suspended Reason:</span> {selectedUser.suspendedReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Suspend Form */}
              {!selectedUser.isAdmin && !selectedUser.isSuspended && (
                <div className={`p-5 rounded-2xl mb-6 ${darkMode ? "bg-gray-800/50" : "bg-gray-100/50"} border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"}`}>
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm">🚫</span>
                    Suspend User
                  </h4>
                  <input
                    type="text"
                    placeholder="Enter reason for suspension..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl mb-4 ${darkMode ? "bg-gray-700/50" : "bg-white"} border ${darkMode ? "border-gray-600/50" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all`}
                  />
                  <button
                    onClick={() => handleSuspend(selectedUser._id)}
                    disabled={!suspendReason.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Suspension
                  </button>
                </div>
              )}

              {/* User Statistics */}
              {userDetails && (
                <div className="space-y-6">
                  <h4 className="font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">📊</span>
                    User Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl text-center ${darkMode ? "bg-gray-800/50" : "bg-gray-100/50"} border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"} hover:scale-105 transition-all duration-300`}>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-2xl shadow-lg">
                        💬
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">{userDetails.comments?.length || 0}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Comments</p>
                    </div>
                    <div className={`p-5 rounded-2xl text-center ${darkMode ? "bg-gray-800/50" : "bg-gray-100/50"} border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"} hover:scale-105 transition-all duration-300`}>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-2xl shadow-lg">
                        ❤️
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">{userDetails.favorites?.length || 0}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Favorites</p>
                    </div>
                    <div className={`p-5 rounded-2xl text-center ${darkMode ? "bg-gray-800/50" : "bg-gray-100/50"} border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"} hover:scale-105 transition-all duration-300`}>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg">
                        📋
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{userDetails.watchlist?.length || 0}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Watchlist</p>
                    </div>
                  </div>

                  {/* Recent Comments */}
                  {userDetails.comments?.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-sm">💬</span>
                        Recent Comments
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {userDetails.comments.slice(0, 5).map((c: any) => (
                          <div key={c._id} className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/50 hover:bg-gray-800/80" : "bg-gray-100/50 hover:bg-gray-100"} transition-all duration-300 border ${darkMode ? "border-gray-700/30" : "border-gray-200/50"}`}>
                            <p className="font-semibold text-sm bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{c.title || c.name}</p>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} truncate mt-1`}>"{c.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Stat Card Component
const ModernStatCard = ({ icon, label, value, gradient, darkMode }: { icon: string; label: string; value: number; gradient: string; darkMode: boolean }) => {
  return (
    <div className={`group relative p-5 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl ${darkMode ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700/50" : "bg-white/70 backdrop-blur-xl border border-gray-200/50"}`}>
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      {/* Icon with gradient background */}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      
      {/* Value with animation */}
      <p className={`text-3xl font-bold mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value.toLocaleString()}
      </p>
      
      {/* Label */}
      <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
      
      {/* Decorative element */}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
    </div>
  );
};

export default AdminPage;
