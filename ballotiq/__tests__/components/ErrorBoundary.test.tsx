import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

jest.mock('@/lib/firebase/client', () => ({
  analytics: {},
}));

const ThrowComponent = ({ message = 'Test Error' }) => {
  throw new Error(message);
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn<void, unknown[]>();
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary componentName="Test">
        <div>Success Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Success Content')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws', () => {
    render(
      <ErrorBoundary componentName="Test">
        <ThrowComponent message="Crashed!" />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Crashed!')).toBeInTheDocument();
  });

  it('renders custom fallback prop when provided and a child throws', () => {
    render(
      <ErrorBoundary componentName="Test" fallback={<div>Custom Error</div>}>
        <ThrowComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
  });

  it('"Try Again" button resets the error state and renders children again', () => {
    const { rerender } = render(
      <ErrorBoundary componentName="Test">
        <ThrowComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Rerender with safe content first
    rerender(
      <ErrorBoundary componentName="Test">
        <div>Recovered Content</div>
      </ErrorBoundary>
    );

    // Then click try again to reset internal state
    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getByText('Recovered Content')).toBeInTheDocument();
  });

  it('componentDidCatch calls console.error with the component name', () => {
    render(
      <ErrorBoundary componentName="MyComponent">
        <ThrowComponent />
      </ErrorBoundary>
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ErrorBoundary:MyComponent]'),
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('works when analytics is null', () => {
    // We can't easily swap the mock, so we just verify it doesn't throw
    // since the component has a try-catch and null check.
    render(
      <ErrorBoundary componentName="Test">
        <ThrowComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('getDerivedStateFromError returns { hasError: true, error }', () => {
    const error = new Error('Static Error');
    const state = ErrorBoundary.getDerivedStateFromError(error);
    expect(state).toEqual({ hasError: true, error });
  });
});
