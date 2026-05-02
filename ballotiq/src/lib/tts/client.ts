/**
 * Google Cloud Text-to-Speech API v1 client.
 * Audio cache prevents re-synthesizing same content.
 * Gracefully degrades when API unavailable.
 */

import { checkRateLimit, incrementUsage } from '@/lib/security/rateLimit';

const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

const API_KEY = process.env.NEXT_PUBLIC_TTS_API_KEY ?? '';
const BASE_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

/**
 * Synthesizes speech from text using Google Cloud TTS.
 * Caches audio to prevent re-synthesis of same content.
 * @param text - Text to synthesize
 * @param languageCode - BCP-47 language code (e.g., 'en-US')
 * @returns Base64-encoded MP3 audio or null on failure
 */
export async function synthesizeSpeech(
  text: string,
  languageCode: string,
  sessionId?: string
): Promise<string | null> {
  if (!text.trim()) return null;

  const cacheKey = `${text}:${languageCode}`;
  const cached = audioCache.get(cacheKey);
  if (cached) return cached;

  const limit = await checkRateLimit(sessionId ?? 'tts', 'tts');
  if (!limit.allowed) return null;

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text.substring(0, 5000) },
        voice: { languageCode, ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
      }),
    });

    if (!response.ok) throw new Error(`TTS API error: ${response.status}`);

    const data = await response.json() as { audioContent: string };
    audioCache.set(cacheKey, data.audioContent);
    await incrementUsage(sessionId ?? 'tts', 'tts');
    return data.audioContent;
  } catch (error) {
    console.error('[TTS] Synthesis failed:', error);
    return null;
  }
}

/**
 * Plays base64-encoded audio. Stops any currently playing audio first.
 * @param base64Audio - Base64-encoded MP3 audio string
 */
export function playAudio(base64Audio: string): void {
  stopAudio();
  const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
  currentAudio = new Audio(audioSrc);
  currentAudio.play().catch((error) => {
    console.error('[TTS] Playback failed:', error);
  });
}

/**
 * Stops any currently playing audio.
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Returns whether audio is currently playing.
 * @returns True if audio is actively playing
 */
export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
