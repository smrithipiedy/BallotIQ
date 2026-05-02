import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import VoiceInputButton from '@/components/Assessment/VoiceInputButton';

expect.extend(toHaveNoViolations);

describe('VoiceInputButton', () => {
  const onToggle = jest.fn();

  beforeEach(() => {
    onToggle.mockClear();
  });

  it('renders microphone icon when isListening is false', () => {
    const { container } = render(
      <VoiceInputButton isListening={false} isLoading={false} onToggle={onToggle} />
    );
    // Lucide Mic icon has data-lucide="mic" usually, but we check via aria-label or presence
    expect(screen.getByLabelText('Start voice input')).toBeInTheDocument();
    expect(container.querySelector('.lucide-mic')).toBeInTheDocument();
  });

  it('renders stop/active state when isListening is true', () => {
    const { container } = render(
      <VoiceInputButton isListening={true} isLoading={false} onToggle={onToggle} />
    );
    expect(screen.getByLabelText('Stop voice input')).toBeInTheDocument();
    expect(container.querySelector('.lucide-mic-off')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-red-500/20');
  });

  it('clicking button calls onToggle when not listening', () => {
    render(<VoiceInputButton isListening={false} isLoading={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('clicking button calls onToggle when listening', () => {
    render(<VoiceInputButton isListening={true} isLoading={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('button is disabled when isLoading prop is true', () => {
    render(<VoiceInputButton isListening={false} isLoading={true} onToggle={onToggle} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has correct aria-label when listening', () => {
    render(<VoiceInputButton isListening={true} isLoading={false} onToggle={onToggle} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Stop voice input');
  });

  it('has correct aria-label when not listening', () => {
    render(<VoiceInputButton isListening={false} isLoading={false} onToggle={onToggle} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Start voice input');
  });

  it('has no accessibility violations in both states', async () => {
    const { container: containerOff, rerender } = render(
      <VoiceInputButton isListening={false} isLoading={false} onToggle={onToggle} />
    );
    let results = await axe(containerOff);
    expect(results).toHaveNoViolations();

    rerender(<VoiceInputButton isListening={true} isLoading={false} onToggle={onToggle} />);
    results = await axe(containerOff);
    expect(results).toHaveNoViolations();
  });
});
