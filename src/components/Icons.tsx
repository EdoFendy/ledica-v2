export const Arrow = (p: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true" className={p.className}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const Play = () => (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>);
export const Menu = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18" /></svg>);
export const Close = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>);
/** Elettrodo di tungsteno, arco, pezzo. */
export const Mark = ({ className = "logo-mark" }: { className?: string }) => (
  <svg viewBox="0 0 34 34" className={className} aria-hidden="true">
    <rect x="15" y="2" width="4" height="15" fill="#d6dadf" />
    <path d="M17 17l-3 4 4-1-2 5" stroke="#7fb0ff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
    <circle cx="17" cy="17" r="2.2" fill="#fff" />
    <rect x="3" y="28" width="28" height="3" fill="#2e7dff" />
  </svg>
);
