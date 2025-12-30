import express from "express";
import fetch from "node-fetch";
import Favorite from "../models/Favorite.js";
import WatchList from "../models/WatchList.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const TMDB_API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) return res.status(401).json({ error: "Token format incorrect" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) return res.status(403).json({ error: "Unauthorized" });

    // 1. Fetch User Data
    const [favorites, watchlist] = await Promise.all([
      Favorite.find({ userId }),
      WatchList.find({ userId }),
    ]);

    const allItems = [...favorites, ...watchlist];
    const knownIds = new Set(allItems.map((i) => i.movieId));

    // If no data, return popular movies
    if (allItems.length === 0) {
      const popRes = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
      const popData = await popRes.json();
      return res.json(popData.results || []);
    }

    // 2. Analyze User Preferences (Last 10 items for relevance)
    const recentItems = allItems.slice(-10);
    const genreCounts = {};
    const actorCounts = {};
    const langCounts = {};
    const years = [];

    // Fetch details for analysis
    await Promise.all(
      recentItems.map(async (item) => {
        try {
          const type = item.media_type || "movie";
          const detailRes = await fetch(
            `https://api.themoviedb.org/3/${type}/${item.movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits`
          );
          const data = await detailRes.json();

          // Genres
          data.genres?.forEach((g) => {
            genreCounts[g.id] = (genreCounts[g.id] || 0) + 1;
          });

          // Cast (Top 5 billed)
          data.credits?.cast?.slice(0, 5).forEach((c) => {
            actorCounts[c.id] = (actorCounts[c.id] || 0) + 1;
          });

          // Language
          if (data.original_language) {
            langCounts[data.original_language] = (langCounts[data.original_language] || 0) + 1;
          }

          // Year
          const date = data.release_date || data.first_air_date;
          if (date) years.push(parseInt(date.split("-")[0]));
        } catch (e) {
          console.error("Error fetching details for analysis:", e);
        }
      })
    );

    // Determine Top Preferences
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)
      .join(","); // e.g., "28,12,878"

    const topActors = Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id)
      .join(","); // e.g., "123,456"

    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en';

    const avgYear = years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : null;

    // 3. Fetch Recommendations based on criteria
    const queries = [];

    // Strategy A: Based on Genres + Year
    if (topGenres && avgYear) {
      queries.push(
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenres}&primary_release_date.gte=${avgYear - 5}-01-01&primary_release_date.lte=${avgYear + 5}-12-31&with_original_language=${topLang}&sort_by=popularity.desc`
        )
      );
    }

    // Strategy B: Based on Actors
    if (topActors) {
      queries.push(
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_cast=${topActors}&with_original_language=${topLang}&sort_by=popularity.desc`
        )
      );
    }

    // Strategy C: Just Top Genres (Fallback)
    if (topGenres) {
      queries.push(
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${topGenres}&with_original_language=${topLang}&sort_by=popularity.desc`
        )
      );
    }

    const responses = await Promise.all(queries);
    const results = await Promise.all(responses.map((r) => r.json()));

    // 4. Merge and Filter
    const candidates = [];
    results.forEach((data) => {
      if (data.results) candidates.push(...data.results);
    });

    // Deduplicate and remove watched
    const uniqueRecommendations = [];
    const seenIds = new Set(knownIds);

    for (const movie of candidates) {
      if (!seenIds.has(movie.id)) {
        uniqueRecommendations.push(movie);
        seenIds.add(movie.id);
      }
    }

    // Shuffle slightly to give variety or just take top 20
    res.json(uniqueRecommendations.slice(0, 20));

  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;
