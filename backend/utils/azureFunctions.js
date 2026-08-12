/**
 * Azure Functions (Serverless Microservices) Entegrasyonu
 * Arka plan ağır işleri, duygu analizleri ve Fabric tetikleme işlemlerini yürütür.
 */

const FUNCTION_APP_URL = process.env.AZURE_FUNCTION_APP_URL;
const FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY;

/**
 * Azure Function endpoint'ini tetikler
 * @param {string} functionName - Fonksiyon adı (örneğin 'analyzeSentiment' veya 'triggerFabric')
 * @param {object} payload - Gönderilecek JSON verisi
 * @returns {Promise<object|null>} Fonksiyondan dönen yanıt
 */
export async function invokeFunction(functionName, payload = {}) {
  if (!FUNCTION_APP_URL) {
    console.warn(`⚠️ AZURE_FUNCTION_APP_URL tanımlı değil. '${functionName}' fonksiyonu atlanıyor.`);
    return null;
  }

  const endpointUrl = `${FUNCTION_APP_URL}/api/${functionName}${FUNCTION_KEY ? `?code=${FUNCTION_KEY}` : ""}`;

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Azure Function '${functionName}' hata döndürdü: HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`❌ Azure Function '${functionName}' tetiklenemedi:`, err.message);
    return null;
  }
}
