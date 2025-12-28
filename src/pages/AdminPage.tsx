import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";
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
  Legend
} from "recharts";

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

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

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
        const res = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } else if (activeTab === "users") {
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(await res.json());
        }
      } else if (activeTab === "activities") {
        const res = await fetch("http://localhost:5000/api/admin/activities", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setActivities(await res.json());
        }
      } else if (activeTab === "reports") {
        const res = await fetch("http://localhost:5000/api/reports", {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/suspend`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/unsuspend`, {
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
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
      const res = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
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

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">🛡️</span> Admin Panel
            </h1>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Site
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {(["dashboard", "users", "activities", "reports"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition relative ${
                  activeTab === tab
                    ? "bg-purple-600 text-white"
                    : darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {tab === "dashboard" && "📊 "}
                {tab === "users" && "👥 "}
                {tab === "activities" && "📜 "}
                {tab === "reports" && "⚠️ "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "reports" && pendingReports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && stats && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="blue" darkMode={darkMode} />
                  <StatCard icon="🚫" label="Suspended" value={stats.suspendedUsers} color="red" darkMode={darkMode} />
                  <StatCard icon="🔒" label="Private" value={stats.privateUsers} color="yellow" darkMode={darkMode} />
                  <StatCard icon="💬" label="Comments" value={stats.totalComments} color="green" darkMode={darkMode} />
                  <StatCard icon="❤️" label="Favorites" value={stats.totalFavorites} color="pink" darkMode={darkMode} />
                  <StatCard icon="📋" label="Watchlist" value={stats.totalWatchlist} color="purple" darkMode={darkMode} />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Registrations */}
                  <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                    <h3 className="text-lg font-bold mb-4">📈 Daily Registrations (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={stats.dailyRegistrations}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ddd"} />
                        <XAxis dataKey="_id" tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <YAxis tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#333" : "#fff" }} />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ fill: "#8884d8" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Daily Comments */}
                  <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                    <h3 className="text-lg font-bold mb-4">💬 Daily Comments (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.dailyComments}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ddd"} />
                        <XAxis dataKey="_id" tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <YAxis tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#333" : "#fff" }} />
                        <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Commenters */}
                  <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                    <h3 className="text-lg font-bold mb-4">🏆 Top Commenters</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.topCommenters} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ddd"} />
                        <XAxis type="number" tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <YAxis dataKey="username" type="category" width={100} tick={{ fill: darkMode ? "#fff" : "#333" }} />
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#333" : "#fff" }} />
                        <Bar dataKey="count" fill="#ffc658" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* User Distribution Pie */}
                  <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                    <h3 className="text-lg font-bold mb-4">📊 User Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Active", value: stats.totalUsers - stats.suspendedUsers - stats.privateUsers },
                            { name: "Private", value: stats.privateUsers },
                            { name: "Suspended", value: stats.suspendedUsers }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                          dataKey="value"
                        >
                          <Cell fill="#82ca9d" />
                          <Cell fill="#ffc658" />
                          <Cell fill="#ff7300" />
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Favorites */}
                <div className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                  <h3 className="text-lg font-bold mb-4">⭐ Most Favorited Movies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {stats.topFavorites.map((movie, i) => (
                      <div key={movie._id} className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"} text-center`}>
                        <div className="text-3xl mb-2">{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}</div>
                        <p className="font-semibold text-sm truncate">{movie.title}</p>
                        <p className="text-xs opacity-70">{movie.count} favorites</p>
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
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-4 py-3 rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} border ${darkMode ? "border-gray-700" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                </div>

                {/* Users Table */}
                <div className={`rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                  <table className="w-full">
                    <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <tr>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-center">Comments</th>
                        <th className="px-4 py-3 text-center">Favorites</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user._id} className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"} hover:${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{user.username}</span>
                              {user.isAdmin && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Admin</span>}
                              {user.isPrivate && <span className="text-xs">🔒</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm opacity-70">{user.email}</td>
                          <td className="px-4 py-3 text-center">{user.commentCount}</td>
                          <td className="px-4 py-3 text-center">{user.favoriteCount}</td>
                          <td className="px-4 py-3 text-center">
                            {user.isSuspended ? (
                              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">Suspended</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  fetchUserDetails(user._id);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                              >
                                👁️ View
                              </button>
                              {!user.isAdmin && (
                                user.isSuspended ? (
                                  <button
                                    onClick={() => handleUnsuspend(user._id)}
                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                  >
                                    ✓ Unsuspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                  >
                                    🚫 Suspend
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
            )}

            {/* Activities Tab */}
            {activeTab === "activities" && (
              <div className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6`}>
                <h3 className="text-lg font-bold mb-4">📜 Recent Activities</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {activities.map((activity, i) => (
                    <div key={i} className={`p-4 rounded-lg flex items-center gap-4 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <div className="text-2xl">
                        {activity.type === "comment" && "💬"}
                        {activity.type === "favorite" && "❤️"}
                        {activity.type === "watchlist" && "📋"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {activity.data.userId?.username || "Unknown"}{" "}
                          <span className="font-normal opacity-70">
                            {activity.type === "comment" && "commented on"}
                            {activity.type === "favorite" && "added to favorites"}
                            {activity.type === "watchlist" && "added to watchlist"}
                          </span>{" "}
                          <span className="text-purple-400">{activity.data.title || activity.data.name}</span>
                        </p>
                        {activity.type === "comment" && (
                          <p className="text-sm opacity-70 truncate">{activity.data.comment}</p>
                        )}
                      </div>
                      <div className="text-xs opacity-50">
                        {new Date(activity.createdAt).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-lg p-6`}>
                <h3 className="text-lg font-bold mb-4">⚠️ Reported Comments</h3>
                
                {reports.length === 0 ? (
                  <p className="text-center py-8 opacity-70">No reports yet</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div 
                        key={report._id} 
                        className={`p-4 rounded-lg border-l-4 ${
                          report.status === "pending" 
                            ? "border-yellow-500" 
                            : report.status === "deleted" 
                              ? "border-red-500" 
                              : "border-green-500"
                        } ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className={`px-2 py-1 text-xs rounded font-semibold ${
                              report.status === "pending" 
                                ? "bg-yellow-500 text-white" 
                                : report.status === "deleted"
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                            }`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className="text-xs opacity-50 ml-2">
                              {new Date(report.createdAt).toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <span className="text-sm opacity-70">
                            on <strong className="text-purple-400">{report.movieTitle}</strong>
                          </span>
                        </div>

                        <div className={`p-3 rounded mb-3 ${darkMode ? "bg-gray-600" : "bg-white"}`}>
                          <p className="text-sm opacity-70 mb-1">
                            Comment by <strong>{report.commentAuthor?.username || "Unknown"}</strong>:
                          </p>
                          <p className="italic">"{report.commentText}"</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs opacity-50">
                            Reported by: <strong>{report.reportedBy?.username || "Unknown"}</strong>
                          </p>

                          {report.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReportAction(report._id, "dismissed")}
                                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                              >
                                ✓ Dismiss
                              </button>
                              <button
                                onClick={() => handleReportAction(report._id, "deleted", true)}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              >
                                🗑️ Delete Comment
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  👤 {selectedUser.username}
                  {selectedUser.isSuspended && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Suspended</span>
                  )}
                </h2>
                <button
                  onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                  className="text-2xl hover:text-red-500"
                >
                  &times;
                </button>
              </div>

              {/* User Info */}
              <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString("tr-TR")}</p>
                <p><strong>Private:</strong> {selectedUser.isPrivate ? "Yes 🔒" : "No"}</p>
                {selectedUser.isSuspended && (
                  <p className="text-red-400"><strong>Suspended Reason:</strong> {selectedUser.suspendedReason}</p>
                )}
              </div>

              {/* Suspend Form */}
              {!selectedUser.isAdmin && !selectedUser.isSuspended && (
                <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                  <h4 className="font-bold mb-2">🚫 Suspend User</h4>
                  <input
                    type="text"
                    placeholder="Reason for suspension..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg mb-2 ${darkMode ? "bg-gray-600" : "bg-white"} border ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                  />
                  <button
                    onClick={() => handleSuspend(selectedUser._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Confirm Suspend
                  </button>
                </div>
              )}

              {/* User Details */}
              {userDetails && (
                <div className="space-y-4">
                  <h4 className="font-bold">📊 User Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <p className="text-2xl font-bold">{userDetails.comments?.length || 0}</p>
                      <p className="text-sm opacity-70">Comments</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <p className="text-2xl font-bold">{userDetails.favorites?.length || 0}</p>
                      <p className="text-sm opacity-70">Favorites</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                      <p className="text-2xl font-bold">{userDetails.watchlist?.length || 0}</p>
                      <p className="text-sm opacity-70">Watchlist</p>
                    </div>
                  </div>

                  {/* Recent Comments */}
                  {userDetails.comments?.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-2">💬 Recent Comments</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {userDetails.comments.slice(0, 5).map((c: any) => (
                          <div key={c._id} className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                            <p className="font-semibold text-sm">{c.title || c.name}</p>
                            <p className="text-sm opacity-70 truncate">{c.comment}</p>
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

// Stat Card Component
const StatCard = ({ icon, label, value, color, darkMode }: { icon: string; label: string; value: number; color: string; darkMode: boolean }) => {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
    green: "from-green-500 to-green-600",
    pink: "from-pink-500 to-pink-600",
    purple: "from-purple-500 to-purple-600"
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
};

export default AdminPage;
