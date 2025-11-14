import { useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import SearchBar from "./components/searchBar";
import SearchResults from "./pages/SearchBarResult";
import MovieCategoryPage from "./pages/MovieCategoryPage";
import RouteHandler from "./RouteHandler";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ProfilePage from "./pages/ProfilePage";
import SpotifyCallbackPage from "./pages/SpotifyCallbackPage"; // 🔹 Yeni sayfa

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onSearchClick={handleSearchClick} />
      <SearchBar ref={searchInputRef} /> {/* 🔹 Her zaman görünür */}

      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/search" element={token ? <SearchResults /> : <Navigate to="/login" />} />
        <Route path="/:type/:param" element={token ? <RouteHandler /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />

        {/* Spotify OAuth callback */}
       
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
