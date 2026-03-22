import { PlannedRecipe } from '@lib/calendar';
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
 * Fetch all planned recipes belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchPlannedRecipes = createAsyncThunk(
  'calendar/fetchPlannedRecipes',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch planned recipes.');

      const q = query(
        collection(db, 'plannedRecipes'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const plannedRecipes: PlannedRecipe[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as PlannedRecipe,
      );
      return plannedRecipes;
    } catch (err) {
      console.error('Error fetching planned recipes:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new planned recipe. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 */
export const createPlannedRecipe = createAsyncThunk(
  'calendar/createPlannedRecipeAsync',
  async (params: Omit<PlannedRecipe, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    const plannedRecipeId = generatedId('planned');

    if (isDemoActive(getState)) {
      const newPlannedRecipe: PlannedRecipe = { ...params, id: plannedRecipeId, userId: DEMO_USER_ID };
      return newPlannedRecipe;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create a planned recipe.');

      const docRef = doc(db, 'plannedRecipes', plannedRecipeId);
      const newPlannedRecipe: PlannedRecipe = { ...params, id: plannedRecipeId, userId };
      await setDoc(docRef, newPlannedRecipe);
      return newPlannedRecipe;
    } catch (err) {
      console.error('Error creating planned recipe:', err);
      throw err;
    }
  },
);

/**
 * Update an existing planned recipe. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updatePlannedRecipe = createAsyncThunk(
  'calendar/updatePlannedRecipeAsync',
  async (plannedRecipe: PlannedRecipe, { getState }) => {
    if (isDemoActive(getState)) {
      return plannedRecipe;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update a planned recipe.');

      const docRef = doc(db, 'plannedRecipes', plannedRecipe.id);

      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) throw new Error('Planned recipe not found.');

        const existing = snap.data() as PlannedRecipe;
        if (existing.userId !== userId)
          throw new Error('You can only update your own planned recipes.');

        const { id: _id, userId: _userId, ...updatableFields } = plannedRecipe;
        tx.update(docRef, updatableFields);
      });

      return plannedRecipe;
    } catch (err) {
      console.error('Error updating planned recipe:', err);
      throw err;
    }
  },
);

/**
 * Delete a planned recipe. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deletePlannedRecipe = createAsyncThunk(
  'calendar/deletePlannedRecipeAsync',
  async (plannedRecipeId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return plannedRecipeId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete a planned recipe.');

      const docRef = doc(db, 'plannedRecipes', plannedRecipeId);

      await runTransaction(db, async (tx: Transaction) => {
        const snap = await tx.get(docRef);
        if (!snap.exists()) throw new Error('Planned recipe not found.');

        const plannedRecipe = snap.data() as PlannedRecipe;
        if (plannedRecipe.userId !== userId)
          throw new Error('You can only delete your own planned recipes.');

        tx.delete(docRef);
      });

      return plannedRecipeId;
    } catch (err) {
      console.error('Error deleting planned recipe:', err);
      throw err;
    }
  },
);
