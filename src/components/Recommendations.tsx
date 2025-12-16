import React, { useEffect, useState, useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemaContext";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

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
        fetch("http://localhost:5000/api/favorites", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/watchlists", { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:5000/api/ratings/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
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
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const { favorites, watchlist, ratings } = await fetchUserData();
        
        // 1. LocalStorage'dan View Stats al (1x Weight)
        const genreStats = JSON.parse(localStorage.getItem("genreStats") || "{}");
        const genreScores: Record<number, number> = { ...genreStats };

        // 2. Son etkileşimlerin detaylarını çekip türlerini puanla
        const recentInteractions = [
          ...favorites.slice(-5).map(i => ({ id: i.movieId, weight: 10 })), // Fav: 10x
          ...watchlist.slice(-5).map(i => ({ id: i.movieId, weight: 5 })),  // Watchlist: 5x
          ...ratings.slice(-5).map(i => ({ id: i.movieId, weight: i.rating >= 4 ? 8 : (i.rating <= 2 ? -5 : 2) })) // Rating: Dynamic
        ];

        // Detayları çek (Genre ID'leri için)
        await Promise.all(recentInteractions.map(async (item) => {
          try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`);
            const data = await res.json();
            data.genres?.forEach((g: any) => {
              genreScores[g.id] = (genreScores[g.id] || 0) + item.weight;
            });
          } catch (e) { console.error(e); }
        }));

        // En yüksek puanlı 3 türü bul
        const topGenres = Object.entries(genreScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([g]) => g)
          .join(",");

        // Eğer genre yoksa popüler filmleri al
        const url = topGenres
          ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${topGenres}&sort_by=popularity.desc&language=en-US&page=1`
          : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

        const res = await fetch(url);
        const data = await res.json();
        
        // Kullanıcının zaten bildiği filmleri filtrele
        const knownIds = new Set([
          ...favorites.map(f => f.movieId),
          ...watchlist.map(w => w.movieId),
          ...ratings.map(r => r.movieId)
        ]);

        const filtered = (data.results || []).filter((m: any) => !knownIds.has(m.id));
        setItems(filtered);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

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
          Sizin İçin Seçtiklerimiz
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
                    <Link to={`/movie/${item.id}`}>
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
