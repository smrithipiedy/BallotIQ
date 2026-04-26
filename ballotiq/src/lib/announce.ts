/**
 * Accessibility announcer for screen readers.
 * Use this to announce dynamic content changes.
 */
export function announce(message: string): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('a11y-announcer');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}
