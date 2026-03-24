import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import Home from './Home';

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logOut: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Home', () => {
  it('renders the app title', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(
      screen.getByText(
        'Your intelligent kitchen companion for recipes, meal planning, and cooking inspiration',
      ),
    ).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText('Recipe Management')).toBeInTheDocument();
    expect(screen.getByText('Ingredient Tracking')).toBeInTheDocument();
    expect(screen.getByText('Meal Planning')).toBeInTheDocument();
    expect(screen.getByText('Shopping Lists')).toBeInTheDocument();
    expect(screen.getByText('Try Demo Mode')).toBeInTheDocument();
  });

  it('shows "Get Started" when not authenticated', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    const buttons = screen.getAllByText('Get Started');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders demo mode button when not authenticated', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.getByText('🎭 Try Demo Mode')).toBeInTheDocument();
  });

  it('shows "Enter App" when authenticated', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { demo: { isActive: true, isHydrated: true } },
    });
    render(<Home />, { wrapper });
    const buttons = screen.getAllByText('Enter App');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
