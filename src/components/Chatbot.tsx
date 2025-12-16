import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface Movie {
  id: number;
  title: string;
  type: "movie" | "tv";
  poster_path?: string;
}

interface Message {
  from: "user" | "bot";
  text: string;
  movies?: Movie[];
}

const SUGGESTIONS = ["Happy", "Sad", "Excited", "Chill", "Romantic", "Adventurous"];

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi there! 👋 I'm your movie assistant. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    const trimmedInput = textToSend.trim();

    if (!trimmedInput) return;

    // Add user message
    const userMessage: Message = { from: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      
      const sentimentText = data.sentiment 
        ? `I sense you are feeling ${data.sentiment.toLowerCase()}. Here are some recommendations:` 
        : `Here are some recommendations for you:`;

      const botMessage: Message = {
        from: "bot",
        text: sentimentText,
        movies: data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);
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
    setMessages([{ from: "bot", text: "Chat cleared. How are you feeling now?" }]);
  };

  return (
    <>
      {/* Robot Button */}
      <button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white z-50 shadow-lg transition-all duration-300 hover:scale-110 ${
          open ? "bg-red-500 rotate-90" : "bg-gradient-to-r from-blue-500 to-purple-600"
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
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center shadow-md">
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
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm md:text-base ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-600"
                  }`}
                >
                  {msg.text}
                </div>

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
                        <p className="text-xs font-medium truncate text-gray-700 dark:text-gray-300 group-hover:text-blue-500">
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
              <div className="flex items-center gap-1 ml-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>

          {/* Suggestions */}
          {!loading && messages.length < 3 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 flex gap-2 overflow-x-auto scrollbar-hide">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="flex-shrink-0 px-3 py-1 text-xs font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-300 transition-colors text-gray-600 dark:text-gray-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="How are you feeling?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-full transition-colors ${
                !input.trim() || loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
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
