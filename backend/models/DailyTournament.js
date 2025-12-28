import mongoose from "mongoose";

const dailyTournamentSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  movies: [
    {
      id: Number,
      title: String,
      poster_path: String,
      vote_average: Number,
      overview: String
    }
  ]
});

export default mongoose.model("DailyTournament", dailyTournamentSchema);
