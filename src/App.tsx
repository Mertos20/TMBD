import { useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import SearchBar from "./components/searchBar";
import SearchResults from "./pages/SearchBarResult";
import MovieCategoryPage from "./pages/MovieCategoryPage";
import RouteHandler from "./RouteHandler";

function App() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onSearchClick={handleSearchClick} />
      <SearchBar ref={searchInputRef} /> {/* 🔹 Her zaman görünür */}
      
      <Routes>
        <Route path="/" element={<Home />} />
       
        <Route path="/search" element={<SearchResults/>}/>
        <Route path="/:type/:param" element={<RouteHandler />} />

      </Routes>

      <Footer />
    </div>
  );
}

export default App;
