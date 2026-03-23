import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { CalendarScreen } from './CalendarScreen';

vi.mock('@components/calendar', () => ({
  TotalsCard: () => <div data-testid="totals-card">TotalsCard</div>,
  DayCard: () => <div data-testid="day-card">DayCard</div>,
  DayDetailModal: () => <div data-testid="day-detail-modal">DayDetailModal</div>,
  MonthView: () => <div data-testid="month-view">MonthView</div>,
}));

describe('CalendarScreen', () => {
  it('renders the page title', () => {
    const { wrapper } = generateTestWrapper();
    render(<CalendarScreen />, { wrapper });
    expect(screen.getByText('Meal Planner')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    const { wrapper } = generateTestWrapper();
    render(<CalendarScreen />, { wrapper });
    expect(
      screen.getByText('Plan your recipes for the day, week, or any custom period.'),
    ).toBeInTheDocument();
  });

  it('renders the Add Recipe button', () => {
    const { wrapper } = generateTestWrapper();
    render(<CalendarScreen />, { wrapper });
    expect(screen.getByText('Add Recipe')).toBeInTheDocument();
  });

  it('renders month view by default', () => {
    const { wrapper } = generateTestWrapper();
    render(<CalendarScreen />, { wrapper });
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('renders view tabs', () => {
    const { wrapper } = generateTestWrapper();
    render(<CalendarScreen />, { wrapper });
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });
});
