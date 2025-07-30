import React from "react";

interface Props {
  videoId: string;
  onClose: () => void;
}

export default function VideoModal({ videoId, onClose }: Props) {
  if (!videoId) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-[1103.4px] h-[682.4px] aspect-video mx-4 rounded-lg overflow-hidden shadow-lg">
        <iframe
          className="w-full h-full bg-transparent"
          style={{ backgroundColor: "transparent" }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-3xl hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
