/**
 * notificationService.js
 *
 * Azure Function App'e HTTP isteği atarak asenkron notification oluşturur.
 * Backend'de doğrudan Notification.create() yazmak yerine bunu kullan.
 *
 * Kullanım:
 *   import { triggerNotification } from "../utils/notificationService.js";
 *
 *   await triggerNotification({
 *     type: "follow_request",
 *     recipientId: "...",
 *     senderId: "...",
 *   });
 */

const FUNCTION_URL = process.env.AZURE_FUNCTION_APP_URL
  ? `${process.env.AZURE_FUNCTION_APP_URL}/api/notification-sender`
  : null;

const FUNCTION_SECRET = process.env.FUNCTION_SECRET || "movibase-fn-secret-2024";

/**
 * @param {{ type: string, recipientId: string, senderId?: string, message?: string }} payload
 * @param {{ fireAndForget?: boolean }} [options]  - fireAndForget=true → cevap beklenmez (varsayılan: false)
 */
export async function triggerNotification(payload, { fireAndForget = false } = {}) {
  if (!FUNCTION_URL) {
    // Local geliştirme veya Function App URL tanımsızsa eski yönteme düş
    console.warn("[notificationService] AZURE_FUNCTION_APP_URL tanımlı değil, notification atlanıyor.");
    return null;
  }

  const body = JSON.stringify({
    secret: FUNCTION_SECRET,
    ...payload,
  });

  const fetchPromise = fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error(`[notificationService] Function App hata döndürdü (${res.status}):`, text);
      }
      return res;
    })
    .catch((err) => {
      console.error("[notificationService] Function App'e ulaşılamadı:", err.message);
    });

  // Fire-and-forget: beklemeden devam et
  if (fireAndForget) return null;

  await fetchPromise;
  return null;
}
