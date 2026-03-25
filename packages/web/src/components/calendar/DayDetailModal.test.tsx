import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayDetailModal, DayDetailModalProps } from './DayDetailModal';
import type { PlannedRecipe } from '@lib/calendar';
import type { Recipe } from '@lib/recipes';

vi.mock('@/utils', () => ({
  formatDateFull: () => 'Monday, January 15, 2024',
  getStartOfDay: (ts: number) => ts,
}));

vi.mock('@/lib/calendar/calendar.utils', () => ({
  calculateTotals: () => ({
    calories: 400,
    protein: 25,
    carbs: 50,
    fat: 15,
    fiber: 4,
    price: 6.0,
  }),
}));

const day = 1705276800000;

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    userId: 'user-1',
    title: 'Omelette',
    description: 'Cheese omelette',
    category: 'breakfast',
    cuisine: 'american',
    prepTime: 5,
    cookTime: 10,
    servingSize: 1,
    instructions: ['Beat eggs', 'Cook'],
    imageUrl: '',
    ingredients: [],
    share: null,
    ...overrides,
  };
}

function createPlannedRecipe(overrides: Partial<PlannedRecipe> = {}): PlannedRecipe {
  return {
    id: 'pr-1',
    userId: 'user-1',
    recipeId: 'recipe-1',
    date: day,
    category: 'breakfast',
    notes: null,
    ...overrides,
  };
}

function defaultProps(overrides: Partial<DayDetailModalProps> = {}): DayDetailModalProps {
  return {
    day,
    plannedRecipes: [],
    recipes: [createRecipe()],
    ingredients: [],
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

describe('DayDetailModal', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when day is null', () => {
    const { container } = render(<DayDetailModal {...defaultProps({ day: null })} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the modal when day is provided', () => {
    render(<DayDetailModal {...defaultProps()} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('shows empty message when no recipes match the day', () => {
    render(<DayDetailModal {...defaultProps()} />);
    expect(screen.getByText('No recipes planned for this day.')).toBeInTheDocument();
  });

  it('renders a table with recipe data when recipes are planned', () => {
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned })} />);
    const matches = screen.getAllByText('Omelette');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('breakfast')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned })} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Recipe')).toBeInTheDocument();
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Protein')).toBeInTheDocument();
  });

  it('renders day total row', () => {
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned })} />);
    expect(screen.getByText('Day Total')).toBeInTheDocument();
  });

  it('renders manage recipes section with edit and remove buttons', () => {
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned })} />);
    expect(screen.getByText('Manage recipes:')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove')).toBeInTheDocument();
  });

  it('calls onEdit and onClose when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onClose = vi.fn();
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned, onEdit, onClose })} />);
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(planned[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when remove button is clicked', () => {
    const onDelete = vi.fn();
    const planned = [createPlannedRecipe()];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned, onDelete })} />);
    fireEvent.click(screen.getByLabelText('Remove'));
    expect(onDelete).toHaveBeenCalledWith(planned[0]);
  });

  it('shows "Unknown" for a recipe not found in recipes list', () => {
    const planned = [createPlannedRecipe({ recipeId: 'missing' })];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned, recipes: [] })} />);
    const unknowns = screen.getAllByText('Unknown');
    expect(unknowns.length).toBeGreaterThanOrEqual(1);
  });

  it('renders notes when a planned recipe has notes', () => {
    const planned = [createPlannedRecipe({ notes: 'Extra cheese' })];
    render(<DayDetailModal {...defaultProps({ plannedRecipes: planned })} />);
    expect(screen.getByText('Extra cheese')).toBeInTheDocument();
  });
});
