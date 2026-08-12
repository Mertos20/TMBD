import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { API_URL } from "../config/api";

const API_KEY = "d0b51a37ed5a34284904dab55afbc04c"; // TMDB API Key

interface Movie {
  id: number;
  title: string;
  type: "movie" | "tv";
  poster_path?: string;
}

// Yeni: Film detayları için arayüz
interface MovieDetail extends Movie {
  overview: string;
  release_date?: string;
  vote_average?: number;
}

interface Message {
  from: "user" | "bot";
  text: string;
  movies?: Movie[];
  movieDetail?: MovieDetail; // Film detayı için yeni alan
}

// --- DİNAMİK İÇERİK ---
const WELCOME_MESSAGES = [
  "Hi there! 👋 I'm your movie assistant. 🎬 How are you feeling today? ✨",
  "Hello! 🍿 Ready to find a movie? Tell me your mood! 🤩",
  "Greetings! 🖖 What kind of movie are you in the mood for? 🎭",
  "Hey! 🎥 I can help you find the perfect movie. What's on your mind? 🤔",
  "Welcome! 🌟 Let's discover a new movie or TV show together. 📺 How can I help? 🚀",
];

const DYNAMIC_SUGGESTIONS = [
  "Happy", "Sad", "Excited", "Chill", "Romantic", "Adventurous",
  "Action", "Comedy", "Sci-Fi", "Horror", "Thriller", "Drama",
  "Trending movies", "Top rated shows", "A classic film",
  "Quiz Mode 🧠"
];

