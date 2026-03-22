import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/helpers/renderWithProviders';
import { RecipeIngredientSelector } from './RecipeIngredientSelector';

vi.mock('@components/ingredients', () => ({
  CreateIngredientModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-ingredient-modal" /> : null,
}));

const mockIngredients = [
  {
    id: 'i1', userId: 'u1', name: 'Tomato', type: 'produce' as const,
    imageUrl: '', nutrients: { protein: 1, carbs: 4, fat: 0, fiber: 1, sugar: 3, sodium: 5, calories: 22 },
    currentAmount: 5, servingSize: 1, unit: 'piece' as const, otherUnit: null,
    products: [], defaultProductId: null, barcode: null,
  },
  {
    id: 'i2', userId: 'u1', name: 'Olive Oil', type: 'oils' as const,
    imageUrl: '', nutrients: { protein: 0, carbs: 0, fat: 14, fiber: 0, sugar: 0, sodium: 0, calories: 120 },
    currentAmount: 500, servingSize: 15, unit: 'ml' as const, otherUnit: null,
    products: [], defaultProductId: null, barcode: null,
  },
];

describe('RecipeIngredientSelector', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty message when no ingredients selected', () => {
    renderWithProviders(
      <RecipeIngredientSelector
        ingredients={mockIngredients}
        selectedIngredients={[]}
        onChange={onChange}
        fromRecipePath="/recipes/new"
      />,
    );
    expect(screen.getByText('No ingredients added yet.')).toBeInTheDocument();
  });

  it('renders selected ingredients', () => {
    renderWithProviders(
      <RecipeIngredientSelector
        ingredients={mockIngredients}
        selectedIngredients={[{ ingredientId: 'i1', servings: 2 }]}
        onChange={onChange}
        fromRecipePath="/recipes/new"
      />,
    );
    const matches = screen.getAllByText('Tomato');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows add ingredient button', () => {
    renderWithProviders(
      <RecipeIngredientSelector
        ingredients={mockIngredients}
        selectedIngredients={[]}
        onChange={onChange}
        fromRecipePath="/recipes/new"
      />,
    );
    expect(screen.getByText('+ Add Ingredient')).toBeInTheDocument();
  });

  it('calls onChange when removing ingredient', () => {
    renderWithProviders(
      <RecipeIngredientSelector
        ingredients={mockIngredients}
        selectedIngredients={[{ ingredientId: 'i1', servings: 2 }]}
        onChange={onChange}
        fromRecipePath="/recipes/new"
      />,
    );
    const removeBtns = screen.getAllByLabelText('Remove Tomato');
    fireEvent.click(removeBtns[0]);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
