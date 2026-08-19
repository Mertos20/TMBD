import express from "express";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Favorite from "../models/Favorite.js";
import WatchList from "../models/WatchList.js";
import Rating from "../models/Rating.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Optional token verification or Power BI API Key check
const verifyPowerBIAccess = (req, res, next) => {
  const apiKey = req.headers["x-powerbi-key"] || req.query.api_key;
  const expectedKey = process.env.POWERBI_API_KEY || "movibase-powerbi-secret-key";

  if (apiKey && apiKey === expectedKey) {
    return next();
  }

  // Fallback to standard Bearer token check
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1]?.trim();
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
          req.user = decoded;
          return next();
        }
        return res.status(401).json({ error: "Invalid token" });
      });
    }
  }

  // If no auth provided, allow public analytics read if configured
  next();
};

/**
 * GET /api/powerbi/admin-metrics
 * Analytics data stream formatted for Power BI Data Connector / DirectQuery
 */
router.get("/admin-metrics", verifyPowerBIAccess, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isSuspended: false });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const totalComments = await Comment.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    const totalWatchlist = await WatchList.countDocuments();
    const totalRatings = await Rating.countDocuments();

    // 30 Days Registration Trend for Power BI Time Intelligence
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userRegistrationTrends = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          registrations: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 30 Days Comment Volume
    const commentTrends = await Comment.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          commentsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top Favorited Movies Data Dataset
    const topMovies = await Favorite.aggregate([
      {
        $group: {
          _id: "$movieId",
          title: { $first: "$title" },
          mediaType: { $first: "$media_type" },
          favoriteCount: { $sum: 1 },
        },
      },
      { $sort: { favoriteCount: -1 } },
      { $limit: 15 },
    ]);

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalComments,
        totalFavorites,
        totalWatchlist,
        totalRatings,
        generatedAt: new Date().toISOString(),
      },
      userRegistrationTrends: userRegistrationTrends.map((t) => ({
        date: t._id,
        registrations: t.registrations,
      })),
      commentTrends: commentTrends.map((c) => ({
        date: c._id,
        commentsCount: c.commentsCount,
      })),
      topMovies: topMovies.map((m) => ({
        movieId: m._id,
        title: m.title || `Movie #${m._id}`,
        mediaType: m.mediaType || "movie",
        favoriteCount: m.favoriteCount,
      })),
    });
  } catch (err) {
    console.error("PowerBI Admin Metrics Error:", err);
    res.status(500).json({ error: "Failed to generate Power BI analytics payload" });
  }
});

/**
 * GET /api/powerbi/user-analytics/:userId
 * User profile analytics payload for Power BI User Dashboard
 */
router.get("/user-analytics/:userId", verifyPowerBIAccess, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("username email createdAt");
    if (!user) return res.status(404).json({ error: "User not found" });

    const [favorites, watchlist, ratings, comments] = await Promise.all([
      Favorite.find({ userId }),
      WatchList.find({ userId }),
      Rating.find({ userId }),
      Comment.find({ userId }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    ratings.forEach((r) => {
      const score = Math.round(r.rating || 0);
      if (score >= 1 && score <= 5) {
        ratingDistribution[score] = (ratingDistribution[score] || 0) + 1;
        ratingSum += score;
      }
    });

    const averageRating = ratings.length > 0 ? (ratingSum / ratings.length).toFixed(2) : 0;

    res.json({
      user: {
        id: user._id,
        username: user.username,
        joinedAt: user.createdAt,
      },
      metrics: {
        favoriteCount: favorites.length,
        watchlistCount: watchlist.length,
        ratingCount: ratings.length,
        commentCount: comments.length,
        averageRating: Number(averageRating),
      },
      ratingDistribution: Object.entries(ratingDistribution).map(([star, count]) => ({
        starScore: `${star} Stars`,
        count,
      })),
      recentActivities: [
        ...favorites.slice(-5).map((f) => ({ type: "favorite", title: f.title, date: f.createdAt })),
        ...comments.slice(-5).map((c) => ({ type: "comment", title: c.comment, date: c.createdAt })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
  } catch (err) {
    console.error("PowerBI User Analytics Error:", err);
    res.status(500).json({ error: "Failed to generate user analytics" });
  }
});

/**
 * GET /api/powerbi/config
 * Returns Power BI Embed URL configuration
 */
router.get("/config", (req, res) => {
  res.json({
    powerBiEmbedUrlAdmin:
      process.env.POWERBI_ADMIN_EMBED_URL ||
      "https://app.powerbi.com/reportEmbed?reportId=sample-admin-report",
    powerBiEmbedUrlProfile:
      process.env.POWERBI_PROFILE_EMBED_URL ||
      "https://app.powerbi.com/reportEmbed?reportId=sample-profile-report",
    isConfigured: Boolean(process.env.POWERBI_ADMIN_EMBED_URL),
  });
});

export default router;
