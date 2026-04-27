/**
 * Firebase Performance Monitoring traces.
 * Measures actual performance of critical operations.
 * Provides real data to prove efficiency claims.
 */

import { getPerformance, trace } from 'firebase/performance';
import { app } from './client';

const perf = typeof window !== 'undefined' ? getPerformance(app) : null;

/**
 * Wraps an async function with a Firebase Performance trace.
 * Automatically records duration and custom attributes.
 */
export async function withTrace<T>(
  traceName: string,
  attributesOrFn: Record<string, string> | (() => Promise<T>),
  maybeFn?: () => Promise<T>
): Promise<T> {
  const fn = typeof attributesOrFn === 'function' ? attributesOrFn : maybeFn;
  const attributes = typeof attributesOrFn === 'object' ? attributesOrFn : {};

  if (!fn) {
    console.error(`[withTrace] No function provided for trace: ${traceName}`);
    return Promise.resolve() as unknown as T;
  }

  // If performance monitoring is unavailable or we're on SSR, just run the function
  if (!perf) return fn();

  const t = trace(perf, traceName);
  
  // Set attributes before starting
  Object.entries(attributes).forEach(([k, v]) => {
    if (v) t.putAttribute(k, String(v));
  });
  
  t.start();
  
  try {
    const result = await fn();
    t.putAttribute('status', 'success');
    return result;
  } catch (error) {
    t.putAttribute('status', 'error');
    throw error;
  } finally {
    t.stop();
  }
}
