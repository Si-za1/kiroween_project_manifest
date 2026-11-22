import type { Card } from "../lib/cards.ts";
import { Icon } from "./Icons.tsx";

export function TarotCard({ card }: { card: Card }) {
  return (
    <article
      className={`tarot tint-${card.tint}`}
      key={card.id}
      aria-label={`Today's card: ${card.title}`}
    >
      <div className="tarot-inner stitched">
        <span className="tarot-numeral">{card.numeral}</span>
        <span className="tarot-icon">
          <Icon name={card.icon} size={54} />
        </span>
        <h3 className="tarot-title">{card.title}</h3>
        <p className="tarot-prompt">{card.prompt}</p>
        <span className="tarot-foot">today's card</span>
      </div>
    </article>
  );
}
