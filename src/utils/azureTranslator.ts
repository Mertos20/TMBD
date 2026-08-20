/**
 * Azure Translator Utility
 * Translates dynamic content (e.g. movie overviews, comments) using Azure Translator API
 * or a backend translation endpoint fallback.
 */

const AZURE_TRANSLATOR_KEY = import.meta.env.VITE_AZURE_TRANSLATOR_KEY || "";
const AZURE_TRANSLATOR_REGION = import.meta.env.VITE_AZURE_TRANSLATOR_REGION || "swedencentral";
const AZURE_TRANSLATOR_ENDPOINT = import.meta.env.VITE_AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";

export async function translateText(
  text: string,
  targetLang: "tr" | "en",
  sourceLang?: "tr" | "en"
): Promise<string> {
  if (!text || text.trim() === "") return text;

  // 1. If direct Azure Translator key is configured in Vite env:
  if (AZURE_TRANSLATOR_KEY) {
    try {
      const url = `${AZURE_TRANSLATOR_ENDPOINT}/translate?api-version=3.0&to=${targetLang}${
        sourceLang ? `&from=${sourceLang}` : ""
      }`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
          "Ocp-Apim-Subscription-Region": AZURE_TRANSLATOR_REGION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].translations && data[0].translations[0]) {
          return data[0].translations[0].text;
        }
      } else {
        console.warn("Azure Translator returned status:", response.status);
      }
    } catch (err) {
      console.error("Azure Translator error:", err);
    }
  }

  // 2. Fallback: Return original text if translation fails or key is missing
  return text;
}
