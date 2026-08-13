import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { triggerLogicApp } from "../utils/azureLogicApp.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Email transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

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

    const frontendUrl = process.env.FRONTEND_URL || "https://orange-dune-0a919c503.7.azurestaticapps.net";
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const logicAppSuccess = await triggerLogicApp({
      type: "password_reset",
      recipientEmail: user.email,
      username: user.username,
      resetUrl: resetUrl,
      subject: "🔑 Movibase - Password Reset Request",
      message: `Hello ${user.username}, click the link below to reset your password: ${resetUrl}`,
      timestamp: new Date().toISOString()
    });

    if (logicAppSuccess) {
      console.log(`⚡ Azure Logic App triggered successfully for password reset: ${user.email}`);
      return res.json({ message: "Password reset link has been sent via Azure Logic App workflow.", link: resetUrl });
    }

    // Fallback: Check if SMTP email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Send real email via SMTP
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: "🔑 Movibase - Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">🎬 MOVIBASE</h1>
              <p style="color: rgba(255,255,255,0.9); text-align: center; margin-top: 10px;">Password Reset Request</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="color: #333; font-size: 16px;">Hello <strong>${user.username}</strong>,</p>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center;">
                This link will expire in <strong>1 hour</strong>.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} Movibase - Your Movie Database
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to: ${user.email}`);
      res.json({ message: "Password reset link has been sent to your email.", link: resetUrl });
    } else {
      console.log("🔑 PASSWORD RESET LINK (Console Mode):", resetUrl);
      res.json({ message: "Reset link generated.", link: resetUrl });
    }
  } catch (err) {
    console.error("❌ Error in forgot-password:", err);
    res.status(500).json({ error: "Error sending reset email" });
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
