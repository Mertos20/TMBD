import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";

interface User {
  _id: string;
  username: string;
  isFollowing: boolean;
}

interface FeedItem {
  _id: string;
  type: "rating" | "favorite" | "comment";
  userId: { _id: string; username: string };
  movieId: number;
  rating?: number;
  comment?: string;
  title?: string; // From Favorite
  poster_path?: string; // From Favorite
  date: string;
  // Enriched data
  movieTitle?: string;
  moviePoster?: string;
}

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

const SocialPage = () => {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Search Users
  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(`http://localhost:5000/api/friends/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // Follow / Unfollow
  const toggleFollow = async (id: string, isFollowing: boolean) => {
    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
      await fetch(`http://localhost:5000/api/friends/${endpoint}/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state
      setUsers(users.map(u => u._id === id ? { ...u, isFollowing: !isFollowing } : u));
      fetchFeed(); // Refresh feed
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Feed
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/friends/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: FeedItem[] = await res.json();

      // Enrich with TMDB data for items missing title (Ratings, Comments)
      const enriched = await Promise.all(
        data.map(async (item) => {
          if (item.title) return item; // Favorites already have data

          try {
            const tmdbRes = await fetch(
              `https://api.themoviedb.org/3/movie/${item.movieId}?api_key=${API_KEY}`
            );
            const tmdbData = await tmdbRes.json();
            return {
              ...item,
              movieTitle: tmdbData.title || tmdbData.name,
              moviePoster: tmdbData.poster_path,
            };
          } catch {
            return item;
          }
        })
      );

      setFeed(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className={`min-h-screen pt-10 pb-20 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-3xl font-bold mb-8">Social Feed</h1>

        {/* SEARCH SECTION */}
        <div className={`p-6 rounded-xl shadow-lg mb-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-xl font-semibold mb-4">Find Friends</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-1 p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {/* Search Results */}
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u._id} className={`flex items-center justify-between p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <Link to={`/profile/${u._id}`} className="font-semibold hover:underline">
                  {u.username}
                </Link>
                <button
                  onClick={() => toggleFollow(u._id, u.isFollowing)}
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    u.isFollowing 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {u.isFollowing ? "Unfollow" : "Follow"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* FEED SECTION */}
        <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
        {loading ? (
          <p>Loading feed...</p>
        ) : feed.length === 0 ? (
          <p className="opacity-70">No activity yet. Follow some people!</p>
        ) : (
          <div className="space-y-6">
            {feed.map((item) => {
              const title = item.title || item.movieTitle || "Unknown Movie";
              const poster = item.poster_path || item.moviePoster;
              
              return (
                <div key={item._id} className={`flex gap-4 p-4 rounded-xl shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
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
                    <div className="flex items-center gap-2 mb-2">
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
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SocialPage;
