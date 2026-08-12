import React, { useEffect, useState, useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemaContext";
import { API_URL } from "../config/api";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";
const API_KEY = "d0b51a37ed5a34284904dab55afbc04c";

interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number | null;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
}

interface Favorite {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
  genre_ids?: number[];
}

interface Watchlist {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
  genre_ids?: number[];
}

const BAND_HEIGHT = 300;

const Recommendations: React.FC = () => {
  const { darkMode } = useTheme();
  const [items, setItems] = useState<TMDBItem[]>([]);
  const listRef = useRef<HTMLUListElement>(null);
  const [bandWidth, setBandWidth] = useState(0);
  const [barsTop, setBarsTop] = useState(0);
  const [loading, setLoading] = useState(true);

  // Favorites ve Watchlist backend’den çek
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return { favorites: [] as Favorite[], watchlist: [] as Watchlist[], ratings: [] as any[] };

      const [favRes, watchRes, ratingsRes] = await Promise.all([
        fetch(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/watchlists`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ratings/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const favorites: Favorite[] = await favRes.json();
      const watchlist: Watchlist[] = await watchRes.json();
      const ratings: any[] = await ratingsRes.json();
      return { favorites, watchlist, ratings };
    } catch (err) {
      console.error(err);
      return { favorites: [], watchlist: [], ratings: [] };
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent !== "true") {
      setLoading(false);
      return;
    }

    const buildRecommendations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
          setItems([]);
          return;
        }

        const { favorites, watchlist } = await fetchUserData();
        const all = [...favorites, ...watchlist];

        const genreCount: Record<number, number> = {};
        let movieCount = 0;
        let tvCount = 0;
        const years: number[] = [];

        // Enrich with minimal TMDB data if missing
        const enrichIfNeeded = async (item: Favorite | Watchlist) => {
          const hasGenres = item.genre_ids && item.genre_ids.length > 0;
          const hasYear = (item as any).release_date || (item as any).first_air_date;
          if (hasGenres && hasYear) return item as any;
          try {
            const type = item.media_type || (item.name ? "tv" : "movie");
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${item.movieId}?api_key=${API_KEY}&language=en-US`);
            const data = await res.json();
            return {
              ...item,
              genre_ids: data.genres ? data.genres.map((g: any) => g.id) : item.genre_ids,
              release_date: data.release_date,
              first_air_date: data.first_air_date,
            } as any;
          } catch {
            return item as any;
          }
        };

        const enriched = await Promise.all(all.map(enrichIfNeeded));

        enriched.forEach((it: any) => {
          const type = it.media_type || (it.name ? "tv" : "movie");
          if (type === "movie") movieCount++; else tvCount++;
          (it.genre_ids || []).forEach((gid: number) => {
            genreCount[gid] = (genreCount[gid] || 0) + 1;
          });
          const yStr = it.release_date || it.first_air_date;
          if (typeof yStr === "string" && yStr.length >= 4) {
            const y = parseInt(yStr.slice(0, 4));
            if (!isNaN(y)) years.push(y);
          }
        });

        const topGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([gid]) => gid)
          .join(",");

        let yearPref: number | undefined;
        if (years.length) {
          const sorted = years.slice().sort((a, b) => a - b);
          yearPref = sorted[Math.floor(sorted.length / 2)];
        }

        const excludedIds = new Set(enriched.map((it: any) => it.movieId));

        const baseMovie = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&vote_count.gte=50`;
        const baseTV = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&vote_count.gte=50`;
        const movieUrl = `${baseMovie}${topGenres ? `&with_genres=${topGenres}` : ""}${yearPref ? `&primary_release_year=${yearPref}` : ""}`;
        const tvUrl = `${baseTV}${topGenres ? `&with_genres=${topGenres}` : ""}${yearPref ? `&first_air_date_year=${yearPref}` : ""}`;
        const queries: { url: string; type: "movie" | "tv" }[] = [
          { url: movieUrl, type: "movie" },
          { url: tvUrl, type: "tv" },
        ];
        if (tvCount > movieCount) queries.reverse();

        const results: TMDBItem[] = [];
        for (const q of queries) {
          try {
            const res = await fetch(q.url);
            const data = await res.json();
            const mapped = (data.results || []).map((it: any) => ({
              id: it.id,
              title: it.title,
              name: it.name,
              release_date: it.release_date,
              first_air_date: it.first_air_date,
              poster_path: it.poster_path,
              vote_average: it.vote_average,
              media_type: q.type,
              genre_ids: it.genre_ids,
            }));
            for (const m of mapped) {
              if (excludedIds.has(m.id)) continue;
              if (!results.find(r => r.id === m.id)) results.push(m);
              if (results.length >= 10) break;
            }
            if (results.length >= 10) break;
          } catch (err) {
            console.error("Discover fetch failed", err);
          }
        }

        if (results.length < 10) {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}&language=en-US`);
            const data = await res.json();
            const mapped = (data.results || []).map((it: any) => ({
              id: it.id,
              title: it.title,
              name: it.name,
              release_date: it.release_date,
              first_air_date: it.first_air_date,
              poster_path: it.poster_path,
              vote_average: it.vote_average,
              media_type: it.media_type as "movie" | "tv",
              genre_ids: it.genre_ids,
            }));
            for (const m of mapped) {
              if (excludedIds.has(m.id)) continue;
              if (!results.find(r => r.id === m.id)) results.push(m);
              if (results.length >= 10) break;
            }
          } catch (err) {
            console.error("Trending fetch failed", err);
          }
        }

        setItems(results.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    buildRecommendations();
  }, []);

  const consent = localStorage.getItem("cookieConsent");
  if (consent !== "true") return null;

  // Yeşil bar yüksekliği hesapla
  useLayoutEffect(() => {
    const calc = () => {
      if (!listRef.current) return;
      const containerWidth = listRef.current.offsetWidth;
      setBandWidth(containerWidth);

      const firstPoster = listRef.current.querySelector("[data-poster]") as HTMLDivElement | null;
      if (firstPoster) {
        const UL_PADDING_TOP = 32;
        const ADJUST = 20;
        setBarsTop(firstPoster.offsetHeight + UL_PADDING_TOP + ADJUST);
      }
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [items]);

  return (
    <section className="w-full md:w-[1528px] flex justify-center mt-6">
      <div className="pt-6 md:pt-[30px] w-full md:w-[1300px]">
        <h2 className={`font-sans text-xl md:text-[24px] leading-[24px] font-semibold ${darkMode ? "text-white" : "text-black"}`}>
          Recommendations for you
        </h2>

        <div className="relative mt-6 overflow-visible">
          <BackgroundBars width={bandWidth} top={barsTop} height={BAND_HEIGHT} className="absolute left-0 z-[0]" darkMode={darkMode} />

          <ul
            ref={listRef}
            className="relative z-[10] flex w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth ml-0 md:ml-10 px-4 md:px-0 scrollbar-hide"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className={`w-[120px] h-[180px] md:w-auto md:h-auto shrink-0 animate-pulse rounded-xl bg-slate-200 ${i !== 0 ? "ml-3 md:ml-5" : ""}`}
                  />
                ))
              : items.map((item, i) => (
                  <li
                    key={item.id}
                    className={`shrink-0 snap-start ${i !== 0 ? "ml-3 md:ml-5" : ""}`}
                  >
                    <Link to={`/${item.media_type || (item.name ? "tv" : "movie")}/${item.id}`}>
                      <div
                        data-poster
                        className="w-[120px] md:w-[150px] flex flex-col items-center"
                      >
                        {item.poster_path ? (
                          <img
                            src={`${IMAGE_BASE}${item.poster_path}`}
                            alt={item.title || item.name}
                            className="rounded-xl shadow-md hover:shadow-xl transition"
                          />
                        ) : (
                          <div className="w-[120px] md:w-[150px] h-[180px] bg-gray-600 rounded-xl" />
                        )}
                        <p className="mt-2 text-sm text-center">{item.title || item.name}</p>
                      </div>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Recommendations;

function BackgroundBars({ width, top, height, className = "", darkMode }: { width: number; top: number; height: number; className?: string; darkMode: boolean }) {
  const barWidth = 4;
  const gap = 5;

  const count = useMemo(() => Math.max(10, Math.floor(width / (barWidth + gap))), [width]);

  const bars = useMemo(() => {
    const arr: number[] = [];
    let seed = 20250724;
    for (let i = 0; i < count; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const rand = seed / 0x7fffffff;
      arr.push(80 + Math.round(rand * 40));
    }
    return arr;
  }, [count]);

  return (
    <div
      aria-hidden
      className={`absolute flex items-end ${className}`}
      style={{
        top: top - height,
        width,
        height,
        overflow: "hidden",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)",
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className={`rounded-t-full ${darkMode ? "bg-white/50" : "bg-[#1ed5a9]"} opacity-80`}
          style={{
            width: barWidth,
            height: h,
            marginLeft: i === 0 ? 0 : gap,
          }}
        />
      ))}
    </div>
  );
}
