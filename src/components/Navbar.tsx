import React from "react";
import { useState } from "react";
import Logo from "../aspects/Logo2.png";

type NavbarProps = {
  onSearchClick: () => void;
};

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="bg-[#032541] w-full h-[64px] flex items-center justify-center">
      <div className="w-[1300px] h-[56px] flex items-center justify-between px-10">
        
       
        <div className="flex items-center h-[56px]">
          <a href="/">
            <img
              className="h-[20px] w-[154px] mr-4 sm:mr-4"
              src={Logo}
              alt="TMDB Logo"
            />
          </a>
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

            <li><a href="#" className="hover:text-[#01b4e4]">People</a></li>
            <li><a href="#" className="hover:text-[#01b4e4]">More</a></li>
          </ul>
        </div>

        
         <div className="hidden lg:flex items-center space-x-6">
          <button className="border border-white text-white rounded h-[26px] w-[28px] text-sm font-bold hover:bg-white hover:text-[#032541] transition">
            EN
          </button>
          <a href="#" className="text-white font-semibold hover:text-[#01b4e4]">Login</a>
          <a href="#" className="text-white font-semibold hover:text-[#01b4e4]">Join TMDB</a>
          <button onClick={onSearchClick}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="#01b4e4" strokeWidth="2" />
              <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#01b4e4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

      
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

      

      

     
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#032541] text-white px-4 pb-4">
          <ul className="flex flex-col space-y-2 font-semibold">
            <li><a href="/movie/popular">Movies - Popular</a></li>
            <li><a href="/tv/popular">TV Shows - Popular</a></li>
            <li><a href="#">People</a></li>
            <li><a href="#">More</a></li>
            <li><a href="#">Login</a></li>
            <li><a href="#">Join TMDB</a></li>
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
