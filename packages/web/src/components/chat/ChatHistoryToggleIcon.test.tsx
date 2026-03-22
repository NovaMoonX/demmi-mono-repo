import { render } from '@testing-library/react';
import { ChatHistoryToggleIcon } from './ChatHistoryToggleIcon';

describe('ChatHistoryToggleIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<ChatHistoryToggleIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has aria-hidden set to true', () => {
    const { container } = render(<ChatHistoryToggleIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies default size class', () => {
    const { container } = render(<ChatHistoryToggleIcon />);
    const svg = container.querySelector('svg');
    expect(svg?.className).toContain('size-4');
  });

  it('applies custom className', () => {
    const { container } = render(<ChatHistoryToggleIcon className="custom-class" />);
    const svg = container.querySelector('svg');
    expect(svg?.className).toContain('custom-class');
  });

  it('renders the expected SVG shapes', () => {
    const { container } = render(<ChatHistoryToggleIcon />);
    expect(container.querySelector('rect')).toBeInTheDocument();
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(4);
  });
});
