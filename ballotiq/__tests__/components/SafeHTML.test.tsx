import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SafeHTML from '@/components/ui/SafeHTML';
import { useTranslation } from '@/hooks/useTranslation';
import { sanitizeAIResponse } from '@/lib/security/sanitize';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));
jest.mock('@/lib/security/sanitize');

describe('SafeHTML', () => {
  const mockTranslate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({
      translate: mockTranslate,
      language: 'en',
    });
    (sanitizeAIResponse as jest.Mock).mockImplementation((html) => html ? `sanitized-${html}` : '');
  });

  it('renders sanitized HTML content', () => {
    render(<SafeHTML html="<p>Hello</p>" />);
    const container = screen.getByLabelText('AI generated content');
    expect(container.innerHTML).toBe('sanitized-<p>Hello</p>');
  });

  it('shows opacity-50 while loading translation', async () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: () => new Promise((resolve) => setTimeout(() => resolve('translated'), 100)),
      language: 'hi',
    });

    render(<SafeHTML html="hello" />);
    const container = screen.getByLabelText('AI generated content');
    expect(container).toHaveClass('opacity-50');
  });

  it('returns to opacity-100 after translation completes', async () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: jest.fn().mockResolvedValue('translated html'),
      language: 'hi',
    });

    render(<SafeHTML html="hello" />);
    const container = screen.getByLabelText('AI generated content');
    
    await waitFor(() => {
      expect(container).toHaveClass('opacity-100');
    });
    expect(container.innerHTML).toBe('sanitized-translated html');
  });

  it('when language is "en", does not call translate', () => {
    render(<SafeHTML html="hello" />);
    expect(mockTranslate).not.toHaveBeenCalled();
    expect(sanitizeAIResponse).toHaveBeenCalledWith('hello');
  });

  it('when html is empty string, renders empty without calling translate', () => {
    render(<SafeHTML html="" />);
    expect(mockTranslate).not.toHaveBeenCalled();
    const container = screen.getByLabelText('AI generated content');
    expect(container.innerHTML).toBe('');
  });

  it('has role="region" and aria-label="AI generated content"', () => {
    render(<SafeHTML html="test" />);
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'AI generated content');
  });

  it('cleans up isMounted on unmount', () => {
    const translatePromise = new Promise((resolve) => setTimeout(() => resolve('done'), 10));
    (useTranslation as jest.Mock).mockReturnValue({
      translate: () => translatePromise,
      language: 'hi',
    });

    const { unmount } = render(<SafeHTML html="test" />);
    unmount();
    
    // If it updates state after unmount, it might show a warning in some test environments,
    // though RTL/Jest handles this well. This test mainly exercises the cleanup return.
  });
});
