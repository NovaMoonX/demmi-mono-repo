import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import Layout from './Layout';

jest.mock('@components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  useNavigate: () => jest.fn(),
}));

describe('Layout', () => {
  it('renders the sidebar and outlet', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('does not show demo banner when demo is inactive', () => {
    renderWithProviders(<Layout />);
    expect(screen.queryByText(/Demo Mode/)).not.toBeInTheDocument();
  });

  it('shows demo banner when demo is active', () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        demo: { isActive: true },
      } as never,
    });
    expect(screen.getByText(/Demo Mode/)).toBeInTheDocument();
  });

  it('renders an Exit Demo button when demo is active', () => {
    renderWithProviders(<Layout />, {
      preloadedState: {
        demo: { isActive: true },
      } as never,
    });
    expect(screen.getByText('Exit Demo')).toBeInTheDocument();
  });

  it('dispatches endDemoSession when Exit Demo is clicked', async () => {
    const { store } = renderWithProviders(<Layout />, {
      preloadedState: {
        demo: { isActive: true },
      } as never,
    });
    fireEvent.click(screen.getByText('Exit Demo'));
    await screen.findByText('Exit Demo');
    const demoState = store.getState().demo;
    expect(demoState.isActive).toBe(false);
  });
});
