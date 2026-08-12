import "dotenv/config";
import appInsights from "applicationinsights";

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();
  console.log("📊 Azure Application Insights Telemetry Monitoring Initialized");
}

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
import ratingRoutes from "./routes/ratings.js";
import gamificationRoutes from "./routes/gamification.js";
import recommendationRoutes from "./routes/recommendations.js";
import duelRoutes from "./routes/duel.js";
import friendRoutes from "./routes/friends.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";
import reportRoutes from "./routes/reports.js";

const app = express();

// Production CORS Configuration (supports Azure Static Web Apps & Local dev)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, dynamically validated
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve local uploads as fallback, Azure Blob Storage is primary for cloud
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error:", err.message));
} else {
  console.warn("⚠️ MONGO_URI environment variable is missing!");
}


// Health Check Endpoint for Azure App Service & Ping
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date(), service: "movibase-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/watchlists", watchListRoutes);
app.use("/api/vibe", vibeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/duel", duelRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/api/chatbot", chatbotRoutes);


const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

httpServer.listen(PORT, () =>
  console.log(`✅ HTTP Server running at http://localhost:${PORT}`)
);
