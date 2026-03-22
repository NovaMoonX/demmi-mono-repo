import { emptyForm, itemToForm } from './shoppingUtils';
import type { ShoppingListItem } from '@lib/shoppingList';

describe('emptyForm', () => {
  it('returns a form state with all fields empty/default', () => {
    const result = emptyForm();
    expect(result).toEqual({
      name: '',
      ingredientId: null,
      productId: null,
      amount: '',
      unit: '',
      category: 'other',
      note: '',
    });
  });
});

describe('itemToForm', () => {
  it('converts a shopping list item to form state', () => {
    const item: ShoppingListItem = {
      id: 'sl-1',
      userId: 'user-1',
      name: 'Milk',
      ingredientId: 'ing-1',
      productId: 'prod-1',
      amount: 2,
      unit: 'l',
      category: 'dairy',
      note: 'Whole milk',
      checked: false,
      createdAt: Date.now(),
    };

    const result = itemToForm(item);
    expect(result).toEqual({
      name: 'Milk',
      ingredientId: 'ing-1',
      productId: 'prod-1',
      amount: '2',
      unit: 'l',
      category: 'dairy',
      note: 'Whole milk',
    });
  });

  it('converts null amount to empty string', () => {
    const item: ShoppingListItem = {
      id: 'sl-1',
      userId: 'user-1',
      name: 'Salt',
      ingredientId: null,
      productId: null,
      amount: null,
      unit: null,
      category: 'other',
      note: null,
      checked: false,
      createdAt: Date.now(),
    };

    const result = itemToForm(item);
    expect(result.amount).toBe('');
    expect(result.unit).toBe('');
    expect(result.note).toBe('');
  });
});
