import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

jest.mock('@routes/AppRoutes', () => ({
  router: 'mock-router',
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  RouterProvider: () => <div data-testid="router-provider">Router</div>,
}));

jest.mock('@contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

jest.mock('@store/index', () => {
  const { configureStore } = jest.requireActual('@reduxjs/toolkit');
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
