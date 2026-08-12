import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFoundImage from '../aspects/404.svg';

const quotes = [
  { text: "Toto, I've a feeling we're not in Kansas anymore.", movie: "The Wizard of Oz" },
  { text: "Houston, we have a problem.", movie: "Apollo 13" },
  { text: "There's no place like home.", movie: "The Wizard of Oz" },
  { text: "May the Force be with you.", movie: "Star Wars" },
  { text: "E.T. phone home.", movie: "E.T. The Extra-Terrestrial" },
  { text: "I'll be back.", movie: "The Terminator" },
  { text: "You talking to me?", movie: "Taxi Driver" },
  { text: "Here's looking at you, kid.", movie: "Casablanca" },
  { text: "Why so serious?", movie: "The Dark Knight" },
  { text: "I see dead people.", movie: "The Sixth Sense" },
];

const NotFound = () => {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Set initial quote immediately
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const intervalId = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 3000); // 5 saniye

    return () => clearInterval(intervalId); // Component unmount olduğunda interval'ı temizle
  }, []); // Boş dependency array, bu effect'in sadece mount edildiğinde çalışmasını sağlar

  return (
    <>
    <style>{`
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.96; }
      }
      @keyframes flicker-intense {
        0%, 100% { opacity: 1; }
        25% { opacity: 0.85; }
        50% { opacity: 0.9; }
        75% { opacity: 0.75; }
      }
      .animate-flicker {
        animation: flicker 0.1s infinite;
      }
      .group:hover .animate-flicker {
        animation: flicker-intense 0.05s infinite;
      }
    `}</style>
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-900 text-center px-4 overflow-hidden">
      {/* Cinematic Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-80 z-0"></div>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-[1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      <div className="z-10 flex flex-col items-center max-w-2xl w-full">
        {/* TV Frame / Screen Container */}
        <div className="relative mb-8 group w-full max-w-lg">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-black p-1 rounded-lg border-4 border-gray-800 shadow-2xl overflow-hidden animate-flicker transform -skew-x-1 skew-y-1 transition-transform duration-75 group-hover:-skew-x-3 group-hover:skew-y-3">
            {/* Scanline Effect */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
            
            <img src={NotFoundImage} alt="404 Scene Not Found" className="w-full rounded opacity-90 relative z-10" />
            
            {/* Random Movie Quote Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
              <div className="bg-black/60 p-4 rounded-xl backdrop-blur-sm text-center border border-white/10 max-w-[90%] transform -rotate-1 shadow-lg">
                <p className="text-white/95 text-lg md:text-xl font-serif italic mb-2 drop-shadow-md">"{quote.text}"</p>
                <p className="text-gray-300/80 text-xs font-mono tracking-widest uppercase">- {quote.movie}</p>
              </div>
            </div>

            <div className="absolute top-4 right-6 z-30 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.7)]"></div>
              <span className="text-xs font-mono text-white/80 tracking-widest drop-shadow-md">REC</span>
            </div>
            
            <div className="absolute bottom-4 left-6 z-30 font-mono text-xs text-white/60 tracking-widest">
              00:04:04:00
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 tracking-tight">
          Cut!
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg leading-relaxed font-light">
          The scene you're looking for seems to have been left on the cutting room floor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">«</span> Rewind
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-r from-pink-600 to-purple-700 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default NotFound;