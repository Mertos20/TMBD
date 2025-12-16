import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one rating per user per movie
ratingSchema.index({ movieId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
