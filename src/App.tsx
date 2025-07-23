import { useState } from "react";

import Navbar from "./components/Navbar";
import SearchBar from "./components/searchBar";


function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar  />
      <SearchBar/>
     
       
     
    </div>
  );
}

export default App;
