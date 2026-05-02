/**
 * Tests for DiagnosticQuestion component.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DiagnosticQuestion from '@/components/Assessment/DiagnosticQuestion';
import { useSTT } from '@/hooks/useSTT';
jest.mock('@/hooks/useSTT', () => ({
  useSTT: jest.fn(() => ({
    isListening: false,
    error: null,
    startListening: jest.fn(),
    stopListening: jest.fn(),
  })),
}));
jest.mock('@/components/ui/TranslatedText', () => ({
  __esModule: true,
  default: ({ text, as: Component = 'span', className }: { text: string, as?: React.ElementType, className?: string }) => (
    <Component className={className}>{text}</Component>
  ),
}));
jest.mock('@/components/ui/SafeHTML', () => ({
  __esModule: true,
  default: ({ html, className }: { html: string, className?: string }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));
jest.mock('@/components/ui/TTSButton', () => ({
  __esModule: true,
  default: () => <button data-testid="tts-button">TTS</button>,
}));
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ language: 'unrecognized-lang' }),
}));

expect.extend(toHaveNoViolations);

describe('DiagnosticQuestion', () => {
  const onAnswer = jest.fn<void, [string | boolean | number]>();

  beforeEach(() => {
    onAnswer.mockClear();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders question 1 with correct buttons', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByText(/Have you voted/i)).toBeInTheDocument();
    expect(screen.getByText('Yes, I have')).toBeInTheDocument();
    expect(screen.getByText('No, first time')).toBeInTheDocument();
  });

  it('calls onAnswer with boolean for question 1', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByText('Yes, I have'));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer with false for question 1 "No, first time"', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByText('No, first time'));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('calls onAnswer with false (logic) for question 1 "I\'m not sure yet"', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByText("I'm not sure yet"));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('renders question 2 with 1-5 scale labels', () => {
    render(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByText(/How well do you understand/i)).toBeInTheDocument();
    expect(screen.getByText('Complete beginner')).toBeInTheDocument();
    expect(screen.getByText('Very knowledgeable')).toBeInTheDocument();
  });

  it('calls onAnswer with number for question 2', () => {
    render(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByText('Complete beginner'));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('calls onAnswer with 5 for question 2 "Very knowledgeable"', () => {
    render(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByText('Very knowledgeable'));
    expect(onAnswer).toHaveBeenCalledWith(5);
  });

  it('renders question 3 with textarea', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByPlaceholderText(/e.g. How does vote counting work/i)).toBeInTheDocument();
  });

  it('calls onAnswer with sanitized text for question 3', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i);
    fireEvent.change(textarea, { target: { value: '<script>alert(1)</script>Help' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit your answer/i }));
    expect(onAnswer).toHaveBeenCalledWith('&lt;script&gt;alert(1)&lt;/script&gt;Help');
  });

  it('submits fallback text for question 3 when textarea is empty', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Submit your answer/i }));
    expect(onAnswer).toHaveBeenCalledWith('General election process');
  });

  it('limits textarea input to maxChars', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i) as HTMLTextAreaElement;
    const longText = 'a'.repeat(250);
    fireEvent.change(textarea, { target: { value: longText } });
    expect(textarea.value.length).toBe(200);
  });

  it('disables inputs when loading', () => {
    const { rerender } = render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Yes, I have/i })).toBeDisabled();

    rerender(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={true} />);
    expect(screen.getByLabelText(/1 out of 5/i)).toBeDisabled();

    rerender(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={true} />);
    expect(screen.getByPlaceholderText(/e.g. How does vote counting work/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /Submit your answer/i })).toBeDisabled();
  });

  it('When onSpeak prop is provided, TTSButton renders on question 1', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} onSpeak={jest.fn<void, [string]>()} />);
    expect(screen.getByTestId('tts-button')).toBeInTheDocument();
  });

  it('When onSpeak prop is undefined/not provided, TTSButton does NOT render on question 1', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.queryByTestId('tts-button')).not.toBeInTheDocument();
  });

  it('When onSpeak prop is provided, TTSButton renders on question 2', () => {
    render(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={false} onSpeak={jest.fn<void, [string]>()} />);
    expect(screen.getByTestId('tts-button')).toBeInTheDocument();
  });

  it('When onSpeak prop is not provided, TTSButton does NOT render on question 2', () => {
    render(<DiagnosticQuestion questionNumber={2} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.queryByTestId('tts-button')).not.toBeInTheDocument();
  });

  it('When onSpeak prop is provided, TTSButton renders on question 3', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} onSpeak={jest.fn<void, [string]>()} />);
    expect(screen.getByTestId('tts-button')).toBeInTheDocument();
  });

  it('When onSpeak prop is not provided, TTSButton does NOT render on question 3', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.queryByTestId('tts-button')).not.toBeInTheDocument();
  });

  it('When STT error is truthy, the amber error message "Voice input is unavailable" appears', () => {
    (useSTT as jest.Mock).mockImplementationOnce(() => ({
      isListening: false,
      error: 'Some error',
      startListening: jest.fn(),
      stopListening: jest.fn(),
    }));
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByText(/Voice input is unavailable on this browser/i)).toBeInTheDocument();
  });

  it('When isListening is true and no error, the blue "Listening" pulse text appears', () => {
    (useSTT as jest.Mock).mockImplementationOnce(() => ({
      isListening: true,
      error: null,
      startListening: jest.fn(),
      stopListening: jest.fn(),
    }));
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByText(/Listening... speak now/i)).toBeInTheDocument();
  });

  it('When isListening is false and no error, neither the error nor listening text appears', () => {
    (useSTT as jest.Mock).mockImplementationOnce(() => ({
      isListening: false,
      error: null,
      startListening: jest.fn(),
      stopListening: jest.fn(),
    }));
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.queryByText(/Voice input is unavailable/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Listening... speak now/i)).not.toBeInTheDocument();
  });

  it('getLanguageInfo returns \'en-US\' as fallback when language code is unrecognized', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(useSTT).toHaveBeenCalledWith('en-US', expect.any(Function));
  });

  describe('STT Integration', () => {
    let capturedOnResult: (text: string) => void;

    beforeEach(() => {
      (useSTT as jest.Mock).mockImplementation((lang, onResult) => {
        capturedOnResult = onResult;
        return {
          isListening: false,
          error: null,
          startListening: jest.fn(),
          stopListening: jest.fn(),
        };
      });
    });

    it('does not update textarea when spoken text is empty', () => {
      render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i) as HTMLTextAreaElement;
      
      act(() => {
        capturedOnResult('   ');
      });
      
      expect(textarea.value).toBe('');
    });

    it('appends spoken text with space separator when textarea is populated', () => {
      render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i) as HTMLTextAreaElement;
      
      fireEvent.change(textarea, { target: { value: 'Existing text' } });
      
      act(() => {
        if (capturedOnResult) capturedOnResult('new voice text');
      });
      
      expect(textarea.value).toBe('Existing text new voice text');
    });

    it('slices combined text to maxChars (200)', () => {
      render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i) as HTMLTextAreaElement;
      
      const longText = 'a'.repeat(190);
      fireEvent.change(textarea, { target: { value: longText } });
      
      act(() => {
        if (capturedOnResult) capturedOnResult('this is more than twenty characters long');
      });
      
      expect(textarea.value.length).toBe(200);
    });

    it('The textarea prefix logic — when existing text is empty, appended STT text has no leading space; when existing text exists, appended STT text is separated by a space', () => {
      render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
      const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i) as HTMLTextAreaElement;
      
      // Empty text logic
      act(() => {
        capturedOnResult('first sentence');
      });
      expect(textarea.value).toBe('first sentence');
      
      // Existing text logic
      act(() => {
        capturedOnResult('second sentence');
      });
      expect(textarea.value).toBe('first sentence second sentence');
    });
  });
});
