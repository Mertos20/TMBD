import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../aspects/Hero4.png";

type HeroProps = {
  onSearch?: (q: string) => void;
  
};

export default function Hero({ onSearch }: HeroProps) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [bgIndex, setBgIndex] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem("username") || "");
  const [backgrounds, setBackgrounds] = useState<string[]>([heroBg]);

  const API_KEY = "d0b51a37ed5a34284904dab55afbc04c";

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`)
      .then((res) => res.json())
      .then((data) => {
        const paths = data.results
          .filter((m: any) => m.backdrop_path)
          .map((m: any) => `https://image.tmdb.org/t/p/original${m.backdrop_path}`);
        
        if (paths.length > 0) {
          setBackgrounds(paths);
        }
      })
      .catch((err) => console.error("Hero background fetch error:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000); // 5 saniyede bir değişim
    return () => clearInterval(interval);
  }, [backgrounds]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;

    onSearch?.(trimmed);
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative w-full h-auto md:h-[300px] overflow-hidden py-[30px] px-4 md:px-10">
      {/* Background */}
      <img
        src={backgrounds[bgIndex]}
        alt="hero"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <div className="absolute inset-0 bg-[#01b4e4] mix-blend-multiply opacity-[0.84]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#032541]/70 via-[#032541]/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1300px] w-full px-4 pt-6 pb-6 h-auto md:h-[240px]">
        
        {/* TEXT AREA */}
        <div className="mb-4 w-full max-w-[1220px]">
          <p className="text-white font-bold tracking-[-0.02em] text-3xl sm:text-4xl md:text-[48px] m-0 leading-tight">
            {userName ? (
              <>
                Welcome{" "}
                <span className="bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] bg-clip-text text-transparent">
                  {userName}
                </span>
                .
              </>
            ) : (
              <span className="bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] bg-clip-text text-transparent">
                Welcome.
              </span>
            )}
          </p>

          <p className="text-white font-semibold text-base sm:text-xl md:text-[30px] m-0 leading-tight">
            Millions of movies, TV shows and people to discover. Explore now.
          </p>
        </div>

        {/* Search */}
        <div className="pt-6 w-full max-w-[1220px]">
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row gap-2 h-auto sm:h-[48px] w-full items-center overflow-hidden rounded-full bg-white pl-4 sm:pl-6 shadow-[0_6px_16px_rgba(3,37,65,0.2)]"
          >
            <input
              aria-label="search"
              className="flex-1 bg-transparent text-[16px] text-[#2c3e50] placeholder:text-[#9aa4b1] outline-none h-[48px]"
              placeholder="Search for a movie, tv show, person......"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <button
              type="submit"
              className="h-[48px] px-6 rounded-full bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#01b4e4]/50 w-full sm:w-auto"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}