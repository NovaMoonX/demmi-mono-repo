import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

vi.mock('@routes/AppRoutes', () => ({
  router: 'mock-router',
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  RouterProvider: () => <div data-testid="router-provider">Router</div>,
}));

vi.mock('@contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('@store/index', async () => {
  const { configureStore } = await vi.importActual('@reduxjs/toolkit');
  return {
    store: configureStore({
      reducer: { stub: (s = {}) => s },
    }),
  };
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });

  it('wraps content in AuthProvider', () => {
    render(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });
});
