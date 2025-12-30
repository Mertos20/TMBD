import mongoose from "mongoose";

const dailyMovieStatsSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  movieId: { type: Number, required: true },
  title: String,
  poster_path: String,
  points: { type: Number, default: 0 }
});

// Compound index to ensure unique stats per movie per day
dailyMovieStatsSchema.index({ date: 1, movieId: 1 }, { unique: true });

export default mongoose.model("DailyMovieStats", dailyMovieStatsSchema);
