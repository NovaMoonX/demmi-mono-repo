import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import demoReducer from '@store/slices/demoSlice';
import userReducer from '@store/slices/userSlice';
import shoppingListReducer from '@store/slices/shoppingListSlice';
import {
  fetchShoppingList,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  clearCheckedShoppingListItems,
} from './shoppingListActions';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  setDoc: vi.fn(),
  runTransaction: vi.fn(),
  writeBatch: vi.fn(() => ({
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@utils/generatedId', () => ({
  generatedId: vi.fn(() => 'sl-id-123'),
}));

function createTestStore(demoActive: boolean, items: unknown[] = []) {
  return configureStore({
    reducer: {
      demo: demoReducer,
      user: userReducer,
      shoppingList: shoppingListReducer,
    },
    preloadedState: {
      demo: { isActive: demoActive, isHydrated: true } as never,
      user: {
        user: { uid: 'user1', email: 'a@b.com', emailVerified: true },
        loading: false,
      } as never,
      shoppingList: { items, loading: false, error: null } as never,
    },
  });
}

describe('shoppingListActions', () => {
  describe('fetchShoppingList', () => {
    it('skips execution when demo mode is active', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(fetchShoppingList());
      expect(result.meta.requestStatus).toBe('rejected');
      expect(
        (result as ReturnType<typeof fetchShoppingList.rejected>).meta
          .condition,
      ).toBe(true);
    });
  });

  describe('createShoppingListItem', () => {
    it('returns local data in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(
        createShoppingListItem({
          name: 'Milk',
          ingredientId: null,
          productId: null,
          amount: 1,
          unit: 'l',
          category: 'dairy',
          note: null,
          checked: false,
        }),
      );
      expect(result.type).toBe('shoppingList/createShoppingListItem/fulfilled');
      const payload = result.payload as Record<string, unknown>;
      expect(payload.userId).toBe('demo');
      expect(payload.id).toBe('sl-id-123');
    });

    it('rejects duplicate items', async () => {
      const store = createTestStore(true, [
        { id: 'existing', name: 'Milk', checked: false },
      ]);
      const result = await store.dispatch(
        createShoppingListItem({
          name: 'milk',
          ingredientId: null,
          productId: null,
          amount: 1,
          unit: 'l',
          category: 'dairy',
          note: null,
          checked: false,
        }),
      );
      expect(result.type).toBe('shoppingList/createShoppingListItem/rejected');
    });
  });

  describe('updateShoppingListItem', () => {
    it('returns item as-is in demo mode', async () => {
      const store = createTestStore(true);
      const item = {
        id: 'sl1',
        userId: 'demo',
        name: 'Milk',
        ingredientId: null,
        productId: null,
        amount: 2,
        unit: 'l' as const,
        category: 'dairy' as const,
        note: null,
        checked: false,
        createdAt: Date.now(),
      };
      const result = await store.dispatch(updateShoppingListItem(item));
      expect(result.type).toBe('shoppingList/updateShoppingListItem/fulfilled');
      expect(result.payload).toEqual(item);
    });
  });

  describe('deleteShoppingListItem', () => {
    it('returns id in demo mode', async () => {
      const store = createTestStore(true);
      const result = await store.dispatch(deleteShoppingListItem('sl1'));
      expect(result.type).toBe('shoppingList/deleteShoppingListItem/fulfilled');
      expect(result.payload).toBe('sl1');
    });
  });

  describe('clearCheckedShoppingListItems', () => {
    it('returns checked item ids in demo mode', async () => {
      const checkedItems = [
        { id: 'sl1', name: 'Milk', checked: true },
        { id: 'sl2', name: 'Bread', checked: true },
      ];
      const store = createTestStore(true, checkedItems);
      const result = await store.dispatch(clearCheckedShoppingListItems());
      expect(result.type).toBe(
        'shoppingList/clearCheckedShoppingListItems/fulfilled',
      );
      expect(result.payload).toEqual(['sl1', 'sl2']);
    });
  });
});
