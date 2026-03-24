import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayCard, DayCardProps } from './DayCard';
import type { PlannedRecipe } from '@lib/calendar';
import type { Recipe } from '@lib/recipes';
import type { Ingredient } from '@lib/ingredients';

vi.mock('@/utils', () => ({
  formatDateShort: (_ts: number) => 'Jan 15',
  formatDayShort: (_ts: number) => 'Mon',
}));

vi.mock('@/lib/calendar/calendar.utils', () => ({
  calculateTotals: () => ({
    calories: 500,
    protein: 30,
    carbs: 60,
    fat: 20,
    fiber: 5,
    price: 8.5,
  }),
}));

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 'recipe-1',
    userId: 'user-1',
    title: 'Pancakes',
    description: 'Fluffy pancakes',
    category: 'breakfast',
    cuisine: 'american',
    prepTime: 10,
    cookTime: 15,
    servingSize: 2,
    instructions: ['Mix', 'Cook'],
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
    date: 1705276800000,
    category: 'breakfast',
    notes: null,
    ...overrides,
  };
}

const day = 1705276800000;
const recipes: Recipe[] = [createRecipe()];
const ingredients: Ingredient[] = [];

function defaultProps(overrides: Partial<DayCardProps> = {}): DayCardProps {
  return {
    day,
    plannedRecipes: [],
    recipes,
    ingredients,
    compact: false,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onViewDetail: vi.fn(),
    onGoToDay: vi.fn(),
    ...overrides,
  };
}

describe('DayCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders "No recipes planned." when there are no planned recipes', () => {
    render(<DayCard {...defaultProps()} />);
    expect(screen.getByText('No recipes planned.')).toBeInTheDocument();
  });

  it('renders the + Add button', () => {
    render(<DayCard {...defaultProps()} />);
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('calls onAdd when + Add button is clicked', () => {
    const onAdd = vi.fn();
    render(<DayCard {...defaultProps({ onAdd })} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(onAdd).toHaveBeenCalledWith(day);
  });

  it('renders a recipe title when there are planned recipes', () => {
    const planned = [createPlannedRecipe()];
    render(<DayCard {...defaultProps({ plannedRecipes: planned })} />);
    expect(screen.getByText('Pancakes')).toBeInTheDocument();
  });

  it('shows "Unknown Recipe" when recipe is not found', () => {
    const planned = [createPlannedRecipe({ recipeId: 'nonexistent' })];
    render(<DayCard {...defaultProps({ plannedRecipes: planned, recipes: [] })} />);
    expect(screen.getByText('Unknown Recipe')).toBeInTheDocument();
  });

  it('calls onEdit when a recipe row is clicked', () => {
    const onEdit = vi.fn();
    const planned = [createPlannedRecipe()];
    render(<DayCard {...defaultProps({ plannedRecipes: planned, onEdit })} />);
    fireEvent.click(screen.getByText('Pancakes'));
    expect(onEdit).toHaveBeenCalledWith(planned[0]);
  });

  it('renders day totals when recipes are planned', () => {
    const planned = [createPlannedRecipe()];
    render(<DayCard {...defaultProps({ plannedRecipes: planned })} />);
    const matches = screen.getAllByText(/500 kcal/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders compact date labels in compact mode', () => {
    render(<DayCard {...defaultProps({ compact: true })} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Jan 15')).toBeInTheDocument();
  });

  it('calls onGoToDay when compact date is clicked', () => {
    const onGoToDay = vi.fn();
    render(<DayCard {...defaultProps({ compact: true, onGoToDay })} />);
    fireEvent.click(screen.getByText('Jan 15'));
    expect(onGoToDay).toHaveBeenCalledWith(day);
  });

  it('renders view detail button in compact mode when recipes exist', () => {
    const planned = [createPlannedRecipe()];
    render(<DayCard {...defaultProps({ compact: true, plannedRecipes: planned })} />);
    expect(screen.getByLabelText('View day details')).toBeInTheDocument();
  });

  it('calls onViewDetail when detail button is clicked', () => {
    const onViewDetail = vi.fn();
    const planned = [createPlannedRecipe()];
    render(<DayCard {...defaultProps({ compact: true, plannedRecipes: planned, onViewDetail })} />);
    fireEvent.click(screen.getByLabelText('View day details'));
    expect(onViewDetail).toHaveBeenCalledWith(day);
  });

  it('renders category quick-add buttons', () => {
    render(<DayCard {...defaultProps()} />);
    const addButtons = screen.getAllByText(/\+$/);
    expect(addButtons.length).toBeGreaterThanOrEqual(6);
  });
});
