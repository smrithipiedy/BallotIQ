import { renderHook, act } from '@testing-library/react';
import { useSTT } from '@/hooks/useSTT';

describe('useSTT', () => {
  const originalSpeechRecognition = window.SpeechRecognition;
  const originalWebkitSpeechRecognition = window.webkitSpeechRecognition;

  // Mock instance to trigger events
  let mockRecognitionInstance: MockSpeechRecognition;

  class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    lang = 'en-US';
    onstart = null;
    onresult = null;
    onerror = null;
    onend = null;
    start = jest.fn().mockImplementation(function(this: MockSpeechRecognition) {
      if (this.onstart) (this.onstart as () => void)();
    });
    stop = jest.fn().mockImplementation(function(this: MockSpeechRecognition) {
      if (this.onend) (this.onend as () => void)();
    });

    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      mockRecognitionInstance = this;
    }
  }

  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    window.SpeechRecognition = originalSpeechRecognition;
    window.webkitSpeechRecognition = originalWebkitSpeechRecognition;
    jest.useRealTimers();
  });

  it('sets error when recognition is not supported', () => {
    const { result } = renderHook(() => useSTT());
    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.error).toBe('Speech recognition not supported in this browser.');
  });

  it('startListening does nothing when not supported', () => {
    const { result } = renderHook(() => useSTT());
    act(() => {
      result.current.startListening();
    });
    expect(result.current.isListening).toBe(false);
  });

  describe('with support', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'SpeechRecognition', {
        writable: true,
        value: MockSpeechRecognition,
      });
    });

    it('sets isListening: true when recognition starts', () => {
      const { result } = renderHook(() => useSTT());
      
      act(() => {
        result.current.startListening();
      });

      expect(result.current.isListening).toBe(true);
      expect(mockRecognitionInstance.start).toHaveBeenCalled();
    });

    it('sets transcript and calls onResult when receiving final result', () => {
      const onResult = jest.fn<void, [string]>();
      const { result } = renderHook(() => useSTT('en-US', onResult));

      act(() => {
        const event = {
          resultIndex: 0,
          results: {
            0: {
              0: { transcript: 'hello world' },
              isFinal: true,
            },
            length: 1,
          },
        };
        mockRecognitionInstance.onresult(event);
      });

      expect(result.current.transcript).toBe('hello world');
      expect(onResult).toHaveBeenCalledWith('hello world');
    });

    it('sets isListening: false when recognition ends', () => {
      const { result } = renderHook(() => useSTT());
      
      act(() => {
        result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);

      act(() => {
        mockRecognitionInstance.onend();
      });
      expect(result.current.isListening).toBe(false);
    });

    it('sets error state when recognition fires an error', () => {
      const { result } = renderHook(() => useSTT());
      
      act(() => {
        mockRecognitionInstance.onerror({ error: 'not-allowed' });
      });

      expect(result.current.error).toBe('not-allowed');
      expect(result.current.isListening).toBe(false);
    });

    it('stopListening stops the recognition', () => {
      const { result } = renderHook(() => useSTT());
      
      act(() => {
        result.current.startListening();
      });
      
      act(() => {
        result.current.stopListening();
      });

      expect(mockRecognitionInstance.stop).toHaveBeenCalled();
      expect(result.current.isListening).toBe(false);
    });
  });
});
