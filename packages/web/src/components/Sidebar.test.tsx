import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { Sidebar } from './Sidebar';

const mockNavigate = vi.fn();
const mockLogOut = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/recipes' }),
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
    logOut: mockLogOut,
    loading: false,
  }),
}));

describe('Sidebar', () => {
  const demoOff = { preloadedState: { demo: { isActive: false, isHydrated: false } } };
  const demoOn = { preloadedState: { demo: { isActive: true, isHydrated: true } } };

  beforeEach(() => vi.clearAllMocks());

  it('renders all navigation tabs', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('renders the Navigation heading', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders user email when not in demo mode', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('renders Sign Out button when not in demo mode', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders Exit Demo button and Demo Mode label in demo mode', () => {
    renderWithProviders(<Sidebar />, demoOn);
    expect(screen.getByText('Exit Demo')).toBeInTheDocument();
    expect(screen.getByText('Demo Mode')).toBeInTheDocument();
  });

  it('does not render Sign Out in demo mode', () => {
    renderWithProviders(<Sidebar />, demoOn);
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  it('navigates when a tab is clicked', () => {
    renderWithProviders(<Sidebar />, demoOff);
    fireEvent.click(screen.getByText('Chat'));
    expect(mockNavigate).toHaveBeenCalledWith('/chat');
  });

  it('calls logOut when Sign Out is clicked', () => {
    renderWithProviders(<Sidebar />, demoOff);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });

  it('renders the Dark Mode toggle', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
  });

  it('renders the Demmi logo link', () => {
    renderWithProviders(<Sidebar />, demoOff);
    expect(screen.getByText('Demmi')).toBeInTheDocument();
  });
});
