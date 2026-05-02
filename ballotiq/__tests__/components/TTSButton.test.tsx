import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TTSButton from '@/components/ui/TTSButton';

describe('TTSButton', () => {
  const mockOnToggle = jest.fn<void, [string]>();
  const defaultProps = {
    text: 'Hello world',
    isSpeaking: false,
    currentText: null,
    onToggle: mockOnToggle,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Listen" text and Volume2 icon when not active', () => {
    render(<TTSButton {...defaultProps} />);
    expect(screen.getByText('Listen')).toBeInTheDocument();
    expect(screen.getByLabelText('Read aloud')).toBeInTheDocument();
  });

  it('renders "Stop" text and VolumeX icon when active', () => {
    render(<TTSButton {...defaultProps} isSpeaking={true} currentText="Hello world" />);
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByLabelText('Stop reading aloud')).toBeInTheDocument();
  });

  it('renders "Listen" when isSpeaking=true but currentText does NOT match text prop', () => {
    render(<TTSButton {...defaultProps} isSpeaking={true} currentText="Different text" />);
    expect(screen.getByText('Listen')).toBeInTheDocument();
  });

  it('clicking button calls onToggle with the text prop', () => {
    render(<TTSButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnToggle).toHaveBeenCalledWith('Hello world');
  });

  it('aria-pressed is false when not active', () => {
    render(<TTSButton {...defaultProps} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('aria-pressed is true when active', () => {
    render(<TTSButton {...defaultProps} isSpeaking={true} currentText="Hello world" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('aria-label is "Read aloud" when not active', () => {
    render(<TTSButton {...defaultProps} />);
    expect(screen.getByLabelText('Read aloud')).toBeInTheDocument();
  });

  it('aria-label is "Stop reading aloud" when active', () => {
    render(<TTSButton {...defaultProps} isSpeaking={true} currentText="Hello world" />);
    expect(screen.getByLabelText('Stop reading aloud')).toBeInTheDocument();
  });
});
