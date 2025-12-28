import express from "express";
import { verifyAdmin } from "../middleware/adminAuth.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Favorite from "../models/Favorite.js";
import WatchList from "../models/WatchList.js";

const router = express.Router();

// Dashboard Statistics
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const privateUsers = await User.countDocuments({ isPrivate: true });
    const totalComments = await Comment.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    const totalWatchlist = await WatchList.countDocuments();

    // Son 7 gün için günlük kayıt istatistikleri
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Son 7 gün için günlük yorum istatistikleri
    const dailyComments = await Comment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // En aktif kullanıcılar (yorum sayısına göre)
    const topCommenters = await Comment.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $project: { username: "$user.username", count: 1 } }
    ]);

    // En favori eklenen filmler
    const topFavorites = await Favorite.aggregate([
      { $group: { _id: "$movieId", title: { $first: "$title" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      suspendedUsers,
      privateUsers,
      totalComments,
      totalFavorites,
      totalWatchlist,
      dailyRegistrations,
      dailyComments,
      topCommenters,
      topFavorites
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Get all users with activities
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    // Her kullanıcı için aktivite sayıları
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const commentCount = await Comment.countDocuments({ userId: user._id });
        const favoriteCount = await Favorite.countDocuments({ userId: user._id });
        const watchlistCount = await WatchList.countDocuments({ userId: user._id });

        return {
          ...user.toObject(),
          commentCount,
          favoriteCount,
          watchlistCount
        };
      })
    );

    res.json(usersWithStats);
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user details with all activities
router.get("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetPasswordToken -resetPasswordExpires");
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const comments = await Comment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);
    const favorites = await Favorite.find({ userId: user._id }).sort({ createdAt: -1 });
    const watchlist = await WatchList.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      comments,
      favorites,
      watchlist
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

// Suspend user
router.post("/users/:id/suspend", verifyAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isAdmin) return res.status(400).json({ error: "Cannot suspend admin users" });

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedReason = reason || "No reason provided";
    await user.save();

    res.json({ message: "User suspended successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to suspend user" });
  }
});

// Unsuspend user
router.post("/users/:id/unsuspend", verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isSuspended = false;
    user.suspendedAt = undefined;
    user.suspendedReason = undefined;
    await user.save();

    res.json({ message: "User unsuspended successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
});

// Delete user comment
router.delete("/comments/:id", verifyAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Get recent activities (all types combined)
router.get("/activities", verifyAdmin, async (req, res) => {
  try {
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "username");

    const recentFavorites = await Favorite.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "username");

    const recentWatchlist = await WatchList.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "username");

    // Combine and sort all activities
    const activities = [
      ...recentComments.map(c => ({ type: "comment", data: c, createdAt: c.createdAt })),
      ...recentFavorites.map(f => ({ type: "favorite", data: f, createdAt: f.createdAt })),
      ...recentWatchlist.map(w => ({ type: "watchlist", data: w, createdAt: w.createdAt }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
