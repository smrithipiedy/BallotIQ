import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

/**
 * Google Cloud Gemini API key.
 * This MUST be a server-side environment variable for production security.
 */
const API_KEY = process.env.GEMINI_API_KEY ?? '';

const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
] as const;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/** Sleep helper for exponential backoff */
const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

type GeminiRequestBody = {
  prompt: string;
  lite?: boolean;
  kind?: 'general' | 'quiz';
  systemInstruction?: string;
  maxTokens?: number;
};

export async function GET() {
  return NextResponse.json({ enabled: Boolean(genAI) });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GeminiRequestBody;

    if (!genAI) {
      return NextResponse.json({ text: null, error: 'GEMINI_API_KEY missing' }, { status: 503 });
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    if (!prompt.trim()) {
      return NextResponse.json({ text: null, error: 'Missing prompt' }, { status: 400 });
    }

    const kind = body.kind ?? 'general';
    const lite = body.lite ?? false;
    const systemInstruction = body.systemInstruction;
    const maxTokens = typeof body.maxTokens === 'number' ? body.maxTokens : 512;

    if (kind === 'quiz') {
      const models = MODELS_TO_TRY;
      for (const modelId of models) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelId,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: maxTokens,
            },
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
          });

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          if (text) return NextResponse.json({ text });
        } catch {
          // Try next model.
        }
      }

      return NextResponse.json({ text: null });
    }

    const models = lite
      ? (['gemini-2.0-flash-lite-001', 'gemini-1.5-flash'] as const)
      : MODELS_TO_TRY;

    const retryDelays = lite ? [1000] : [2000, 5000];

    for (const modelId of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            temperature: lite ? 0.1 : 0.3,
            maxOutputTokens: maxTokens,
          },
          systemInstruction,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          ],
        });

        for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
          try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (text) return NextResponse.json({ text });
          } catch (err: unknown) {
            const status =
              typeof err === 'object' && err !== null && 'status' in err
                ? (err as { status?: number }).status
                : undefined;
            const message =
              typeof err === 'object' && err !== null && 'message' in err
                ? (err as { message?: string }).message ?? ''
                : '';

            // 404: Model not available in this region/key
            if (status === 404) break;

            // 429: Quota Exceeded - Move to NEXT MODEL immediately
            if (status === 429 || message.toLowerCase().includes('quota')) break;

            // 503: Overloaded - Retry with delay
            if (status === 503 && attempt < retryDelays.length) {
              const wait = retryDelays[attempt] + Math.random() * 1000;
              await sleep(wait);
              continue;
            }

            // Other errors: move to next model
            break;
          }
        }
      } catch {
        // Try next model.
      }
    }

    return NextResponse.json({ text: null });
  } catch {
    return NextResponse.json({ text: null }, { status: 500 });
  }
}

