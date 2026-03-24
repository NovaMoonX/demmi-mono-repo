import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalsCard } from './TotalsDisplay';
import type { NutrientTotals } from '@lib/calendar';

function createTotals(overrides: Partial<NutrientTotals> = {}): NutrientTotals {
  return {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 80,
    fiber: 30,
    price: 25.5,
    ...overrides,
  };
}

describe('TotalsCard', () => {
  it('renders all nutrient labels', () => {
    render(<TotalsCard totals={createTotals()} dayCount={1} />);
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
    expect(screen.getByText('Carbs')).toBeInTheDocument();
    expect(screen.getByText('Fat')).toBeInTheDocument();
    expect(screen.getByText('Fiber')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
  });

  it('renders total values for single day', () => {
    render(<TotalsCard totals={createTotals()} dayCount={1} />);
    expect(screen.getByText('2000 kcal')).toBeInTheDocument();
    expect(screen.getByText('150g')).toBeInTheDocument();
    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByText('80g')).toBeInTheDocument();
    expect(screen.getByText('30g')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  it('shows "Totals for Period" when dayCount is 1', () => {
    render(<TotalsCard totals={createTotals()} dayCount={1} />);
    expect(screen.getByText('Totals for Period')).toBeInTheDocument();
  });

  it('shows day count in heading when dayCount > 1', () => {
    render(<TotalsCard totals={createTotals()} dayCount={3} />);
    expect(screen.getByText('Totals · 3-Day Period')).toBeInTheDocument();
  });

  it('shows per-day averages when dayCount > 1', () => {
    render(<TotalsCard totals={createTotals({ calories: 3000, price: 30 })} dayCount={3} />);
    expect(screen.getByText('~1000 kcal/day')).toBeInTheDocument();
    expect(screen.getByText('~$10.00/day')).toBeInTheDocument();
  });

  it('does not show per-day averages when dayCount is 1', () => {
    render(<TotalsCard totals={createTotals()} dayCount={1} />);
    expect(screen.queryByText(/\/day/)).not.toBeInTheDocument();
  });

  it('renders all nutrient emojis', () => {
    render(<TotalsCard totals={createTotals()} dayCount={1} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();
    expect(screen.getByText('🌾')).toBeInTheDocument();
    expect(screen.getByText('🥑')).toBeInTheDocument();
    expect(screen.getByText('🥦')).toBeInTheDocument();
  });
});
