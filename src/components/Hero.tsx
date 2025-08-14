import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../aspects/Hero4.png";

type HeroProps = {
  onSearch?: (q: string) => void;
};

export default function Hero({ onSearch }: HeroProps) {
  const [q, setQ] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;

    
    onSearch?.(trimmed);

    
    navigate(`/search?query=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative w-[1528px] h-[300px] overflow-hidden py-[30px] px-10">
      {/* Background */}
      <img
        src={heroBg}
        alt="hero"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[#01b4e4] mix-blend-multiply opacity-[0.84]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#032541]/70 via-[#032541]/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1300px] h-[240px] px-8 pt-6 pb-6">
        <div className="relative h-[80px] w-[1220px]">
          <p className="text-white font-bold tracking-[-0.02em] text-[48px] m-0 leading-none">
            Welcome.
          </p>
          <p className="text-white font-semibold text-[30px] m-0 leading-none">
            Millions of movies, TV shows and people to discover. Explore now.
          </p>
        </div>

        {/* Search */}
        <div className="pt-6 flex h-[77px] w-[1220px]">
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex h-[48px] w-full items-center overflow-hidden rounded-full bg-white pl-6 shadow-[0_6px_16px_rgba(3,37,65,0.2)]"
          >
            <input
              aria-label="search"
              className="flex-1 bg-transparent text-[16px] text-[#2c3e50] placeholder:text-[#9aa4b1] outline-none h-full"
              placeholder="Search for a movie, tv show, person......"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              className="h-full px-6 rounded-full bg-gradient-to-r from-[#1ed5a9] to-[#01b4e4] font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#01b4e4]/50"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
