import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login
// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        error: "Account suspended", 
        reason: user.suspendedReason || "Your account has been suspended." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    // JWT oluşturuluyor
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, username: user.username, email: user.email, id: user._id, isAdmin: user.isAdmin });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get Public User Info
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username createdAt vibeCount following followers isPrivate");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Toggle Private Account
router.post("/toggle-private", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]?.trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isPrivate = !user.isPrivate;
    await user.save();

    res.json({ isPrivate: user.isPrivate });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle privacy" });
  }
});

// Get current user's privacy setting
router.get("/privacy-status", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1]?.trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("isPrivate");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ isPrivate: user.isPrivate });
  } catch (err) {
    res.status(500).json({ error: "Failed to get privacy status" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    // LOCAL DEV MODE: Log link to console instead of sending email
    console.log("--------------------------------------------------");
    console.log("🔑 PASSWORD RESET LINK (Local Dev Mode):");
    console.log(resetUrl);
    console.log("--------------------------------------------------");

    res.json({ message: "Reset link generated. Check server console.", link: resetUrl });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Error generating reset link" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Password reset token is invalid or has expired" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error resetting password" });
  }
});

export default router;
