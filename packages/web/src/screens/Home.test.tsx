import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import Home from './Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

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
    renderWithProviders(<Home />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the hero description', () => {
    renderWithProviders(<Home />);
    expect(
      screen.getByText(
        'Your intelligent kitchen companion for recipes, meal planning, and cooking inspiration',
      ),
    ).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('AI Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText('Recipe Management')).toBeInTheDocument();
    expect(screen.getByText('Ingredient Tracking')).toBeInTheDocument();
    expect(screen.getByText('Meal Planning')).toBeInTheDocument();
    expect(screen.getByText('Shopping Lists')).toBeInTheDocument();
    expect(screen.getByText('Try Demo Mode')).toBeInTheDocument();
  });

  it('shows "Get Started" when not authenticated', () => {
    renderWithProviders(<Home />);
    const buttons = screen.getAllByText('Get Started');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('navigates to /auth when Get Started clicked unauthenticated', () => {
    renderWithProviders(<Home />);
    const buttons = screen.getAllByText('Get Started');
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('renders demo mode button when not authenticated', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('🎭 Try Demo Mode')).toBeInTheDocument();
  });

  it('shows "Enter App" when authenticated', () => {
    renderWithProviders(<Home />, {
      preloadedState: { demo: { isActive: true, isHydrated: true } },
    });
    const buttons = screen.getAllByText('Enter App');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
