/**
 * Utility functions for text processing and simplification.
 */

/**
 * Simplifies complex text by replacing jargon with simpler terms
 * and limiting the length to ensure readability.
 */
export function simplifyText(text: string): string {
  if (!text) return '';
  
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\btherefore\b/gi, 'so')
    .replace(/\bhence\b/gi, 'so')
    .replace(/\bhowever\b/gi, 'but')
    .replace(/\bconstituency\b/gi, 'area')
    .replace(/\bverification\b/gi, 'checking')
    .replace(/\beligibility\b/gi, 'who can do this')
    .replace(/\bdisqualified\b/gi, 'not allowed')
    .trim();

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (sentences.length === 0) return text;

  return sentences.join(' ');
}
