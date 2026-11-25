import type { Card } from "../lib/cards.ts";
import type { Moon } from "../lib/moon.ts";
import { Icon } from "./Icons.tsx";

export function TarotCard({ card, moon }: { card: Card; moon?: Moon }) {
  return (
    <article
      className={`tarot tint-${card.tint}`}
      key={card.id}
      aria-label={`Today's card: ${card.title}`}
    >
      <div className="tarot-inner stitched">
        <span className="tarot-numeral">{card.numeral}</span>
        <span className="tarot-icon">
          <Icon name={card.icon} size={50} />
        </span>
        <h3 className="tarot-title">{card.title}</h3>
        <p className="tarot-prompt">{card.prompt}</p>
        {moon ? (
          <span className="tarot-moon">
            <Icon name="moon" size={13} /> {moon.name} · {Math.round(moon.illumination * 100)}% lit
          </span>
        ) : (
          <span className="tarot-moon">today's card</span>
        )}
      </div>
    </article>
  );
}
