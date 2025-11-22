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
    let rawText;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        You are a chatbot that suggests 10 movies or TV shows based on the user's feeling.
        User feeling: ${message}
        STRICT RULES:
        - Return EXACTLY 10 titles
        - Format: Title only, no extra text
        - Separate with commas
      `;
      const response = await model.generateContent(prompt);
      rawText = response.response.text();
      console.log("Gemini response:", rawText);
    } catch (err) {
      console.error("❌ Gemini API Error:", err);
      return res.status(500).json({ error: "Gemini API failed" });
    }

    const titles = rawText
      .split(",")
      .map(t => t.trim())
      .slice(0, 10);

    console.log("Parsed titles:", titles);

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

    res.json({ reply: tmdbResults.filter(Boolean) });

  } catch (err) {
    console.error("❌ Chatbot Error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

export default router;
