import React from "react";
import Logo from "../aspects/Logo2.png";

const Navbar = () => {
  return (
   
    <nav className="w-[1528px] bg-[#032541] h-[64px] flex items-center justify-center">
      
      <div className="w-[1300px] h-[56px] flex items-center justify-between fonts-size-[16px]">
        
        <div className="flex items-center h-[56px]">
          <a href="/">
            <img className="h-[20px] w-[154px]" src={Logo} alt="" />
          </a>
         <ul className="flex items-center ml-8 h-[56px] py-2">
            <li>
              <a href="#" className="text-white font-semibold hover:text-[#01b4e4]">Movies</a>
            </li>
            <li>
              <a href="#" className="ml-4 text-white font-semibold hover:text-[#01b4e4]">TV Shows</a>
            </li>
            <li>
              <a href="#" className="ml-4 text-white font-semibold hover:text-[#01b4e4]">People</a>
            </li>
            <li>
              <a href="#" className="ml-4 text-white font-semibold hover:text-[#01b4e4]">More</a>
            </li>
          </ul>
        </div>

        
        <div className="flex items-center h-[56px]">
         
           <ul className="flex items-center h-[34px]">
          <li>
  <button className="flex items-center justify-center w-8 h-8">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g opacity="0.72">
        <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </button>
</li>
          <li>
            <button className="border border-white text-white rounded  h-[26px] w-[28px] text-sm font-bold hover:bg-white hover:text-[#032541] transition ml-8">EN</button>
          </li>
          <li>
            <a href="#" className="text-white font-semibold hover:text-[#01b4e4] ml-8">Login</a>
          </li>
          <li>
            <a href="#" className="text-white font-semibold hover:text-[#01b4e4] ml-8">Join TMDB</a>
          </li>
          <li>
            <button className="ml-8">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="#01b4e4" strokeWidth="2" />
                <line
                  x1="16.65"
                  y1="16.65"
                  x2="22"
                  y2="22"
                  stroke="#01b4e4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </li>
        </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
