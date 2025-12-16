import express from "express";
import Rating from "../models/Rating.js";
import jwt from "jsonwebtoken";

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

// Get ratings by user
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const ratings = await Rating.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get ratings for a movie
router.get("/:movieId", async (req, res) => {
  try {
    const ratings = await Rating.find({ movieId: req.params.movieId });
    const average = ratings.length > 0 
      ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) 
      : 0;
    
    res.json({ ratings, average });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add/Update rating
router.post("/", verifyToken, async (req, res) => {
  const { movieId, rating } = req.body;
  if (!movieId || !rating) return res.status(400).json({ error: "Missing fields" });

  try {
    const updatedRating = await Rating.findOneAndUpdate(
      { movieId, userId: req.user.id },
      { rating },
      { new: true, upsert: true }
    );
    res.json(updatedRating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
