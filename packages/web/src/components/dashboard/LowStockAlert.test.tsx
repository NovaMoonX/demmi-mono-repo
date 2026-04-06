import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { LowStockAlert } from './LowStockAlert';
import type { Ingredient } from '@lib/ingredients';

vi.mock('@store/actions/shoppingListActions', () => {
  const { createAsyncThunk } = require('@reduxjs/toolkit');
  return {
    fetchShoppingList: createAsyncThunk('shoppingList/fetchShoppingList', async () => []),
    createShoppingListItem: createAsyncThunk(
      'shoppingList/createShoppingListItem',
      async (params: Record<string, unknown>) => ({
        ...params,
        id: 'sl-test',
        userId: 'user-1',
        createdAt: Date.now(),
      }),
    ),
    updateShoppingListItem: createAsyncThunk('shoppingList/updateShoppingListItem', async (item: unknown) => item),
    deleteShoppingListItem: createAsyncThunk('shoppingList/deleteShoppingListItem', async (id: string) => id),
    clearCheckedShoppingListItems: createAsyncThunk('shoppingList/clearCheckedShoppingListItems', async () => []),
  };
});

function createIngredient(overrides: Partial<Ingredient> & { id: string; name: string }): Ingredient {
  return {
    userId: 'user-1',
    type: 'produce',
    imageUrl: '',
    nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, calories: 0 },
    currentAmount: 0,
    servingSize: 1,
    unit: 'piece',
    otherUnit: null,
    products: [],
    defaultProductId: null,
    barcode: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LowStockAlert', () => {
  it('renders nothing when no ingredients are low stock', () => {
    const ingredients = [
      createIngredient({ id: 'ing-1', name: 'Apples', currentAmount: 5 }),
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: { ingredients: { items: ingredients } },
    });

    const { container } = render(<LowStockAlert />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are no ingredients', () => {
    const { wrapper } = generateTestWrapper({
      preloadedState: { ingredients: { items: [] } },
    });

    const { container } = render(<LowStockAlert />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('shows low stock items when ingredients have currentAmount <= 0', () => {
    const ingredients = [
      createIngredient({ id: 'ing-1', name: 'Chicken', currentAmount: 0 }),
      createIngredient({ id: 'ing-2', name: 'Rice', currentAmount: 5 }),
      createIngredient({ id: 'ing-3', name: 'Milk', currentAmount: 0 }),
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: { ingredients: { items: ingredients } },
    });

    render(<LowStockAlert />, { wrapper });
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.queryByText('Rice')).not.toBeInTheDocument();
  });

  it('shows up to 5 items and a "more" message', () => {
    const ingredients = Array.from({ length: 7 }, (_, i) =>
      createIngredient({ id: `ing-${i}`, name: `Item ${i}`, currentAmount: 0 }),
    );

    const { wrapper } = generateTestWrapper({
      preloadedState: { ingredients: { items: ingredients } },
    });

    render(<LowStockAlert />, { wrapper });
    expect(screen.getByText('+2 more items low on stock')).toBeInTheDocument();
  });

  it('renders "Add to shopping list" buttons', () => {
    const ingredients = [
      createIngredient({ id: 'ing-1', name: 'Chicken', currentAmount: 0 }),
    ];

    const { wrapper } = generateTestWrapper({
      preloadedState: { ingredients: { items: ingredients } },
    });

    render(<LowStockAlert />, { wrapper });
    const addButton = screen.getByText('Add to shopping list');
    expect(addButton).toBeInTheDocument();
  });

  it('dispatches createShoppingItem on button click', async () => {
    const ingredients = [
      createIngredient({ id: 'ing-1', name: 'Chicken', currentAmount: 0 }),
    ];

    const { wrapper, store } = generateTestWrapper({
      preloadedState: { ingredients: { items: ingredients } },
    });

    render(<LowStockAlert />, { wrapper });
    fireEvent.click(screen.getByText('Add to shopping list'));

    await waitFor(() => {
      const items = store.getState().shoppingList.items;
      expect(items).toHaveLength(1);
    });

    const items = store.getState().shoppingList.items;
    expect(items[0].name).toBe('Chicken');
    expect(items[0].ingredientId).toBe('ing-1');
  });
});
