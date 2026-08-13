import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const getRedirectUri = () => {
  const uri = process.env.SPOTIFY_REDIRECT_URI;
  if (!uri || uri.includes("ngrok-free.dev")) {
    return "https://webb-mb-hbd5feanavdwdyfp.swedencentral-01.azurewebsites.net/spotify/callback";
  }
  return uri;
};

// 1️⃣ Spotify login yönlendirmesi
router.get("/login", (req, res) => {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = getRedirectUri();
  const SCOPES = "playlist-modify-private";

  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;

  res.redirect(url);
});

// 2️⃣ Spotify callback (token alınıp frontend'e gönderiliyor)
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("No code received");

  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REDIRECT_URI = getRedirectUri();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      console.error("Spotify token error:", tokenText);
      return res.status(400).send("Spotify token alınamadı!");
    }

    const data = JSON.parse(tokenText);
    console.log("Spotify token:", data);

    res.send(`
      <script>
        window.opener.postMessage({ access_token: "${data.access_token}" }, "*");
        window.close();
      </script>
    `);
  } catch (err) {
    console.error("Spotify callback error:", err);
    res.status(500).send("Spotify token alınırken hata oluştu!");
  }
});

// 3️⃣ Spotify playlist oluşturma
router.post("/create-playlist", async (req, res) => {
  const { access_token, tracks, playlist_name } = req.body;

  if (!access_token || !tracks || tracks.length === 0 || !playlist_name) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    // Kullanıcının Spotify ID'sini al
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const meText = await meRes.text();
    if (!meRes.ok) {
      console.error("Spotify /me error:", meText);
      return res.status(400).json({ error: "Could not get Spotify user ID" });
    }
    const meData = JSON.parse(meText);
    const userId = meData.id;

    // Yeni playlist oluştur
    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: playlist_name,
        description: "Created with AI Vibe Playlist",
        public: false
      }),
    });
    const playlistText = await playlistRes.text();
    if (!playlistRes.ok) {
      console.error("Spotify create playlist error:", playlistText);
      return res.status(400).json({ error: "Could not create playlist" });
    }
    const playlistData = JSON.parse(playlistText);

    // Trackleri Spotify ID’lerine çevir
    const trackIds = [];
    for (const track of tracks) {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(track)}&type=track&limit=1`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const searchText = await searchRes.text();
      if (!searchRes.ok) {
        console.error("Spotify search error:", searchText);
        continue; // hatalı track'i atla
      }
      const searchData = JSON.parse(searchText);
      if (searchData.tracks.items.length > 0) {
        trackIds.push(searchData.tracks.items[0].uri);
      }
    }

    // Playlist’e track ekle
    const addRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uris: trackIds }),
    });
    const addText = await addRes.text();
    if (!addRes.ok) {
      console.error("Spotify add tracks error:", addText);
      return res.status(400).json({ error: "Could not add tracks to playlist" });
    }

    res.json({ success: true, playlist_url: playlistData.external_urls.spotify });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ error: "Failed to create Spotify playlist" });
  }
});

export default router;
