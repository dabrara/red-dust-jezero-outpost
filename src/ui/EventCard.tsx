import { EVENTS } from "../game/events";
import { pick } from "../game/copy";
import type { EventId, ReadingLevel } from "../game/types";
import { BookIcon, SoundIcon } from "./icons";

interface EventCardProps {
  eventId: EventId;
  reading: ReadingLevel;
  onOpenScience: () => void;
  onReadAloud?: () => void;
  readAloudAvailable: boolean;
}

export function EventCard({
  eventId,
  reading,
  onOpenScience,
  onReadAloud,
  readAloudAvailable,
}: EventCardProps) {
  const event = EVENTS[eventId];
  const text = pick(reading, event.kidText, event.fullText);

  return (
    <section className={`event-card event-card--${event.kind}`} aria-labelledby="event-title">
      <div className="event-top">
        <span className="event-symbol" aria-hidden="true">
          {event.kind === "radiation"
            ? "☀"
            : event.kind === "comms"
              ? "◎"
              : event.kind === "supply"
                ? "⚡"
                : "✦"}
        </span>
        <h2 id="event-title">{event.title}</h2>
        {readAloudAvailable && onReadAloud ? (
          <button
            type="button"
            className="btn btn--icon"
            onClick={onReadAloud}
            aria-label={`Read the ${event.title} card aloud`}
          >
            <SoundIcon width={16} height={16} />
          </button>
        ) : null}
      </div>

      <p className="event-text">{text}</p>

      <ul className="event-effects">
        {event.effects.slice(0, 2).map((effect) => (
          <li key={effect}>{effect}</li>
        ))}
      </ul>

      <div className="event-foot">
        <span
          className={`chip ${event.basis === "measured" ? "chip--sky" : "chip--teal"}`}
        >
          {event.basis === "measured" ? "Real NASA measurement" : "Real NASA record"}
        </span>
        {event.sourceId ? (
          <button type="button" className="link-btn" onClick={onOpenScience}>
            <BookIcon width={16} height={16} /> Source
          </button>
        ) : null}
        <details className="more-detail event-more">
          <summary>More</summary>
          <p>{event.known}</p>
          <p>Affects: {event.affects.join(", ")}.</p>
          {event.effects.slice(2).length > 0 ? (
            <ul>
              {event.effects.slice(2).map((effect) => (
                <li key={effect}>{effect}</li>
              ))}
            </ul>
          ) : null}
        </details>
      </div>
    </section>
  );
}
