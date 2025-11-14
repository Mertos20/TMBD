import React, { useState } from "react";
import Logo from "../aspects/Logo2.png";
import { useNavigate } from "react-router-dom";

type NavbarProps = {
  onSearchClick: () => void;
};

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <nav className="bg-[#032541] w-full h-[64px] flex items-center justify-center">
      <div className="w-[1300px] h-[56px] flex items-center justify-between px-10">
        {/* Logo */}
        <div className="flex items-center h-[56px]">
          <a href="/">
            <img
              className="h-[20px] w-[154px] mr-4 sm:mr-4"
              src={Logo}
              alt="TMDB Logo"
            />
          </a>
          {/* Desktop Menü */}
          <ul className="flex items-center ml-8 h-[56px] space-x-6 text-white font-semibold">
            <li className="relative group h-full flex items-center">
              <a href="#" className="hover:text-[#01b4e4]">Movies</a>
              <ul className="absolute left-0 top-full bg-white text-black rounded shadow-lg w-40 hidden group-hover:block z-50">
                <li><a href="/movie/popular" className="block px-4 py-2 hover:bg-gray-100">Popular</a></li>
                <li><a href="/movie/now_playing" className="block px-4 py-2 hover:bg-gray-100">Now Playing</a></li>
                <li><a href="/movie/upcoming" className="block px-4 py-2 hover:bg-gray-100">Upcoming</a></li>
                <li><a href="/movie/top_rated" className="block px-4 py-2 hover:bg-gray-100">Top Rated</a></li>
              </ul>
            </li>
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

        {/* Sağ Menü */}
        <div className="hidden lg:flex items-center space-x-6">
          <button className="border border-white text-white rounded h-[26px] w-[28px] text-sm font-bold hover:bg-white hover:text-[#032541] transition">
            EN
          </button>

          {userId ? (
            <>
              {/* Profil */}
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-[#01b4e4] transition"
                title="Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#01b4e4"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A8.962 8.962 0 0112 15c2.21 0 4.21.896 5.879 2.346M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Logout */}
              <button onClick={handleLogout} className="hover:text-[#01b4e4] transition ml-4">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#01b4e4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="text-white font-semibold hover:text-[#01b4e4]">Login</a>
              <a href="/signup" className="text-white font-semibold hover:text-[#01b4e4]">Join TMDB</a>
            </>
          )}

          {/* Arama */}
          <button onClick={onSearchClick}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="#01b4e4" strokeWidth="2" />
              <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#01b4e4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobil Menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#032541] text-white px-4 pb-4">
          <ul className="flex flex-col space-y-2 font-semibold">
            <li><a href="/movie/popular">Movies - Popular</a></li>
            <li><a href="/tv/popular">TV Shows - Popular</a></li>
            <li><a href="#">People</a></li>
            <li><a href="#">More</a></li>

            {userId ? (
              <li className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:text-[#01b4e4]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#01b4e4"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.121 17.804A8.962 8.962 0 0112 15c2.21 0 4.21.896 5.879 2.346M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:text-[#01b4e4]"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#01b4e4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li><a href="/login">Login</a></li>
                <li><a href="/signup">Join TMDB</a></li>
              </>
            )}

            <li>
              <button onClick={onSearchClick} className="flex items-center gap-2 mt-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" stroke="#01b4e4" strokeWidth="2" />
                  <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#01b4e4" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Search</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
