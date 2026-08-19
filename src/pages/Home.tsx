import React from "react";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import TrailerSection from "../components/TrailerSection";
import Popular from "../components/Popular";
import FreeToWatch from "../components/FreeToWatch";
import Recommendations from "../components/Recommendations";
import Chatbot from "../components/Chatbot";

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Recommendations />
      <Trending />
      <TrailerSection />
      <Popular />
      <FreeToWatch />
      <Chatbot />
    </>
  );
};

export default Home;
