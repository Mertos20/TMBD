import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentAuthor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentText: { type: String, required: true },
  movieTitle: { type: String },
  movieId: { type: Number },
  status: { type: String, enum: ["pending", "reviewed", "dismissed", "deleted"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);
