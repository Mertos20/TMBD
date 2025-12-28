import { Link } from "react-router-dom";

interface FeedItemData {
  _id: string;
  type: "rating" | "favorite" | "comment";
  userId: { _id: string; username: string };
  movieId: number;
  rating?: number;
  comment?: string;
  title?: string;
  poster_path?: string;
  date: string;
  movieTitle?: string;
  moviePoster?: string;
}

interface FeedItemCardProps {
  item: FeedItemData;
  darkMode: boolean;
}

const FeedItemCard = ({ item, darkMode }: FeedItemCardProps) => {
  const title = item.title || item.movieTitle || "Unknown Movie";
  const poster = item.poster_path || item.moviePoster;
  
  return (
    <div className={`flex gap-4 p-4 rounded-xl shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      {/* Poster */}
      <Link to={`/movie/${item.movieId}`} className="shrink-0">
        {poster ? (
          <img 
            src={`https://image.tmdb.org/t/p/w200${poster}`} 
            alt={title} 
            className="w-[80px] h-[120px] object-cover rounded-lg"
          />
        ) : (
          <div className="w-[80px] h-[120px] bg-gray-600 rounded-lg" />
        )}
      </Link>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Link to={`/profile/${item.userId._id}`} className="font-bold text-lg text-blue-500 hover:underline">
            {item.userId.username}
          </Link>
          <span className="opacity-60 text-sm">
            {item.type === "favorite" && "added to favorites"}
            {item.type === "rating" && "rated"}
            {item.type === "comment" && "commented on"}
          </span>
          <span className="font-semibold">{title}</span>
        </div>

        {item.type === "rating" && (
          <div className="text-yellow-500 text-xl">
            {"★".repeat(item.rating || 0)}
            <span className="text-gray-400 text-sm ml-2">({item.rating}/5)</span>
          </div>
        )}

        {item.type === "comment" && (
          <p className={`p-3 rounded-lg mt-2 italic ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            "{item.comment}"
          </p>
        )}

        <p className="text-xs opacity-50 mt-2">
          {new Date(item.date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default FeedItemCard;
