import express from "express";
import fetch from "node-fetch";
import Favorite from "../models/Favorite.js";
import WatchList from "../models/WatchList.js";
import Rating from "../models/Rating.js";
import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";
import { generateAIText } from "../utils/aiFoundry.js";

const router = express.Router();
const TMDB_API_KEY = "d0b51a37ed5a34284904dab55afbc04c";

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    }
    next();
  });
};

// In-memory backend cache for recommendations
const recommendationCache = new Map();
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 Hours

/**
 * POST /api/recommendations/ai
 * AI-powered recommendation endpoint using Azure AI Foundry
 */
router.post("/ai", optionalVerifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { recentViews = [], forceRefresh = false } = req.body || {};

    let userFavorites = [];
    let userWatchlist = [];
    let userRatings = [];
    let userComments = [];

    if (userId) {
      const [favs, watch, rates, comments] = await Promise.all([
        Favorite.find({ userId }).limit(15),
        WatchList.find({ userId }).limit(15),
        Rating.find({ userId }).limit(15),
        Comment.find({ userId }).limit(10),
      ]);
      userFavorites = favs;
      userWatchlist = watch;
      userRatings = rates;
      userComments = comments;
    }

    // Build action fingerprint hash
    const fingerprint = `${userId || "guest"}_${userFavorites.length}_${userWatchlist.length}_${
      userRatings.length
    }_${recentViews.length}`;

    // Check backend cache unless forced refresh
    if (!forceRefresh && recommendationCache.has(fingerprint)) {
      const cached = recommendationCache.get(fingerprint);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.json({
          userProfileSummary: cached.userProfileSummary,
          recommendations: cached.recommendations,
          fromCache: true,
        });
      }
    }

    // Determine if we have enough personal data to justify an AI call.
    // Guests and users with empty libraries skip AI entirely → instant TMDB response (~200ms).
    const hasPersonalData =
      userFavorites.length > 0 || userWatchlist.length > 0 || userRatings.length > 0;

    let aiResult = null;

    if (userId && hasPersonalData) {
      const profileText = `
User Profile & Behavior Analysis:
- Favorited Movies/Shows: ${userFavorites.map((f) => f.title || f.name).join(", ") || "None"}
- Watchlist Items: ${userWatchlist.map((w) => w.title || w.name).join(", ") || "None"}
- User High Ratings: ${userRatings.map((r) => `Movie ID ${r.movieId} Rated ${r.rating}/5`).join(", ") || "None"}
- User Comments/Thoughts: ${userComments.map((c) => `"${c.comment}"`).join("; ") || "None"}
- Recent Browsing History: ${recentViews.map((v) => v.title || v.name || v).join(", ") || "None"}
`;

      const systemPrompt = `You are Movibase AI Engine, an expert film curator and personalized recommendation agent.
Analyze the user's explicit behavior (favorites, watchlist, high ratings, comments) and implicit browsing history.
You MUST act as a recommendation instruction tool and output a strictly valid JSON object matching this schema:

{
  "userProfileSummary": "A concise 1-sentence Turkish summary of the user's cinematic taste and current mood.",
  "recommendations": [
    {
      "title": "Exact Title of Recommended Movie or TV Show",
      "media_type": "movie" or "tv",
      "reason": "Clear 1-sentence Turkish reason explaining why this is recommended based on user's exact preferences/recent views.",
      "matchPercentage": 95
    }
  ]
}

Provide 10 diverse, high-quality, relevant movie or TV show recommendations. Do NOT repeat items from their favorites list. Output ONLY the JSON object.`;

      try {
        const aiResponseText = await generateAIText({
          prompt: profileText,
          systemPrompt,
          temperature: 0.7,
          jsonMode: true,
        });
        aiResult = JSON.parse(aiResponseText);
      } catch (aiError) {
        console.warn("⚠️ Azure AI Foundry recommendation call fallback:", aiError.message);
      }
    }

    const knownTitles = new Set([
      ...userFavorites.map((f) => (f.title || f.name || "").toLowerCase()),
      ...userWatchlist.map((w) => (w.title || w.name || "").toLowerCase()),
    ]);

    // Parallelize TMDB Metadata Resolution for high performance (~150ms)
    let finalRecommendations = [];
    if (aiResult?.recommendations && Array.isArray(aiResult.recommendations)) {
      const searchPromises = aiResult.recommendations.map(async (rec) => {
        if (!rec.title || knownTitles.has(rec.title.toLowerCase())) return null;

        try {
          const type = rec.media_type === "tv" ? "tv" : "movie";
          const searchUrl = `https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
            rec.title
          )}&language=en-US`;

          const searchRes = await fetch(searchUrl);
          const searchData = await searchRes.json();

          if (searchData.results && searchData.results.length > 0) {
            const tmdbItem = searchData.results[0];
            return {
              id: tmdbItem.id,
              title: tmdbItem.title || tmdbItem.name,
              poster_path: tmdbItem.poster_path,
              backdrop_path: tmdbItem.backdrop_path,
              vote_average: tmdbItem.vote_average,
              release_date: tmdbItem.release_date,
              first_air_date: tmdbItem.first_air_date,
              media_type: type,
              aiReason: rec.reason || "Kullanıcı tercihlerine ve izleme geçmişine göre önerildi.",
              matchPercentage: rec.matchPercentage || 92,
            };
          }
        } catch (e) {
          console.error("Error resolving TMDB metadata for AI rec:", rec.title, e);
        }
        return null;
      });

      const resolvedResults = await Promise.all(searchPromises);
      finalRecommendations = resolvedResults.filter(Boolean);
    }

    // Fallback: always runs for guests, runs for logged-in users if AI returned < 5 results
    if (finalRecommendations.length < 5) {
      try {
        const popRes = await fetch(
          `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const popData = await popRes.json();
        const fallbackItems = (popData.results || []).map((it) => ({
          id: it.id,
          title: it.title || it.name,
          poster_path: it.poster_path,
          backdrop_path: it.backdrop_path,
          vote_average: it.vote_average,
          release_date: it.release_date,
          first_air_date: it.first_air_date,
          media_type: it.media_type || "movie",
          aiReason: "Günün en çok tercih edilen popüler yapımları arasından önerildi.",
          matchPercentage: 88,
        }));

        for (const fb of fallbackItems) {
          if (!finalRecommendations.find((r) => r.id === fb.id)) {
            finalRecommendations.push(fb);
          }
          if (finalRecommendations.length >= 10) break;
        }
      } catch (err) {
        console.error("Fallback fetch failed:", err);
      }
    }

    const payload = {
      userProfileSummary:
        aiResult?.userProfileSummary ||
        "Günün en popüler ve çok izlenen yapımları arasından derlendi.",
      recommendations: finalRecommendations.slice(0, 10),
    };

    // Save to backend cache
    recommendationCache.set(fingerprint, {
      ...payload,
      timestamp: Date.now(),
    });

    res.json(payload);
  } catch (err) {
    console.error("AI Recommendation Router Error:", err);
    res.status(500).json({ error: "Failed to generate AI recommendations" });
  }
});

/**
 * GET /api/recommendations/:userId
 * Compatibility endpoint
 */
router.get("/:userId", optionalVerifyToken, async (req, res) => {
  try {
    const popRes = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}&language=tr-TR`
    );
    const popData = await popRes.json();
    res.json((popData.results || []).slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

export default router;
