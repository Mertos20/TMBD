import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";
import { UserSearch, FeedItemCard } from "../components/social";

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
  title?: string;
  poster_path?: string;
  date: string;
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
        <UserSearch
          query={query}
          users={users}
          darkMode={darkMode}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          onToggleFollow={toggleFollow}
        />

        {/* FEED SECTION */}
        <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
        {loading ? (
          <p>Loading feed...</p>
        ) : feed.length === 0 ? (
          <p className="opacity-70">No activity yet. Follow some people!</p>
        ) : (
          <div className="space-y-6">
            {feed.map((item) => (
              <FeedItemCard key={item._id} item={item} darkMode={darkMode} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SocialPage;
