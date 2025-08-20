import React, { useEffect, useState, useRef } from "react";
import TrailerCard from "./TrailerCard";
import VideoModal from "./VideoModal";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

interface Item {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;
  poster_path: string;
  media_type: "movie" | "tv";
}

const tabs = [
  { label: "Popular", key: "popular" },
  { label: "Streaming", key: "now_playing" },
  { label: "On TV", key: "tv_on_the_air" },
  { label: "For Rent", key: "movie_upcoming" },
  { label: "In Theaters", key: "in_theaters" },
];

export default function TrailerSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [bgBackdrop, setBgBackdrop] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("popular");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollAtStart, setScrollAtStart] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    setScrollAtStart(scrollContainerRef.current.scrollLeft === 0);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (!container) return;
      setScrollAtStart(container.scrollLeft === 0);
    };

    // (modal açıkken)
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Veri çekme
    async function fetchData() {
      let url = "";

      switch (activeTab) {
        case "popular":
          url = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;
          break;
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

      if (filtered[0]?.backdrop_path) {
        setBgBackdrop(
          `https://image.tmdb.org/t/p/original${filtered[0].backdrop_path}`
        );
      } else {
        setBgBackdrop(null);
      }

      if (container) {
        container.scrollLeft = 0;
      }
    }

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    fetchData();

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      document.body.style.overflow = "";
    };
  }, [activeTab, selectedVideo]);

  const onHover = (backdrop: string | null) => {
    if (backdrop) {
      setBgBackdrop(`https://image.tmdb.org/t/p/original${backdrop}`);
    }
  };

  const onCardClick = async (item: Item) => {
    const res = await fetch(
      `https://api.themoviedb.org/3/${item.media_type}/${item.id}/videos?api_key=${API_KEY}`
    );
    const data = await res.json();

    const trailer = data.results.find(
      (v: any) => v.type === "Trailer" && v.site === "YouTube"
    );

    if (trailer) {
      setSelectedVideo(trailer.key);
    }
  };

  return (
   <section className="relative w-full md:w-[1528px] h-auto md:h-[353.34px] overflow-hidden text-white">
  <div className="flex justify-center">
    <div
      className={`absolute right-0 top-0 h-full w-16 z-20 pointer-events-none transition-opacity duration-300 
      ${scrollAtStart ? "opacity-100" : "opacity-0"}`}
      style={{
        background:
          "linear-gradient(to left, rgba(255,255,255,0.6), transparent)",
      }}
    ></div>

    {bgBackdrop && (
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${bgBackdrop})`,
        }}
      >
        <div className="absolute inset-0 bg-[#0d253f] bg-opacity-70 backdrop-blur-sm" />
      </div>
    )}

    <div className="relative z-10 pt-6 md:pt-[30px] w-full md:w-[1300px] h-auto md:h-[353.34px] px-4 md:px-0">
      <div className="flex flex-col md:flex-row flex-wrap md:items-center w-full md:w-[1300px] h-auto md:h-[29.6px] space-y-3 md:space-y-0 md:px-10">
        <h2
          className="text-xl md:text-[24px] font-semibold md:mr-5 leading-[24px]"
          style={{ fontFamily: '"Source Sans Pro", Arial, sans-serif' }}
        >
          Latest Trailers
        </h2>
        <div className="flex flex-wrap border border-[rgb(30,213,169)] rounded-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 md:px-5 py-1 rounded-full text-sm text-[14px] md:text-[16px] font-semibold h-[28px] transition ${
                activeTab === tab.key ? "bg-teal-400 text-black" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex w-full md:w-[1300px] h-auto md:h-[293.74px] overflow-x-auto py-4 md:py-5 ml-0 md:ml-4 scrollbar-thin scrollbar-hide"
      >
        {items.map((item) => (
          <TrailerCard
            key={item.id}
            item={item}
            onHover={() => onHover(item.backdrop_path)}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
    </div>

    {selectedVideo && (
      <VideoModal
        videoId={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    )}
  </div>
</section>
  );
}
