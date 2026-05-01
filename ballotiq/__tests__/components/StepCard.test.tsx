/**
 * Tests for StepCard component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StepCard from '@/components/Journey/StepCard';
import type { ElectionStep } from '@/types';

expect.extend(toHaveNoViolations);

const mockStep: ElectionStep = {
  id: 'step1',
  order: 1,
  title: 'Test Step',
  description: 'Regular description',
  detailedExplanation: 'Detailed explanation for beginners',
  simpleExplanation: 'Very simple explanation that is long enough to be kept in the adaptive mode. It needs at least three sentences to pass the rich check so we are adding more text here to reach the one hundred and eighty character limit required by the logic. This should be enough now.',
  timeline: 'Anytime',
  requirements: ['ID Card'],
  tips: ['Bring water'],
  status: 'current',
};

describe('StepCard', () => {
  const onComplete = jest.fn();
  const onSpeak = jest.fn();

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="intermediate"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders step title and basic info', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="intermediate"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('Detailed explanation for beginners')).toBeInTheDocument();
  });

  it('shows simpleExplanation when adaptationActive is true', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="intermediate"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={true}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.getByText(/Very simple explanation/)).toBeInTheDocument();
  });

  it('shows detailedExplanation for beginner when adaptation is false', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.getByText('Detailed explanation for beginners')).toBeInTheDocument();
  });

  it('calls onComplete when button is clicked', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    fireEvent.click(screen.getByText(/Mark as Complete/i));
    expect(onComplete).toHaveBeenCalled();
  });

  it('toggles requirements visibility', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    const button = screen.getByText(/Requirements/i);
    expect(screen.queryByText('ID Card')).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText('ID Card')).toBeInTheDocument();
  });

  it('renders with correct aria-label for accessibility', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'Step 1: Test Step');
  });

  it('shows checkmark icon when completed', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={false}
        isCompleted={true}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument(); // Order number hidden
    expect(screen.getByTestId('check-circle')).toBeInTheDocument(); // Checkmark shown (if using data-testid, otherwise check icon)
  });

  it('toggles tips visibility', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    const button = screen.getByText(/Tips/i);
    expect(screen.queryByText('Bring water')).not.toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText('Bring water')).toBeInTheDocument();
  });

  it('hides complete button when step is already completed', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={false}
        isCompleted={true}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.queryByText(/Mark as Complete/i)).not.toBeInTheDocument();
  });
});
