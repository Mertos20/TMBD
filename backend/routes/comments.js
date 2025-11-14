import express from "express";
import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// JWT doğrulama middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1].trim();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT verify error:", err.message);
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// 1️⃣ Yorum ekleme
router.post("/", verifyToken, async (req, res) => {
  const { movieId, comment, rating } = req.body;
  if (!movieId || !comment) return res.status(400).json({ error: "MovieId and comment required" });

  try {
    const newComment = new Comment({
      movieId,
      userId: req.user.id,
      username: req.user.email, // ya da username saklıyorsan username
      comment,
      rating: rating || 0,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2️⃣ Movie bazlı yorumları listeleme
router.get("/:movieId", async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    const formattedComments = comments.map(c => ({
      ...c._doc,
      userId: c.userId.toString()
    }));
    res.json(formattedComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 3️⃣ Kullanıcı bazlı yorumları listeleme
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Sadece kendi yorumlarını almasını sağla
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const comments = await Comment.find({ userId }).sort({ createdAt: -1 });
    const formattedComments = comments.map(c => ({
      ...c._doc,
      userId: c.userId.toString()
    }));

    res.json(formattedComments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4️⃣ Yorum silme
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
