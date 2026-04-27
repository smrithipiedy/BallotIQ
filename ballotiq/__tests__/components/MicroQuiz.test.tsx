/**
 * Tests for MicroQuiz component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import MicroQuiz from '@/components/Journey/MicroQuiz';
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
});
