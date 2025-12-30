import mongoose from "mongoose";

const DuelStatsSchema = new mongoose.Schema({
  movieId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  poster_path: { type: String },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
});

export default mongoose.model("DuelStats", DuelStatsSchema);
