import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

const router = express.Router();
const TMDB_API_KEY = "348088421ad3fb3a9d6e56bb6a9a8f80";

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Missing message" });

    console.log("User message:", message);

    // Gemini AI
    let parsedData = { sentiment: "neutral", movies: [] };
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        Analyze the sentiment of the user's input: "${message}".
        Based on this sentiment, suggest 10 movies or TV shows.

        Return the result in the following JSON format:
        {
          "sentiment": "A short description of the detected sentiment (e.g. Happy, Melancholic, Thrilled)",
          "movies": ["Movie 1", "Movie 2", ..., "Movie 10"]
        }
        Do not include any markdown formatting like \`\`\`json. Just the raw JSON string.
      `;

      const response = await model.generateContent(prompt);
      const rawText = response.response.text().replace(/```json|```/g, "").trim();
      console.log("Gemini response:", rawText);
      
      parsedData = JSON.parse(rawText);
    } catch (err) {
      console.error("❌ Gemini API Error:", err);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const titles = parsedData.movies.slice(0, 10);
    console.log("Parsed titles:", titles);
    console.log("Detected sentiment:", parsedData.sentiment);

    // TMDB fetch
    const tmdbResults = await Promise.all(
      titles.map(async (title) => {
        try {
          const search = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
          );
          const data = await search.json();
          console.log("TMDB search for", title, data.results?.[0]);
          const result = data.results?.[0];
          if (!result) return null;
          return {
            id: result.id,
            title: result.title || result.name,
            type: result.media_type,
            poster_path: result.poster_path
          };
        } catch (err) {
          console.error("❌ TMDB fetch error for", title, err);
          return null;
        }
      })
    );

    res.json({ 
      reply: tmdbResults.filter(Boolean),
      sentiment: parsedData.sentiment 
    });

  } catch (err) {
    console.error("❌ Chatbot Error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

router.post("/analyze-character", async (req, res) => {
  try {
    const { genres, totalWatched, username } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Analyze the movie watching character of a user named ${username}.
      They have watched ${totalWatched} items in total.
      Their genre distribution is: ${genres}.

      Based on this data, write a fun, insightful, and slightly humorous personality analysis (max 150 words).
      Address the user directly. Use emojis.
      Tell them what kind of viewer they are (e.g., "The Adrenaline Junkie", "The Hopeless Romantic", "The Intellectual", etc.).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to analyze character" });
  }
});

export default router;
