import { PlannedMeal } from '@lib/calendar';
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
 * Fetch all planned meals belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchPlannedMeals = createAsyncThunk(
  'calendar/fetchPlannedMeals',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch planned meals.');

      const q = query(
        collection(db, 'plannedMeals'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const plannedMeals: PlannedMeal[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as PlannedMeal,
      );
      return plannedMeals;
    } catch (err) {
      console.error('Error fetching planned meals:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new planned meal. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 */
export const createPlannedMeal = createAsyncThunk(
  'calendar/createPlannedMealAsync',
  async (params: Omit<PlannedMeal, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    const plannedMealId = generatedId('planned');

    if (isDemoActive(getState)) {
      const newPlannedMeal: PlannedMeal = { ...params, id: plannedMealId, userId: DEMO_USER_ID };
      return newPlannedMeal;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create a planned meal.');

      const docRef = doc(db, 'plannedMeals', plannedMealId);
      const newPlannedMeal: PlannedMeal = { ...params, id: plannedMealId, userId };
      await setDoc(docRef, newPlannedMeal);
      return newPlannedMeal;
    } catch (err) {
      console.error('Error creating planned meal:', err);
      throw err;
    }
  },
);

/**
 * Update an existing planned meal. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updatePlannedMeal = createAsyncThunk(
  'calendar/updatePlannedMealAsync',
  async (plannedMeal: PlannedMeal, { getState }) => {
    if (isDemoActive(getState)) {
      return plannedMeal;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update a planned meal.');

      const docRef = doc(db, 'plannedMeals', plannedMeal.id);

      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) throw new Error('Planned meal not found.');

        const existing = snap.data() as PlannedMeal;
        if (existing.userId !== userId)
          throw new Error('You can only update your own planned meals.');

        const { id: _id, userId: _userId, ...updatableFields } = plannedMeal;
        tx.update(docRef, updatableFields);
      });

      return plannedMeal;
    } catch (err) {
      console.error('Error updating planned meal:', err);
      throw err;
    }
  },
);

/**
 * Delete a planned meal. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deletePlannedMeal = createAsyncThunk(
  'calendar/deletePlannedMealAsync',
  async (plannedMealId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return plannedMealId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete a planned meal.');

      const docRef = doc(db, 'plannedMeals', plannedMealId);

      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) throw new Error('Planned meal not found.');

        const plannedMeal = snap.data() as PlannedMeal;
        if (plannedMeal.userId !== userId)
          throw new Error('You can only delete your own planned meals.');

        tx.delete(docRef);
      });

      return plannedMealId;
    } catch (err) {
      console.error('Error deleting planned meal:', err);
      throw err;
    }
  },
);
