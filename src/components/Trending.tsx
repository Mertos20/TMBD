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

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const BAND_HEIGHT = 300;

const Trending: React.FC = () => {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLUListElement>(null);
  const [bandWidth, setBandWidth] = useState(0);
  const [barsTop, setBarsTop] = useState(0);

  // Trending verisini çek
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/${period}?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        setItems(data.results || []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [period]);

  // Barların hizasını ve genişliğini hesapla
  useLayoutEffect(() => {
    const calc = () => {
      if (!listRef.current) return;

      // Sadece görünür liste kadar genişlik al
      const containerWidth = listRef.current.offsetWidth;
      setBandWidth(containerWidth);

      const firstPoster = listRef.current.querySelector(
        "[data-poster]"
      ) as HTMLDivElement | null;

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
    <section className=" w-[1528px] flex justify-center">
      <div className=" pt-[30px] w-[1300px]">
        {/* Başlık ve sekmeler */}
        <div className="flex items-center  px-10 h-[29.6px]">
          <h2 className="font-sans text-[24px] text-[rgb(0,0,0)] leading-[24px] font-semibold mr-5">
            Trending
          </h2>

          <div className="inline-flex items-center rounded-full border border-[#0d253f1a]">
            <Tab active={period === "day"} onClick={() => setPeriod("day")}>
              Today
            </Tab>
            <Tab active={period === "week"} onClick={() => setPeriod("week")}>
              This Week
            </Tab>
          </div>
        </div>

        <div className="relative mt-6 overflow-visible ">
          <BackgroundBars
            width={bandWidth}
            top={barsTop}
            height={BAND_HEIGHT}
            className="absolute left-0 z-[0]"
          />

          <ul
            ref={listRef}
            className="relative z-[10] flex w-full  overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth ml-10 scrollbar-hide"
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

export default Trending;

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-[6px] text-sm font-semibold transition-colors ${
        active
          ? "bg-[#0d253f] text-[#1ed5a9]"
          : "text-[#0d253f] hover:bg-[#0d253f0d]"
      }`}
    >
      {children}
    </button>
  );
}

function BackgroundBars({
  width,
  top,
  height,
  className = "",
}: {
  width: number;
  top: number;
  height: number;
  className?: string;
}) {
  const barWidth = 4; // daha ince barlar
  const gap = 5; // barlar arası boşluk azaltıldı

  const count = useMemo(
    () => Math.max(10, Math.floor(width / (barWidth + gap))),
    [width]
  );

  const bars = useMemo(() => {
    const arr: number[] = [];
    let seed = 20250724;
    for (let i = 0; i < count; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const rand = seed / 0x7fffffff;
      arr.push(80 + Math.round(rand * 40)); // 80px - 120px arası yükseklik
    }
    return arr;
  }, [count]);

  return (
    <div
      aria-hidden
      className={`absolute flex items-end ${className}`}
      style={{
        top: top - height, // tam film kartlarının altında biter
        width,
        height,
        overflow: "hidden",
        WebkitMaskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)",
        maskImage:
          "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 100%)",
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-t-full bg-[#1ed5a9] opacity-80"
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
