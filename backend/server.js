import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.js";
import commentRoutes from "./routes/comments.js";
import favoriteRoutes from "./routes/favorites.js";
import watchListRoutes from "./routes/watchList.js";
import vibeRoutes from "./routes/vibe.js";
import spotifyRoutes from "./routes/spotify.js";
import chatbotRoutes from "./routes/chatbot.js"; 

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/watchlists", watchListRoutes);
app.use("/api/vibe", vibeRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/api/chatbot", chatbotRoutes);


const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () =>
  console.log(`✅ HTTP Server running at http://localhost:${PORT}`)
);
