import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MovieCard from "./MovieCard";

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
  { label: "Movies", key: "movie" },
  { label: "TV", key: "tv" },
];

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

const Popular: React.FC = () => {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("movie");

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    async function fetchData() {
      let url = "";

      switch (activeTab) {
        case "movie":
          url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_watch_monetization_types=free&watch_region=US&sort_by=popularity.desc`;
          break;
        case "tv":
          url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_watch_monetization_types=free&watch_region=US&sort_by=popularity.desc`;
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
    <section className=" w-[1528px] h-[430.6px] flex justify-center">
      <div className="pt-[30px] w-[1300px] h-[430.6px]">
        
        <div className="flex items-center  px-10 h-[29.6px]">
          <h2 className="font-sans text-[24px] text-[rgb(0,0,0)] leading-[24px] font-semibold mr-5">
            Free To Watch
          </h2>

          <div className="flex  border-[0.8px] border-[rgb(0,0,0)] rounded-full overflow-x scrollbar-thin scrollbar-thumb-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-1 rounded-full text-sm leading-5 text-[16px] font-sans font-semibold transition-colors duration-200 ${
                  activeTab === tab.key
                    ? "bg-[#0d253f] text-[#1ed5a9]"
                    : "text-[rgb(0,0,0)]  hover:bg-[#0d253f0d]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-6 overflow-visible ">
          <ul
            ref={listRef}
            className="relative z-[10] flex w-full  overflow-x-auto overflow-y-hidden  scroll-smooth ml-10 scrollbar-hide"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className={` shrink-0 animate-pulse rounded-xl bg-slate-200 ${
                      i !== 0 ? "ml-5" : ""
                    }`}
                  />
                ))
              : items.map((item, i) => (
                  <li
                    key={item.id}
                    className={`shrink-0 snap-start ${i !== 0 ? "ml-5" : ""}`}
                  >
                    <MovieCard
                      posterPath={item.poster_path}
                      title={item.title || item.name || ""}
                      date={item.release_date || item.first_air_date || ""}
                      vote={item.vote_average}
                    />
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Popular;
