import { generateAIText } from "../utils/aiFoundry.js";

export const generateVibePlaylist = async (req, res) => {
  try {
    const { title, overview } = req.body;
    if (!title || !overview) {
      return res.status(400).json({ error: "Missing data" });
    }

    const prompt = `
    Based on the vibe of:
    ${title}
    Overview: ${overview}

    STRICT RULES:
    - Return EXACTLY 8 songs.
    - Format each as: "Artist - Song Name"
    - Must be a numbered list (1-8)
    - DO NOT add any intro sentence, titles, quotes, section names, markdown, emojis, bullet points, explanations, comments, or extra text.
    - Just return the numbered list. No other content is allowed.
    `;

    const rawText = await generateAIText({
      prompt,
      systemPrompt: "You are a music curator creating song playlists matching movie vibes.",
      temperature: 0.7,
    });

    // Numara temizleme: sadece şarkılar kalsın
    const tracks = rawText
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*/, "").replace(/^-\s*/, "").trim())
      .filter(line => line.length > 0)
      .slice(0, 8);

    console.log("✅ Clean Playlist:", tracks);

    return res.json({ tracks });

  } catch (err) {
    console.error("❌ Playlist AI Error:", err);
    return res.status(500).json({ error: "Failed to generate playlist" });
  }
};