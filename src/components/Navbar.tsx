import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config/api";
import { FaMoon, FaRegMoon, FaBell } from "react-icons/fa";
import { useTheme } from "./ThemaContext";

type NavbarProps = { onSearchClick: () => void };

interface Notification {
  _id: string;
  sender?: { _id: string; username: string };
  type: "follow" | "follow_request" | "follow_accepted" | "report" | "warning";
  message?: string;
  read: boolean;
  createdAt: string;
}

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    window.location.href = "/login";
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="bg-[#032541] w-full h-[64px] flex items-center justify-center relative z-50">
        <div className="w-[1300px] h-[56px] flex items-center justify-between px-10">
          
          {/* Logo + Desktop Menu */}
          <div className="flex items-center h-[56px]">
            <a href="/" className="flex items-center gap-2 mr-4">
              <div className="flex items-center">
                <span className="text-2xl font-black bg-gradient-to-r from-[#01b4e4] to-[#90cea1] bg-clip-text text-transparent">
                  Movi
                </span>
                <span className="text-2xl font-black text-white">base</span>
                <span className="ml-2 text-xs font-bold bg-[#01b4e4] text-[#032541] px-1.5 py-0.5 rounded">
                  MVB
                </span>
              </div>
            </a>

            {/* Desktop Menu */}
            <ul className={`hidden lg:flex items-center ml-8 h-[56px] space-x-6 font-semibold text-white`}>
              
              {/* Admin sees only Admin Panel */}
              {isAdmin ? (
                <li className="h-full flex items-center">
                  <a href="/admin" className="hover:text-[#01b4e4] font-bold text-yellow-400">
                    🛡️ Admin Panel
                  </a>
                </li>
              ) : (
                <>
                  {/* Movies */}
                  <li className="relative group h-full flex items-center">
                    <a href="#" className="hover:text-[#01b4e4]">Movies</a>
                    <ul className="absolute left-0 top-full bg-white text-black rounded shadow-lg w-40 hidden group-hover:block z-50">
                      <li><a href="/movie/popular" className="block px-4 py-2 hover:bg-gray-100">Popular</a></li>
                      <li><a href="/movie/now_playing" className="block px-4 py-2 hover:bg-gray-100">Now Playing</a></li>
                      <li><a href="/movie/upcoming" className="block px-4 py-2 hover:bg-gray-100">Upcoming</a></li>
                      <li><a href="/movie/top_rated" className="block px-4 py-2 hover:bg-gray-100">Top Rated</a></li>
                    </ul>
                  </li>

                  {/* TV Shows */}
                  <li className="relative group h-full flex items-center">
                    <a href="#" className="hover:text-[#01b4e4]">TV Shows</a>
                    <ul className="absolute left-0 top-full bg-white text-black rounded shadow-lg w-40 hidden group-hover:block z-50">
                      <li><a href="/tv/popular" className="block px-4 py-2 hover:bg-gray-100">Popular</a></li>
                      <li><a href="/tv/airing_today" className="block px-4 py-2 hover:bg-gray-100">Airing Today</a></li>
                      <li><a href="/tv/on_tv" className="block px-4 py-2 hover:bg-gray-100">On TV</a></li>
                      <li><a href="/tv/top_rated" className="block px-4 py-2 hover:bg-gray-100">Top Rated</a></li>
                    </ul>
                  </li>

                  {/* Duel */}
                  <li className="h-full flex items-center">
                    <a href="/duel" className="hover:text-[#01b4e4] font-bold bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
                      Duel
                    </a>
                  </li>

                  {/* Social */}
                  <li className="h-full flex items-center">
                    <a href="/social" className="hover:text-[#01b4e4]">Social</a>
                  </li>

                  {/* Guide */}
                  <li className="h-full flex items-center">
                    <a href="/guide" className="hover:text-[#01b4e4]">Guide</a>
                  </li>
                </>
              )}

            </ul>
          </div>

          {/* Right Side Desktop */}
          <div className="hidden lg:flex items-center space-x-6 text-white">

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition ${darkMode ? "bg-white text-black" : "bg-[#032541] text-white"}`}
            >
              {darkMode ? <FaMoon /> : <FaRegMoon />}
            </button>

            {/* If logged in */}
            {userId ? (
              <>
                {/* Admin only sees logout */}
                {isAdmin ? (
                  <button onClick={handleLogout} className="hover:text-[#01b4e4] flex items-center gap-2">
                    <svg width="24" height="24" fill="none" stroke="#01b4e4" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span className="text-sm">Logout</span>
                  </button>
                ) : (
                  <>
                    {/* Notifications */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-1 hover:text-[#01b4e4]"
                      >
                        <FaBell size={20} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white text-black rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
                          <div className="p-2 bg-gray-100 font-bold text-sm border-b">Notifications</div>
                          <ul className="max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <li className="p-4 text-sm text-gray-500 text-center">No notifications</li>
                            ) : (
                              notifications.map((n) => (
                                <li 
                                  key={n._id} 
                                  className={`p-3 border-b text-sm hover:bg-gray-50 cursor-pointer ${!n.read ? "bg-blue-50" : ""}`}
                                  onClick={() => {
                                    markAsRead(n._id);
                                    if (n.type === "follow_request") {
                                      navigate("/profile");
                                      setShowNotifications(false);
                                    } else if (n.type === "report") {
                                      navigate("/admin");
                                      setShowNotifications(false);
                                    } else if (n.type === "warning") {
                                      navigate("/profile");
                                      setShowNotifications(false);
                                    } else {
                                      navigate(`/profile/${n.sender?._id}`);
                                      setShowNotifications(false);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    {n.type === "follow_request" && <span className="text-yellow-500">📩</span>}
                                    {n.type === "follow" && <span className="text-blue-500">👤</span>}
                                    {n.type === "follow_accepted" && <span className="text-green-500">✅</span>}
                                    {n.type === "report" && <span className="text-red-500">⚠️</span>}
                                    {n.type === "warning" && <span className="text-orange-500">🚨</span>}
                                    <span>
                                      {n.type === "follow" && (
                                        <>
                                          <span className="font-bold">{n.sender?.username || "User"}</span>
                                          {" started following you."}
                                        </>
                                      )}
                                      {n.type === "follow_request" && (
                                        <>
                                          <span className="font-bold">{n.sender?.username || "User"}</span>
                                          {" sent you a follow request."}
                                        </>
                                      )}
                                      {n.type === "follow_accepted" && (
                                        <>
                                          <span className="font-bold">{n.sender?.username || "User"}</span>
                                          {" accepted your follow request."}
                                        </>
                                      )}
                                      {n.type === "report" && (
                                        <>
                                          <span className="font-bold">Admin</span>
                                          {" reviewed a report."}
                                        </>
                                      )}
                                      {n.type === "warning" && (
                                        <span>{n.message || "You have received a warning."}</span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </div>
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button onClick={() => navigate("/profile")} className="hover:text-[#01b4e4]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="#01b4e4" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8.962 8.962 0 0112 15c2.21 0 4.21.896 5.879 2.346M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    <button onClick={handleLogout} className="hover:text-[#01b4e4]">
                      <svg width="24" height="24" fill="none" stroke="#01b4e4" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <a href="/login" className="font-semibold hover:text-[#01b4e4]">Login</a>
                <a href="/signup" className="font-semibold hover:text-[#01b4e4]">Join Movibase</a>
              </>
            )}

            {/* Search */}
            <button onClick={onSearchClick}>
              <svg width="28" height="28" fill="none">
                <circle cx="11" cy="11" r="7" stroke="#01b4e4" strokeWidth="2" />
                <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#01b4e4" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ✅ MOBILE MENU BURADA */}
      {mobileMenuOpen && (
  <div className="lg:hidden bg-[#032541] text-white px-10 py-4 space-y-4">

    {/* Mobile Dark Mode Toggle */}
    <button
      onClick={toggleDarkMode}
      className="w-full text-left py-2 hover:text-[#01b4e4]"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>

    <a href="/movie/popular" className="block hover:text-[#01b4e4]">Popular Movies</a>
    <a href="/movie/now_playing" className="block hover:text-[#01b4e4]">Now Playing</a>
    <a href="/movie/upcoming" className="block hover:text-[#01b4e4]">Upcoming</a>
    <a href="/movie/top_rated" className="block hover:text-[#01b4e4]">Top Rated Movies</a>

    <hr className="border-white/20" />

    <a href="/tv/popular" className="block hover:text-[#01b4e4]">Popular TV</a>
    <a href="/tv/top_rated" className="block hover:text-[#01b4e4]">Top Rated TV</a>

    <hr className="border-white/20" />

    {userId ? (
      <>
        <a href="/profile" className="block hover:text-[#01b4e4]">Profile</a>
        <button onClick={handleLogout} className="block w-full text-left hover:text-[#01b4e4]">Logout</button>
      </>
    ) : (
      <>
        <a href="/login" className="block hover:text-[#01b4e4]">Login</a>
        <a href="/signup" className="block hover:text-[#01b4e4]">Join TMDB</a>
      </>
    )}

    <button onClick={onSearchClick} className="block hover:text-[#01b4e4]">
      Search
    </button>
  </div>
)}

    </>
  );
};

export default Navbar;
