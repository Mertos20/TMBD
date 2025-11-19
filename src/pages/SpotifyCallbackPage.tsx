import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search); // hash yerine search
    const token = params.get("access_token");

    if (token) {
      localStorage.setItem("spotify_access_token", token);
      alert("Spotify token alındı!");
      navigate("/"); // ana sayfaya
    } else {
      alert("Spotify token bulunamadı!");
      navigate("/login");
    }
  }, [navigate]);

  return <div>Spotify yönlendiriliyor...</div>;
};

export default SpotifyCallback;
