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
  if (!perf) {
    return typeof attributesOrFn === 'function' ? attributesOrFn() : maybeFn!();
  }
  
  const t = trace(perf, traceName);
  const attributes = typeof attributesOrFn === 'object' ? attributesOrFn : {};
  const fn = typeof attributesOrFn === 'function' ? attributesOrFn : maybeFn!;

  Object.entries(attributes).forEach(([k, v]) => t.putAttribute(k, v));
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
