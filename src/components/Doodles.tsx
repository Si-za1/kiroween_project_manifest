// Scrapbook pieces: stickers, washi tape, and the Dearly logo. All inline SVG, no image files.

export type StickerKind =
  "heart" | "star" | "sparkle" | "flower" | "moon" | "bow" | "cloud" | "cherry";

const NAVY = "#214669";
const PINK = "#f275a6";
const BLUSH = "#f9d4e3";
const CREAM = "#fdfbf9";

function Shape({ kind }: { kind: StickerKind }) {
  const line = {
    stroke: NAVY,
    strokeWidth: 1.6,
    strokeLinejoin: "round",
    strokeLinecap: "round",
  } as const;
  switch (kind) {
    case "heart":
      return (
        <path
          d="M16 27s-11-6.6-11-14a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 7.4-11 14-11 14z"
          fill={PINK}
          {...line}
        />
      );
    case "star":
      return (
        <path
          d="M16 4l3.6 7.6 8.2 1-6 5.7 1.5 8.2L16 22.6l-7.3 3.9 1.5-8.2-6-5.7 8.2-1z"
          fill={BLUSH}
          {...line}
        />
      );
    case "sparkle":
      return (
        <path
          d="M16 3c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10z"
          fill={PINK}
          {...line}
        />
      );
    case "flower":
      return (
        <g {...line}>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse
              key={r}
              cx="16"
              cy="9"
              rx="4.6"
              ry="6"
              fill={BLUSH}
              transform={`rotate(${r} 16 16)`}
            />
          ))}
          <circle cx="16" cy="16" r="3.6" fill={PINK} />
        </g>
      );
    case "moon":
      return <path d="M22 25A10.5 10.5 0 1 1 15 5a8.4 8.4 0 0 0 7 20z" fill={CREAM} {...line} />;
    case "bow":
      return (
        <g {...line}>
          <path d="M16 16L5 9.5v13zM16 16l11-6.5v13z" fill={PINK} />
          <path d="M14 16l-3 10M18 16l3 10" />
          <circle cx="16" cy="16" r="2.8" fill={BLUSH} />
        </g>
      );
    case "cloud":
      return (
        <path
          d="M9 24h15a5 5 0 0 0 .5-10A7.5 7.5 0 0 0 10 13a5.5 5.5 0 0 0-1 11z"
          fill={CREAM}
          {...line}
        />
      );
    case "cherry":
      return (
        <g {...line}>
          <path
            d="M11 20c2-7 5-11 10-14M21 21c-1-6 0-11 0-15M21 6c3-1 5 0 6 2-3 1-5 0-6-2z"
            fill="none"
          />
          <circle cx="10" cy="22" r="5" fill={PINK} />
          <circle cx="21" cy="23" r="5" fill={PINK} />
        </g>
      );
  }
}

/** A small die-cut sticker with a white outline, like the ones you'd peel off a sheet. */
export function Sticker({
  kind,
  size = 34,
  className = "",
  style,
}: {
  kind: StickerKind;
  size?: number;
  className?: string;
  style?: Record<string, string | number>;
}) {
  return (
    <svg
      className={`sticker ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={style}
      aria-hidden="true"
    >
      <g className="sticker-outline">
        <Shape kind={kind} />
      </g>
      <Shape kind={kind} />
    </svg>
  );
}

/** A strip of washi tape. Place it inside a positioned parent. */
export function Tape({
  variant = "pink",
  className = "",
}: {
  variant?: "pink" | "navy" | "dots" | "check";
  className?: string;
}) {
  return <span className={`tape tape-${variant} ${className}`} aria-hidden="true" />;
}

/** Dearly logo: a little envelope sealed with a heart. */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="12" fill={NAVY} />
      <rect x="9" y="12" width="22" height="16" rx="3" fill={CREAM} />
      <path
        d="M9.8 13.5L20 21l10.2-7.5"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 26.6s-4.2-2.5-4.2-5.3a2.3 2.3 0 0 1 4.2-1.3 2.3 2.3 0 0 1 4.2 1.3c0 2.8-4.2 5.3-4.2 5.3z"
        fill={PINK}
      />
    </svg>
  );
}

/** A hand-drawn curly arrow for handwritten notes. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`squiggle ${className}`}
      viewBox="0 0 80 40"
      width="80"
      height="40"
      aria-hidden="true"
    >
      <path
        d="M4 8c14 0 24 4 22 12-2 7-12 6-10-1 2-8 18-9 30-2 8 5 16 11 26 13"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M66 24l9 6-10 3"
        fill="none"
        stroke={NAVY}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
