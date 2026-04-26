import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

expect.extend(toHaveNoViolations);

describe('Accessibility Audit', () => {
  it('should have no basic accessibility violations in core layouts', async () => {
    const { container } = render(
      <main>
        <h1>Election Guide</h1>
        <section aria-label="Steps">
          <button aria-label="Start Learning">Start</button>
        </section>
      </main>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
