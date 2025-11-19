import React, { useState } from "react";
import Logo from "../aspects/Logo2.png";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaRegMoon } from "react-icons/fa";
import { useTheme } from "./ThemaContext";

type NavbarProps = { onSearchClick: () => void };

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="bg-[#032541] w-full h-[64px] flex items-center justify-center">
        <div className="w-[1300px] h-[56px] flex items-center justify-between px-10">
          
          {/* Logo + Desktop Menu */}
          <div className="flex items-center h-[56px]">
            <a href="/">
              <img className="h-[20px] w-[154px] mr-4" src={Logo} alt="TMDB Logo" />
            </a>

            {/* Desktop Menu */}
            <ul className={`hidden lg:flex items-center ml-8 h-[56px] space-x-6 font-semibold text-white`}>
              
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
            ) : (
              <>
                <a href="/login" className="font-semibold hover:text-[#01b4e4]">Login</a>
                <a href="/signup" className="font-semibold hover:text-[#01b4e4]">Join TMDB</a>
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
