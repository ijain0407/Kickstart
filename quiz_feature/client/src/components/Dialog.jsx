import { useEffect, useRef } from 'react';

/** Minimal modal: focuses the first control, closes on Escape, keeps Tab inside, restores focus on close. */
export default function Dialog({ titleId, role = 'dialog', onClose, children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const focusables = () => ref.current?.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])') ?? [];
    focusables()[0]?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === 'Tab') {
        const items = [...focusables()];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div ref={ref} role={role} aria-modal="true" aria-labelledby={titleId} className={`card w-full max-w-md ${className}`}>
        {children}
      </div>
    </div>
  );
}
