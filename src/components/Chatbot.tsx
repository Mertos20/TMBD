import React, { useState, useRef, useEffect } from "react";

interface Movie {
  id: number;
  title: string;
  type: "movie" | "tv";
}

interface Message {
  from: "user" | "bot";
  text: string;
  movies?: Movie[];
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "How do you feel today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmedInput = input.trim().toLowerCase();

    // Eğer boşsa veya sadece teşekkür ifadeleri ise
    if (!trimmedInput || /^(thank you|thanks|thx|ty)$/i.test(trimmedInput)) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Please share how you feel, thank you 😊" },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const botMessage: Message = {
        from: "bot",
        text: "Here are some suggestions based on your mood:",
        movies: data.reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, I couldn't fetch recommendations. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Robot Button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white z-50 shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 md:w-96 max-h-[500px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-lg">
            Chatbot
          </div>

          {/* Messages */}
          <div
            ref={containerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3"
          >
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                <div
                  className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                    msg.from === "user"
                      ? "self-end bg-gray-200 dark:bg-gray-700 text-black"
                      : "self-start bg-blue-500 text-white"
                  }`}
                >
                  {msg.text}
                </div>

               
                {msg.movies && (
                  <ul className="mt-1 space-y-1">
                    {msg.movies.map((movie) => (
                      <li key={movie.id}>
                        <a
                          href={`/${movie.type}/${movie.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {movie.title} ({movie.type})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {loading && (
              <div className="self-start text-blue-500">Loading...</div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your feeling..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
