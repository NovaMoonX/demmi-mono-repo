import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('@routes/AppRoutes', () => ({
  router: null,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  RouterProvider: ({ router }: { router: unknown }) => (
    <div data-testid="router-provider">Router: {String(router)}</div>
  ),
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

  it('renders the RouterProvider inside AuthProvider', () => {
    render(<App />);
    const authProvider = screen.getByTestId('auth-provider');
    const routerProvider = screen.getByTestId('router-provider');
    expect(authProvider).toContainElement(routerProvider);
  });
});
