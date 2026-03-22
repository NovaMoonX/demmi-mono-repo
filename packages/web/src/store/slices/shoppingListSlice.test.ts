import { describe, it, expect } from 'vitest';
import reducer, {
  addShoppingListItem,
  updateShoppingListItem,
  toggleShoppingListItem,
  deleteShoppingListItem,
  clearCheckedItems,
  setShoppingList,
  resetShoppingList,
} from './shoppingListSlice';
import type { ShoppingListItem } from '@lib/shoppingList';

const sampleItem: ShoppingListItem = {
  id: 'sl-1',
  userId: 'user-1',
  name: 'Milk',
  ingredientId: null,
  productId: null,
  amount: 2,
  unit: 'l',
  category: 'dairy',
  note: null,
  checked: false,
  createdAt: 1700000000000,
};

describe('shoppingListSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual({ items: [] });
  });

  it('handles addShoppingListItem', () => {
    const { id: _id, createdAt: _createdAt, ...withoutIdAndDate } = sampleItem;
    const state = reducer(undefined, addShoppingListItem(withoutIdAndDate));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Milk');
    expect(state.items[0].id).toBeTruthy();
    expect(state.items[0].createdAt).toBeTruthy();
  });

  it('handles addShoppingListItem with preset id', () => {
    const { createdAt: _createdAt, ...withoutDate } = sampleItem;
    const state = reducer(undefined, addShoppingListItem(withoutDate));
    expect(state.items[0].id).toBe('sl-1');
  });

  it('handles updateShoppingListItem', () => {
    const initial = { items: [sampleItem] };
    const state = reducer(
      initial,
      updateShoppingListItem({ id: 'sl-1', updates: { name: 'Almond Milk' } }),
    );
    expect(state.items[0].name).toBe('Almond Milk');
  });

  it('handles toggleShoppingListItem', () => {
    const initial = { items: [sampleItem] };
    const state = reducer(initial, toggleShoppingListItem('sl-1'));
    expect(state.items[0].checked).toBe(true);
    const toggled = reducer(state, toggleShoppingListItem('sl-1'));
    expect(toggled.items[0].checked).toBe(false);
  });

  it('handles deleteShoppingListItem', () => {
    const initial = { items: [sampleItem] };
    const state = reducer(initial, deleteShoppingListItem('sl-1'));
    expect(state.items).toHaveLength(0);
  });

  it('handles clearCheckedItems', () => {
    const initial = {
      items: [
        sampleItem,
        { ...sampleItem, id: 'sl-2', name: 'Bread', checked: true },
        { ...sampleItem, id: 'sl-3', name: 'Eggs', checked: true },
      ],
    };
    const state = reducer(initial, clearCheckedItems());
    expect(state.items).toHaveLength(1);
    expect(state.items[0].name).toBe('Milk');
  });

  it('handles setShoppingList', () => {
    const items = [sampleItem, { ...sampleItem, id: 'sl-2' }];
    const state = reducer(undefined, setShoppingList(items));
    expect(state.items).toHaveLength(2);
  });

  it('handles resetShoppingList', () => {
    const initial = { items: [sampleItem] };
    const state = reducer(initial, resetShoppingList());
    expect(state.items).toHaveLength(0);
  });
});
