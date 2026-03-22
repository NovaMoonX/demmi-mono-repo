import { Recipe } from '@lib/recipes';
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
 * Fetch all recipes belonging to the current user from Firestore.
 * No-ops silently when demo mode is active.
 */
export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async (_, { getState }) => {
    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to fetch recipes.');

      const q = query(
        collection(db, 'recipes'),
        where('userId', '==', userId),
      );
      const snapshot = await getDocs(q);
      const recipes: Recipe[] = snapshot.docs.map(
        (d: QueryDocumentSnapshot) => d.data() as Recipe,
      );
      return recipes;
    } catch (err) {
      console.error('Error fetching recipes:', err);
      throw err;
    }
  },
  { condition: (_, { getState }) => !isDemoActive(getState) },
);

/**
 * Create a new recipe. In demo mode, persists to local Redux state only.
 * In normal mode, persists to Firestore.
 */
export const createRecipe = createAsyncThunk(
  'recipes/createRecipeAsync',
  async (params: Omit<Recipe, 'id' | 'userId'>, { getState }) => {
    const state = getState() as RootState;
    const recipeId = generatedId('recipe');

    if (isDemoActive(getState)) {
      const newRecipe: Recipe = { ...params, id: recipeId, userId: DEMO_USER_ID };
      return newRecipe;
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to create a recipe.');

      const recipeDocRef = doc(db, 'recipes', recipeId);
      const newRecipe: Recipe = { ...params, id: recipeId, userId };
      await setDoc(recipeDocRef, newRecipe);
      return newRecipe;
    } catch (err) {
      console.error('Error creating recipe:', err);
      throw err;
    }
  },
);

/**
 * Update an existing recipe. In demo mode, updates local Redux state only.
 * In normal mode, updates Firestore.
 */
export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipeAsync',
  async (recipe: Recipe, { getState }) => {
    if (isDemoActive(getState)) {
      return recipe;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to update a recipe.');

      const recipeDocRef = doc(db, 'recipes', recipe.id);

      await runTransaction(db, async (tx: Transaction) => {
        const recipeSnap = await tx.get(recipeDocRef);
        if (!recipeSnap.exists()) throw new Error('Recipe not found.');

        const existing = recipeSnap.data() as Recipe;
        if (existing.userId !== userId)
          throw new Error('You can only update your own recipes.');

        const { id: _id, userId: _userId, ...updatableFields } = recipe;
        tx.update(recipeDocRef, updatableFields);
      });

      return recipe;
    } catch (err) {
      console.error('Error updating recipe:', err);
      throw err;
    }
  },
);

/**
 * Delete a recipe. In demo mode, removes from local Redux state only.
 * In normal mode, deletes from Firestore.
 */
export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipeAsync',
  async (recipeId: string, { getState }) => {
    if (isDemoActive(getState)) {
      return recipeId;
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to delete a recipe.');

      const recipeDocRef = doc(db, 'recipes', recipeId);

      await runTransaction(db, async (tx: Transaction) => {
        const recipeSnap = await tx.get(recipeDocRef);
        if (!recipeSnap.exists()) throw new Error('Recipe not found.');

        const recipe = recipeSnap.data() as Recipe;
        if (recipe.userId !== userId)
          throw new Error('You can only delete your own recipes.');

        tx.delete(recipeDocRef);
      });

      return recipeId;
    } catch (err) {
      console.error('Error deleting recipe:', err);
      throw err;
    }
  },
);
