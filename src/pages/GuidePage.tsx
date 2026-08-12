import React, { useState } from "react";
import { useTheme } from "../components/ThemaContext";
import { Link } from "react-router-dom";

const GuidePage = () => {
  const { darkMode } = useTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up to unlock your personal watchlist and profile." },
    { num: "02", title: "Discover & Track", desc: "Browse movies, use AI tools, and mark what you've watched." },
    { num: "03", title: "Join the Community", desc: "Participate in duels, follow friends, and earn badges." },
  ];

  const faqs = [
    {
      question: "Is MoviBase free to use?",
      answer: "Yes! You can browse, track movies, and use basic AI features for free. Join us and start your journey."
    },
    {
      question: "How does the AI Vibe work?",
      answer: "Our AI analyzes the mood, soundtrack, and visual style of movies to generate Spotify playlists that match the atmosphere perfectly."
    },
    {
      question: "How do I earn badges?",
      answer: "Simply engage with the platform! Rate movies, leave comments, and participate in daily duels to unlock unique achievements."
    }
  ];

  const testimonials = [
    { name: "Muhammed Cihan", role: "System Engineer", comment: "The AI recommendations are scarily accurate. Love it!", avatar: "MC" },
    { name: "Mert Bektaş", role: "Software Developer", comment: "Duel mode is the highlight of my day. So much fun!", avatar: "MB" },
    { name: "Mehmet Ertin", role: "Director", comment: "A beautiful interface for movie lovers. The dark mode is perfect.", avatar: "ME" },
    { name: "Bengisu Karadağ", role: "Student", comment: "Finally found a place to track all my watched movies easily.", avatar: "BK" },
    { name: "Mustafa Coşkun", role: "Cinephile", comment: "The community features make me feel connected to other fans.", avatar: "M" },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-10 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Welcome to Movibase Guide
        </h1>
        <p className="text-center text-lg opacity-70 mb-16 max-w-2xl mx-auto">
          Discover everything you can do on our platform. From AI-powered features to social interactions, here is how to make the most of your experience.
        </p>

        {/* Getting Started Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {steps.map((step, idx) => (
            <div key={idx} className={`p-6 rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} text-center`}>
              <div className="w-12 h-12 mx-auto bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="opacity-70 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold text-center mb-10">Key Features</h2>
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

        {/* Testimonials Section */}
        <div className="mt-24 mb-10 overflow-hidden relative">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          
          {/* Gradient masks for smooth fade effect at edges */}
          <div className={`absolute top-0 left-0 w-20 h-full z-10 bg-gradient-to-r ${darkMode ? "from-gray-900" : "from-gray-100"} to-transparent pointer-events-none`}></div>
          <div className={`absolute top-0 right-0 w-20 h-full z-10 bg-gradient-to-l ${darkMode ? "from-gray-900" : "from-gray-100"} to-transparent pointer-events-none`}></div>

          <div className="flex animate-scroll" style={{ width: "max-content" }}>
            {/* Duplicating list for seamless infinite scroll */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className={`mx-4 p-6 rounded-xl w-80 flex-shrink-0 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border shadow-lg`}>
                <p className="italic mb-4 opacity-80 text-sm leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{t.name}</h5>
                    <span className="text-xs opacity-60">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll { animation: scroll 40s linear infinite; }
            .animate-scroll:hover { animation-play-state: paused; }
          `}</style>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md overflow-hidden`}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <h4 className="text-xl font-semibold text-purple-500">{faq.question}</h4>
                  <span className="text-2xl font-bold ml-4 opacity-70">
                    {openFaqIndex === index ? "−" : "+"}
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaqIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-6 pb-6 opacity-80">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
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