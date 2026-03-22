import { createAsyncThunk } from '@reduxjs/toolkit';
import { ref, set, remove, get } from 'firebase/database';
import { doc, runTransaction, Transaction } from 'firebase/firestore';
import { db, rtdb } from '@lib/firebase/firebase.config';
import { Recipe } from '@lib/recipes';
import { SharedRecipe } from '@lib/recipes/sharedRecipe.types';
import { generatedId } from '@utils/generatedId';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Share a recipe by writing its data to the Realtime Database.
 * Generates a share.id if the recipe has none, or re-uses the existing one (refresh).
 * Also updates the recipe's share field in Firestore.
 * In demo mode, generates a local share object without touching the database.
 */
export const shareRecipe = createAsyncThunk(
  'recipes/shareRecipe',
  async (recipe: Recipe, { getState }) => {
    const state = getState() as RootState;

    if (isDemoActive(getState)) {
      const shareId = recipe.share?.id ?? generatedId('recipe');
      return { ...recipe, share: { id: shareId, sharedAt: Date.now() } };
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to share a recipe.');

      const shareId = recipe.share?.id ?? generatedId('recipe');
      const sharedAt = Date.now();

      const allIngredients = state.ingredients.items;
      const sharedIngredients = recipe.ingredients.map((ing) => {
        const ingredient = allIngredients.find((i) => i.id === ing.ingredientId);

        const resolvedUnit =
          ingredient?.unit === 'other'
            ? ingredient.otherUnit ?? 'other'
            : ingredient?.unit ?? 'other';

        const sharedIngredient = {
          ingredientId: ing.ingredientId,
          name: ingredient?.name ?? 'Unknown Ingredient',
          servings: ing.servings,
          unit: resolvedUnit,
        };

        return sharedIngredient;
      });

      const sharedRecipe: SharedRecipe = {
        shareId,
        recipeId: recipe.id,
        userId,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servingSize: recipe.servingSize,
        imageUrl: recipe.imageUrl,
        instructions: recipe.instructions,
        ingredients: sharedIngredients,
        sharedAt,
      };

      const shareValue = { id: shareId, sharedAt };
      const recipeDocRef = doc(db, 'recipes', recipe.id);
      await runTransaction(db, async (tx: Transaction) => {
        const recipeSnap = await tx.get(recipeDocRef);
        if (!recipeSnap.exists()) throw new Error('Recipe not found.');
        const existing = recipeSnap.data() as Recipe;
        if (existing.userId !== userId)
          throw new Error('You can only share your own recipes.');
        tx.update(recipeDocRef, { share: shareValue });
      });

      await set(ref(rtdb, `sharedRecipes/${shareId}`), sharedRecipe);

      return { ...recipe, share: shareValue };
    } catch (err) {
      console.error('Error sharing recipe:', err);
      throw err;
    }
  },
);

/**
 * Stop sharing a recipe by removing its data from the Realtime Database
 * and clearing the share field in Firestore.
 * In demo mode, clears the local share object without touching the database.
 */
export const unshareRecipe = createAsyncThunk(
  'recipes/unshareRecipe',
  async (recipe: Recipe, { getState }) => {
    if (isDemoActive(getState)) {
      return { ...recipe, share: null };
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to unshare a recipe.');
      if (!recipe.share) throw new Error('Recipe is not currently shared.');

      const recipeDocRef = doc(db, 'recipes', recipe.id);
      await runTransaction(db, async (tx: Transaction) => {
        const recipeSnap = await tx.get(recipeDocRef);
        if (!recipeSnap.exists()) throw new Error('Recipe not found.');
        const existing = recipeSnap.data() as Recipe;
        if (existing.userId !== userId)
          throw new Error('You can only unshare your own recipes.');
        tx.update(recipeDocRef, { share: null });
      });

      await remove(ref(rtdb, `sharedRecipes/${recipe.share.id}`));

      return { ...recipe, share: null };
    } catch (err) {
      console.error('Error unsharing recipe:', err);
      throw err;
    }
  },
);

/**
 * Fetch a shared recipe from the Realtime Database by its shareId.
 * This is a public operation — no authentication required.
 */
export const fetchSharedRecipe = createAsyncThunk(
  'recipes/fetchSharedRecipe',
  async (shareId: string) => {
    try {
      const snapshot = await get(ref(rtdb, `sharedRecipes/${shareId}`));
      if (!snapshot.exists()) return null;
      return snapshot.val() as SharedRecipe;
    } catch (err) {
      console.error('Error fetching shared recipe:', err);
      throw err;
    }
  },
);
