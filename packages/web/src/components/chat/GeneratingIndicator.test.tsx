import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GeneratingIndicator } from './GeneratingIndicator';

describe('GeneratingIndicator', () => {
  it('renders three bouncing dots', () => {
    render(<GeneratingIndicator />);
    const dots = screen.getAllByText('●');
    expect(dots).toHaveLength(3);
  });

  it('applies animate-bounce class to dots', () => {
    render(<GeneratingIndicator />);
    const dots = screen.getAllByText('●');
    for (const dot of dots) {
      expect(dot.className).toContain('animate-bounce');
    }
  });

  it('applies custom className to container', () => {
    const { container } = render(<GeneratingIndicator className="custom-class" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('custom-class');
  });

  it('applies custom dotClassName to each dot', () => {
    render(<GeneratingIndicator dotClassName="dot-custom" />);
    const dots = screen.getAllByText('●');
    for (const dot of dots) {
      expect(dot.className).toContain('dot-custom');
    }
  });
});
