import React from "react";

const SearchBar = () => {
  return (
    <div className="w-full bg-white flex items-center h-[45.6px] w-[1300px] pl-20">
    <div className="w-full bg-white flex items-center h-[44px] w-[1220px] px-10 shadow-sm">
      {/* Search Icon */}
      <svg
        className="mr-3"
        width="24"
        height="20"
        viewBox="0 0 20 24"
        fill="none"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="#212529"
          strokeWidth="3"
        />
        <line
          x1="16.65"
          y1="16.65"
          x2="22"
          y2="22"
          stroke="#212529"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      
      <input
        type="text"
        placeholder="Search for a movie, tv show, person..."
        className="w-full outline-none border-none bg-transparent text-gray-700 placeholder-gray-400 text-l w-[1220px] h-[20px]"
      />
    </div>
    </div>
  );
};

export default SearchBar;
