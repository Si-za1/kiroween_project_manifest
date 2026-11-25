import { json } from "./_lib/http.js";
import { llmConfigured } from "./_lib/llm.js";

// GET /api/status -> { ai: boolean }. Tells the app whether an AI service is set up.
// Never returns the key, the provider URL, or the model name.
export function GET(): Response {
  return json({ ai: llmConfigured() });
}
