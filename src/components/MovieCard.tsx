import React from "react";
import ScoreBadge from "./ScoreBadge"

export interface MovieCardProps {
  posterPath: string | null;
  title: string;
  date?: string;
  vote: number | null;
  id: number;
  type : "movie" | "tv";
}

const IMG = "https://image.tmdb.org/t/p/w300";

const MovieCard: React.FC<MovieCardProps> = ({
  posterPath,
  title,
  date,
  vote,
}) => {
  const pct = vote != null ? Math.round(vote * 10) : null;

  return (
    <div className="relative flex  w-[150px] h-[350px]  flex-col items-start">
    <div className="relative flex w-[150px] h-[225px] flex-col items-start overflow-visible">
  <div
    data-poster
    className="relative w-[150px] h-[225px] overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
  >
    {posterPath ? (
      <img
        src={`${IMG}${posterPath}`}
        alt={title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="flex w-full h-full items-center justify-center bg-gray-100 text-gray-400">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <rect width="24" height="24" fill="#e5e7eb" />
          <path d="M4 17L10 11L14 15L20 9" stroke="#bbb" strokeWidth="2" />
        </svg>
      </div>
    )}
  </div>

  {/* VOTE BADGE */}
  <div className="absolute -bottom-2 left-3 z-[3]">
    <ScoreBadge value={pct} />
  </div>
</div>


      <div className="w-[150px] h-[60px] px-[10px] pt-[26px]">
        <p className="line-clamp-2 cursor-pointer  font-semibold  text-[#0d253f] transition-colors hover:text-[#01b4e4]">
          {title}
        </p>
        {date && (
          <p className=" text-[14px] text-[#7e8c99]">
            {formatDate(date)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

/* -------- helpers -------- */

function formatDate(date?: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch {
    return date;
  }
}


