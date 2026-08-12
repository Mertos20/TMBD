import OpenAI from "openai";

/**
 * Creates and returns an OpenAI client configured for Microsoft Azure AI Foundry.
 */
export const getAIFoundryClient = () => {
  const endpoint = process.env.AZURE_FOUNDRY_ENDPOINT;
  const apiKey = process.env.AZURE_FOUNDRY_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Missing Azure AI Foundry configuration: AZURE_FOUNDRY_ENDPOINT or AZURE_FOUNDRY_KEY is not defined in environment variables."
    );
  }

  return new OpenAI({
    baseURL: endpoint,
    apiKey: apiKey,
  });
};

/**
 * Generates text response using Microsoft Azure AI Foundry model endpoint.
 * 
 * @param {Object} options
 * @param {string} options.prompt - User input prompt.
 * @param {string} [options.systemPrompt] - Optional system instruction.
 * @param {number} [options.temperature=0.7] - Temperature parameter.
 * @param {boolean} [options.jsonMode=false] - Request JSON object response format.
 * @returns {Promise<string>} The response content from the Azure AI Foundry model.
 */
export const generateAIText = async ({
  prompt,
  systemPrompt = "",
  temperature = 0.7,
  jsonMode = false,
}) => {
  const client = getAIFoundryClient();
  const modelName = process.env.AZURE_FOUNDRY_MODEL || "gpt-4o-mini";

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const requestParams = {
    model: modelName,
    messages,
    temperature,
  };

  if (jsonMode) {
    requestParams.response_format = { type: "json_object" };
  }

  const response = await client.chat.completions.create(requestParams);

  if (!response.choices || response.choices.length === 0) {
    throw new Error("Azure AI Foundry model returned empty response choices.");
  }

  return response.choices[0].message.content;
};
