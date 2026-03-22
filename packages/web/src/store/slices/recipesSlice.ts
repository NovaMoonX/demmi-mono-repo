import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '@lib/recipes';
import { generatedId } from '@utils/generatedId';
import {
  fetchRecipes,
  createRecipe as createRecipeAsync,
  updateRecipe as updateRecipeAsync,
  deleteRecipe as deleteRecipeAsync,
} from '@store/actions/recipeActions';
import { shareRecipe, unshareRecipe } from '@store/actions/shareRecipeActions';

interface RecipesState {
  items: Recipe[];
}

const initialState: RecipesState = {
  items: [],
};

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    createRecipe: (state, action: PayloadAction<Omit<Recipe, 'id'>>) => {
      const newRecipe: Recipe = {
        ...action.payload,
        ingredients: action.payload.ingredients ?? [],
        id: generatedId('recipe'),
      };

      state.items.push(newRecipe);
    },
    updateRecipe: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Recipe, 'id'>> }>
    ) => {
      const index = state.items.findIndex((recipe) => recipe.id === action.payload.id);

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((recipe) => recipe.id !== action.payload);
    },
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.items = action.payload;
    },
    resetRecipes: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createRecipeAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateRecipeAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteRecipeAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      })
      .addCase(shareRecipe.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(unshareRecipe.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { createRecipe, updateRecipe, deleteRecipe, setRecipes, resetRecipes } = recipesSlice.actions;

export default recipesSlice.reducer;
