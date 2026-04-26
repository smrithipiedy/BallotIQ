/**
 * Tests for QuizCard component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import QuizCard from '@/components/Quiz/QuizCard';
import type { QuizQuestion } from '@/types';

const mockQ: QuizQuestion = {
  id: 'q1',
  question: 'Which of these is required to vote?',
  options: ['Passport', 'Valid ID', 'Birth Certificate', 'Library Card'],
  correctIndex: 1,
  explanation: 'Most regions require a government-issued photo ID.',
  difficulty: 'medium',
  relatedStepId: 'step_eligibility',
};

describe('QuizCard', () => {
  const onAnswer = jest.fn();

  it('renders question and difficulty badge', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={null}
        showResult={false}
        onAnswer={onAnswer}
      />
    );
    expect(screen.getByText('Which of these is required to vote?')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('renders all 4 options with labels', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={null}
        showResult={false}
        onAnswer={onAnswer}
      />
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('Passport')).toBeInTheDocument();
    expect(screen.getByText('Valid ID')).toBeInTheDocument();
  });

  it('calls onAnswer when an option is clicked', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={null}
        showResult={false}
        onAnswer={onAnswer}
      />
    );
    fireEvent.click(screen.getByText('Valid ID'));
    expect(onAnswer).toHaveBeenCalledWith(1);
  });

  it('shows explanation when showResult is true', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={1}
        showResult={true}
        onAnswer={onAnswer}
      />
    );
    expect(screen.getByText(/Most regions require/i)).toBeInTheDocument();
  });

  it('highlights correct option when showResult is true', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={0}
        showResult={true}
        onAnswer={onAnswer}
      />
    );
    // Emerald color check in class
    const correctOpt = screen.getByText('B').closest('button');
    expect(correctOpt).toHaveClass('text-emerald-300');
  });

  it('renders correct aria-checked attribute for selected option', () => {
    render(
      <QuizCard
        question={mockQ}
        questionNumber={1}
        totalQuestions={10}
        selectedAnswer={1}
        showResult={false}
        onAnswer={onAnswer}
      />
    );
    const options = screen.getAllByRole('radio');
    expect(options[1]).toHaveAttribute('aria-checked', 'true');
    expect(options[0]).toHaveAttribute('aria-checked', 'false');
  });
});
