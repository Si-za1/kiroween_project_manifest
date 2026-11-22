import type { Card } from "../lib/cards.ts";

export function TarotCard({ card }: { card: Card }) {
  return (
    <article className="tarot" key={card.id} aria-label={`Today's card: ${card.title}`}>
      <div className="tarot-face stitched">
        <span className="tarot-numeral">{card.numeral}</span>
        <div className="tarot-glyph" aria-hidden="true">
          {card.glyph}
        </div>
        <h3 className="tarot-title">{card.title}</h3>
        <p className="tarot-prompt">{card.prompt}</p>
      </div>
    </article>
  );
}
