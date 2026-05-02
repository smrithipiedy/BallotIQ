import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TranslatedText from '@/components/ui/TranslatedText';
import { useTranslation } from '@/hooks/useTranslation';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

describe('TranslatedText', () => {
  const mockTranslate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({
      translate: mockTranslate,
      language: 'en',
    });
  });

  it('renders original text when language is "en"', () => {
    render(<TranslatedText text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('renders translated text when language is not "en"', async () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: jest.fn().mockResolvedValue('Namaste'),
      language: 'hi',
    });

    render(<TranslatedText text="Hello" />);
    
    await waitFor(() => {
      expect(screen.getByText('Namaste')).toBeInTheDocument();
    });
  });

  it('shows opacity-50 class while translating', () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: () => new Promise(() => {}), // Never resolves
      language: 'hi',
    });

    const { container } = render(<TranslatedText text="Hello" />);
    expect(container.firstChild).toHaveClass('opacity-50');
  });

  it('shows opacity-100 after translation completes', async () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: jest.fn().mockResolvedValue('Done'),
      language: 'hi',
    });

    const { container } = render(<TranslatedText text="Hello" />);
    await waitFor(() => {
      expect(container.firstChild).toHaveClass('opacity-100');
    });
  });

  it('renders as "span" by default', () => {
    const { container } = render(<TranslatedText text="Hello" />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('renders as the element specified in "as" prop', () => {
    const { rerender, container } = render(<TranslatedText text="Hello" as="p" />);
    expect(container.firstChild?.nodeName).toBe('P');

    rerender(<TranslatedText text="Hello" as="h2" />);
    expect(container.firstChild?.nodeName).toBe('H2');
  });

  it('does not call translate when text is empty string', () => {
    render(<TranslatedText text="" />);
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translate: () => new Promise((resolve) => setTimeout(() => resolve('hi'), 10)),
      language: 'hi',
    });

    const { unmount } = render(<TranslatedText text="test" />);
    unmount();
  });
});
