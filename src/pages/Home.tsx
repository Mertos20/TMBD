import React from "react";
import SearchBar from "../components/searchBar";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import TrailerSection from "../components/TrailerSection";
import Popular from "../components/Popular";
import FreeToWatch from "../components/FreeToWatch";
import JoinSection from "../components/JoinSection";

const Home = () => {
  return (
    <>
      <SearchBar />
      <Hero />
      <Trending />
      <TrailerSection />
      <Popular />
      <FreeToWatch />
      <JoinSection />
    </>
  );
};

export default Home;
