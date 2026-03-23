import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { CalendarScreen } from './CalendarScreen';

vi.mock('@components/calendar', () => ({
  TotalsCard: () => <div data-testid="totals-card">TotalsCard</div>,
  DayCard: () => <div data-testid="day-card">DayCard</div>,
  DayDetailModal: () => <div data-testid="day-detail-modal">DayDetailModal</div>,
  MonthView: () => <div data-testid="month-view">MonthView</div>,
}));

describe('CalendarScreen', () => {
  it('renders the page title', () => {
    renderWithProviders(<CalendarScreen />);
    expect(screen.getByText('Meal Planner')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    renderWithProviders(<CalendarScreen />);
    expect(
      screen.getByText('Plan your recipes for the day, week, or any custom period.'),
    ).toBeInTheDocument();
  });

  it('renders the Add Recipe button', () => {
    renderWithProviders(<CalendarScreen />);
    expect(screen.getByText('Add Recipe')).toBeInTheDocument();
  });

  it('renders month view by default', () => {
    renderWithProviders(<CalendarScreen />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('renders view tabs', () => {
    renderWithProviders(<CalendarScreen />);
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });
});
