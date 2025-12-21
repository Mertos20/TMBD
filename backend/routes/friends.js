import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import Favorite from "../models/Favorite.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]?.trim();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Search Users
router.get("/search", verifyToken, async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: req.user.id } // Exclude self
    }).select("username _id");
    
    // Check if already following
    const currentUser = await User.findById(req.user.id);
    const results = users.map(u => ({
      _id: u._id,
      username: u.username,
      isFollowing: currentUser.following.includes(u._id)
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Follow User
router.post("/follow/:id", verifyToken, async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ error: "Cannot follow self" });

  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id } });

    // Create Notification
    await Notification.create({
      recipient: req.params.id,
      sender: req.user.id,
      type: "follow"
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Follow failed" });
  }
});

// Unfollow User
router.post("/unfollow/:id", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Unfollow failed" });
  }
});

// Get Followers
router.get("/followers/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("followers", "username");
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// Get Following
router.get("/following/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("following", "username");
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

// Get Activity Feed
router.get("/feed", verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.following;

    if (followingIds.length === 0) return res.json([]);

    // Fetch recent activities from followed users
    const [ratings, favorites, comments] = await Promise.all([
      Rating.find({ userId: { $in: followingIds } }).populate("userId", "username").sort({ createdAt: -1 }).limit(20).lean(),
      Favorite.find({ userId: { $in: followingIds } }).populate("userId", "username").sort({ createdAt: -1 }).limit(20).lean(),
      Comment.find({ userId: { $in: followingIds } }).populate("userId", "username").sort({ createdAt: -1 }).limit(20).lean()
    ]);

    // Normalize and merge
    const feed = [
      ...ratings.map(r => ({ ...r, type: "rating", date: r.createdAt })),
      ...favorites.map(f => ({ ...f, type: "favorite", date: f.createdAt })),
      ...comments.map(c => ({ ...c, type: "comment", date: c.createdAt }))
    ];

    // Sort by date desc
    feed.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(feed.slice(0, 50));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Feed failed" });
  }
});

export default router;
