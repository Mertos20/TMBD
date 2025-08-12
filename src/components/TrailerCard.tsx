import React from "react";

interface Item {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: "movie" | "tv";
}

interface Props {
  item: Item;
  onHover: () => void;

  onClick: () => void;
}

export default function TrailerCard({ item, onHover, onClick }: Props) {
  const IMG = "https://image.tmdb.org/t/p/w500";
  const label = item.title || item.name || "";

  return (
    <div
      onMouseEnter={onHover}
      onClick={onClick}
      className="w-[300px] py-5 ml-5 flex-shrink-0 snap-start cursor-pointer relative transform transition-transform duration-300 hover:scale-105"
    >
      <div className="relative rounded-xl overflow-hidden">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={label}
            className="w-full h-[168.54px]"
          />
        ) : (
          <div className="w-full h-[168.54px] bg-gray-700" />
        )}

        <div className="absolute  inset-0 bg-black/40 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <div className="mt-2.5">
        <h2 className="text-lg font-semibold">{label}</h2>
        <h3 className="text-sm opacity-80">
          {item.name || item.title}
        </h3>
      </div>
    </div>
  );
}
