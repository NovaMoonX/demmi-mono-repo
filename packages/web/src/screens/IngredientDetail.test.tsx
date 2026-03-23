import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { IngredientDetail } from './IngredientDetail';
import type { Ingredient } from '@lib/ingredients';

function createIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-1',
    userId: 'user-1',
    name: 'Chicken Breast',
    type: 'meat',
    currentAmount: 500,
    servingSize: 100,
    unit: 'g',
    otherUnit: null,
    imageUrl: '',
    barcode: null,
    products: [],
    defaultProductId: null,
    nutrients: {
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      calories: 165,
    },
    ...overrides,
  };
}

describe('IngredientDetail - New Mode', () => {
  it('renders the page title for new ingredient', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new', path: '/ingredients/:id' });
    render(<IngredientDetail />, { wrapper });
    expect(screen.getByText('← Back to Ingredients')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new', path: '/ingredients/:id' });
    render(<IngredientDetail />, { wrapper });
    expect(screen.getByText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Type *')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    const { wrapper } = generateTestWrapper({ route: '/ingredients/new', path: '/ingredients/:id' });
    render(<IngredientDetail />, { wrapper });
    expect(screen.getByText('Create Ingredient')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('IngredientDetail - View Mode', () => {
  it('renders the ingredient name in view mode', () => {
    const ingredient = createIngredient();
    const { wrapper } = generateTestWrapper({ route: '/ingredients/ing-1', path: '/ingredients/:id', preloadedState: { ingredients: { items: [ingredient] } } });
    render(<IngredientDetail />, { wrapper });
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons in view mode', () => {
    const ingredient = createIngredient();
    const { wrapper } = generateTestWrapper({ route: '/ingredients/ing-1', path: '/ingredients/:id', preloadedState: { ingredients: { items: [ingredient] } } });
    render(<IngredientDetail />, { wrapper });
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
