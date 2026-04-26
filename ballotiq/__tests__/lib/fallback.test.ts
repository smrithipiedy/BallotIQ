/**
 * Tests for static fallback content module.
 */

import { getFallbackGuide, FALLBACK_GUIDES } from '@/lib/gemini/fallback';

describe('getFallbackGuide', () => {
  it('returns 7 steps for India beginner', () => {
    const steps = getFallbackGuide('IN', 'beginner');
    expect(steps).toHaveLength(7);
    expect(steps![0].title).toBe('Am I Eligible to Vote?');
  });

  it('returns fewer steps for India advanced than beginner', () => {
    const beginnerSteps = getFallbackGuide('IN', 'beginner');
    const advancedSteps = getFallbackGuide('IN', 'advanced');
    expect(advancedSteps!.length).toBeLessThan(beginnerSteps!.length);
  });

  it('returns 7 steps for USA beginner', () => {
    const steps = getFallbackGuide('US', 'beginner');
    expect(steps).toHaveLength(7);
    expect(steps![0].title).toBe('Am I Eligible to Vote?');
  });

  it('returns null for unsupported country', () => {
    expect(getFallbackGuide('XX', 'beginner')).toBeNull();
  });

  it('all fallback steps have required fields', () => {
    const allSteps = Object.values(FALLBACK_GUIDES).flatMap(levelMap => 
      Object.values(levelMap).flatMap(steps => steps)
    );
    
    allSteps.forEach(step => {
      expect(step.id).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.detailedExplanation).toBeDefined();
      expect(step.simpleExplanation).toBeDefined();
      expect(step.microQuizQuestion).toBeDefined();
    });
  });

  it('steps are ordered correctly', () => {
    const steps = getFallbackGuide('IN', 'beginner');
    const orders = steps!.map(s => s.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sortedOrders);
  });

  it('provides different content for India and USA for the same level', () => {
    const inSteps = getFallbackGuide('IN', 'beginner');
    const usSteps = getFallbackGuide('US', 'beginner');
    expect(inSteps![0].title).toBe(usSteps![0].title); // Same first step title
    expect(inSteps![1].title).not.toBe(usSteps![1].title); // Different second step
  });
});
