import { render, screen } from '@testing-library/react';
import { MonthView } from './MonthView';
import type { PlannedRecipe } from '@lib/calendar';

jest.mock('@moondreamsdev/dreamer-ui/components', () => ({
  Calendar: ({ onDateSelect, renderCell }: {
    onDateSelect: (date: Date) => void;
    renderCell: (date: Date, isSelected: boolean, isDisabled: boolean, isToday: boolean) => React.ReactNode;
  }) => (
    <div data-testid="calendar">
      <div data-testid="cell-output">
        {renderCell(new Date(2024, 0, 15), false, false, false)}
      </div>
      <button
        data-testid="select-date"
        onClick={() => onDateSelect(new Date(2024, 0, 15))}
      >
        Select
      </button>
    </div>
  ),
}));

jest.mock('@/utils', () => ({
  getStartOfDay: (ts: number) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  },
}));

function createPlannedRecipe(overrides: Partial<PlannedRecipe> = {}): PlannedRecipe {
  return {
    id: 'pr-1',
    userId: 'user-1',
    recipeId: 'recipe-1',
    date: new Date(2024, 0, 15).setHours(0, 0, 0, 0),
    category: 'breakfast',
    notes: null,
    ...overrides,
  };
}

describe('MonthView', () => {
  it('renders the Calendar component', () => {
    render(<MonthView plannedRecipes={[]} onDateSelect={jest.fn()} />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders the legend with meal categories', () => {
    render(<MonthView plannedRecipes={[]} onDateSelect={jest.fn()} />);
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });

  it('calls onDateSelect when a date is selected', () => {
    const onDateSelect = jest.fn();
    render(<MonthView plannedRecipes={[]} onDateSelect={onDateSelect} />);
    screen.getByTestId('select-date').click();
    expect(onDateSelect).toHaveBeenCalledTimes(1);
  });

  it('renders a cell with the day number', () => {
    render(<MonthView plannedRecipes={[]} onDateSelect={jest.fn()} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders meal indicator dots for planned recipes on a day', () => {
    const recipes = [
      createPlannedRecipe({ category: 'breakfast' }),
      createPlannedRecipe({ id: 'pr-2', category: 'lunch' }),
    ];
    const cellOutput = render(
      <MonthView plannedRecipes={recipes} onDateSelect={jest.fn()} />,
    );
    const dots = cellOutput.container.querySelectorAll('[data-testid="cell-output"] .rounded-full');
    expect(dots.length).toBe(2);
  });
});
