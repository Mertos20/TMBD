import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

interface Comment {
  _id: string;
  movieId: string;
  media_type?: "movie" | "tv";
  username: string;
  comment: string;
  rating: number;
}

interface MovieData {
  id: string;
  title?: string;
  name?: string;
  poster_path?: string;
}

interface Favorite {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
}

interface Watchlist {
  _id: string;
  movieId: number;
  media_type?: "movie" | "tv";
  poster_path: string;
  title?: string;
  name?: string;
}

const ProfilePage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [comments, setComments] = useState<(Comment & MovieData)[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // 🔴 Navbar ile aynı logout fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    window.location.href = "/login"; 
  };

  // ► Kullanıcı + yorumlar + favoriler + watchlist fetch
  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setUsername(localStorage.getItem("username") || "");

        // Yorumlar
        const commentsRes = await fetch(
          `http://localhost:5000/api/comments/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rawComments: Comment[] = await commentsRes.json();
        const sliced = rawComments.slice(0, 5);

        // Her yorum için TMDB verisi ekle
        const enriched = await Promise.all(
          sliced.map(async (c) => {
            try {
              let type: "movie" | "tv" = "movie";
              let res = await fetch(
                `https://api.themoviedb.org/3/movie/${c.movieId}?api_key=${API_KEY}`
              );
              let data = await res.json();

              if (data.status_code) {
                res = await fetch(
                  `https://api.themoviedb.org/3/tv/${c.movieId}?api_key=${API_KEY}`
                );
                data = await res.json();
                type = "tv";
              }

              return { ...c, ...data, media_type: type };
            } catch {
              return c;
            }
          })
        );

        setComments(enriched);

        // Favoriler
        const favRes = await fetch(`http://localhost:5000/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(await favRes.json());

        // Watchlist
        const watchRes = await fetch(`http://localhost:5000/api/watchlists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(await watchRes.json());
      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayedItems = showFavorites ? favorites : watchlist;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800"
        }`}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen pb-20`}>
      <div className={`max-w-[1300px] mx-auto p-6 mt-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        
        {/* USERNAME */}
        <h1 className="text-2xl font-bold text-center mb-8">
          Profile: {username}
        </h1>

        {/* LAST COMMENTS */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Your Last 5 Comments</h2>

          {comments.length === 0 ? (
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              You haven't commented yet.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li
                  key={c._id}
                  className={`flex overflow-hidden border rounded ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"
                  }`}
                >
                  <Link to={`/${c.media_type}/${c.id}`}>
                    {c.poster_path && (
                      <img
                        src={`${IMAGE_BASE}${c.poster_path}`}
                        className="w-[80px] md:w-[100px]"
                        alt=""
                      />
                    )}
                  </Link>
                  <div className="p-3 flex-1">
                    <h3 className="font-bold">{c.title || c.name}</h3>
                    <p>{c.comment}</p>
                    <p className="text-sm opacity-70">Rating: {c.rating}/10</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FAVORITES / WATCHLIST TOGGLE */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowFavorites(true)}
            className={`px-6 py-2 font-semibold rounded-full transition ${
              showFavorites ? "bg-[#0d253f] text-[#1ed5a9]" : "hover:bg-[#0d253f1a]"
            }`}
          >
            Favorites
          </button>

          <button
            onClick={() => setShowFavorites(false)}
            className={`px-6 py-2 font-semibold rounded-full transition ${
              !showFavorites ? "bg-[#0d253f] text-[#1ed5a9]" : "hover:bg-[#0d253f1a]"
            }`}
          >
            Watchlist
          </button>
        </div>

        {/* MOVIE LIST */}
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="flex gap-4 snap-x snap-mandatory">
            {displayedItems.length === 0 ? (
              <p className="w-full text-center py-10 opacity-70">
                No {showFavorites ? "favorites" : "watchlist"} found.
              </p>
            ) : (
              displayedItems.map((m) => (
                <li key={m.movieId} className="snap-start">
                  <Link to={`/${m.media_type}/${m.movieId}`}>
                    <div className="w-[120px] md:w-[150px] text-center">
                      {m.poster_path ? (
                        <img
                          src={`${IMAGE_BASE}${m.poster_path}`}
                          className="rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-[120px] h-[180px] bg-gray-600 rounded-xl" />
                      )}
                      <p className="mt-2 text-sm">{m.title || m.name}</p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

    
      <div className="flex justify-center mt-10">
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
