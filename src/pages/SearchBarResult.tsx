import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

const CATEGORIES = ["movie", "tv", "person"] as const;
type Category = typeof CATEGORIES[number];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [activeCategory, setActiveCategory] = useState<Category>("movie");
  const [results, setResults] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<Category, number>>({
    movie: 0,
    tv: 0,
    person: 0,
  });

  const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

  
  useEffect(() => {
    if (!query.trim()) return;

    const fetchCounts = async () => {
      const counts: Record<Category, number> = { movie: 0, tv: 0, person: 0 };

      await Promise.all(
        CATEGORIES.map(async (cat) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/${cat}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
              query
            )}`
          );
          const data = await res.json();
          counts[cat] = data.total_results || 0;
        })
      );

      setCategoryCounts(counts);
    };

    fetchCounts();
  }, [query]);

  
  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${activeCategory}?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    };

    fetchResults();
  }, [query, activeCategory]);

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
  };

  return (
    <div className="max-w-full md:max-w-[1300px] mx-auto mt-4 md:mt-6 flex flex-col md:flex-row gap-4 md:gap-6 px-4 md:px-6 pb-16">
      
      <aside className="w-full md:w-[220px]">
        <div className="bg-[#01b4e4] text-white p-3 font-bold rounded-t">
          Search Results
        </div>

        <ul className="bg-white shadow rounded-b divide-y">
          {CATEGORIES.map((cat) => (
            <li
              key={cat}
              className={`px-4 py-2 cursor-pointer flex justify-between hover:bg-gray-100 ${
                activeCategory === cat ? "font-bold bg-gray-100" : ""
              }`}
              onClick={() => handleCategoryChange(cat)}
            >
              <span className="capitalize">
                {cat === "movie" ? "Movies" : cat === "tv" ? "TV Shows" : "People"}
              </span>
              <span className="bg-gray-200 text-sm px-2 rounded">
                {categoryCounts[cat] ?? 0}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Tip: You can use the 'y:' filter to narrow your results by year. Example: <br />
          <span className="font-mono bg-gray-100 px-1 rounded">star wars y:1977</span>
        </p>
      </aside>

      
      <section className="flex-1 space-y-3 md:space-y-4">
        {results.length === 0 ? (
          <p className="text-gray-500">
            No results found for "{query}"
          </p>
        ) : (
          results.map((item) => {
            const title = item.title || item.name;
            const date = item.release_date || item.first_air_date || "";
            const image = item.poster_path || item.profile_path;
            const overview = item.overview || item.known_for_department || "";

            return (
              <div
                key={item.id}
                className="flex bg-white rounded shadow hover:shadow-md overflow-hidden"
              >
                <Link to={`/${activeCategory}/${item.id}`} className="shrink-0">
                  {image && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${image}`}
                      alt={title}
                      className="w-[80px] md:w-[100px] h-full object-cover"
                    />
                  )}
                </Link>

                <div className="p-3 md:p-4">
                  <h2 className="text-base md:text-lg font-semibold">{title}</h2>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">{date}</p>
                  <p className="text-sm text-gray-600">
                    {typeof overview === "string"
                      ? (overview.length > 200 ? overview.slice(0, 200) + "..." : overview)
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default SearchResults;
