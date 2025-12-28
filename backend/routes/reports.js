import express from "express";
import jwt from "jsonwebtoken";
import Report from "../models/Report.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Create a report
router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]?.trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { commentId, commentText, commentAuthorId, movieTitle, movieId } = req.body;

    // Check if already reported by this user
    const existingReport = await Report.findOne({ 
      commentId, 
      reportedBy: decoded.id 
    });
    
    if (existingReport) {
      return res.status(400).json({ error: "You have already reported this comment" });
    }

    const report = new Report({
      commentId,
      reportedBy: decoded.id,
      commentAuthor: commentAuthorId,
      commentText,
      movieTitle,
      movieId,
      status: "pending"
    });

    await report.save();

    // Send notification to all admin users
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      const notification = new Notification({
        recipient: admin._id,
        sender: decoded.id,
        type: "report",
        message: `New comment reported on "${movieTitle}"`
      });
      await notification.save();
    }

    res.status(201).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// Get all reports (admin only)
router.get("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]?.trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const reports = await Report.find()
      .populate("reportedBy", "username")
      .populate("commentAuthor", "username")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Update report status (admin only)
router.put("/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]?.trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { status, deleteComment } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // If admin chooses to delete the comment
    if (deleteComment && status === "deleted") {
      await Comment.findByIdAndDelete(report.commentId);
    }

    report.status = status;
    report.reviewedBy = decoded.id;
    report.reviewedAt = new Date();
    await report.save();

    res.json({ message: "Report updated", report });
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
