import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  poster_path: String,
  media_type: String,
  createdAt: { type: Date, default: Date.now },
});

// Aynı kullanıcının aynı filmi iki kez eklemesini engeller
favoriteSchema.index({ movieId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
