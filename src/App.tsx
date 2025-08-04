import { useState } from "react";

import Navbar from "./components/Navbar";
import SearchBar from "./components/searchBar";
import Hero from "./components/Hero";
import Trending from "./components/Trending";
import TrailerSection from "./components/TrailerSection";
import Popular from "./components/Popular";
import FreeToWatch from "./components/FreeToWatch";
import JoinSection from "./components/JoinSEction" ;
import Footer from "./components/Footer";
function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <SearchBar />
      <Hero />
      <Trending />
      <TrailerSection/>
      <Popular/>
      <FreeToWatch/>
      <JoinSection/>
      <Footer/>
      
    </div>
  );
}

export default App;
