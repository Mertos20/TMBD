import { useState } from "react";

import Navbar from "./components/Navbar";


function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar  />
     
       
     
    </div>
  );
}

export default App;
