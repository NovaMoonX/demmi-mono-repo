import { ShoppingListItem } from '@lib/shoppingList';
import { DEMO_USER_ID } from '@lib/app';
import { db } from '@lib/firebase/firebase.config';
import { generatedId } from '@utils/generatedId';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection,
  doc,
  getDocs,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  Transaction,
  where,
  writeBatch,
} from 'firebase/firestore';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Fetch all shopping list items belonging to the current user from Firestore.
 * In demo mode, returns the current items unchanged to preserve demo data.
 */
export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetchShoppingList',
  async (_, { getState }) => {
    const state = getState() as RootState;

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch your shopping list.');

      const q = query(
        collection(db, 'shoppingList'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const items: ShoppingListItem[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as ShoppingListItem,
      );
      return items;
    } catch (err) {
      console.error('Error fetching shopping list:', err);
      throw err;
    }
  },
    { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new shopping list item. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 * Silently skips creation if an item with the same name (case-insensitive, trimmed) already exists.
 */
export const createShoppingListItem = createAsyncThunk(
  'shoppingList/createShoppingListItem',
  async (params: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt'>, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    const normalizedNew = params.name.toLowerCase().trim();
    const isDuplicate = state.shoppingList.items.some(
      (item) => item.name.toLowerCase().trim() === normalizedNew,
    );
    if (isDuplicate) {
      return rejectWithValue('duplicate' as const);
    }

    const itemId = generatedId('sl');
    const createdAt = Date.now();

    if (isDemoActive(getState)) {
      const newItem: ShoppingListItem = { ...params, id: itemId, userId: DEMO_USER_ID, createdAt };
      return newItem;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to add an item.');

      const itemDocRef = doc(db, 'shoppingList', itemId);
      const newItem: ShoppingListItem = { ...params, id: itemId, userId, createdAt };
      await setDoc(itemDocRef, newItem);
      return newItem;
    } catch (err) {
      console.error('Error creating shopping list item:', err);
      throw err;
    }
  },
);

/**
 * Update an existing shopping list item. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updateShoppingListItem = createAsyncThunk(
  'shoppingList/updateShoppingListItem',
  async (item: ShoppingListItem, { getState }) => {
    if (isDemoActive(getState)) {
      return item;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update an item.');

      const itemDocRef = doc(db, 'shoppingList', item.id);

      await runTransaction(db, async (tx: Transaction) => {
        const itemSnap = await tx.get(itemDocRef);
        if (!itemSnap.exists()) throw new Error('Item not found.');

        const existing = itemSnap.data() as ShoppingListItem;
        if (existing.userId !== userId)
          throw new Error('You can only update your own items.');

        const { id: _id, userId: _userId, ...updatableFields } = item;
        tx.update(itemDocRef, updatableFields);
      });

      return item;
    } catch (err) {
      console.error('Error updating shopping list item:', err);
      throw err;
    }
  },
);

/**
 * Delete a shopping list item. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deleteShoppingListItem = createAsyncThunk(
  'shoppingList/deleteShoppingListItem',
  async (itemId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return itemId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete an item.');

      const itemDocRef = doc(db, 'shoppingList', itemId);

      await runTransaction(db, async (tx: Transaction) => {
        const itemSnap = await tx.get(itemDocRef);
        if (!itemSnap.exists()) throw new Error('Item not found.');

        const item = itemSnap.data() as ShoppingListItem;
        if (item.userId !== userId)
          throw new Error('You can only delete your own items.');

        tx.delete(itemDocRef);
      });

      return itemId;
    } catch (err) {
      console.error('Error deleting shopping list item:', err);
      throw err;
    }
  },
);

/**
 * Delete all checked shopping list items. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const clearCheckedShoppingListItems = createAsyncThunk(
  'shoppingList/clearCheckedShoppingListItems',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const checkedItems = state.shoppingList.items.filter((item) => item.checked);

    if (isDemoActive(getState)) {
      return checkedItems.map((item) => item.id);
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to clear checked items.');

      if (checkedItems.length === 0) return [] as string[];

      const batch = writeBatch(db);
      for (const item of checkedItems) {
        batch.delete(doc(db, 'shoppingList', item.id));
      }
      await batch.commit();

      return checkedItems.map((item) => item.id);
    } catch (err) {
      console.error('Error clearing checked shopping list items:', err);
      throw err;
    }
  },
);
