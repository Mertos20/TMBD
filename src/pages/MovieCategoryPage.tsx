import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
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
  const [filter, setFilter] = useState<"everything" | "liked">("everything");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [token, setToken] = useState<string | null>(null);

  // Token'ı localStorage'dan al
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    setLoading(true);

    const fetchFavorites = async () => {
      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Item[] = await res.json();

        // id ataması
        let mapped = data.map((item) => ({
          ...item,
          id: item.movieId,
          media_type: item.media_type || (item.title ? "movie" : "tv"),
        }));

        // liked filtresi için sort uygula
        mapped = mapped.sort((a, b) => {
          switch (sortBy) {
            case "popularity.asc":
              return (a.popularity || 0) - (b.popularity || 0);
            case "popularity.desc":
              return (b.popularity || 0) - (a.popularity || 0);
            case "vote_average.asc":
              return (a.vote_average || 0) - (b.vote_average || 0);
            case "vote_average.desc":
              return (b.vote_average || 0) - (a.vote_average || 0);
            case "release_date.asc":
              return (
                new Date(a.release_date || "1970-01-01").getTime() -
                new Date(b.release_date || "1970-01-01").getTime()
              );
            case "release_date.desc":
              return (
                new Date(b.release_date || "1970-01-01").getTime() -
                new Date(a.release_date || "1970-01-01").getTime()
              );
            case "original_title.asc":
              return (a.title || a.name || "").localeCompare(b.title || b.name || "");
            case "original_title.desc":
              return (b.title || b.name || "").localeCompare(a.title || a.name || "");
            default:
              return 0;
          }
        });

        setItems(mapped);
      } catch (err) {
        console.error("Favori fetch hatası:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (filter === "liked") {
      fetchFavorites();
    } else {
      fetch(
        `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=en-US&sort_by=${sortBy}`
      )
        .then((res) => res.json())
        .then((data) => setItems(data.results || []))
        .catch((err) => console.error("API error:", err))
        .finally(() => setLoading(false));
    }
  }, [type, category, filter, sortBy, token]);

  const getItemType = (item: Item) => item.media_type || (item.title ? "movie" : "tv");

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 space-y-6">
        {/* Sort */}
        <div className="border rounded bg-white p-4">
          <h2 className="font-semibold mb-3 text-lg">Sort</h2>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Sort Results By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-100 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter */}
        <div className="border rounded bg-white p-4">
          <h2 className="font-semibold mb-3 text-lg">Filters</h2>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="everything"
                checked={filter === "everything"}
                onChange={() => setFilter("everything")}
                className="mr-2"
              />
              Everything
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="liked"
                checked={filter === "liked"}
                onChange={() => setFilter("liked")}
                className="mr-2"
              />
              Liked
            </label>
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className="flex-1">
        <h1 className="text-3xl font-bold capitalize mb-4">
          {category.replace("_", " ")} {type === "tv" ? "TV Shows" : "Movies"}
        </h1>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => (
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
                  <div className="w-full h-[300px] bg-gray-300 rounded" />
                )}
                <p className="mt-2 text-sm text-center text-black">
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
