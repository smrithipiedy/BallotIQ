/**
 * Tests for StepCard component.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StepCard from '@/components/Journey/StepCard';
import type { ElectionStep } from '@/types';

jest.mock('@/components/ui/TranslatedText', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock('@/components/ui/SafeHTML', () => ({
  __esModule: true,
  default: ({ html, className }: { html: string, className?: string }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));

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
  const onComplete = jest.fn<void, []>();
  const onSpeak = jest.fn<void, [string]>();

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

  it('simplification logic handles long text and word replacements', () => {
    const longStep = {
      ...mockStep,
      detailedExplanation: 'however, therefore hence constituency verification eligibility disqualified. Sentence 2. Sentence 3. Sentence 4. Sentence 5. Sentence 6.',
      simpleExplanation: 'Too short', 
    };

    render(
      <StepCard
        step={longStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={jest.fn()}
        onSpeak={jest.fn()}
        adaptationActive={true}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );

    // Should contain simplified sentences from detailedExplanation
    const textElement = screen.getByText(/but/);
    const content = textElement.textContent || '';

    // Verify replacements
    expect(content).toContain('but'); 
    expect(content).toContain('so');  
    expect(content).toContain('area');
    expect(content).toContain('checking');
    expect(content).toContain('who can do this');
    expect(content).toContain('not allowed');

    // Verify slicing (should have max 4 sentences)
    const sentences = content.split(/[.!?]+\s*/).filter(Boolean);
    // Note: the intro suffix might be added if sentences < 3, but here we have 6.
    expect(sentences.length).toBeLessThanOrEqual(5); // 4 from slice + potentially intro/reqs
  });

  it('appends importance suffix when adaptationActive is true and content is short', () => {
    const shortStep = {
      ...mockStep,
      simpleExplanation: 'Very short text.',
    };

    render(
      <StepCard
        step={shortStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={jest.fn()}
        onSpeak={jest.fn()}
        adaptationActive={true}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );

    expect(screen.getByText(/This step is important because it helps you avoid mistakes/)).toBeInTheDocument();
  });

  it('returns original text when sentences array is empty after filtering', () => {
    const emptyStep = {
      ...mockStep,
      simpleExplanation: '   ', // Only whitespace
    };

    render(
      <StepCard
        step={emptyStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={jest.fn()}
        onSpeak={jest.fn()}
        adaptationActive={true}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    
    // It should render the original step description or the intro suffix
    expect(screen.getByText(/This step is important/)).toBeInTheDocument();
  });

  it('falls back to description when detailedExplanation is absent and adaptationActive is false', () => {
    const noDetailStep = {
      ...mockStep,
      detailedExplanation: '',
    };
    render(
      <StepCard
        step={noDetailStep}
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
    expect(screen.getByText('Regular description')).toBeInTheDocument();
  });

  it('applies opacity-60 styling when isActive and isCompleted are both false (locked state)', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={false}
        isCompleted={false}
        knowledgeLevel="beginner"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    const card = screen.getByRole('article');
    expect(card.className).toContain('opacity-60');
  });

  it('applies blue border styling when isActive is true and isCompleted is false', () => {
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
    const card = screen.getByRole('article');
    expect(card.className).toContain('border-blue-500/30');
  });

  it('displays "Legal & Technical Detail" level label when knowledgeLevel is advanced', () => {
    render(
      <StepCard
        step={mockStep}
        isActive={true}
        isCompleted={false}
        knowledgeLevel="advanced"
        onComplete={onComplete}
        onSpeak={onSpeak}
        adaptationActive={false}
        isSpeaking={false}
        currentSpokenText={null}
      />
    );
    expect(screen.getByText('Legal & Technical Detail')).toBeInTheDocument();
  });

  it('renders official source link when knowledgeLevel is intermediate, isActive is true, and electionBodyUrl is provided', () => {
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
        electionBodyUrl="https://example-election.gov"
      />
    );
    const link = screen.getByRole('link', { name: /official election commission/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example-election.gov');
  });

  it('does NOT render official source link when knowledgeLevel is beginner, even with electionBodyUrl', () => {
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
        electionBodyUrl="https://example-election.gov"
      />
    );
    expect(screen.queryByRole('link', { name: /official election commission/i })).not.toBeInTheDocument();
  });
});
