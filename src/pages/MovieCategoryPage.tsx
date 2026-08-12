import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../components/ThemaContext";

const API_KEY = "d0b51a37ed5a34284904dab55afbc04c";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w200";

interface Item {
  id?: number;
  movieId?: number;
  poster_path: string | null;
  title?: string;
  name?: string;
  media_type?: string;
  vote_average?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

interface CategoryPageProps {
  type: string;
  category: string;
}

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity Descending" },
  { value: "popularity.asc", label: "Popularity Ascending" },
  { value: "vote_average.desc", label: "Rating Descending" },
  { value: "vote_average.asc", label: "Rating Ascending" },
  { value: "release_date.desc", label: "Release Date Descending" },
  { value: "release_date.asc", label: "Release Date Ascending" },
  { value: "original_title.asc", label: "Title (A-Z)" },
  { value: "original_title.desc", label: "Title (Z-A)" },
];

export default function CategoryPage({ type, category }: CategoryPageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [token, setToken] = useState<string | null>(null);

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const { darkMode } = useTheme();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  // Genre List Fetch
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/genre/${type}/list?api_key=${API_KEY}&language=en-US`)
      .then(res => res.json())
      .then(data => setGenres(data.genres || []))
      .catch(err => console.error("Genre fetch error:", err));
  }, [type]);

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const sortItems = (arr: Item[], sortKey: string) => {
    return [...arr].sort((a, b) => {
      switch (sortKey) {
        case "popularity.asc":
          return (a.popularity || 0) - (b.popularity || 0);
        case "popularity.desc":
          return (b.popularity || 0) - (a.popularity || 0);
        case "vote_average.asc":
          return (a.vote_average || 0) - (b.vote_average || 0);
        case "vote_average.desc":
          return (b.vote_average || 0) - (a.vote_average || 0);
        case "release_date.asc": {
          const aDate = new Date(a.release_date || a.first_air_date || "1970-01-01").getTime();
          const bDate = new Date(b.release_date || b.first_air_date || "1970-01-01").getTime();
          return aDate - bDate;
        }
        case "release_date.desc": {
          const aDate = new Date(a.release_date || a.first_air_date || "1970-01-01").getTime();
          const bDate = new Date(b.release_date || b.first_air_date || "1970-01-01").getTime();
          return bDate - aDate;
        }
        case "original_title.asc":
          return (a.title || a.name || "").localeCompare(b.title || b.name || "");
        case "original_title.desc":
          return (b.title || b.name || "").localeCompare(a.title || a.name || "");
        default:
          return 0;
      }
    });
  };

  // Fetch items — Liked/Everything logic removed, simple discover API only
  useEffect(() => {
    setLoading(true);

    fetch(
      `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=en-US&sort_by=${sortBy}&with_genres=${selectedGenres.join(",")}`
    )
      .then(res => res.json())
      .then(data => {
        const sorted = sortItems(
          (data.results || []).map((item: Item) => ({
            ...item,
            id: item.id || item.movieId,
            media_type: item.media_type || (item.title ? "movie" : "tv"),
          })),
          sortBy
        );
        setItems(sorted);
      })
      .catch(err => console.error("API error:", err))
      .finally(() => setLoading(false));

  }, [type, category, sortBy, selectedGenres]);

  const getItemType = (item: Item) =>
    item.media_type || (item.title ? "movie" : "tv");

  return (
    <div className={`p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 ${darkMode ? "dark" : ""}`}>

      {/* Sidebar */}
      <aside className="w-full lg:w-64 space-y-6">

        {/* Sort */}
        <div className={`border rounded p-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
          <h2 className="font-semibold mb-3 text-lg">Sort</h2>
          <label className="block mb-1 text-sm font-medium">Sort Results By</label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full p-2 border rounded ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-100 text-black border-gray-300"}`}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Genre Filter */}
        <div className={`border rounded p-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
          <h2 className="font-semibold mb-3 text-lg">Genres</h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {genres.map(g => (
              <label key={g.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(g.id)}
                  onChange={() => toggleGenre(g.id)}
                  className="mr-2"
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>

      </aside>

      {/* Content */}
      <section className="flex-1">
        <h1 className="text-3xl font-bold capitalize mb-4">
          {category.replace("_", " ")} {type === "tv" ? "TV Shows" : "Movies"}
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map(item => (
              <Link
                to={`/${getItemType(item)}/${item.id}`}
                key={item.id}
                className="group"
              >
                {item.poster_path ? (
                  <img
                    src={`${IMAGE_BASE}${item.poster_path}`}
                    alt={item.title || item.name}
                    className="rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-[300px] bg-gray-300 dark:bg-gray-700 rounded" />
                )}

                <p className="mt-2 text-sm text-center">
                  {item.title || item.name}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
