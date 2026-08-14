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
  aiReason?: string;
  matchPercentage?: number;
}

const BAND_HEIGHT = 320;

const Recommendations: React.FC = () => {
  const { darkMode } = useTheme();
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [userSummary, setUserSummary] = useState<string>("");
  const listRef = useRef<HTMLUListElement>(null);
  const [bandWidth, setBandWidth] = useState(0);
  const [barsTop, setBarsTop] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buildRecommendations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const recentViewsStr = localStorage.getItem("recentViews") || "[]";
        let recentViews = [];
        try {
          recentViews = JSON.parse(recentViewsStr);
        } catch {}

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/api/recommendations/ai`, {
          method: "POST",
          headers,
          body: JSON.stringify({ recentViews }),
        });

        if (res.ok) {
          const data = await res.json();
          setUserSummary(data.userProfileSummary || "");
          setItems(data.recommendations || []);
        } else {
          console.error("AI Recommendation endpoint failed:", res.status);
        }
      } catch (err) {
        console.error("Error fetching AI recommendations:", err);
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
    <section className="w-full md:w-[1528px] flex justify-center mt-8">
      <div className="pt-6 md:pt-[30px] w-full md:w-[1300px] px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h2
                className={`font-sans text-xl md:text-[24px] leading-[24px] font-bold ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                AI Recommended For You
              </h2>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                Foundry Powered
              </span>
            </div>
            {userSummary && (
              <p className="text-xs text-[#1DB954] mt-1 font-mono flex items-center gap-1">
                <span>🤖 Profil Analizi:</span> {userSummary}
              </p>
            )}
          </div>
        </div>

        <div className="relative mt-6 overflow-visible">
          <BackgroundBars
            width={bandWidth}
            top={barsTop}
            height={BAND_HEIGHT}
            className="absolute left-0 z-[0]"
            darkMode={darkMode}
          />

          <ul
            ref={listRef}
            className="relative z-[10] flex w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth ml-0 md:ml-6 px-4 md:px-0 scrollbar-hide py-2"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li
                    key={i}
                    className={`w-[140px] md:w-[170px] h-[260px] shrink-0 animate-pulse rounded-2xl bg-slate-800/50 ${
                      i !== 0 ? "ml-3 md:ml-5" : ""
                    }`}
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
                        className="w-[140px] md:w-[170px] flex flex-col items-center group relative"
                      >
                        <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition duration-300 transform group-hover:-translate-y-1">
                          {item.poster_path ? (
                            <img
                              src={`${IMAGE_BASE}${item.poster_path}`}
                              alt={item.title || item.name}
                              className="w-[140px] md:w-[170px] h-[210px] object-cover rounded-xl"
                            />
                          ) : (
                            <div className="w-[140px] md:w-[170px] h-[210px] bg-neutral-800 rounded-xl flex items-center justify-center text-xs text-neutral-400">
                              Görsel Yok
                            </div>
                          )}

                          {item.matchPercentage && (
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-[#1DB954]/50 text-[#1DB954] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shadow-md">
                              %{item.matchPercentage} Uyum
                            </div>
                          )}
                        </div>

                        <p className="mt-2 text-sm font-semibold text-center truncate w-full px-1">
                          {item.title || item.name}
                        </p>

                        {item.aiReason && (
                          <p className="text-[10px] text-gray-400 text-center line-clamp-2 mt-0.5 px-1 italic">
                            "{item.aiReason}"
                          </p>
                        )}
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
