import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { Sidebar } from './Sidebar';

const mockLogOut = vi.fn();

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@test.com', emailVerified: true },
    logOut: mockLogOut,
    loading: false,
  }),
}));

const mockUseRuntimeEnvironment = vi.fn(() => ({
  isElectron: false,
  isMobileWebView: false,
  canInstallOllama: true,
}));

vi.mock('@hooks/useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => mockUseRuntimeEnvironment(),
}));

describe('Sidebar', () => {
  const demoOff = { preloadedState: { demo: { isActive: false, isHydrated: false } } };
  const demoOn = { preloadedState: { demo: { isActive: true, isHydrated: true } } };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRuntimeEnvironment.mockReturnValue({
      isElectron: false,
      isMobileWebView: false,
      canInstallOllama: true,
    });
  });

  it('renders all navigation tabs', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('renders the Navigation heading', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders user email when not in demo mode', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('renders Sign Out button when not in demo mode', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders Exit Demo button and Demo Mode label in demo mode', () => {
    const { wrapper } = generateTestWrapper(demoOn);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Exit Demo')).toBeInTheDocument();
    expect(screen.getByText('Demo Mode')).toBeInTheDocument();
  });

  it('does not render Sign Out in demo mode', () => {
    const { wrapper } = generateTestWrapper(demoOn);
    render(<Sidebar />, { wrapper });
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  it('calls logOut when Sign Out is clicked', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });

  it('renders the Dark Mode toggle', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
  });

  it('renders the Demmi logo link', () => {
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.getByText('Demmi')).toBeInTheDocument();
  });

  it('hides Chat tab when isMobileWebView is true', () => {
    mockUseRuntimeEnvironment.mockReturnValue({
      isElectron: false,
      isMobileWebView: true,
      canInstallOllama: false,
    });
    const { wrapper } = generateTestWrapper(demoOff);
    render(<Sidebar />, { wrapper });
    expect(screen.queryByText('Chat')).not.toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
  });
});
