import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import Home from './Home';

const mockUseAuth = vi.fn(() => ({
  user: null as { uid: string; email: string; emailVerified: boolean } | null,
  loading: false,
  logOut: vi.fn(),
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@hooks/useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => ({
    isElectron: false,
    isMobileWebView: false,
    canInstallOllama: true,
  }),
}));

vi.mock('@components/dashboard', () => ({
  TodaysMeals: () => <div data-testid="todays-meals">TodaysMeals</div>,
  LowStockAlert: () => <div data-testid="low-stock-alert">LowStockAlert</div>,
  QuickAskDemi: () => <div data-testid="quick-ask-demi">QuickAskDemi</div>,
  RecipeOfTheDay: () => <div data-testid="recipe-of-the-day">RecipeOfTheDay</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: null as { uid: string; email: string; emailVerified: boolean } | null,
    loading: false,
    logOut: vi.fn(),
  });
});

describe('Home (unauthenticated)', () => {
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

  it('does not render the dashboard', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.queryByTestId('todays-meals')).not.toBeInTheDocument();
  });
});

describe('Home (authenticated)', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'user-1', email: 'test@test.com', emailVerified: true },
      logOut: vi.fn(),
      loading: false,
    });
  });

  it('shows the dashboard heading', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.getByText('Welcome back 👋')).toBeInTheDocument();
  });

  it('renders all dashboard sections', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.getByTestId('todays-meals')).toBeInTheDocument();
    expect(screen.getByTestId('low-stock-alert')).toBeInTheDocument();
    expect(screen.getByTestId('quick-ask-demi')).toBeInTheDocument();
    expect(screen.getByTestId('recipe-of-the-day')).toBeInTheDocument();
  });

  it('does not show marketing content', () => {
    const { wrapper } = generateTestWrapper();
    render(<Home />, { wrapper });
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
    expect(screen.queryByText('🎭 Try Demo Mode')).not.toBeInTheDocument();
  });
});

describe('Home (demo mode)', () => {
  it('shows the dashboard when demo mode is active', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { demo: { isActive: true, isHydrated: true } },
    });
    render(<Home />, { wrapper });
    expect(screen.getByText('Welcome back 👋')).toBeInTheDocument();
    expect(screen.getByTestId('todays-meals')).toBeInTheDocument();
  });
});
