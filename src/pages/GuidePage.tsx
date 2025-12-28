import React from "react";
import { useTheme } from "../components/ThemaContext";
import { Link } from "react-router-dom";

const GuidePage = () => {
  const { darkMode } = useTheme();

  const features = [
    {
      title: "🎬 Movies & TV Shows",
      description: "Explore thousands of movies and TV shows. Get detailed information, cast, trailers, and find out where to watch them.",
      icon: "🎥"
    },
    {
      title: "🤖 AI Vibe Check",
      description: "Not sure what to watch? Or want music that matches a movie's mood? Use our AI Vibe feature on movie detail pages to generate Spotify playlists based on movie atmospheres.",
      icon: "🎵"
    },
    {
      title: "⚔️ Duel Mode",
      description: "Participate in our Daily Movie Tournament. Vote for your favorites in a bracket-style competition and help crown the Movie of the Day! Top 3 movies get on the podium.",
      icon: "🏆"
    },
    {
      title: "👥 Social Features",
      description: "Follow friends, see what they are watching, liking, and reviewing. Build your own profile with Favorites and Watchlists. Get notifications when someone follows you.",
      icon: "🌍"
    },
    {
      title: "💬 AI Chatbot",
      description: "Have questions about a movie? Chat with our AI assistant to get instant answers and recommendations.",
      icon: "🤖"
    },
    {
      title: "🏅 Gamification",
      description: "Earn badges for your activities! Comment, rate, and engage to unlock achievements and even win real rewards like cinema tickets.",
      icon: "🎖️"
    }
  ];

  return (
    <div className={`min-h-screen pt-24 pb-10 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Welcome to TBMD Guide
        </h1>
        <p className="text-center text-lg opacity-70 mb-16 max-w-2xl mx-auto">
          Discover everything you can do on our platform. From AI-powered features to social interactions, here is how to make the most of your experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 ${
                darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-5xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="opacity-70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
          <p className="mb-8 text-lg opacity-90">Start by searching for a movie or checking out the daily duel!</p>
          <Link to="/" className="px-8 py-3 bg-white text-purple-600 font-bold rounded-full hover:bg-gray-100 transition shadow-xl">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
