/**
 * Tests for useAdaptiveLearning hook.
 * Verifies consecutive error tracking and adaptation trigger.
 */

import { renderHook, act } from '@testing-library/react';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import type { UserContext, ElectionStep } from '@/types';
import * as geminiClient from '@/lib/gemini/client';

// Mock gemini client
jest.mock('@/lib/gemini/client', () => ({
  reExplainConcept: jest.fn().mockResolvedValue('Simplified explanation from AI'),
}));

const mockSteps: ElectionStep[] = [
  {
    id: '1',
    title: 'Step 1',
    order: 1,
    description: 'Desc 1',
    detailedExplanation: 'Detail 1',
    simpleExplanation: 'Simple 1',
    timeline: 'Timeline 1',
    requirements: [],
    tips: [],
    status: 'locked' as const,
  },
  {
    id: '2',
    title: 'Step 2',
    order: 2,
    description: 'Desc 2',
    detailedExplanation: 'Detail 2',
    simpleExplanation: 'Simple 2',
    timeline: 'Timeline 2',
    requirements: [],
    tips: [],
    status: 'locked' as const,
  },
];

const mockContext: UserContext = {
  sessionId: 'test-session',
  countryCode: 'US',
  countryName: 'USA',
  knowledgeLevel: 'intermediate',
  adaptationActive: false,
  consecutiveErrors: 0,
  hasVotedBefore: false,
  selfRatedKnowledge: 3,
  mainConfusion: '',
  language: 'en',
};

describe('useAdaptiveLearning', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.adaptationActive).toBe(false);
    expect(result.current.consecutiveErrors).toBe(0);
  });

  it('resets errors on correct answer', async () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    // First fail
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'Wrong', 'Right');
    });
    expect(result.current.consecutiveErrors).toBe(1);

    // Then succeed
    await act(async () => {
      await result.current.handleMicroQuizResult(true, mockSteps[0], 'Right', 'Right');
    });
    expect(result.current.consecutiveErrors).toBe(0);
  });

  it('shows adaptation prompt after 2 consecutive errors', async () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    // Fail 1
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W1', 'C');
    });
    expect(result.current.showAdaptationPrompt).toBe(false);
    expect(result.current.adaptationActive).toBe(false);

    // Fail 2
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W2', 'C');
    });
    expect(result.current.showAdaptationPrompt).toBe(true);
    expect(result.current.adaptationActive).toBe(false);

    // Confirm
    act(() => {
      result.current.confirmAdaptation();
    });
    expect(result.current.adaptationActive).toBe(true);
    expect(result.current.showAdaptationPrompt).toBe(false);
  });

  it('calls reExplainConcept on failure', async () => {
    const spy = jest.spyOn(geminiClient, 'reExplainConcept');
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'Wrong', 'Right');
    });

    expect(spy).toHaveBeenCalled();
    expect(result.current.reExplanation).toBe('Simplified explanation from AI');
  });

  it('moves to next step', () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    act(() => {
      result.current.moveToNextStep();
    });
    expect(result.current.currentStepIndex).toBe(1);
    expect(result.current.reExplanation).toBeNull();
  });

  it('retains adaptationActive state across step changes once triggered', async () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    // Trigger adaptation
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W1', 'C');
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W2', 'C');
    });
    act(() => {
      result.current.confirmAdaptation();
    });
    expect(result.current.adaptationActive).toBe(true);

    // Move to next step
    act(() => {
      result.current.moveToNextStep();
    });
    expect(result.current.adaptationActive).toBe(true);
  });
  it('dismisses adaptation prompt and resets errors', async () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W1', 'C');
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W2', 'C');
    });
    expect(result.current.showAdaptationPrompt).toBe(true);

    act(() => {
      result.current.dismissAdaptation();
    });
    expect(result.current.showAdaptationPrompt).toBe(false);
    expect(result.current.consecutiveErrors).toBe(0);
  });

  it('does not trigger another prompt when adaptation is already active', async () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W1', 'C');
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W2', 'C');
    });
    
    act(() => {
      result.current.confirmAdaptation();
    });

    await act(async () => {
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W3', 'C');
      await result.current.handleMicroQuizResult(false, mockSteps[0], 'W4', 'C');
    });
    
    expect(result.current.showAdaptationPrompt).toBe(false);
  });

  it('does not exceed max step index on moveToNextStep', () => {
    const { result } = renderHook(() => useAdaptiveLearning(mockContext, mockSteps));
    
    act(() => {
      result.current.moveToNextStep(); // Moves to index 1
    });
    expect(result.current.currentStepIndex).toBe(1);
    
    act(() => {
      result.current.moveToNextStep(); // Attempt to move beyond last step
    });
    expect(result.current.currentStepIndex).toBe(1);
  });
});
