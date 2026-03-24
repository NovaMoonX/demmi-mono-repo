import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders without crashing', async () => {
    render(<App />);
    await screen.findByText('Demmi');
  });
});
