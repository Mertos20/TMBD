import { app } from "@azure/functions";
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

// ── MongoDB bağlantısını tek seferlik tut (warm start optimizasyonu)
let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// ──────────────────────────────────────────────────────────────
// HTTP Trigger: POST /api/notification-sender
//
// Body:
//   {
//     "secret":      string,           // FUNCTION_SECRET env değişkeni ile eşleşmeli
//     "type":        string,           // "follow" | "follow_request" | "follow_accepted" | "comment_deleted"
//     "recipientId": string (ObjectId),
//     "senderId":    string (ObjectId) | null,
//     "message":     string | undefined
//   }
// ──────────────────────────────────────────────────────────────
app.http("notification-sender", {
  methods: ["POST"],
  authLevel: "anonymous", // Güvenlik FUNCTION_SECRET ile sağlanıyor
  handler: async (request, context) => {
    context.log("notification-sender triggered");

    let body;
    try {
      body = await request.json();
    } catch {
      return {
        status: 400,
        jsonBody: { error: "Invalid JSON body" },
      };
    }

    const { secret, type, recipientId, senderId, message } = body;

    // ── Basit shared-secret doğrulaması
    if (secret !== process.env.FUNCTION_SECRET) {
      context.warn("Unauthorized notification-sender call — wrong secret");
      return {
        status: 401,
        jsonBody: { error: "Unauthorized" },
      };
    }

    // ── Zorunlu alan kontrolü
    if (!type || !recipientId) {
      return {
        status: 400,
        jsonBody: { error: "Missing required fields: type, recipientId" },
      };
    }

    try {
      await connectDB();

      const notification = await Notification.create({
        recipient: recipientId,
        sender: senderId || undefined,
        type,
        message: message || undefined,
      });

      context.log(`✅ Notification created: ${notification._id} | type=${type} | recipient=${recipientId}`);

      return {
        status: 200,
        jsonBody: { success: true, notificationId: notification._id },
      };
    } catch (err) {
      context.error("❌ Notification creation failed:", err.message);
      return {
        status: 500,
        jsonBody: { error: "Failed to create notification", detail: err.message },
      };
    }
  },
});
