/**
 * Tests for DiagnosticQuestion component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DiagnosticQuestion from '@/components/Assessment/DiagnosticQuestion';

expect.extend(toHaveNoViolations);

describe('DiagnosticQuestion', () => {
  const onAnswer = jest.fn();

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

  it('renders question 3 with textarea', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    expect(screen.getByPlaceholderText(/e.g. How does vote counting work/i)).toBeInTheDocument();
  });

  it('calls onAnswer with sanitized text for question 3', () => {
    render(<DiagnosticQuestion questionNumber={3} onAnswer={onAnswer} isLoading={false} />);
    const textarea = screen.getByPlaceholderText(/e.g. How does vote counting work/i);
    fireEvent.change(textarea, { target: { value: '<script>alert(1)</script>Help' } });
    fireEvent.click(screen.getByText(/Continue/i));
    expect(onAnswer).toHaveBeenCalledWith('&lt;script&gt;alert(1)&lt;/script&gt;Help');
  });

  it('disables inputs when loading', () => {
    render(<DiagnosticQuestion questionNumber={1} onAnswer={onAnswer} isLoading={true} />);
    expect(screen.getByText('Yes, I have')).toBeDisabled();
  });
});
