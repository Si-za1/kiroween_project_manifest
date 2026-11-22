// Vercel Function (Web Standard handler). Served at /api/health.
// LLM and evidence endpoints will live next to this file so API keys never reach the browser.
export function GET(): Response {
  return Response.json({ ok: true, service: "manifest-git", time: new Date().toISOString() });
}
