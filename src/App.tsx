import { useState } from "react";

import Navbar from "./components/Navbar";
import SearchBar from "./components/searchBar";
import Hero from "./components/Hero";
import Trending from "./components/Trending";

function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <SearchBar />
      <Hero />
      <Trending />
    </div>
  );
}

export default App;
