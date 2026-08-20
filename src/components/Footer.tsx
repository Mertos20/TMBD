import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const footerLinks = {
    pages: [
      { label: "Home", path: "/" },
      { label: "Movies", path: "/" },
      { label: "Trending", path: "/" },
      { label: "Recommendations", path: "/" },
    ],
    features: [
      { label: "Profile", path: "/profile" },
      { label: "Friends", path: "/profile" },
      { label: "Duels", path: "/duel" },
      { label: "Social", path: "/social" },
    ],
    community: [
      { label: "Ratings", path: "/" },
      { label: "Comments", path: "/" },
      { label: "Watchlist", path: "/" },
      { label: "Statistics", path: "/" },
    ],
    legal: [
      { label: "Terms of Use", path: "/" },
      { label: "Privacy Policy", path: "/" },
      { label: "Contact", path: "/" },
    ],
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

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
              {t("footer.desc")}
            </p>
          </div>

          {/* Links Container */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full lg:w-auto flex-1 justify-end">
            
            {/* Pages */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">{t("footer.pages")}</h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.pages.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="hover:text-[#01b4e4] transition-colors text-gray-300 text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">{t("footer.features")}</h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.features.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="hover:text-[#01b4e4] transition-colors text-gray-300 text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">{t("footer.community")}</h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.community.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="hover:text-[#01b4e4] transition-colors text-gray-300 text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-4 uppercase text-[#01b4e4]">{t("footer.legal")}</h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.legal.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="hover:text-[#01b4e4] transition-colors text-gray-300 text-left cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Movibase. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
