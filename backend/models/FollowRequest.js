import mongoose from "mongoose";

const followRequestSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure unique request between two users
followRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model("FollowRequest", followRequestSchema);
