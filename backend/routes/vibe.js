import express from "express";
import { generateVibePlaylist } from "../controllers/vibeController.js";

const router = express.Router();
router.post("/", generateVibePlaylist);

export default router;
