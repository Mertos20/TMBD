import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VideoModal from "../components/VideoModal";
import ScoreBadge from "../components/ScoreBadge";
import Emoji1 from "../aspects/emoji1.svg";
import Emoji2 from "../aspects/emoji2.svg";
import Emoji3 from "../aspects/emoji3.svg";
import Instagram from "../aspects/instagram.svg";
import Facebook from "../aspects/facebook.svg";
import Twitter from "../aspects/twitter.svg";
import { useTheme } from "../components/ThemaContext";

const API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const MOVIE_QUOTES = [
  { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather" },
  { text: "May the Force be with you.", movie: "Star Wars" },
  { text: "Here's looking at you, kid.", movie: "Casablanca" },
  { text: "You talking to me?", movie: "Taxi Driver" },
  { text: "I see dead people.", movie: "The Sixth Sense" },
  { text: "Why so serious?", movie: "The Dark Knight" },
  { text: "I'll be back.", movie: "The Terminator" },
  { text: "Houston, we have a problem.", movie: "Apollo 13" },
  { text: "To infinity and beyond!", movie: "Toy Story" },
  { text: "Just keep swimming.", movie: "Finding Nemo" },
  { text: "Winter is coming.", movie: "Game of Thrones" },
  { text: "My precious.", movie: "The Lord of the Rings" },
  { text: "I am your father.", movie: "Star Wars: Empire Strikes Back" },
  { text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
];

// --- YENİ EKLENEN LOADING CLAPPERBOARD BİLEŞENİ ---
const LoadingClapperboard = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOVIE_QUOTES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const quote = MOVIE_QUOTES[quoteIndex];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md transition-colors duration-700">
      <div className="relative w-80 select-none">
        
        {/* Üst Parça (Clapper Stick) - Sürekli Çakan Animasyon */}
        <div 
          className="h-16 bg-[#1a1a1a] rounded-t-xl origin-bottom-left relative z-20 animate-clap-loop"
          style={{ 
            backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, white 20px, white 40px)",
            boxShadow: "0 4px 6px rgba(0,0,0,0.5)"
          }}
        >
            {/* Menteşe Detayı */}
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-neutral-400 border-2 border-neutral-600 shadow-inner z-30" />
        </div>

        {/* Alt Parça (Board) */}
        <div className="h-80 bg-[#1a1a1a] rounded-b-xl shadow-2xl flex flex-col relative overflow-hidden border-t-4 border-white">
           {/* Alt parçanın üst şeridi */}
           <div className="h-4 w-full absolute top-0 left-0" 
                style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 20px, white 20px, white 40px)" }} 
           />
           
           <div className="p-6 mt-4 flex flex-col h-full justify-between">
               {/* Bilgi Izgarası */}
               <div className="grid grid-cols-2 gap-px bg-white/20 border border-white/20 rounded-lg overflow-hidden">
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Production</p>
                       <p className="text-white font-mono font-bold text-lg truncate">MOVIBASE</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Scene</p>
                       <p className="text-[#1DB954] font-mono text-lg font-bold">VIBE CHECK</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Take</p>
                       <p className="text-red-500 font-mono text-xl font-bold animate-pulse">REC</p>
                   </div>
                   <div className="bg-[#222] p-3">
                       <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Director</p>
                       <p className="text-white font-mono text-sm truncate">AI & SPOTIFY</p>
                   </div>
               </div>

               {/* Aksiyon Yazısı */}
               <div className="text-center mt-4 flex flex-col items-center justify-center flex-1">
                   <h2 className="text-3xl font-black text-white tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] mb-2">
                       LOADING
                   </h2>
                   
                   <div key={quoteIndex} className="flex flex-col items-center justify-center animate-fade-in px-2">
                     <p className="text-xs text-[#1DB954] font-mono animate-pulse mb-3">Connecting to Spotify...</p>
                     <p className="text-sm text-white/90 italic font-serif text-center leading-tight">"{quote.text}"</p>
                     <p className="text-[10px] text-white/50 uppercase mt-1">- {quote.movie}</p>
                   </div>
               </div>
           </div>
           
           {/* Parlama efekti */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* CSS Animasyonu */}
      <style>{`
        @keyframes clap-loop {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        .animate-clap-loop {
          animation: clap-loop 0.8s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

interface DetailPageProps {
  id: string;
  type: string;
}

const DetailPage: React.FC<DetailPageProps> = ({ id, type }) => {
  const { darkMode } = useTheme(); 
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState("0");
  const [userRating, setUserRating] = useState(0);
  
  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingComment, setReportingComment] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const userId = localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Fetch Ratings
  useEffect(() => {
    async function fetchRatings() {
      if (!id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/ratings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAverageRating(data.average);
          
          if (userId) {
            const myRating = data.ratings.find((r: any) => r.userId === userId);
            if (myRating) setUserRating(myRating.rating);
          }
        }
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    }
    fetchRatings();
  }, [id, userId]);

  const handleRate = async (value: number) => {
    if (!token) {
      alert("Please login to rate!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/ratings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ movieId: id, rating: value }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUserRating(updated.rating);
        // Refresh average
        const ratingsRes = await fetch(`http://localhost:5000/api/ratings/${id}`);
        const ratingsData = await ratingsRes.json();
        setAverageRating(ratingsData.average);
      } else if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login"); 
      } else {
        alert("Failed to submit rating.");
      }
    } catch (err) {
      console.error("Error rating:", err);
      alert("Server error. Please check if the backend is running.");
    }
  };

  useEffect(() => {
    if (!data) return;

    const consent = localStorage.getItem("cookieConsent");
    if (!consent) return;

    const genreStats = JSON.parse(localStorage.getItem("genreStats") || "{}");

    data.genres?.forEach((g: any) => {
      genreStats[g.id] = (genreStats[g.id] || 0) + 1;
    });

    localStorage.setItem("genreStats", JSON.stringify(genreStats));
  }, [data]);

  // Scroll top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, id]);

  // Film/TV detaylarını çek
  useEffect(() => {
    async function fetchDetail() {
      if (!type || !id) return;

      const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=en-US&append_to_response=videos,credits,keywords,external_ids,recommendations,reviews,watch/providers`;

      const res = await fetch(url);
      if (!res.ok) {
        setLoading(false);
        return;
      }
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

  // Yorumları çek
  useEffect(() => {
    async function fetchComments() {
      if (!id) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    }
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (!token) return;

    const fetchFavorite = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      } catch (err) {
        console.error("Favori kontrol hatası:", err);
      }
    };

    fetchFavorite();
  }, [id, token]);

  const toggleFavorite = async () => {
    if (!token) {
      alert("Beğenmek için giriş yap!");
      return;
    }

    try {
      if (isFavorite) {
        await fetch(`http://localhost:5000/api/favorites/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        await fetch("http://localhost:5000/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: id,
            title: data.title || data.name,
            poster_path: data.poster_path,
            media_type: type,
          }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Favori hatası:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchWatchList = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/watchlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setIsWatchlist(data.isWatchlist);
      } catch (err) {
        console.error("watch list kontrol hatası:", err);
      }
    };

    fetchWatchList();
  }, [id, token]);

  const toggleWatchList = async () => {
    if (!token) {
      alert("Eklemek için giriş yap!");
      return;
    }

    try {
      if (isWatchlist) {
        await fetch(`http://localhost:5000/api/watchlists/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWatchlist(false);
      } else {
        await fetch("http://localhost:5000/api/watchlists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: id,
            title: data.title || data.name,
            poster_path: data.poster_path,
            media_type: type,
          }),
        });
        setIsWatchlist(true);
      }
    } catch (error) {
      console.error("watch list hatası:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment) return;
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:5000/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: id, comment: newComment, rating: 0 }), 
      });

      if (res.ok) {
        const savedComment = await res.json();
        setComments([savedComment, ...comments]);
        setNewComment("");
      } else {
        console.log("Error adding comment");
        alert("Failed to add comment. Please try again.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Server error. Please check if the backend is running.");
    }
  };

  const handleDeleteComment = async (commentId: string, commentOwnerId: string, reporterId?: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setComments(comments.filter((c) => c._id !== commentId));

      // Sadece Admin işlem yaptığında bildirim gönder
      if (isAdmin) {
        // 1. Yorum Sahibine Bildirim (Eğer admin kendisi değilse)
        if (commentOwnerId && commentOwnerId !== userId) {
          try {
            const notifRes = await fetch("http://localhost:5000/api/notifications", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                receiverId: commentOwnerId,
                type: "warning",
                message: "Your comment has been deleted due to violation of rules. Repeated violations may lead to suspension."
              })
            });
            if (!notifRes.ok) console.error("Failed to send warning notification");
          } catch (err) {
            console.error("Failed to send warning notification to owner", err);
          }
        }

        // 2. Raporlayan Kullanıcıya Bildirim (Eğer varsa ve admin kendisi değilse)
        if (reporterId && reporterId !== userId) {
          try {
            await fetch("http://localhost:5000/api/notifications", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                receiverId: reporterId,
                type: "report", // Rapor sonucunu bildirmek için
                message: "The comment you reported has been reviewed and deleted. Thank you for keeping the community safe."
              })
            });
          } catch (err) {
            console.error("Failed to send notification to reporter", err);
          }
        }
      }
    } else {
      console.log("Error deleting comment");
    }
  };

  // Report comment handler
  const handleReportComment = async () => {
    if (!reportingComment || !token) return;
    
    setReportLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          commentId: reportingComment._id,
          commentText: reportingComment.comment,
          commentAuthorId: reportingComment.userId,
          movieTitle: data?.title || data?.name,
          movieId: id
        })
      });

      const result = await res.json();
      if (res.ok) {
        setToast({ show: true, message: "Report submitted successfully. Admin will review this comment.", type: "success" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      } else {
        setToast({ show: true, message: result.error || "Failed to submit report", type: "error" });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      }
    } catch (err) {
      console.error("Report error:", err);
      setToast({ show: true, message: "Failed to submit report", type: "error" });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    } finally {
      setReportLoading(false);
      setShowReportModal(false);
      setReportingComment(null);
    }
  };

  const handleVibeClick = () => {
    // 1. Check for existing token first
    const token = localStorage.getItem("spotify_access_token");
    if (token) {
      createVibePlaylist();
      return;
    }
    
    // 2. Show loading immediately (Clapperboard appears)
    setVibeLoading(true);
    
    const width = 450;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const loginUrl = "https://latanya-juicier-lanelle.ngrok-free.dev/spotify/login";

    const popup = window.open(
      loginUrl,
      "Spotify Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Timer to check if popup is closed by user
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        // If popup is closed and we don't have a token yet (user closed it manually), stop loading
        setTimeout(() => {
             if (!localStorage.getItem("spotify_access_token")) {
                 setVibeLoading(false);
             }
        }, 500);
      }
    }, 1000);

    // ✔ popup’tan token mesajını dinle
    const receiveToken = async (e: MessageEvent) => {
      if (!e.origin.includes("ngrok-free.dev")) return;

      const { access_token } = e.data;
      if (access_token) {
        localStorage.setItem("spotify_access_token", access_token);
        
        clearInterval(checkPopup);

        popup?.close();

        // ✔ Token alınır alınmaz otomatik playlist oluştur
        await createVibePlaylist();
      }

      window.removeEventListener("message", receiveToken);
    };

    window.addEventListener("message", receiveToken);
  };

  // 🔍 Token geçerli mi kontrol eden fonksiyon
  const validateSpotifyToken = async (token: string) => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      return res.status === 200; // ✔ Geçerli token
    } catch {
      return false;
    }
  };

  // 🎶 Playlist oluşturma
  const createVibePlaylist = async (tokenParam?: string) => {

    setVibeLoading(true);

    const token = tokenParam || localStorage.getItem("spotify_access_token");

    if (!token) {
      alert("⚠️ Spotify token bulunamadı!");
      setVibeLoading(false);
      return;
    }

    // Timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      await Promise.race([
        (async () => {
          // 🔥 İlk iş: Token geçerli mi?
          const isValid = await validateSpotifyToken(token);

          if (!isValid) {
            alert("⚠️ Spotify oturumun kapalı veya token süresi dolmuş!\nLütfen yeniden giriş yap.");
            localStorage.removeItem("spotify_access_token");
            return;
          }

          const appToken = localStorage.getItem("token");
          const headers: any = { "Content-Type": "application/json" };
          if (appToken) {
            headers["Authorization"] = `Bearer ${appToken}`;
          }

          const res = await fetch("https://latanya-juicier-lanelle.ngrok-free.dev/api/vibe", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
              title: data.title || data.name,
              overview: data.overview,
            }),
          });

          const responseData = await res.json();
          const tracks = Array.isArray(responseData) ? responseData : responseData.tracks || [];

          if (tracks.length === 0) {
            alert("⚠️ AI playlist boş döndü!");
            return;
          }

          const playlistRes = await fetch("https://latanya-juicier-lanelle.ngrok-free.dev/spotify/create-playlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: token,
              tracks,
              playlist_name: `${data.title || data.name} - AI Vibe`,
            }),
          });

          const playlistData = await playlistRes.json();

          if (playlistData.success) {
            // Yeni sekmede Spotify playlist aç
            window.location.href = playlistData.playlist_url;
          } else {
            alert("⚠️ Playlist Spotify'a eklenemedi!");
          }
        })(),
        timeoutPromise
      ]);

    } catch (error: any) {
      console.error(error);
      if (error.message === "TIMEOUT") {
        alert("⚠️ İşlem çok uzun sürdü (15sn). Lütfen tekrar deneyin.");
      } else {
        alert("⚠️ Playlist oluşturulurken hata oluştu!");
      }
    } finally {
      setVibeLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!data) return <div className="p-4">Not found</div>;

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black" } w-full relative`}>
      {/* Loading Clapperboard Overlay */}
      {vibeLoading && <LoadingClapperboard />}

      {/* Modern Toast Notification */}
      <div className={`fixed top-24 right-5 z-[100] transition-all duration-500 transform ${toast.show ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"}`}>
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border min-w-[320px] ${
          toast.type === "success" 
            ? "bg-green-500/10 border-green-500/20 text-green-500" 
            : "bg-red-500/10 border-red-500/20 text-red-500"
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            toast.type === "success" ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            {toast.type === "success" ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="font-bold text-lg">{toast.type === "success" ? "Success!" : "Error!"}</h4>
            <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{toast.message}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Blurred when loading */}
      <div className={`transition-all duration-700 ${vibeLoading ? 'blur-md brightness-[0.4] pointer-events-none' : ''}`}>
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
                
                <button
                  onClick={handleVibeClick}
                  className="bg-[#32cd32] text-white px-4 py-2 rounded-full font-semibold"
                >
                  What's your Vibe ?
                </button>
              </div>

              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <button
                  onClick={toggleWatchList}
                  className="w-10 h-10 rounded-full bg-[#081C24] flex items-center justify-center hover:bg-[#0E2A33] transition-all duration-200"
                >
                  {isWatchlist ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-green-400 animate-scale"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
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
                  )}
                </button>

                <button onClick={toggleFavorite} className="favorite-btn">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "#ff7f00" : "none"}
                    stroke="#ff7f00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                            C13.09 3.81 14.76 3 16.5 3
                            19.58 3 22 5.42 22 8.5
                            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

              {/* Where to Watch */}
              {(() => {
                const providers = data["watch/providers"]?.results?.TR || data["watch/providers"]?.results?.US;
                if (providers?.flatrate) {
                  return (
                    <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 inline-block">
                      <h3 className="text-black font-bold mb-2 text-sm">Stream Now</h3>
                      <div className="flex gap-3 flex-wrap">
                        {providers.flatrate.map((provider: any) => (
                          <div key={provider.provider_id} className="relative group">
                            <img 
                              src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                              alt={provider.provider_name}
                              title={provider.provider_name}
                              className="w-10 h-10 rounded-lg shadow-md transition-transform transform group-hover:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

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

        {/* Cast */}
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

              {/* Comments */}
              <div className="mt-8 w-full md:w-[1050px] mx-auto px-4">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-semibold">Comments</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-yellow-500 text-xl">★</span>
                     <span className="font-semibold text-lg">({averageRating})</span>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-semibold mb-2 text-black">Rate this movie:</h4>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-3xl transition-colors focus:outline-none ${
                          (hoverRating || userRating) >= star ? "text-yellow-400" : "text-gray-300"
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(userRating === star ? 0 : star)}
                      >
                        ★
                      </button>
                    ))}
                    {userRating > 0 && <span className="text-sm text-green-600 ml-2">(You rated: {userRating})</span>}
                  </div>
                </div>

                {/* Add Comment Form */}
                <div className="flex flex-col gap-2 mb-6">
                  <textarea
                    className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none text-black"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment}
                    className={`font-semibold px-4 py-2 rounded-lg transition-colors w-fit ${
                      !newComment 
                        ? "bg-gray-400 cursor-not-allowed text-gray-200" 
                        : "bg-[#032541] text-white hover:bg-[#0E2A33]"
                    }`}
                  >
                    Add Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex flex-col gap-4">
                  {comments.length === 0 && <p>No comments yet</p>}
                  {comments.map((c) => {
                    const canDelete = c.userId === userId || isAdmin;
                    return (
                      <div
                        key={c._id}
                        className={`p-4 border rounded-lg shadow-md ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-black/10"}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <Link 
                            to={`/profile/${c.userId}`} 
                            className={`font-semibold hover:underline ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                          >
                            {c.username}
                          </Link>
                          {c.userEmail && (
                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {c.userEmail}
                            </span>
                          )}
                        </div>
                        <p className={`mb-2 ${darkMode ? "text-gray-300" : "text-black/80"}`}>{c.comment}</p>
                        <div className="flex items-center gap-3">
                          {canDelete && (
                            <button
                              // c.reporterId backend'den geliyorsa buraya eklenir
                              onClick={() => handleDeleteComment(c._id, c.userId, c.reporterId)}
                              className="text-red-600 text-sm font-semibold hover:underline"
                            >
                              Delete
                            </button>
                          )}
                          {c.userId !== userId && (
                            <button
                              onClick={() => {
                                setReportingComment(c);
                                setShowReportModal(true);
                              }}
                              className={`text-sm font-semibold hover:underline ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                            >
                              ⚠️ Report
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
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

            {/* Sidebar */}
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
                { label: "Budget", value: data.budget ? `$${data.budget.toLocaleString()}` : "—" },
                { label: "Revenue", value: data.revenue ? `$${data.revenue.toLocaleString()}` : "—" },
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

      {/* Report Confirmation Modal */}
      {showReportModal && reportingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl max-w-md w-full p-6 shadow-2xl`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚠️ Report Comment
            </h3>
            
            <div className={`p-4 rounded-lg mb-4 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <p className="text-sm opacity-70 mb-1">Comment by <strong>{reportingComment.username}</strong>:</p>
              <p className={`italic ${darkMode ? "text-gray-300" : "text-gray-700"}`}>"{reportingComment.comment}"</p>
            </div>
            
            <p className="mb-6">
              Do you find this comment suspicious and want to report it to the admin for review?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportingComment(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
                disabled={reportLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReportComment}
                disabled={reportLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {reportLoading ? "Submitting..." : "Yes, Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPage;