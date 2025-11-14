import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateVibePlaylist = async (req, res) => {
  try {
    const { title, overview } = req.body;
    if (!title || !overview) {
      return res.status(400).json({ error: "Missing data" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Based on the vibe of:
    ${title}
    Overview: ${overview}

    STRICT RULES:
    - Return EXACTLY 15 songs.
    - Format each as: "Artist - Song Name"
    - Must be a numbered list (1-15)
    - DO NOT add any intro sentence, titles, quotes, section names, markdown, emojis, bullet points, explanations, comments, or extra text.
    - Just return the numbered list. No other content is allowed.
    `;

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();

    // ✅ Numara temizleme: sadece şarkılar kalsın
    const tracks = rawText
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(line => line.length > 0)
      .slice(0, 15);

    console.log("✅ Clean Playlist:", tracks);

    return res.json({ tracks });

  } catch (err) {
    console.error("❌ Playlist AI Error:", err);
    return res.status(500).json({ error: "Failed to generate playlist" });
  }
};
 