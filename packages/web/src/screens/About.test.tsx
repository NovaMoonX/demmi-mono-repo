import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import About from './About';

function renderAbout() {
  const { wrapper } = generateTestWrapper();
  return render(<About />, { wrapper });
}

describe('About', () => {
  it('renders the page title', () => {
    renderAbout();
    expect(screen.getByText('Why Demmi Exists')).toBeInTheDocument();
  });

  it('renders the Demmi brand header', () => {
    renderAbout();
    expect(screen.getByAltText('Demmi logo')).toBeInTheDocument();
  });

  it('renders all section headings', () => {
    renderAbout();
    expect(screen.getByText('The Thread Problem')).toBeInTheDocument();
    expect(screen.getByText('Connected Context')).toBeInTheDocument();
    expect(screen.getByText('Local AI, Real Privacy')).toBeInTheDocument();
    expect(screen.getByText('The Difference')).toBeInTheDocument();
  });

  it('renders the comparison table', () => {
    renderAbout();
    expect(screen.getByText('Generic AI Tools')).toBeInTheDocument();
  });

  it('renders the back to home button', () => {
    renderAbout();
    expect(screen.getByText('← Back to Home')).toBeInTheDocument();
  });
});
