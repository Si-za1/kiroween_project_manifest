// Thin wrappers over the browser's built-in Web Speech API. Nothing is sent to our servers.
// Speech recognition works in Chrome, Edge, and Safari. Read-aloud works in all modern browsers.

interface RecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return recognitionCtor() !== null;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Starts dictation. Calls onText with each finished phrase. Returns a function that stops it. */
export function listen(
  onText: (text: string) => void,
  onEnd: () => void,
  onError: (message: string) => void,
): () => void {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    onError("Voice typing isn't available in this browser. Try Chrome, Edge, or Safari.");
    onEnd();
    return () => {};
  }
  const r = new Ctor();
  r.lang = navigator.language || "en-US";
  r.continuous = true;
  r.interimResults = false;
  r.onresult = (e) => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res?.isFinal) onText(res[0].transcript.trim());
    }
  };
  r.onerror = (e) =>
    onError(
      e.error === "not-allowed"
        ? "Microphone access was blocked. Allow it in your browser to speak your page."
        : "Voice typing stopped. Tap the microphone to try again.",
    );
  r.onend = onEnd;
  r.start();
  return () => r.stop();
}

/** Reads text aloud with a calm voice. Returns a function that stops it. */
export function speak(text: string, onEnd: () => void): () => void {
  if (!canSpeak()) {
    onEnd();
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\n+/g, " "));
  u.rate = 0.95;
  u.pitch = 1;
  const voices = synth.getVoices();
  const lang = (navigator.language || "en").slice(0, 2);
  const preferred =
    voices.find(
      (v) => v.lang.startsWith(lang) && /natural|premium|enhanced|samantha|google/i.test(v.name),
    ) ?? voices.find((v) => v.lang.startsWith(lang));
  if (preferred) u.voice = preferred;
  u.onend = onEnd;
  u.onerror = onEnd;
  synth.speak(u);
  return () => {
    synth.cancel();
    onEnd();
  };
}

/** Joins dictated text onto what is already written, with sensible spacing and capitals. */
export function appendDictation(existing: string, spoken: string): string {
  const s = spoken.trim();
  if (!s) return existing;
  const sentence = s.charAt(0).toUpperCase() + s.slice(1) + (/[.!?]$/.test(s) ? "" : ".");
  if (!existing.trim()) return sentence;
  const sep = /\s$/.test(existing) ? "" : " ";
  return `${existing}${sep}${sentence}`;
}
