// Provider-agnostic LLM client. Works with any OpenAI-compatible /chat/completions endpoint
// (OpenAI, Google Gemini's OpenAI-compatible endpoint, Groq, OpenRouter, and others).
// Configure with LLM_API_KEY, and optionally LLM_BASE_URL and LLM_MODEL. Keys stay on the server.

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export function llmConfigured(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

export async function chatJson(messages: ChatMessage[], maxTokens = 1200): Promise<unknown> {
  const base = (process.env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LLM_API_KEY ?? ""}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`llm_http_${res.status}`);
  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("llm_empty");
  return JSON.parse(content) as unknown;
}
