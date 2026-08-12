import { BlobServiceClient } from "@azure/storage-blob";
import path from "path";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "data";

let containerClient = null;

if (connectionString) {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
  } catch (err) {
    console.error("❌ Azure Storage Connection Error:", err.message);
  }
}

/**
 * Uploads a file buffer to Azure Blob Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mime type (e.g. image/png)
 * @returns {Promise<string>} Public URL of uploaded blob
 */
export async function uploadToBlob(buffer, originalName, mimeType) {
  if (!containerClient) {
    throw new Error("Azure Storage Connection String is missing or invalid.");
  }

  // Generate unique blob filename
  const ext = path.extname(originalName) || ".jpg";
  const blobName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

  // Ensure container exists
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });

  return blockBlobClient.url;
}

/**
 * Deletes a blob from Azure Storage using its URL or blob name
 * @param {string} blobUrlOrName 
 */
export async function deleteFromBlob(blobUrlOrName) {
  if (!containerClient || !blobUrlOrName) return;

  try {
    const blobName = blobUrlOrName.split("/").pop();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error("⚠️ Failed to delete blob:", err.message);
  }
}
