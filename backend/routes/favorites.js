import express from "express";
import Favorite from "../models/Favorite.js";
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

// POST /api/favorites → yeni favori ekle
router.post("/", verifyToken, async (req, res) => {
  const { movieId, title, poster_path, media_type } = req.body;
  if (!movieId || !title) return res.status(400).json({ error: "MovieId and title required" });

  try {
    const exists = await Favorite.findOne({ movieId, userId: req.user.id });
    if (exists) return res.status(409).json({ error: "Already in favorites" });

    const fav = new Favorite({ movieId, title, poster_path, media_type, userId: req.user.id });
    const saved = await fav.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// DELETE /api/favorites/:movieId → favoriyi sil
router.delete("/:movieId", verifyToken, async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({ movieId: req.params.movieId, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Favorite not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete favorite" });
  }
});

// GET /api/favorites → kullanıcı favorilerini getir (Opsiyonel: ?userId=... ile başkasınınkini getir)
router.get("/", verifyToken, async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user.id;
    const favorites = await Favorite.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// GET /api/favorites/user/:userId → belirli kullanıcının favorilerini getir
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// GET /api/favorites/:movieId → favori kontrol
router.get("/:movieId", verifyToken, async (req, res) => {
  try {
    const fav = await Favorite.findOne({ movieId: req.params.movieId, userId: req.user.id });
    res.json({ isFavorite: !!fav });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check favorite" });
  }
});

export default router;
