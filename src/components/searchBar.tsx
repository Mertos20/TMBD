import React, { forwardRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = forwardRef<HTMLInputElement>((props, ref) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const navigate = useNavigate();

  const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80"; 

  useEffect(() => {
    if (query.length >= 3) {
      fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1&include_adult=false`
      )
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(data.results || []);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (title: string) => {
    navigate(`/search?query=${encodeURIComponent(title)}`);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full w-[1528px] h-[46px] flex justify-center items-center bg-white py-2">
      <form
        onSubmit={handleSearch}
        className="flex items-center w-full max-w-[1300px] h-[44px] shadow-sm pl-10 rounded bg-white relative"
      >
        <svg
          className="mr-3"
          width="24"
          height="20"
          viewBox="0 0 20 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="7" stroke="#212529" strokeWidth="3" />
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
          ref={ref}
          type="text"
          placeholder="Search for a movie..."
          className="w-full outline-none border-none bg-transparent text-gray-700 placeholder-gray-400 text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {suggestions.length > 0 && (
        <ul className="absolute top-[46px] left-1/2 -translate-x-1/2 bg-white shadow-md w-[1300px] max-h-[300px] overflow-y-auto z-50">
          {suggestions.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSuggestionClick(item.title)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";
export default SearchBar;
