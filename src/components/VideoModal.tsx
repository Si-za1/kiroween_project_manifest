import { useEffect, useRef } from "react";
import { DEMO_VIDEO_POSTER, DEMO_VIDEO_URL, videoSource } from "../config.ts";
import { Icon } from "./Icons.tsx";

/** Full-screen player for the demo video. Closes with ✕, Escape, or a click outside. */
export function VideoModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const source = videoSource(DEMO_VIDEO_URL);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label="Manifest demo video">
      <button
        type="button"
        className="reveal-backdrop"
        aria-label="Close video"
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="video-frame">
        <button
          ref={closeRef}
          type="button"
          className="reveal-close video-close"
          aria-label="Close video"
          onClick={onClose}
        >
          <Icon name="plus" size={18} />
        </button>
        {source.kind === "embed" ? (
          <iframe
            src={source.src}
            title="Manifest demo video"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video
            src={source.src}
            poster={DEMO_VIDEO_POSTER}
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            Your browser can't play this video.{" "}
            <a href={source.src} target="_blank" rel="noreferrer">
              Download it
            </a>
            .
          </video>
        )}
      </div>
    </div>
  );
}
