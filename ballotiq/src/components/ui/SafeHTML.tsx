/**
 * XSS-safe HTML renderer.
 * Sanitizes AI-generated content before rendering.
 */

import { sanitizeAIResponse } from '@/lib/security/sanitize';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

/** Renders sanitized HTML content safely */
export default function SafeHTML({ html, className = '' }: SafeHTMLProps) {
  const sanitized = sanitizeAIResponse(html);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      role="region"
      aria-label="AI generated content"
    />
  );
}
