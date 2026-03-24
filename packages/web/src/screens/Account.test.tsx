import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Account } from './Account';

describe('Account', () => {
  it('renders the Account heading', () => {
    render(<Account />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders heading as an h1 element', () => {
    render(<Account />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Account');
  });
});
