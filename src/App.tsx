import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DetailPage from "./pages/DetailPage";

function App() {
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
         <Route path="/:type/:id" element={<DetailPage />} />

      </Routes>
      <Footer />
    </div>
  );
}

export default App;
