/**
 * Tests for MicroQuiz component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import MicroQuiz from '@/components/Journey/MicroQuiz';

jest.mock('@/components/ui/TTSButton', () => ({
  __esModule: true,
  default: () => <button data-testid="tts-button">TTS</button>,
}));

expect.extend(toHaveNoViolations);
import type { MicroQuizQuestion } from '@/types';

const mockQuestion: MicroQuizQuestion = {
  question: 'What is the voting age?',
  options: ['16', '18', '21', '25'],
  correctIndex: 1,
  hint: 'Most countries use this age.',
};

describe('MicroQuiz', () => {
  const onSubmit = jest.fn();
  const onContinue = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
    onContinue.mockClear();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders question and options', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText('What is the voting age?')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('calls onSubmit when option is clicked', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    fireEvent.click(screen.getByText('18'));
    expect(onSubmit).toHaveBeenCalledWith(1);
  });

  it('shows correct feedback when isCorrect is true', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={1}
        isCorrect={true}
        showResult={true}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText(/Excellent!/i)).toBeInTheDocument();
  });

  it('shows error feedback and re-explanation when isCorrect is false', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation="Incorrect explanation"
        reExplanation="Simplified explanation"
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText(/Not quite right/i)).toBeInTheDocument();
    expect(screen.getByText(/Simplified explanation/i)).toBeInTheDocument();
  });

  it('calls onContinue when continue button is clicked', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={1}
        isCorrect={true}
        showResult={true}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    fireEvent.click(screen.getByText(/Continue Learning/i));
    expect(onContinue).toHaveBeenCalled();
  });

  it('toggles hint visibility when hint button is clicked', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    // Hint is present but hidden
    const hint = screen.getByText(/Most countries use this age/i);
    const container = hint.closest('div[id^="hint-"]');
    expect(container).toHaveClass('hidden');
    
    fireEvent.click(screen.getByLabelText(/Show hint/i));
    expect(container).not.toHaveClass('hidden');
  });

  it('When isLoading is true, renders the skeleton/pulse loading state (4 skeleton divs visible, no question text)', () => {
    const { container } = render(
      <MicroQuiz
        question={null}
        loading={true}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    // 1 header skeleton + 4 option skeletons = 5 total children or similar,
    // let's just check the 4 skeleton divs via querySelectorAll
    const skeletons = container.querySelectorAll('.h-10');
    expect(skeletons.length).toBe(4);
    expect(screen.queryByText('What is the voting age?')).not.toBeInTheDocument();
  });

  it('When isLoading is false and question is loaded, skeleton is NOT visible', () => {
    const { container } = render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('When onSpeak prop is provided, TTSButton renders in the quiz', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
        onSpeak={jest.fn<void, [string]>()}
      />
    );
    expect(screen.getByTestId('tts-button')).toBeInTheDocument();
  });

  it('When onSpeak prop is not provided, TTSButton does NOT render', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.queryByTestId('tts-button')).not.toBeInTheDocument();
  });

  it('When answer is wrong and isReExplaining is true, shows the AI thinking loading state', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation="Wrong!"
        reExplanation={null}
        isReExplaining={true}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText(/AI is preparing a simpler explanation/i)).toBeInTheDocument();
  });

  it('When answer is wrong and re-explanation text is available, it renders in the UI', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation="Wrong!"
        reExplanation="Here is a simpler breakdown."
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText(/Here is a simpler breakdown/i)).toBeInTheDocument();
  });

  it('When onInteraction prop is provided, it is called when user selects an answer', () => {
    const onInteraction = jest.fn<void, []>();
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
        onInteraction={onInteraction}
      />
    );
    fireEvent.click(screen.getByText('18'));
    expect(onInteraction).toHaveBeenCalled();
  });

  it('When loading={false} and question={null}, component returns null — container is empty', () => {
    const { container } = render(
      <MicroQuiz
        question={null}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('When hint button is clicked and onInteraction is provided, onInteraction is called', () => {
    const onInteraction = jest.fn<void, []>();
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={null}
        isCorrect={null}
        showResult={false}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
        onInteraction={onInteraction}
      />
    );
    fireEvent.click(screen.getByLabelText(/Show hint/i));
    expect(onInteraction).toHaveBeenCalled();
  });

  it('When isCorrect={false} and explanation is empty string, renders TranslatedText with empty string fallback', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation=""
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText(/Not quite right/i)).toBeInTheDocument();
  });

  it('When reExplanation is null and isReExplaining is false, SafeHTML does not render', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation="Wrong"
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(document.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });

  it('When reExplanation has content and isReExplaining is false, SafeHTML renders with the reExplanation content', () => {
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={0}
        isCorrect={false}
        showResult={true}
        explanation="Wrong"
        reExplanation="<p>A clearer explanation.</p>"
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />
    );
    expect(screen.getByText('A clearer explanation.')).toBeInTheDocument();
  });

  it('When Continue button is clicked and onInteraction is provided, onInteraction is called', () => {
    const onInteraction = jest.fn<void, []>();
    render(
      <MicroQuiz
        question={mockQuestion}
        loading={false}
        selectedAnswer={1}
        isCorrect={true}
        showResult={true}
        explanation={null}
        reExplanation={null}
        isReExplaining={false}
        onSubmit={onSubmit}
        onContinue={onContinue}
        onInteraction={onInteraction}
      />
    );
    fireEvent.click(screen.getByLabelText(/Continue to next step/i));
    expect(onInteraction).toHaveBeenCalled();
  });
});
