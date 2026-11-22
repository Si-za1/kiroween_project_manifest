/** Hand-drawn style scene: a girl journaling with a coffee, daydreaming about her dreams. */
export function JournalingGirl() {
  const ink = "#3b2f2a";
  const stroke = {
    stroke: ink,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  return (
    <svg
      className="illustration"
      viewBox="0 0 520 460"
      role="img"
      aria-label="A girl writing in her journal with a cup of coffee, daydreaming"
    >
      {/* soft background blob */}
      <path
        d="M70 250c-10-90 60-170 170-180 110-10 210 40 225 140 15 100-40 190-170 200-130 10-215-60-225-160z"
        fill="#ffe3d3"
      />

      {/* window */}
      <path d="M26 250V142a58 58 0 0 1 116 0v108z" fill="#d6eaf5" {...stroke} />
      <path d="M84 84v166M26 170h116" {...stroke} strokeWidth={2} />
      <circle cx={56} cy={128} r={13} fill="#ffe29a" />
      <path
        d="M100 204c8-6 18-6 26 0"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 216c6-4 13-4 19 0"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />

      {/* plant */}
      <path d="M430 290c-6-30 4-60 26-74" fill="none" {...stroke} />
      <path d="M440 250c-20-6-34-24-34-40 20 2 34 18 34 40z" fill="#a8c3a0" {...stroke} />
      <path d="M447 236c8-22 28-32 44-30-2 20-22 32-44 30z" fill="#a8c3a0" {...stroke} />
      <path d="M436 272c-18 4-36-4-44-18 18-6 36 2 44 18z" fill="#bcd6b3" {...stroke} />
      <path d="M418 292h44l-6 40h-32z" fill="#f0806a" {...stroke} />

      {/* thought trail and cloud */}
      <circle cx={292} cy={140} r={6} fill="#fff" {...stroke} strokeWidth={2} />
      <circle cx={314} cy={116} r={10} fill="#fff" {...stroke} strokeWidth={2} />
      <path
        d="M330 92c-4-24 22-38 40-26 8-18 38-20 48-2 20-6 40 10 34 30 16 10 10 36-10 36H346c-24 0-30-30-16-38z"
        fill="#fff"
        {...stroke}
      />
      {/* dreams inside the cloud: a heart, a star, a little house */}
      <path d="M362 98c-6-6-14 2-8 8l8 8 8-8c6-6-2-14-8-8z" fill="#f0806a" />
      <path d="M396 86l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffd36b" />
      <path d="M424 108l12-10 12 10v14h-24z" fill="#cdbfea" {...stroke} strokeWidth={2} />

      {/* sparkles */}
      <path d="M262 70v16M254 78h16" stroke="#f0a35e" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M470 170v12M464 176h12" stroke="#f0a35e" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M50 300v10M45 305h10" stroke="#a8c3a0" strokeWidth={2.5} strokeLinecap="round" />

      {/* hair, back */}
      <path d="M186 196c-6 30-2 56 10 70h68c12-14 16-40 10-70z" fill="#4a3428" />
      {/* body / sweater */}
      <path d="M150 336c4-48 30-80 80-82s78 34 82 82z" fill="#cdbfea" {...stroke} />
      {/* stitched elbow patch: a tiny Frankenstein touch */}
      <rect
        x={262}
        y={292}
        width={30}
        height={24}
        rx={7}
        fill="#ffe29a"
        {...stroke}
        strokeWidth={2}
      />
      <path d="M266 297l22 0M266 311l22 0" stroke={ink} strokeWidth={1.6} strokeDasharray="3 3" />
      {/* neck */}
      <path d="M218 228h24v26h-24z" fill="#f1c4a7" {...stroke} />
      {/* head */}
      <circle cx={230} cy={192} r={46} fill="#f6d2bb" {...stroke} />
      {/* bun and fringe */}
      <circle cx={232} cy={136} r={22} fill="#4a3428" {...stroke} />
      <path
        d="M184 196c-4-36 20-58 48-58s50 20 46 56c-10-20-26-30-46-30-22 0-38 12-48 32z"
        fill="#4a3428"
        {...stroke}
      />
      {/* face */}
      <path d="M206 198q7 6 14 0M240 198q7 6 14 0" fill="none" {...stroke} />
      <path d="M223 214q7 6 14 0" fill="none" {...stroke} />
      <circle cx={204} cy={210} r={7} fill="#f49c8a" opacity={0.55} />
      <circle cx={256} cy={210} r={7} fill="#f49c8a" opacity={0.55} />

      {/* desk */}
      <rect x={40} y={334} width={440} height={20} rx={10} fill="#e9c9a0" {...stroke} />
      <path d="M80 354v70M440 354v70" {...stroke} strokeWidth={6} />

      {/* journal */}
      <path d="M136 336l14-24 56 4v20z" fill="#fffaf2" {...stroke} />
      <path d="M206 316l58-4 12 24h-70z" fill="#fffaf2" {...stroke} />
      <path
        d="M156 322l36 2M154 329l40 2M216 322l38-2M218 329l40-2"
        stroke="#c9b8a6"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* writing arm and pen */}
      <path
        d="M176 270c-14 20-14 40 0 52"
        fill="none"
        stroke="#cdbfea"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <circle cx={182} cy={322} r={10} fill="#f6d2bb" {...stroke} />
      <path d="M186 316l16-22" {...stroke} strokeWidth={3} />

      {/* mug and hand */}
      <path
        d="M292 272c10 16 22 34 28 46"
        fill="none"
        stroke="#cdbfea"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <rect x={316} y={294} width={38} height={40} rx={8} fill="#f0806a" {...stroke} />
      <path d="M354 304c14 0 14 20 0 20" fill="none" {...stroke} />
      <path d="M326 310h18" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <circle cx={318} cy={316} r={10} fill="#f6d2bb" {...stroke} />
      <path
        d="M328 282c-6-8 6-12 0-20M342 282c-6-8 6-12 0-20"
        fill="none"
        stroke="#b9a89a"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}
