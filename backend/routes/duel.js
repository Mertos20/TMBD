import express from "express";
import fetch from "node-fetch";
import DuelStats from "../models/DuelStats.js";
import DailyTournament from "../models/DailyTournament.js";
import DailyMovieStats from "../models/DailyMovieStats.js";

const router = express.Router();
const TMDB_API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

// Helper: Get today's date string YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// GET /api/duel/daily → Get the 32 movies for today's tournament
router.get("/daily", async (req, res) => {
  const today = getTodayDate();

  try {
    // Check if tournament exists for today
    let tournament = await DailyTournament.findOne({ date: today });

    if (!tournament) {
      // Create new tournament
      // Fetch 2 pages of popular movies to get 40, then pick 32
      const p1 = fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`).then(r => r.json());
      const p2 = fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=2`).then(r => r.json());
      
      const [d1, d2] = await Promise.all([p1, p2]);
      let allMovies = [...(d1.results || []), ...(d2.results || [])];

      // Filter out movies without posters or titles
      allMovies = allMovies.filter(m => m.poster_path && m.title);

      // Shuffle and pick 32
      const shuffled = allMovies.sort(() => 0.5 - Math.random()).slice(0, 32);

      const tournamentMovies = shuffled.map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
        vote_average: m.vote_average
      }));

      tournament = new DailyTournament({
        date: today,
        movies: tournamentMovies
      });

      await tournament.save();
    }

    res.json(tournament.movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch daily tournament" });
  }
});

// POST /api/duel/vote → Register a win (round pass)
router.post("/vote", async (req, res) => {
  const { winnerId, title, poster_path } = req.body;
  const today = getTodayDate();

  if (!winnerId) return res.status(400).json({ error: "Winner ID required" });

  try {
    // Update Daily Stats (+1 point)
    await DailyMovieStats.findOneAndUpdate(
      { date: today, movieId: winnerId },
      {
        $set: { title, poster_path },
        $inc: { points: 1 }
      },
      { upsert: true, new: true }
    );

    // Optional: Update All-Time Stats (just wins)
    await DuelStats.findOneAndUpdate(
      { movieId: winnerId },
      {
        $set: { title, poster_path },
        $inc: { wins: 1 }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register vote" });
  }
});

// GET /api/duel/daily-podium → Get top 3 movies with most points today
router.get("/daily-podium", async (req, res) => {
  const today = getTodayDate();
  try {
    const podium = await DailyMovieStats.find({ date: today }).sort({ points: -1 }).limit(3);
    res.json(podium);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily podium" });
  }
});

// GET /api/duel/leaderboard → All time leaderboard (kept for compatibility)
router.get("/leaderboard", async (req, res) => {
  try {
    // Top 10 by wins
    const leaderboard = await DuelStats.find().sort({ wins: -1 }).limit(10);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
