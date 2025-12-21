import { useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import SearchBar from "./components/searchBar";
import SearchResults from "./pages/SearchBarResult";
import RouteHandler from "./RouteHandler";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import ProfileDetail from "./pages/ProfileDetail";
import NotFound from "./pages/NotFound";
import DuelPage from "./pages/DuelPage";
import SocialPage from "./pages/SocialPage";

import { ThemeProvider } from "./components/ThemaContext";

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  const token = localStorage.getItem("token");
  const hideSearchBar = ["/login", "/signup"].includes(location.pathname);

  return (
    <ThemeProvider>
      <div className="min-h-screen transition-colors duration-300">
        {/* Navbar ve SearchBar sabit renk */}
        <Navbar onSearchClick={handleSearchClick} />
        {!hideSearchBar && <SearchBar ref={searchInputRef} />}

        {/* Sadece sayfalar ThemeProvider’dan etkilenir */}
        <div >
          <Routes>
            <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
            <Route path="/search" element={token ? <SearchResults /> : <Navigate to="/login" />} />
            <Route path="/:type/:param" element={token ? <RouteHandler /> : <Navigate to="/login" />} />
            <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/profile/:userId" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/profile-detail" element={token ? <ProfileDetail /> : <Navigate to="/login" />} />
            <Route path="/duel" element={token ? <DuelPage /> : <Navigate to="/login" />} />
            <Route path="/social" element={token ? <SocialPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
