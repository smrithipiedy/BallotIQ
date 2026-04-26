'use client';

/**
 * Banner shown when adaptive learning mode activates.
 * Informs the user that content has been simplified.
 * (User requested removal - component now returns null)
 */

interface AdaptationNoticeProps {
  isVisible: boolean;
}

/** Dismissible banner announcing simplified content mode */
export default function AdaptationNotice({ isVisible }: AdaptationNoticeProps) {
  // Removed as per user request
  return null;
}
