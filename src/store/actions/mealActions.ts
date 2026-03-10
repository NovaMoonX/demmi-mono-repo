import { Meal } from '@lib/meals';
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
 * Fetch all meals belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchMeals = createAsyncThunk(
  'meals/fetchMeals',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch meals.');

      const q = query(
        collection(db, 'meals'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const meals: Meal[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as Meal,
      );
      return meals;
    } catch (err) {
      console.error('Error fetching meals:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new meal in Firestore for the current user.
 * No-ops silently when demo mode is active.
 */
export const createMeal = createAsyncThunk(
  'meals/createMealAsync',
  async (params: Omit<Meal, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create a meal.');

      const mealId = generatedId('meal');
      const mealDocRef = doc(db, 'meals', mealId);

      const newMeal: Meal = {
        ...params,
        id: mealId,
        userId,
      };

      await setDoc(mealDocRef, newMeal);
      return newMeal;
    } catch (err) {
      console.error('Error creating meal:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Update an existing meal in Firestore. Only the owner may update.
 * No-ops silently when demo mode is active.
 */
export const updateMeal = createAsyncThunk(
  'meals/updateMealAsync',
  async (meal: Meal, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update a meal.');

      const mealDocRef = doc(db, 'meals', meal.id);

      await runTransaction(db, async (tx: Transaction) => {
        const mealSnap = await tx.get(mealDocRef);
        if (!mealSnap.exists()) throw new Error('Meal not found.');

        const existing = mealSnap.data() as Meal;
        if (existing.userId !== userId)
          throw new Error('You can only update your own meals.');

        const { id: _id, userId: _userId, ...updatableFields } = meal;
        tx.update(mealDocRef, updatableFields);
      });

      return meal;
    } catch (err) {
      console.error('Error updating meal:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Delete a meal from Firestore. Only the owner may delete.
 * No-ops silently when demo mode is active.
 */
export const deleteMeal = createAsyncThunk(
  'meals/deleteMealAsync',
  async (mealId: string, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete a meal.');

      const mealDocRef = doc(db, 'meals', mealId);

      await runTransaction(db, async (tx: Transaction) => {
        const mealSnap = await tx.get(mealDocRef);
        if (!mealSnap.exists()) throw new Error('Meal not found.');

        const meal = mealSnap.data() as Meal;
        if (meal.userId !== userId)
          throw new Error('You can only delete your own meals.');

        tx.delete(mealDocRef);
      });

      return mealId;
    } catch (err) {
      console.error('Error deleting meal:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);
