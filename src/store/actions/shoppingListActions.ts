import { ShoppingListItem } from '@lib/shoppingList';
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
 * No-ops silently when demo mode is active.
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
 * Create a new shopping list item in Firestore for the current user.
 * No-ops silently when demo mode is active.
 */
export const createShoppingListItem = createAsyncThunk(
  'shoppingList/createShoppingListItem',
  async (params: Omit<ShoppingListItem, 'id' | 'userId' | 'createdAt'>, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to add an item.');

      const itemId = generatedId('sl');
      const itemDocRef = doc(db, 'shoppingList', itemId);

      const newItem: ShoppingListItem = {
        ...params,
        id: itemId,
        userId,
        createdAt: Date.now(),
      };

      await setDoc(itemDocRef, newItem);
      return newItem;
    } catch (err) {
      console.error('Error creating shopping list item:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Update an existing shopping list item in Firestore. Only the owner may update.
 * No-ops silently when demo mode is active.
 */
export const updateShoppingListItem = createAsyncThunk(
  'shoppingList/updateShoppingListItem',
  async (item: ShoppingListItem, { getState }) => {
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
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Delete a shopping list item from Firestore. Only the owner may delete.
 * No-ops silently when demo mode is active.
 */
export const deleteShoppingListItem = createAsyncThunk(
  'shoppingList/deleteShoppingListItem',
  async (itemId: string, { getState }) => {
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
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Delete all checked shopping list items from Firestore for the current user.
 * No-ops silently when demo mode is active.
 */
export const clearCheckedShoppingListItems = createAsyncThunk(
  'shoppingList/clearCheckedShoppingListItems',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to clear checked items.');

      const checkedItems = state.shoppingList.items.filter((item) => item.checked);
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
  { condition: (_, { getState }) => !isDemoActive(getState) },
);
