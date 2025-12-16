import express from "express";
import { generateVibePlaylist } from "../controllers/vibeController.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const verifyTokenOptional = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1].trim();
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
        req.user = null;
    } else {
        req.user = decoded;
    }
    next();
  });
};

router.post("/", verifyTokenOptional, async (req, res) => {
    if (req.user) {
        try {
            await User.findByIdAndUpdate(req.user.id, { $inc: { vibeCount: 1 } });
        } catch (err) {
            console.error("Error updating vibe count:", err);
        }
    }
    generateVibePlaylist(req, res);
});

export default router;
