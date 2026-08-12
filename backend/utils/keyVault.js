import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const vaultName = process.env.AZURE_KEYVAULT_NAME;
const url = vaultName ? `https://${vaultName}.vault.azure.net` : process.env.AZURE_KEYVAULT_URL;

let secretClient = null;

if (url) {
  try {
    const credential = new DefaultAzureCredential();
    secretClient = new SecretClient(url, credential);
  } catch (err) {
    console.error("❌ Azure Key Vault Connection Error:", err.message);
  }
}

/**
 * Fetches a secret from Azure Key Vault
 * @param {string} secretName - Name of the secret in Key Vault (e.g. MONGO-URI)
 * @param {string} fallbackValue - Local fallback value from process.env
 * @returns {Promise<string>} Secret value
 */
export async function getSecret(secretName, fallbackValue = "") {
  if (!secretClient) {
    return fallbackValue;
  }

  try {
    const secret = await secretClient.getSecret(secretName);
    return secret.value || fallbackValue;
  } catch (err) {
    console.warn(`⚠️ Key Vault secret '${secretName}' okunamadı, fallback değer kullanılıyor.`, err.message);
    return fallbackValue;
  }
}
