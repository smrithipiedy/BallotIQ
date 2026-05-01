/**
 * Tests for the useProgress hook.
 */
import { renderHook, act } from '@testing-library/react';
import { useProgress } from '@/hooks/useProgress';

// Mock Firebase
jest.mock('@/lib/firebase/client', () => ({
  authReady: Promise.resolve(),
  getFirebaseAuth: jest.fn().mockReturnValue({
    currentUser: { uid: 'mock-uid-123' }
  })
}));

jest.mock('@/lib/firebase/firestore', () => ({
  saveProgress: jest.fn().mockResolvedValue(undefined),
  getProgress: jest.fn().mockResolvedValue(null)
}));

describe('useProgress Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('initializes with empty progress', async () => {
    const { result } = renderHook(() => useProgress('US', 'beginner'));

    // Wait for the async restore to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.completedSteps).toEqual([]);
    expect(result.current.progress?.knowledgeLevel).toBe('beginner');
    expect(result.current.sessionId).toBe('mock-uid-123');
  });

  it('completes a step and persists', async () => {
    const { result } = renderHook(() => useProgress('US', 'beginner'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.completeStep('step1');
    });

    expect(result.current.completedSteps).toContain('step1');
    expect(result.current.isStepComplete('step1')).toBe(true);
    expect(result.current.isStepComplete('step2')).toBe(false);
  });

  it('saves micro quiz results', async () => {
    const { result } = renderHook(() => useProgress('US', 'beginner'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.saveMicroQuizResult('step1', true);
    });

    expect(result.current.progress?.microQuizResults['step1']).toBe(true);
  });

  it('resets progress', async () => {
    const { result } = renderHook(() => useProgress('US', 'beginner'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.completeStep('step1');
    });

    expect(result.current.completedSteps).toContain('step1');

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.completedSteps).toEqual([]);
  });
});
