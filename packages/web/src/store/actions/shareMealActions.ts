import { createAsyncThunk } from '@reduxjs/toolkit';
import { ref, set, remove, get } from 'firebase/database';
import { doc, runTransaction, Transaction } from 'firebase/firestore';
import { db, rtdb } from '@lib/firebase/firebase.config';
import { Meal } from '@lib/meals';
import { SharedMeal } from '@lib/meals/sharedMeal.types';
import { generatedId } from '@utils/generatedId';
import { RootState } from '..';

function isDemoActive(getState: () => unknown): boolean {
  const state = getState() as RootState;
  return state.demo.isActive;
}

/**
 * Share a meal by writing its data to the Realtime Database.
 * Generates a share.id if the meal has none, or re-uses the existing one (refresh).
 * Also updates the meal's share field in Firestore.
 * In demo mode, generates a local share object without touching the database.
 */
export const shareMeal = createAsyncThunk(
  'meals/shareMeal',
  async (meal: Meal, { getState }) => {
    const state = getState() as RootState;

    if (isDemoActive(getState)) {
      const shareId = meal.share?.id ?? generatedId('meal');
      return { ...meal, share: { id: shareId, sharedAt: Date.now() } };
    }

    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to share a meal.');

      const shareId = meal.share?.id ?? generatedId('meal');
      const sharedAt = Date.now();

      const allIngredients = state.ingredients.items;
      const sharedIngredients = meal.ingredients.map((ing) => {
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

      const sharedMeal: SharedMeal = {
        shareId,
        mealId: meal.id,
        userId,
        title: meal.title,
        description: meal.description,
        category: meal.category,
        prepTime: meal.prepTime,
        cookTime: meal.cookTime,
        servingSize: meal.servingSize,
        imageUrl: meal.imageUrl,
        instructions: meal.instructions,
        ingredients: sharedIngredients,
        sharedAt,
      };

      const shareValue = { id: shareId, sharedAt };
      const mealDocRef = doc(db, 'meals', meal.id);
      await runTransaction(db, async (tx: Transaction) => {
        const mealSnap = await tx.get(mealDocRef);
        if (!mealSnap.exists()) throw new Error('Meal not found.');
        const existing = mealSnap.data() as Meal;
        if (existing.userId !== userId)
          throw new Error('You can only share your own meals.');
        tx.update(mealDocRef, { share: shareValue });
      });

      await set(ref(rtdb, `sharedMeals/${shareId}`), sharedMeal);

      return { ...meal, share: shareValue };
    } catch (err) {
      console.error('Error sharing meal:', err);
      throw err;
    }
  },
);

/**
 * Stop sharing a meal by removing its data from the Realtime Database
 * and clearing the share field in Firestore.
 * In demo mode, clears the local share object without touching the database.
 */
export const unshareMeal = createAsyncThunk(
  'meals/unshareMeal',
  async (meal: Meal, { getState }) => {
    if (isDemoActive(getState)) {
      return { ...meal, share: null };
    }

    const state = getState() as RootState;
    try {
      const userId = state.user.user?.uid;
      if (!userId) throw new Error('You must be signed in to unshare a meal.');
      if (!meal.share) throw new Error('Meal is not currently shared.');

      const mealDocRef = doc(db, 'meals', meal.id);
      await runTransaction(db, async (tx: Transaction) => {
        const mealSnap = await tx.get(mealDocRef);
        if (!mealSnap.exists()) throw new Error('Meal not found.');
        const existing = mealSnap.data() as Meal;
        if (existing.userId !== userId)
          throw new Error('You can only unshare your own meals.');
        tx.update(mealDocRef, { share: null });
      });

      await remove(ref(rtdb, `sharedMeals/${meal.share.id}`));

      return { ...meal, share: null };
    } catch (err) {
      console.error('Error unsharing meal:', err);
      throw err;
    }
  },
);

/**
 * Fetch a shared meal from the Realtime Database by its shareId.
 * This is a public operation — no authentication required.
 */
export const fetchSharedMeal = createAsyncThunk(
  'meals/fetchSharedMeal',
  async (shareId: string) => {
    try {
      const snapshot = await get(ref(rtdb, `sharedMeals/${shareId}`));
      if (!snapshot.exists()) return null;
      return snapshot.val() as SharedMeal;
    } catch (err) {
      console.error('Error fetching shared meal:', err);
      throw err;
    }
  },
);
