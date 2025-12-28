import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Rating from "../models/Rating.js";
import Favorite from "../models/Favorite.js";
import WatchList from "../models/WatchList.js";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1].trim();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Get Badge Progress
router.get("/progress", verifyToken, async (req, res) => {
  try {
    // Allow fetching for specific user via query param, default to current user
    const userId = req.query.userId || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ratingCount = await Rating.countDocuments({ userId });
    const commentCount = await Comment.countDocuments({ userId });
    const favoriteCount = await Favorite.countDocuments({ userId });
    const watchlistCount = await WatchList.countDocuments({ userId });
    const vibeCount = user.vibeCount || 0;

    const badges = [
      { id: 1, name: "Critic", description: "Rate 5 movies", current: ratingCount, target: 5, unlocked: ratingCount >= 5 },
      { id: 2, name: "Voice", description: "Post 5 comments", current: commentCount, target: 5, unlocked: commentCount >= 5 },
      { id: 3, name: "Collector", description: "Add 5 favorites", current: favoriteCount, target: 5, unlocked: favoriteCount >= 5 },
      { id: 4, name: "Planner", description: "Add 5 watchlist items", current: watchlistCount, target: 5, unlocked: watchlistCount >= 5 },
      { id: 5, name: "Vibe Master", description: "Create 3 Vibe playlists", current: vibeCount, target: 3, unlocked: vibeCount >= 3 },
    ];

    const allUnlocked = badges.every(b => b.unlocked);

    res.json({
      badges,
      allUnlocked,
      rewardCode: user.rewardCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Claim Reward
router.post("/claim", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.rewardCode) {
      return res.json({ code: user.rewardCode });
    }

    // Check requirements again
    const ratingCount = await Rating.countDocuments({ userId });
    const commentCount = await Comment.countDocuments({ userId });
    const favoriteCount = await Favorite.countDocuments({ userId });
    const watchlistCount = await WatchList.countDocuments({ userId });
    const vibeCount = user.vibeCount || 0;

    if (ratingCount >= 5 && commentCount >= 5 && favoriteCount >= 5 && watchlistCount >= 5 && vibeCount >= 3) {
      // Generate unique code
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const year = new Date().getFullYear();
      const code = `TMDB-${year}-${randomPart}`;

      user.rewardCode = code;
      await user.save();

      return res.json({ code });
    } else {
      return res.status(400).json({ error: "Requirements not met" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
