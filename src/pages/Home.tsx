import React, { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import TrailerSection from "../components/TrailerSection";
import Popular from "../components/Popular";
import FreeToWatch from "../components/FreeToWatch";
import CookieConsent from "../components/CookieConstent";
import Recommendations from "../components/Recommendations";
import Chatbot from "../components/Chatbot";

const Home: React.FC = () => {
  const [cookieAccepted, setCookieAccepted] = useState<boolean>(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === "true") setCookieAccepted(true);
  }, []);

  return (
    <>
      <Hero />
      {!cookieAccepted && <CookieConsent onAccept={() => setCookieAccepted(true)} />}
      <Recommendations cookieAccepted={cookieAccepted} />
      <Trending />
      <TrailerSection />
      <Popular />
      <FreeToWatch />
      <Chatbot />
    </>
  );
};

export default Home;
