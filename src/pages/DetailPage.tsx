import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import VideoModal from "../components/VideoModal";
import ScoreBadge from "../components/ScoreBadge";
import Emoji1 from "../aspects/emoji1.svg";
import Emoji2 from "../aspects/emoji2.svg";
import Emoji3 from "../aspects/emoji3.svg";
import Instagram from "../aspects/instagram.svg";
import Facebook from "../aspects/facebook.svg";
import Twitter from "../aspects/twitter.svg";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

interface DetailPageProps {
  id: string;
  type: string;
}


const DetailPage: React.FC<DetailPageProps> = ({ id, type }) => {


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, id]);


  useEffect(() => {
    async function fetchDetail() {
      if (!type || !id) return;

      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,keywords,external_ids,recommendations,reviews`;

      const res = await fetch(url);
      const json = await res.json();
      setData(json);

      const trailer = json.videos?.results.find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube"
      );
      if (trailer) setVideoId(trailer.key);

      setLoading(false);
    }

    fetchDetail();
  }, [type, id]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("favorites");
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
  }, []);
  const toggleFavorite = () => {
    const isAlreadyFav = favorites.some((f) => f.id === data.id);
    const updatedFavs = isAlreadyFav
      ? favorites.filter((f) => f.id !== data.id)
      : [
          ...favorites,
          {
            id: data.id,
            title: data.title || data.name,
            poster_path: data.poster_path,
            media_type: type,
          },
        ];

    setFavorites(updatedFavs);
    localStorage.setItem("favorites", JSON.stringify(updatedFavs));
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">Not found</div>;

  return (
    <div className="w-full bg-white text-black">

      <div className="relative w-full h-auto md:h-[570px] border-b border-black/10">
        {data.backdrop_path && (
          <div className="absolute inset-0 z-0">
            <img
              src={`${IMAGE_BASE}/original${data.backdrop_path}`}
              alt="backdrop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}
        <div className="absolute inset-0 z-10 bg-[#f8e9ed] opacity-50" />

      
        <div className="relative z-10 flex flex-col md:flex-row w-full md:w-[1400px] h-full mx-auto px-4 md:px-10 py-[30px] text-white">
          <div className="flex-shrink-0 mx-auto md:mx-0 mb-6 md:mb-0">
            {data.poster_path && (
              <img
                src={`${IMAGE_BASE}/w500${data.poster_path}`}
                alt={data.title || data.name}
                className="rounded-xl w-[200px] md:w-[300px]"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 md:pl-10 font-sans">
            <div className="text-black mb-4">
              <h2 className="text-2xl md:text-4xl font-bold">
                {data.title || data.name} (
                {(data.release_date || data.first_air_date)?.split("-")[0]})
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                {data.adult !== undefined && (
                  <span className="border border-black/50 px-1 rounded text-xs font-medium">
                    {data.adult ? "R" : "PG"}
                  </span>
                )}
                {data.release_date &&
                  data.production_countries?.[0]?.iso_3166_1 && (
                    <>
                      <span>
                        {new Date(data.release_date).toLocaleDateString("en-US")} (
                        {data.production_countries[0].iso_3166_1})
                      </span>
                      <span>•</span>
                    </>
                  )}
                {data.genres?.length > 0 && (
                  <>
                    <span>
                      {data.genres.map((g: any) => g.name).join(", ")}
                    </span>
                    <span>•</span>
                  </>
                )}
                {data.runtime && (
                  <span>
                    {Math.floor(data.runtime / 60)}h {data.runtime % 60}m
                  </span>
                )}
              </div>
            </div>


            <div className="flex items-center gap-4">
              <ScoreBadge value={Math.round(data.vote_average * 10)} size={60} />
              <div className="flex gap-2">
                {[Emoji1, Emoji2, Emoji3].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="h-8 bg-white/60 rounded-full p-1 transition-transform hover:scale-110"
                    alt=""
                  />
                ))}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#032541] text-white px-4 py-2 rounded-full font-semibold"
              >
                What's your Vibe ?
              </button>
            </div>

          
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <button className="w-10 h-10 rounded-full bg-[#081C24] flex items-center justify-center hover:bg-[#0E2A33] transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <button
                onClick={toggleFavorite}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  favorites.some((f) => f.id === data.id)
                    ? "bg-red-600"
                    : "bg-[#081C24] hover:bg-[#0E2A33]"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill={favorites.some((f) => f.id === data.id) ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5..." />
                </svg>
              </button>

              {videoId && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-black px-4 py-2 rounded-full font-semibold hover:text-white hover:bg-white/60"
                >
                  ▶ Play Trailer
                </button>
              )}
            </div>

            {isModalOpen && videoId && (
              <VideoModal videoId={videoId} onClose={() => setIsModalOpen(false)} />
            )}

            {data.tagline && (
              <p className="italic text-gray-700">{data.tagline}</p>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-2 text-black">Overview</h2>
              <p className="text-black/60">{data.overview}</p>
            </div>
          </div>
        </div>
      </div>

      
      {data.credits?.cast?.length > 0 && (
        <div className="w-full md:w-[1400px] mx-auto px-4 md:px-10 py-[30px] flex flex-col md:flex-row gap-8">
          
          <div className="w-full md:w-[1050px]">
            <h2 className="text-2xl font-semibold mb-4">Top Billed Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {data.credits.cast.slice(0, 10).map((cast: any) => (
                <div
                  key={cast.id}
                  className="w-[150px] flex-shrink-0 bg-white rounded-lg shadow-sm"
                >
                  {cast.profile_path && (
                    <img
                      src={`${IMAGE_BASE}/w200${cast.profile_path}`}
                      alt={cast.name}
                      className="rounded-t-lg w-full h-[225px] object-cover"
                    />
                  )}
                  <div className="p-2">
                    <p className="font-semibold">{cast.name}</p>
                    <p className="text-sm text-gray-600">{cast.character}</p>
                  </div>
                </div>
              ))}
            </div>
            {data.reviews?.results?.length > 0 && (
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                {data.reviews.results.slice(0, 2).map((review: any) => (
                  <div key={review.id} className="mb-4 p-4 border rounded-lg">
                    <p className="font-semibold">{review.author}</p>
                    <p className="text-sm text-gray-700">
                      {review.content.slice(0, 300)}...
                    </p>
                  </div>
                ))}
              </div>
            )}


            {data.recommendations?.results?.length > 0 && (
              <div className="py-8">
                <h2 className="text-2xl font-semibold mb-4">Recommendations</h2>
                <div className="flex gap-4 overflow-x-auto">
                  {data.recommendations.results.slice(0, 10).map((rec: any) => (
                    <Link
                      to={`/${type}/${rec.id}`}
                      key={rec.id}
                      className="w-[150px] flex-shrink-0"
                    >
                      {rec.poster_path && (
                        <img
                          src={`${IMAGE_BASE}/w200${rec.poster_path}`}
                          alt={rec.title || rec.name}
                          className="rounded-lg"
                        />
                      )}
                      <p className="mt-1 text-sm">{rec.title || rec.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

         
          <div className="w-full md:w-[300px] flex-shrink-0 space-y-4">
          
            <div className="flex items-center gap-2">
              {[Facebook, Twitter, Instagram].map((src, i) => (
                <a key={i} href="#" className="hover:opacity-80">
                  <img src={src} alt="" className="h-7" />
                </a>
              ))}
            </div>

           
            {[
              { label: "Status", value: data.status },
              { label: "Original Language", value: data.original_language },
              {
                label: "Budget",
                value: data.budget ? `$${data.budget.toLocaleString()}` : "—",
              },
              {
                label: "Revenue",
                value: data.revenue ? `$${data.revenue.toLocaleString()}` : "—",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h4 className="font-semibold">{item.label}</h4>
                <p className="text-gray-700 capitalize">{item.value || "-"}</p>
              </div>
            ))}

          
            {data.keywords?.keywords?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {data.keywords.keywords.map((kw: any) => (
                    <span
                      key={kw.id}
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                    >
                      {kw.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


     
     
    </div>
  );
};

export default DetailPage;
