// App-wide settings that are easy to change.

/**
 * The AI model shown on the Connections page. The server talks to it through LLM_BASE_URL and
 * LLM_MODEL. Change this label if you switch providers.
 */
export const AI_NAME: string = import.meta.env.VITE_AI_NAME || "Google Gemini 2.5 Flash";

/**
 * The demo video shown by "Watch the demo" on the Home page.
 *
 * To change it, either edit the fallback below, or set VITE_DEMO_VIDEO_URL at build time
 * (for example in Vercel's environment variables). Accepts:
 * - a YouTube link (https://www.youtube.com/watch?v=..., https://youtu.be/...), shown in an embed
 * - a Vimeo link (https://vimeo.com/123456), shown in an embed
 * - a direct video file (.mp4 or .webm), shown in a video player
 */
const BUNDLED_VIDEO = `${import.meta.env.BASE_URL}media/manifest-demo.mp4`;

/** The demo on YouTube. Set VITE_DEMO_VIDEO_URL to BUNDLED_VIDEO's path to play the file instead. */
const YOUTUBE_VIDEO = "https://youtu.be/xwV-W7IIGlI";

export const DEMO_VIDEO_URL: string = import.meta.env.VITE_DEMO_VIDEO_URL || YOUTUBE_VIDEO;

/** Still image shown before the bundled video plays. Not used for YouTube or Vimeo links. */
export const DEMO_VIDEO_POSTER: string | undefined =
  DEMO_VIDEO_URL === BUNDLED_VIDEO
    ? `${import.meta.env.BASE_URL}media/manifest-demo-poster.jpg`
    : undefined;

export type VideoSource = { kind: "embed"; src: string } | { kind: "file"; src: string };

/** Works out how to play a video link. */
export function videoSource(url: string): VideoSource {
  try {
    const u = new URL(url, "https://example.invalid");
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id =
        u.searchParams.get("v") ??
        u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ??
        "";
    }
    if (/^[\w-]{6,}$/.test(id)) {
      return {
        kind: "embed",
        src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      };
    }
    const vimeo = host === "vimeo.com" ? u.pathname.match(/^\/(\d+)/)?.[1] : undefined;
    if (vimeo) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeo}?autoplay=1` };
  } catch {
    // Not a URL we recognise. Treat it as a file.
  }
  return { kind: "file", src: url };
}
