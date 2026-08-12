/**
 * Azure Logic Apps (Workflow Automation & Notifications) Entegrasyonu
 * E-posta gönderimleri, admin uyarıları ve otomatik bildirim iş akışlarını tetikler.
 */

const LOGIC_APP_WEBHOOK_URL = process.env.AZURE_LOGIC_APP_WEBHOOK_URL;

/**
 * Azure Logic App HTTP Webhook iş akışını tetikler
 * @param {object} payload - İş akışına gönderilecek veri (örn: { recipientEmail, subject, content, type })
 * @returns {Promise<boolean>} İşlem başarılı ise true
 */
export async function triggerLogicApp(payload = {}) {
  if (!LOGIC_APP_WEBHOOK_URL) {
    console.warn("⚠️ AZURE_LOGIC_APP_WEBHOOK_URL ortam değişkenlerinde tanımlı değil.");
    return false;
  }

  try {
    const response = await fetch(LOGIC_APP_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 202) {
      console.log("✅ Azure Logic App iş akışı başarıyla tetiklendi.");
      return true;
    } else {
      console.error(`❌ Azure Logic App hata döndürdü: HTTP ${response.status}`);
      return false;
    }
  } catch (err) {
    console.error("❌ Azure Logic App tetiklenemedi:", err.message);
    return false;
  }
}
