import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import Layout from './Layout';

vi.mock('@components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

describe('Layout', () => {
  it('renders the sidebar and outlet', () => {
    const { wrapper } = generateTestWrapper();
    render(<Layout />, { wrapper });
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('does not show demo banner when demo is inactive', () => {
    const { wrapper } = generateTestWrapper();
    render(<Layout />, { wrapper });
    expect(screen.queryByText(/Demo Mode/)).not.toBeInTheDocument();
  });

  it('shows demo banner when demo is active', () => {
    const { wrapper } = generateTestWrapper({ preloadedState: { demo: { isActive: true } } as never });
    render(<Layout />, { wrapper });
    expect(screen.getByText(/Demo Mode/)).toBeInTheDocument();
  });

  it('renders an Exit Demo button when demo is active', () => {
    const { wrapper } = generateTestWrapper({ preloadedState: { demo: { isActive: true } } as never });
    render(<Layout />, { wrapper });
    expect(screen.getByText('Exit Demo')).toBeInTheDocument();
  });

  it('dispatches endDemoSession when Exit Demo is clicked', async () => {
    const { wrapper, store } = generateTestWrapper({ preloadedState: { demo: { isActive: true } } as never });
    render(<Layout />, { wrapper });
    fireEvent.click(screen.getByText('Exit Demo'));
    await screen.findByText('Exit Demo');
    const demoState = store.getState().demo;
    expect(demoState.isActive).toBe(false);
  });
});
