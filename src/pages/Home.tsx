import React from "react";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import TrailerSection from "../components/TrailerSection";
import Popular from "../components/Popular";
import FreeToWatch from "../components/FreeToWatch";


const Home = () => {
  return (
    <>
      <Hero />
      <Trending />
      <TrailerSection />
      <Popular />
      <FreeToWatch />
      
    </>
  );
};

export default Home;
