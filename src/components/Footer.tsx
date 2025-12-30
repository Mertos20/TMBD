export default function Footer() {
  return (
    <footer className="bg-[#032541] text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
            <div className="flex items-center mb-6">
              <span className="text-3xl font-black bg-gradient-to-r from-[#01b4e4] to-[#90cea1] bg-clip-text text-transparent">
                Movi
              </span>
              <span className="text-3xl font-black text-white">base</span>
              <span className="ml-2 text-sm font-bold bg-[#01b4e4] text-[#032541] px-2 py-1 rounded">
                MVB
              </span>
            </div>
            <p className="text-sm text-gray-400 text-center lg:text-left max-w-xs hidden lg:block">
              Movibase (MVB) is a popular, user-editable database for movies and TV shows.
            </p>
          </div>

          {/* Links Container */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full lg:w-auto flex-1 justify-end">
            
            {/* The Basics */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">The Basics</h3>
              <ul className="space-y-2 text-sm">
                {["About Movibase", "Contact Us", "Support Forums", "API", "System Status"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#01b4e4] transition-colors text-gray-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">Get Involved</h3>
              <ul className="space-y-2 text-sm">
                {["Contribution Bible", "Add New Movie", "Add New TV Show"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#01b4e4] transition-colors text-gray-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">Community</h3>
              <ul className="space-y-2 text-sm">
                {["Guidelines", "Discussions", "Leaderboard"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#01b4e4] transition-colors text-gray-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">Legal</h3>
              <ul className="space-y-2 text-sm">
                {["Terms of Use", "Privacy Policy", "DMCA Policy"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-[#01b4e4] transition-colors text-gray-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} The Movie Database. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
