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

    let updatedFavs;
    if (isAlreadyFav) {
      updatedFavs = favorites.filter((f) => f.id !== data.id);
    } else {
      updatedFavs = [
        ...favorites,
        {
          id: data.id,
          title: data.title || data.name,
          poster_path: data.poster_path,
          media_type: type,
        },
      ];
    }

    setFavorites(updatedFavs);
    localStorage.setItem("favorites", JSON.stringify(updatedFavs));
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="w-full bg-white text-black">
      
      <div
        className="relative w-full h-[570px] border-b"
        style={{ borderBottomWidth: "0.8px" }}
      >
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

        
        <div className="relative z-10 flex w-[1400px] h-full mx-auto px-10 py-[30px] text-white">
          
          <div className="flex-shrink-0">
            {data.poster_path && (
              <img
                src={`${IMAGE_BASE}/w500${data.poster_path}`}
                alt={data.title || data.name}
                className="rounded-xl w-[300px]"
              />
            )}
          </div>

         

          <div className="flex flex-col justify-center gap-4 pl-10 font-sans">
            <div className="flex flex-col text-black mb-6">
              <h2 className="text-4xl font-bold">
                {data.title || data.name} (
                {(data.release_date || data.first_air_date)?.split("-")[0]})
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-sm text-black">
                {data.adult !== undefined && (
                  <span className="border border-black/50 px-1 rounded text-xs font-medium">
                    {data.adult ? "R" : "PG"}
                  </span>
                )}
                {data.release_date &&
                  data.production_countries?.[0]?.iso_3166_1 && (
                    <>
                      <span>
                        {new Date(data.release_date).toLocaleDateString(
                          "en-US"
                        )}{" "}
                        ({data.production_countries[0].iso_3166_1})
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

           
            <div className="flex items-center gap-4 ">
              <ScoreBadge
                value={Math.round(data.vote_average * 10)}
                size={65}
              />
              <div className="flex">
                <img
                  src={Emoji1}
                  className="h-[35px]  bg-white/60 rounded-full p-1 transition-transform duration-200 hover:scale-110"
                  alt=""
                />
                <img
                  src={Emoji2}
                  className="h-[35px]  bg-white/60 rounded-full p-1 transition-transform duration-200 hover:scale-110"
                  alt=""
                />
                <img
                  src={Emoji3}
                  className="h-[35px]  bg-white/60 rounded-full p-1 transition-transform duration-200 hover:scale-110"
                  alt=""
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className=" bg-[rgb(3,37,65)] text-white px-4 py-2 rounded-full font-semibold "
              >
                What's your Vibe ?
              </button>
            </div>

            <div className="flex items-center gap-3 mt-4">
             
              <button className="w-10 h-10 rounded-full bg-[#081C24] flex items-center justify-center hover:bg-[#0E2A33] transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
                  fill={
                    favorites.some((f) => f.id === data.id)
                      ? "currentColor"
                      : "none"
                  }
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.13 2.5h.74C13.09 5.01 14.76 4 16.5 4 19 4 21 6 21 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
              </button>

             
              <button className="w-10 h-10 rounded-full bg-[#081C24] flex items-center justify-center hover:bg-[#0E2A33] transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h12v2H6zm0 4h12v14H6zm0 0H4v14h2z" />
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

            {videoId && isModalOpen && (
              <VideoModal
                videoId={videoId}
                onClose={() => setIsModalOpen(false)}
              />
            )}

            {data.tagline && (
              <p className="italic text-gray-700">{data.tagline}</p>
            )}

      
            <div>
              <h2 className="text-xl font-semibold mb-2 text-black">
                Overview
              </h2>
              <p className="text-black/60">{data.overview}</p>
            </div>
          </div>
        </div>
      </div>

  
{data.credits?.cast?.length > 0 && (
  <div className="w-[1400px] mx-auto px-10 py-[30px] flex gap-8">
    
    <div className="w-[1050px]">
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
        <div className=" mx-auto py-8">
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
        <div className="mx-auto py-8">
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


    <div className="w-[300px] flex-shrink-0 space-y-4">
      
      <div className="flex items-center gap-2">
        <a href="#" className="hover:opacity-80">
          <img src={Facebook} alt="Facebook" className=" h-7" />
        </a>
        <a href="#" className="hover:opacity-80">
          <img src={Twitter} alt="Twitter" className="h-7" />
        </a>
        <a href="#" className="hover:opacity-80">
          <img src={Instagram} alt="Instagram" className=" h-7" />
        </a>
        <a href="#" className="hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A1 1 0 0120 13.118V14a9 9 0 11-6-8.485" />
          </svg>
        </a>
      </div>

  
      <div>
        <h4 className="font-semibold">Status</h4>
        <p className="text-gray-700">{data.status || "-"}</p>
      </div>
      <div>
        <h4 className="font-semibold">Original Language</h4>
        <p className="text-gray-700 capitalize">
          {data.original_language || "-"}
        </p>
      </div>
      <div>
        <h4 className="font-semibold">Budget</h4>
        <p className="text-gray-700">
          {data.budget
            ? `$${data.budget.toLocaleString()}`
            : "—"}
        </p>
      </div>
      <div>
        <h4 className="font-semibold">Revenue</h4>
        <p className="text-gray-700">
          {data.revenue
            ? `$${data.revenue.toLocaleString()}`
            : "—"}
        </p>
      </div>

  
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
