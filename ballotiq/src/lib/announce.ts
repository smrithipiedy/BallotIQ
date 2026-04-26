/**
 * Accessibility announcer for screen readers.
 * Use this to announce dynamic content changes (e.g. results loading, errors).
 * 
 * @param message - The text to be announced to the screen reader.
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
