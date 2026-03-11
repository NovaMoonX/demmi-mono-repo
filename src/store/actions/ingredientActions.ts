import { Ingredient } from '@lib/ingredients';
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
} from 'firebase/firestore';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Fetch all ingredients belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch ingredients.');

      const q = query(
        collection(db, 'ingredients'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const ingredients: Ingredient[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as Ingredient,
      );
      return ingredients;
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new ingredient. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 */
export const createIngredient = createAsyncThunk(
  'ingredients/createIngredientAsync',
  async (params: Omit<Ingredient, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    const ingredientId = generatedId('ingredient');

    if (isDemoActive(getState)) {
      const newIngredient: Ingredient = { ...params, id: ingredientId, userId: DEMO_USER_ID };
      return newIngredient;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create an ingredient.');

      const ingredientDocRef = doc(db, 'ingredients', ingredientId);
      const newIngredient: Ingredient = { ...params, id: ingredientId, userId };
      await setDoc(ingredientDocRef, newIngredient);
      return newIngredient;
    } catch (err) {
      console.error('Error creating ingredient:', err);
      throw err;
    }
  },
);

/**
 * Update an existing ingredient. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updateIngredient = createAsyncThunk(
  'ingredients/updateIngredientAsync',
  async (ingredient: Ingredient, { getState }) => {
    if (isDemoActive(getState)) {
      return ingredient;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update an ingredient.');

      const ingredientDocRef = doc(db, 'ingredients', ingredient.id);

      await runTransaction(db, async (tx: Transaction) => {
        const ingredientSnap = await tx.get(ingredientDocRef);
        if (!ingredientSnap.exists()) throw new Error('Ingredient not found.');

        const existing = ingredientSnap.data() as Ingredient;
        if (existing.userId !== userId)
          throw new Error('You can only update your own ingredients.');

        const { id: _id, userId: _userId, ...updatableFields } = ingredient;
        tx.update(ingredientDocRef, updatableFields);
      });

      return ingredient;
    } catch (err) {
      console.error('Error updating ingredient:', err);
      throw err;
    }
  },
);

/**
 * Delete an ingredient. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deleteIngredient = createAsyncThunk(
  'ingredients/deleteIngredientAsync',
  async (ingredientId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return ingredientId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete an ingredient.');

      const ingredientDocRef = doc(db, 'ingredients', ingredientId);

      await runTransaction(db, async (tx: Transaction) => {
        const ingredientSnap = await tx.get(ingredientDocRef);
        if (!ingredientSnap.exists()) throw new Error('Ingredient not found.');

        const ingredient = ingredientSnap.data() as Ingredient;
        if (ingredient.userId !== userId)
          throw new Error('You can only delete your own ingredients.');

        tx.delete(ingredientDocRef);
      });

      return ingredientId;
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      throw err;
    }
  },
);
