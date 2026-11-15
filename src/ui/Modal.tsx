import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  id: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  closeLabel?: string;
  dismissible?: boolean;
}

const FOCUSABLE =
  "button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * Accessible dialog: focus moves inside, Tab stays inside (so keyboard users
 * never get lost behind it), Escape closes it, and focus returns afterwards.
 */
export function Modal({
  title,
  id,
  onClose,
  children,
  wide = false,
  footer,
  closeLabel = "Close",
  dismissible = true,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previous = useRef<Element | null>(null);

  useEffect(() => {
    previous.current = document.activeElement;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      if (previous.current instanceof HTMLElement) previous.current.focus();
    };
  }, [onClose, dismissible]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
    >
      <div
        className={`modal-panel${wide ? " modal-panel--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        ref={panelRef}
      >
        <div className="modal-head">
          <h2 id={`${id}-title`}>{title}</h2>
          {dismissible ? (
            <button
              type="button"
              className="btn btn--icon"
              onClick={onClose}
              aria-label={closeLabel}
              title={closeLabel}
            >
              ✕
            </button>
          ) : null}
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