// TMDB'den rastgele soru üreten fonksiyon
const generateTMDBQuestion = async () => {
  try {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${randomPage}`);
    const data = await res.json();
    const results = data.results;
    
    if (!results || results.length < 4) return null;

    const correct = results[Math.floor(Math.random() * results.length)];
    const others = results.filter((m: any) => m.id !== correct.id);
    
    // 0: Yıl Sorusu, 1: Özet Sorusu
    const type = Math.random() > 0.5 ? 0 : 1;
    let q = "", a = "", options: string[] = [];

    if (type === 0 && correct.release_date) {
      const year = correct.release_date.split("-")[0];
      q = `When was the movie "${correct.title}" released?`;
      a = year;
      const y = parseInt(year);
      const fakes = [y-1, y+1, y-2, y+2, y-5, y+5].sort(() => 0.5 - Math.random()).slice(0, 3);
      options = [a, ...fakes.map(String)].sort(() => 0.5 - Math.random());
    } else {
      q = `Which movie has this plot? "${correct.overview.substring(0, 80)}..."`;
      a = correct.title;
      const fakes = others.sort(() => 0.5 - Math.random()).slice(0, 3).map((m: any) => m.title);
      options = [a, ...fakes].sort(() => 0.5 - Math.random());
    }
    
    return { q, a, options };
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getShuffledSuggestions = (count: number) => [...DYNAMIC_SUGGESTIONS].sort(() => 0.5 - Math.random()).slice(0, count);

// Basit Konfeti Bileşeni
const Confetti = () => {
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  return (
    <div className="absolute inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-sm"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
// --- BİTİŞ ---

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const username = localStorage.getItem("username");
    let text = getRandomItem(WELCOME_MESSAGES);
    if (username) {
      text = text.replace(/^Hi there/, `Hi ${username}`)
                 .replace(/^Hello/, `Hello ${username}`)
                 .replace(/^Hey/, `Hey ${username}`)
                 .replace(/^Greetings/, `Greetings ${username}`)
                 .replace(/^Welcome/, `Welcome ${username}`);
    }
    return [{ from: "bot", text }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [quizActive, setQuizActive] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState<{ q: string; a: string; options: string[] } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation(); // Mevcut sayfayı takip et

  // Scroll to bottom on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  // Sayfa değiştiğinde veya chat açıldığında önerileri güncelle
  useEffect(() => {
    if (open && !quizActive) {
      const detailMatch = location.pathname.match(/^\/(movie|tv)\/(\d+)$/);
      let newSuggestions = getShuffledSuggestions(6);

      if (detailMatch) {
        // Eğer detay sayfasındaysak, bağlama uygun önerileri başa ekle
        newSuggestions = ["About this movie", "Similar to this", ...newSuggestions.slice(0, 4)];
      } else {
        newSuggestions = ["Surprise Me 🎲", ...newSuggestions.slice(0, 5)];
      }
      setSuggestions(newSuggestions);
    }
  }, [open, location.pathname, quizActive]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Auto-focus input after bot response
  useEffect(() => {
    if (!loading && open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [loading, open]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    const trimmedInput = textToSend.trim();

    if (!trimmedInput) return;

    // Add user message
    const userMessage: Message = { from: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // --- QUIZ LOGIC ---
    if (quizActive && currentQuizQuestion) {
      const isCorrect = trimmedInput.toLowerCase() === currentQuizQuestion.a.toLowerCase();
      
      const feedbackText = isCorrect ? "Correct! 🎉" : `Wrong ❌. The answer was "${currentQuizQuestion.a}".`;
      const newScore = quizScore + (isCorrect ? 1 : 0);
      setQuizScore(newScore);

      const nextIndex = quizIndex + 1;
      
      // 5 soruluk bir quiz yapalım
      if (nextIndex < 5) {
        const nextQ = await generateTMDBQuestion();
        if (nextQ) {
          setMessages((prev) => [
            ...prev, 
            { from: "bot", text: feedbackText },
            { from: "bot", text: `Question ${nextIndex + 1}: ${nextQ.q}` }
          ]);
          setSuggestions(nextQ.options);
          setCurrentQuizQuestion(nextQ);
          setQuizIndex(nextIndex);
        } else {
            // Hata durumu
            setMessages((prev) => [...prev, { from: "bot", text: "Error fetching question. Ending quiz." }]);
            setQuizActive(false);
        }
      } else {
          // Quiz bitti, tam puan kontrolü
          if (newScore === 5) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // 5 saniye sonra durdur
          }

          setMessages((prev) => [
            ...prev, 
            { from: "bot", text: feedbackText },
            { from: "bot", text: `Quiz finished! 🏁 Your score: ${newScore}/5` }
          ]);
          setQuizActive(false);
          setCurrentQuizQuestion(null);
          setSuggestions(getShuffledSuggestions(6));
      }
      setLoading(false);
      return;
    }

    if (trimmedInput === "Quiz Mode 🧠" || trimmedInput.toLowerCase().includes("quiz mode")) {
       setQuizActive(true);
       setQuizIndex(0);
       setQuizScore(0);
       
       const firstQuestion = await generateTMDBQuestion();
       if (firstQuestion) {
         setMessages((prev) => [
           ...prev,
           { from: "bot", text: "🎬 Starting Movie Quiz! Let's see how much you know." },
           { from: "bot", text: `Question 1: ${firstQuestion.q}` }
         ]);
         setSuggestions(firstQuestion.options);
         setCurrentQuizQuestion(firstQuestion);
         setLoading(false);
       } else {
         setMessages((prev) => [...prev, { from: "bot", text: "Could not start quiz. Try again." }]);
         setQuizActive(false);
         setLoading(false);
       }
       return;
    }

    // Simple thank you check
    if (/^(thank you|thanks|thx|ty)$/i.test(trimmedInput)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "You're welcome! 😊 Let me know if you need more recommendations." },
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    // --- ÖZEL KOMUTLAR (Context & Surprise) ---
    
    // 1. "Surprise Me" - Rastgele Film
    if (trimmedInput === "Surprise Me 🎲") {
      try {
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${randomPage}`);
        const data = await res.json();
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        
        if (randomMovie) {
          const botMessage: Message = {
            from: "bot",
            text: "🎲 Feeling lucky? Check this out:",
            movieDetail: {
              id: randomMovie.id,
              title: randomMovie.title,
              type: "movie",
              poster_path: randomMovie.poster_path,
              overview: randomMovie.overview,
              release_date: randomMovie.release_date,
              vote_average: randomMovie.vote_average
            }
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
          return;
        }
      } catch (e) { console.error(e); }
    }

    // 2. Detay Sayfası Bağlamı ("About this movie", "Similar to this")
    const detailMatch = location.pathname.match(/^\/(movie|tv)\/(\d+)$/);
    if (detailMatch) {
      const [_, type, id] = detailMatch;

      if (trimmedInput === "About this movie") {
        // Mevcut filmin detaylarını getir
        try {
          const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}&language=en-US`);
          const data = await res.json();
          const botMessage: Message = {
            from: "bot",
            text: `Here is the info for "${data.title || data.name}":`,
            movieDetail: { ...data, type }
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
          return;
        } catch (e) { console.error(e); }
      }

      if (trimmedInput === "Similar to this") {
        // Benzer filmleri getir
        try {
          const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`);
          const data = await res.json();
          const botMessage: Message = {
            from: "bot",
            text: "Here are some similar titles you might like:",
            movies: data.results.slice(0, 5).map((m: any) => ({ ...m, type }))
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);
          return;
        } catch (e) { console.error(e); }
      }
    }

    // --- FRONTEND AKILLI KONTROL (Backend Fallback) ---
    // Eğer kullanıcı "hakkında bilgi" veya "tell me about" diyorsa direkt TMDB'den bulalım.
    const infoRegexTR = /^(?:bana\s+)?(.*)\s+hakkında\s+(?:bilgi|detay)/i; // Örn: "Godfather hakkında bilgi"
    const infoRegexEN = /^(?:tell me about|what is|describe|give me(?: some)? info(?:rmation)? about)\s+(.*)/i;      // Örn: "Tell me about Godfather"
    
    const match = trimmedInput.match(infoRegexTR) || trimmedInput.match(infoRegexEN);
    
    if (match && match[1]) {
      const query = match[1].replace(/filmi|dizisi/gi, "").trim();
      if (query.length > 1) {
        try {
          const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
          const searchData = await searchRes.json();
          
          // En iyi eşleşen film veya diziyi bul
          const bestMatch = searchData.results?.find((r: any) => r.media_type === "movie" || r.media_type === "tv");
          
          if (bestMatch) {
             const botMessage: Message = {
              from: "bot",
              text: `Here is what I found about "${bestMatch.title || bestMatch.name}":`,
              movieDetail: {
                id: bestMatch.id,
                title: bestMatch.title || bestMatch.name,
                type: bestMatch.media_type,
                poster_path: bestMatch.poster_path,
                overview: bestMatch.overview,
                release_date: bestMatch.release_date || bestMatch.first_air_date,
                vote_average: bestMatch.vote_average
              },
            };
            setMessages((prev) => [...prev, botMessage]);
            setLoading(false);
            return; // Backend'e gitmeye gerek kalmadı
          }
        } catch (err) {
          console.error("Frontend search error:", err);
        }
      }
    }
    // ---------------------------------------------------

    try {
      const res = await fetch(`${API_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      
      // Yanıt formatını kontrol et
      // 1. Film detayı yanıtı ("bana X filmini anlat" gibi sorgular için)
      if (data.action === 'describe_movie' && data.movie) {
        const botMessage: Message = {
          from: "bot",
          text: data.text || `I found this about "${data.movie.title}":`,
          movieDetail: data.movie,
        };
        setMessages((prev) => [...prev, botMessage]);
      } 
      // 2. Film tavsiyesi yanıtı (mevcut davranış)
      else if (data.reply) {
        const sentimentText = data.sentiment 
          ? `I sense you are feeling ${data.sentiment.toLowerCase()}. Here are some recommendations:` 
          : `Here are some recommendations for you:`;

        const botMessage: Message = {
          from: "bot",
          text: sentimentText,
          movies: data.reply,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Unknown response structure from chatbot API");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I had trouble finding movies. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  const clearChat = () => {
    setMessages([{ from: "bot", text: "Chat cleared. How can I help you now?" }]);
    setQuizActive(false);
    setSuggestions(getShuffledSuggestions(6));
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>

      {/* Robot Button */}
      <button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white z-50 shadow-lg transition-all duration-300 hover:scale-110 ${
          open ? "bg-red-500 rotate-90 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse shadow-[0_0_20px_rgba(236,72,153,0.6)]"
        }`}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.25)] flex flex-col z-50 overflow-hidden animate-fade-in-up">
          {showConfetti && <Confetti />}
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-900/90 to-blue-900/90 border-b border-purple-500/20 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold text-lg">Movie Assistant</h3>
                <p className="text-xs opacity-80">Powered by AI</p>
              </div>
            </div>
            <button 
              onClick={clearChat}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition"
              title="Clear Chat"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div
            ref={containerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm md:text-base ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-[0_0_10px_rgba(192,38,211,0.3)]"
                      : "bg-gray-800/80 text-gray-100 rounded-bl-none border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  }`}
                >
                  {msg.text}
                </div>

                {/* YENİ: Film Detay Kartı */}
                {msg.movieDetail && (
                  <div className="mt-2 w-full max-w-[85%] bg-gray-800/90 rounded-lg shadow-lg border border-cyan-500/30 flex gap-3 p-3">
                    <div className="flex-shrink-0 w-24">
                      <Link to={`/${msg.movieDetail.type}/${msg.movieDetail.id}`}>
                        {msg.movieDetail.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${msg.movieDetail.poster_path}`}
                            alt={msg.movieDetail.title}
                            className="w-full h-auto object-cover rounded-md transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-gray-300 flex items-center justify-center text-xs text-gray-500 rounded-md">
                            No Image
                          </div>
                        )}
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/${msg.movieDetail.type}/${msg.movieDetail.id}`} className="group">
                        <h4 className="font-bold text-gray-100 group-hover:text-cyan-400 truncate transition-colors">{msg.movieDetail.title}</h4>
                      </Link>
                      <p className="text-xs text-gray-400 mb-1">
                        {msg.movieDetail.release_date?.split('-')[0]}
                        {msg.movieDetail.vote_average ? ` • ★ ${msg.movieDetail.vote_average.toFixed(1)}` : ''}
                      </p>
                      <p className="text-xs text-gray-300 line-clamp-4">{msg.movieDetail.overview}</p>
                    </div>
                  </div>
                )}

                {/* Movie Cards */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-3 w-full overflow-x-auto pb-2 scrollbar-hide flex gap-3 px-1">
                    {msg.movies.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/${movie.type}/${movie.id}`}
                        className="flex-shrink-0 w-28 group"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md mb-1">
                          {movie.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <p className="text-xs font-medium truncate text-gray-300 group-hover:text-cyan-400 transition-colors">
                          {movie.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-gray-800/80 border border-cyan-500/30 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] text-gray-400 ml-2 mt-1 animate-pulse">AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {!loading && messages.length < 3 && (
            <div className="px-4 py-2 bg-transparent flex gap-2 overflow-x-auto scrollbar-hide">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-gray-800/80 border border-purple-500/30 rounded-full hover:bg-purple-500/20 hover:border-purple-400 transition-all text-gray-300 hover:text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-gray-900/90 border-t border-purple-500/20 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="How are you feeling?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full focus:outline-none focus:border-pink-500 focus:shadow-[0_0_10px_rgba(236,72,153,0.2)] text-white text-sm placeholder-gray-500 transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-full transition-colors ${
                !input.trim() || loading
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transform hover:scale-105"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;