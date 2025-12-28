import express from "express";
import WatchList from "../models/WatchList.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) return res.status(401).json({ error: "Token format incorrect" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verify error:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// POST /api/watchlists → yeni watchlist öğesi ekle
router.post("/", verifyToken, async (req, res) => {
  const { movieId, title, poster_path, media_type } = req.body;
  if (!movieId || !title) return res.status(400).json({ error: "MovieId and title required" });

  try {
    const exists = await WatchList.findOne({ movieId, userId: req.user.id });
    if (exists) return res.status(409).json({ error: "Already in watchlists" });

    const watch = new WatchList({ movieId, title, poster_path, media_type, userId: req.user.id });
    const saved = await watch.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add watchlist" });
  }
});

// DELETE /api/watchlists/:movieId → watchlist öğesini sil
router.delete("/:movieId", verifyToken, async (req, res) => {
  try {
    const deleted = await WatchList.findOneAndDelete({ movieId: req.params.movieId, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "WatchList not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete watchlist" });
  }
});

// GET /api/watchlists → kullanıcı listesini getir (Opsiyonel: ?userId=... ile başkasınınkini getir)
router.get("/", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user.id;
    const watchlists = await WatchList.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json(watchlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// GET /api/watchlists/user/:userId → belirli kullanıcının listesini getir
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlists = await WatchList.find({ userId }).sort({ createdAt: -1 });
    res.json(watchlists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

// GET /api/watchlists/:movieId → watchlist kontrol
router.get("/:movieId", verifyToken, async (req, res) => {
  try {
    const watch = await WatchList.findOne({ movieId: req.params.movieId, userId: req.user.id });
    res.json({ isWatchlist: !!watch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check watchlist" });
  }
});

export default router;
