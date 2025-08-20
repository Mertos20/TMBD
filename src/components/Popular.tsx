import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MovieCard from "./MovieCard";
import { Link } from "react-router-dom";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number | null;
  media_type?: "movie" | "tv" | "person";
}

const tabs = [
  { label: "Streaming", key: "now_playing" },
  { label: "On TV", key: "tv_on_the_air" },
  { label: "For Rent", key: "movie_upcoming" },
  { label: "In Theaters", key: "in_theaters" },
];

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

const Popular: React.FC = () => {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("now_playing");

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    async function fetchData() {
      let url = "";

      switch (activeTab) {
        case "now_playing":
          url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`;
          break;
        case "tv_on_the_air":
          url = `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}`;
          break;
        case "movie_upcoming":
          url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`;
          break;
        case "in_theaters":
          url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&region=US`;
          break;
      }

      const res = await fetch(url);
      const data = await res.json();

      const filtered = (data.results || [])
        .filter(
          (i: any) =>
            i.media_type === "movie" ||
            i.media_type === "tv" ||
            i.title ||
            i.name
        )
        .map((item: any) => ({
          ...item,
          media_type: item.media_type || (item.name ? "tv" : "movie"),
        }));

      setItems(filtered);
    }

    fetchData();
  }, [activeTab]);

  return (
   <section className="w-full md:w-[1528px] md:h-[430.6px] flex justify-center">
  <div className="pt-5 md:pt-[30px] w-full md:w-[1300px] h-auto md:h-[430.6px] px-4 md:px-0">
    <div className="flex flex-col md:flex-row items-start md:items-center px-0 md:px-10 space-y-4 md:space-y-0 md:h-[29.6px]">
      <h2 className="font-sans text-xl md:text-[24px] text-black leading-[24px] font-semibold mr-0 md:mr-5">
        What's Popular
      </h2>

      <div className="flex flex-wrap md:flex-nowrap border border-black rounded-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 md:px-5 py-1 rounded-full text-sm leading-5 text-[14px] md:text-[16px] font-sans font-semibold transition-colors duration-200 ${
              activeTab === tab.key
                ? "bg-[#0d253f] text-[#1ed5a9]"
                : "text-black hover:bg-[#0d253f0d]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>

    <div className="relative mt-4 md:mt-6 overflow-visible">
      <ul
        ref={listRef}
        className="relative z-[10] flex w-full overflow-x-auto overflow-y-hidden scroll-smooth ml-0 md:ml-10 scrollbar-hide"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li
                key={i}
                className={`w-[120px] h-[180px] md:w-auto md:h-auto shrink-0 animate-pulse rounded-xl bg-slate-200 ${
                  i !== 0 ? "ml-3 md:ml-5" : ""
                }`}
              />
            ))
          : items.map((item, i) => (
              <li
                key={item.id}
                className={`shrink-0 snap-start ${i !== 0 ? "ml-3 md:ml-5" : ""}`}
              >
                <Link to={`/${item.media_type}/${item.id}`}>
                  <MovieCard
                    posterPath={item.poster_path}
                    id={item.id}
                    title={item.title || item.name || ""}
                    date={item.release_date || item.first_air_date || ""}
                    vote={item.vote_average}
                    type={item.media_type as "movie" | "tv"}
                  />
                </Link>
              </li>
            ))}
      </ul>
    </div>
  </div>
</section>
  );
};

export default Popular;
