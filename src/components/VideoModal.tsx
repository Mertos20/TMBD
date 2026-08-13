import React from "react";

interface Props {
  videoId: string;
  onClose: () => void;
}

export default function VideoModal({ videoId, onClose }: Props) {
  if (!videoId) return null;

  const originParam = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="relative w-[1103.4px] h-[682.4px] aspect-video mx-4 rounded-lg overflow-hidden shadow-lg">
        <iframe
          className="w-full h-full bg-transparent border-0"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${originParam}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
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
